import _ from 'lodash';
import { getRestliRequestHeaders } from './api-utils';
import { constants } from './constants';

const MAX_QUERY_STRING_LENGTH = 4000; // 4KB max length

export function isQueryTunnelingRequired(encodedQueryParamString: string) {
  return encodedQueryParamString && encodedQueryParamString.length > MAX_QUERY_STRING_LENGTH;
}

export function maybeApplyQueryTunnelingToRequestsWithoutBody({
  encodedQueryParamString,
  urlPath,
  originalRestliMethod,
  accessToken,
  versionString = null,
  additionalConfig = {}
}) {
  let requestConfig;

  if (isQueryTunnelingRequired(encodedQueryParamString)) {
    requestConfig = _.merge({
      method: constants.HTTP_METHODS.POST,
      url: urlPath,
      data: encodedQueryParamString,
      headers: getRestliRequestHeaders({
        contentType: constants.CONTENT_TYPE.URL_ENCODED,
        httpMethodOverride: constants.HTTP_METHODS.GET,
        restliMethodType: originalRestliMethod,
        accessToken,
        versionString
      })
    }, additionalConfig);
  } else {
    const url = encodedQueryParamString ?
      `${urlPath}?${encodedQueryParamString}` :
      urlPath;
    requestConfig = _.merge({
      method: constants.HTTP_METHODS.GET,
      url,
      headers: getRestliRequestHeaders({
        restliMethodType: originalRestliMethod,
        accessToken,
        versionString
      })
    }, additionalConfig);
  }

  return requestConfig;
}

export function maybeApplyQueryTunnelingToRequestsWithBody({
  encodedQueryParamString,
  urlPath,
  originalRestliMethod,
  originalJSONRequestBody,
  accessToken,
  versionString = null,
  additionalConfig = {}
}) {
  let requestConfig;
  const originalHttpMethod = constants.RESTLI_METHOD_TO_HTTP_METHOD_MAP[originalRestliMethod];

  if (isQueryTunnelingRequired(encodedQueryParamString)) {
    /**
     * Generate a boundary string that is not present at all in the raw request body
     */
    let boundary = generateRandomString();
    const rawRequestBodyString = encodedQueryParamString + JSON.stringify(originalJSONRequestBody);
    while (rawRequestBodyString.indexOf(boundary) > -1) {
      boundary = generateRandomString();
    }

    // Generate the multipart request body
    let multipartRequestBody = `--${boundary}\r\n` +
      `${constants.HEADERS.CONTENT_TYPE}: ${constants.CONTENT_TYPE.URL_ENCODED}\r\n\r\n` +
      `${encodedQueryParamString}\r\n` +
      `--${boundary}\r\n` +
      `${constants.HEADERS.CONTENT_TYPE}: ${constants.CONTENT_TYPE.JSON}\r\n\r\n` +
      `${JSON.stringify(originalJSONRequestBody)}\r\n` +
      `--${boundary}--`
    ;

    requestConfig = _.merge({
      method: constants.HTTP_METHODS.POST,
      url: urlPath,
      data: multipartRequestBody,
      headers: getRestliRequestHeaders({
        contentType: constants.CONTENT_TYPE.MULTIPART_MIXED_WITH_BOUNDARY(boundary),
        httpMethodOverride: originalHttpMethod,
        restliMethodType: originalRestliMethod,
        accessToken,
        versionString
      }),
      additionalConfig
    });
  } else {
    const url = encodedQueryParamString ?
      `${urlPath}?${encodedQueryParamString}` :
      urlPath;

    requestConfig = _.merge({
      method: originalHttpMethod,
      url,
      headers: getRestliRequestHeaders({
        restliMethodType: originalRestliMethod,
        accessToken,
        versionString
      }),
      data: originalJSONRequestBody
    }, additionalConfig);
  }

  return requestConfig;
}

function generateRandomString() {
  return Math.random().toString(36).substring(2);
}
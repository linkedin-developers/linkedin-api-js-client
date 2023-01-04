/**
 * Utils related to query tunneling
 */

import _ from 'lodash';
import { getRestliRequestHeaders } from './api-utils';
import { HEADERS, HTTP_METHODS, CONTENT_TYPE, RESTLI_METHOD_TO_HTTP_METHOD_MAP } from './constants';

const MAX_QUERY_STRING_LENGTH = 4000; // 4KB max length

export function isQueryTunnelingRequired(encodedQueryParamString: string) {
  return encodedQueryParamString && encodedQueryParamString.length > MAX_QUERY_STRING_LENGTH;
}

export function maybeApplyQueryTunnelingToRequestsWithoutBody({
  encodedQueryParamString,
  urlPath,
  originalRestliMethod,
  accessToken,
  versionString,
  additionalConfig = {}
}) {
  let requestConfig;

  if (isQueryTunnelingRequired(encodedQueryParamString)) {
    requestConfig = _.merge(
      {
        method: HTTP_METHODS.POST,
        url: urlPath,
        data: encodedQueryParamString,
        headers: getRestliRequestHeaders({
          contentType: CONTENT_TYPE.URL_ENCODED,
          httpMethodOverride: HTTP_METHODS.GET,
          restliMethodType: originalRestliMethod,
          accessToken,
          versionString
        })
      },
      additionalConfig
    );
  } else {
    const url = encodedQueryParamString ? `${urlPath}?${encodedQueryParamString}` : urlPath;
    requestConfig = _.merge(
      {
        method: RESTLI_METHOD_TO_HTTP_METHOD_MAP[originalRestliMethod],
        url,
        headers: getRestliRequestHeaders({
          restliMethodType: originalRestliMethod,
          accessToken,
          versionString
        })
      },
      additionalConfig
    );
  }

  return requestConfig;
}

export function maybeApplyQueryTunnelingToRequestsWithBody({
  encodedQueryParamString,
  urlPath,
  originalRestliMethod,
  originalJSONRequestBody,
  accessToken,
  versionString,
  additionalConfig = {}
}) {
  let requestConfig;
  const originalHttpMethod = RESTLI_METHOD_TO_HTTP_METHOD_MAP[originalRestliMethod];

  if (isQueryTunnelingRequired(encodedQueryParamString)) {
    /**
     * Generate a boundary string that is not present at all in the raw request body
     */
    let boundary = generateRandomString();
    const rawRequestBodyString = encodedQueryParamString + JSON.stringify(originalJSONRequestBody);
    while (rawRequestBodyString.includes(boundary)) {
      boundary = generateRandomString();
    }

    // Generate the multipart request body
    const multipartRequestBody =
      `--${boundary}\r\n` +
      `${HEADERS.CONTENT_TYPE}: ${CONTENT_TYPE.URL_ENCODED}\r\n\r\n` +
      `${encodedQueryParamString}\r\n` +
      `--${boundary}\r\n` +
      `${HEADERS.CONTENT_TYPE}: ${CONTENT_TYPE.JSON}\r\n\r\n` +
      `${JSON.stringify(originalJSONRequestBody)}\r\n` +
      `--${boundary}--`;
    requestConfig = _.merge({
      method: HTTP_METHODS.POST,
      url: urlPath,
      data: multipartRequestBody,
      headers: getRestliRequestHeaders({
        contentType: CONTENT_TYPE.MULTIPART_MIXED_WITH_BOUNDARY(boundary),
        httpMethodOverride: originalHttpMethod,
        restliMethodType: originalRestliMethod,
        accessToken,
        versionString
      }),
      additionalConfig
    });
  } else {
    const url = encodedQueryParamString ? `${urlPath}?${encodedQueryParamString}` : urlPath;

    requestConfig = _.merge(
      {
        method: originalHttpMethod,
        url,
        headers: getRestliRequestHeaders({
          restliMethodType: originalRestliMethod,
          accessToken,
          versionString
        }),
        data: originalJSONRequestBody
      },
      additionalConfig
    );
  }

  return requestConfig;
}

function generateRandomString() {
  return Math.random().toString(36).substring(2);
}

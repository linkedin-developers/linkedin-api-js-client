import _ from 'lodash';
import { getRestliRequestHeaders } from './api-utils';
import { constants } from './constants';

const MAX_QUERY_STRING_LENGTH = 4000; // 4KB max length

export function isQueryTunnelingRequired(encodedQueryParamString: string) {
  return encodedQueryParamString.length > MAX_QUERY_STRING_LENGTH;
}

export function maybeApplyQueryTunnelingToGetRequest({
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
    requestConfig = _.merge({
      method: constants.HTTP_METHODS.GET,
      url: `${urlPath}?${encodedQueryParamString}`,
      headers: getRestliRequestHeaders({
        restliMethodType: originalRestliMethod,
        accessToken,
        versionString
      })
    }, additionalConfig);
  }

  return requestConfig;
}
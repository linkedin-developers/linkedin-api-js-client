/**
 * Utilities related to working with LinkedIn's APIs
 */

import { VERSIONED_BASE_URL, NON_VERSIONED_BASE_URL, HEADERS } from './constants';
import { version } from '../../package.json';

export function getRestApiBaseUrl(versionString = null) {
  return versionString ? VERSIONED_BASE_URL : NON_VERSIONED_BASE_URL;
}

export function getRestliRequestHeaders({
  restliMethodType,
  accessToken,
  versionString = null,
  httpMethodOverride = null,
  contentType = 'application/json'
}) {
  const headers = {
    [HEADERS.CONNECTION]: 'Keep-Alive',
    [HEADERS.RESTLI_PROTOCOL_VERSION]: '2.0.0',
    [HEADERS.RESTLI_METHOD]: restliMethodType.toLowerCase(),
    [HEADERS.AUTHORIZATION]: `Bearer ${accessToken}`,
    [HEADERS.CONTENT_TYPE]: contentType,
    [HEADERS.USER_AGENT]: `linkedin-api-js-client/${version}`
  };
  if (versionString) {
    headers[HEADERS.LINKEDIN_VERSION] = versionString;
  }
  if (httpMethodOverride) {
    headers[HEADERS.HTTP_METHOD_OVERRIDE] = httpMethodOverride.toUpperCase();
  }
  return headers;
}

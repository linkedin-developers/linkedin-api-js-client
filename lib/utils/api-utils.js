const constants = require('./constants');

/**
 * This module contains utility methods related to making LinkedIn API requests
 */
module.exports = {
  getRestApiBaseUrl(versionString) {
    return versionString ? constants.VERSIONED_BASE_URL : constants.NON_VERSIONED_BASE_URL;
  },

  getRestliRequestHeaders({
    restliMethodType,
    accessToken,
    versionString = null,
    httpMethodOverride = null,
    contentType = 'application/json'
  }) {
    const headers = {
      [constants.HEADERS.CONNECTION]: 'Keep-Alive',
      [constants.HEADERS.RESTLI_PROTOCOL_VERSION]: '2.0.0',
      [constants.HEADERS.RESTLI_METHOD]: restliMethodType.toLowerCase(),
      [constants.HEADERS.AUTHORIZATION]: `Bearer ${accessToken}`,
      [constants.HEADERS.CONTENT_TYPE]: contentType
    };
    if (versionString) {
      headers[constants.HEADERS.LINKEDIN_VERSION] = versionString;
    }
    if (httpMethodOverride) {
      headers[constants.HEADERS.HTTP_METHOD_OVERRIDE] = httpMethodOverride;
    }
    return headers;
  }
}
const axios = require('axios');
const constants = require('./utils/constants');
const { getPatchObject } = require('./utils/patch-generator');
const { encode, paramEncode } = require('./utils/restli-utils');
const { getRestApiBaseUrl, getRestliRequestHeaders } = require('./utils/api-utils');
const { isQueryTunnelingRequired } = require('./utils/query-tunneling');
const qs = require('qs');
const _ = require('lodash');

// TODO: Add query tunneling support
// TODO: Figure out format when create/batch_create returns the actual entity
// TODO: Add GQL support
// TODO: Handle cases where reduced-encode is required
// TODO: Add tests
// TODO: Validate version string
// TODO: Webhooks support
// TODO: Add types to response
// TODO: error response or utils to check throttling details
// TODO: util to extract relevant request failures
// TODO: handle sub-resources
/**
 * Axios doesn't actually support paramsSerializer to perform custom serialization of
 * query params (documentation makes it appear like it does, but it is not correct). Thus,
 * any query params need to be Rest.li-encoded and appended to the url property.
 */

module.exports = class LinkedInApiClient {
  constructor({ clientId, clientSecret, redirectUrl = null }) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUrl = redirectUrl;
  }

  async getTwoLeggedAccessToken() {
    return await axios.request({
      method: 'POST',
      url: `${constants.OAUTH_BASE_URL}/accessToken`,
      data: qs.stringify({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      }),
      headers: {
        [constants.HEADERS.CONTENT_TYPE]: 'application/x-www-form-urlencoded'
      }
    });
  }

  async exchangeAuthCodeForAccessToken(code) {
    return await axios.request({
      method: 'POST',
      url: `${constants.OAUTH_BASE_URL}/accessToken`,
      data: {
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUrl
      },
      headers: {
        [constants.HEADERS.CONTENT_TYPE]: 'application/x-www-form-urlencoded'
      }
    });
  }

  async exchangeRefreshTokenForAccessToken(refreshToken) {
    return await axios.request({
      method: 'POST',
      url: `${constants.OAUTH_BASE_URL}/accessToken`,
      data: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      },
      headers: {
        [constants.HEADERS.CONTENT_TYPE]: 'application/x-www-form-urlencoded'
      }
    });
  }

  async introspectAccessToken(accessToken) {
    return await axios.request({
      method: 'POST',
      url: `${constants.OAUTH_BASE_URL}/introspectToken`,
      data: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        token: accessToken
      },
      headers: {
        [constants.HEADERS.CONTENT_TYPE]: 'application/x-www-form-urlencoded'
      }
    });
  }

  async get({
    resource,
    id,
    queryParams,
    accessToken,
    versionString = null,
    additionalConfig = {}
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);
    // Simple resources do not have id
    const url = id ? `${baseUrl}${resource}/${encode(id)}` : `${baseUrl}${resource}`;
    const requestConfig = _.merge({
      method: 'GET',
      url,
      params: queryParams,
      headers: getRestliRequestHeaders({
        restliMethodType: constants.RESTLI_METHODS.GET,
        accessToken,
        versionString
      })
    }, additionalConfig);
    return await axios.request(requestConfig);
  }

  async batchGet({
    resource,
    ids,
    queryParams,
    versionString = null,
    accessToken,
    additionalConfig = {}
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);
    const encodedQueryParamString = paramEncode({
      ids,
      ...queryParams
    });

    let requestConfig;
    if (isQueryTunnelingRequired(encodedQueryParamString)) {
      requestConfig = _.merge({
        method: constants.HTTP_METHODS.POST,
        url: `${baseUrl}${resource}`,
        data: encodedQueryParamString,
        headers: getRestliRequestHeaders({
          contentType: constants.CONTENT_TYPE.URL_ENCODED,
          httpMethodOverride: constants.HTTP_METHODS.GET,
          restliMethodType: constants.RESTLI_METHODS.BATCH_GET,
          accessToken,
          versionString
        })
      }, additionalConfig);
    }
    else {
      requestConfig = _.merge({
        method: 'GET',
        url: `${baseUrl}${resource}?${encodedQueryParamString}`,
        headers: getRestliRequestHeaders({
          restliMethodType: constants.RESTLI_METHODS.BATCH_GET,
          accessToken,
          versionString
        })
      }, additionalConfig);
    }

    return await axios.request(requestConfig);
  }

  async getAll({
    resource,
    queryParams,
    versionString = null,
    accessToken,
    additionalConfig = {}
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);
    const encodedQueryParamString = paramEncode(queryParams);
    const requestConfig = _.merge({
      method: 'GET',
      url: `${baseUrl}${resource}?${encodedQueryParamString}`,
      headers: getRestliRequestHeaders({
        restliMethodType: constants.RESTLI_METHODS.GET_ALL,
        accessToken,
        versionString
      })
    }, additionalConfig);
    return await axios.request(requestConfig);
  }

  async create({
    resource,
    data,
    versionString = null,
    accessToken,
    additionalConfig = {}
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);
    const requestConfig = _.merge({
      method: 'POST',
      url: `${baseUrl}${resource}`,
      data,
      headers: getRestliRequestHeaders({
        restliMethodType: constants.RESTLI_METHODS.CREATE,
        accessToken,
        versionString
      })
    }, additionalConfig);

    return await axios.request(requestConfig);
  }

  async batchCreate({
    resource,
    entities,
    versionString = null,
    accessToken,
    additionalConfig = {}
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);
    const requestConfig = _.merge({
      method: 'POST',
      url: `${baseUrl}${resource}`,
      data: {
        elements: entities
      },
      headers: getRestliRequestHeaders({
        restliMethodType: constants.RESTLI_METHODS.BATCH_CREATE,
        accessToken,
        versionString
      })
    }, additionalConfig);
    return await axios.request(requestConfig);
  }

  async partialUpdate({
    resource,
    id,
    patchSetObject,
    originalEntity,
    modifiedEntity,
    versionString = null,
    accessToken,
    additionalConfig = {}
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);

    let patchData;
    if (patchSetObject) {
      if (typeof patchSetObject === 'object' && Object.keys(patchSetObject).length === 0) {
        throw new Error('patchSetObject must be an object with at least one key-value pair');
      }
      patchData = { 'patch': { '$set': patchSetObject } };
    } else if (originalEntity && modifiedEntity) {
      patchData = getPatchObject(originalEntity, modifiedEntity);
      if (!patchData || Object.keys(patchData).length === 0) {
        throw new Error('There must be a difference between originalEntity and modifiedEntity');
      }
    } else {
      throw new Error('Either patchSetObject or originalEntity and modifiedEntity properties must be present');
    }

    const requestConfig = _.merge({
      method: 'POST',
      url: `${baseUrl}${resource}/${encode(id)}`,
      data: getPatchObject(originalEntity, modifiedEntity),
      headers: getRestliRequestHeaders({
        restliMethodType: constants.RESTLI_METHODS.PARTIAL_UPDATE,
        accessToken,
        versionString
      })
    }, additionalConfig);
    return await axios.request(requestConfig);
  }

  async batchPartialUpdate({
    resource,
    ids,
    originalEntities,
    modifiedEntities,
    patchSetObjects,
    queryParams,
    versionString = null,
    accessToken,
    additionalConfig = {}
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);

    if (patchSetObjects) {
      if (ids.length !== patchSetObjects.length) {
        throw new Error('The fields { ids, patchSetObjects } must be arrays with the same length');
      }
    } else if (originalEntities && modifiedEntities) {
      if (ids.length !== originalEntities.length && originalEntities.length !== modifiedEntities.length) {
        throw new Error('The fields { ids, originalEntities, modifiedEntities } must be arrays with the same length');
      }
    } else {
      throw new Error('Either { patchSetObjects } or { originalEntities, modifiedEntities } need to be provided as input parameters');
    }

    const encodedQueryParamString = paramEncode({
      ids,
      ...queryParams
    });
    let entities;

    if (patchSetObjects) {
      entities = ids.reduce((prev, curr, index) => {
        prev[curr] = {
          'patch': { '$set': patchSetObjects[index] }
        };
        return prev;
      }, {});
    } else {
      entities = ids.reduce((prev, curr, index) => {
        prev[curr] = getPatchObject(originalEntities[index], modifiedEntities[index]);
        return prev;
      }, {});
    }

    const requestConfig = _.merge({
      method: 'POST',
      url: `${baseUrl}${resource}?${encodedQueryParamString}`,
      data: {
        entities
      },
      headers: getRestliRequestHeaders({
        restliMethodType: constants.RESTLI_METHODS.BATCH_PARTIAL_UPDATE,
        accessToken,
        versionString
      })
    }, additionalConfig);
    return await axios.request(requestConfig);
  }

  async update({
    resource,
    key,
    data,
    versionString = null,
    accessToken,
    additionalConfig = {}
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);
    const requestConfig = _.merge({
      method: 'PUT',
      url: `${baseUrl}${resource}/${encode(key)}`,
      data,
      headers: getRestliRequestHeaders({
        restliMethodType: constants.RESTLI_METHODS.UPDATE,
        accessToken,
        versionString
      })
    }, additionalConfig);
    return await axios.request(requestConfig);
  }

  async batchUpdate({
    resource,
    ids,
    entitiesArray,
    queryParams,
    versionString = null,
    accessToken,
    additionalConfig = {}
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);
    const encodedQueryParamString = paramEncode({
      ids,
      ...queryParams
    });
    const entitiesObject = ids.reduce((entitiesObject, currId, index) => {
      entitiesObject[encode(currId)] = entitiesArray[index];
      return entitiesObject;
    }, {});
    const requestConfig = _.merge({
      method: 'PUT',
      url: `${baseUrl}${resource}?${encodedQueryParamString}`,
      data: {
        entities: entitiesObject
      },
      headers: getRestliRequestHeaders({
        restliMethodType: constants.RESTLI_METHODS.BATCH_UPDATE,
        accessToken,
        versionString
      })
    }, additionalConfig);
    return await axios.request(requestConfig);
  }

  async delete({
    resource,
    id,
    versionString = null,
    accessToken,
    additionalConfig = {}
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);
    const requestConfig = _.merge({
      method: 'DELETE',
      url: `${baseUrl}${resource}/${encode(id)}`,
      headers: getRestliRequestHeaders({
        restliMethodType: constants.RESTLI_METHODS.DELETE,
        accessToken,
        versionString
      })
    }, additionalConfig);
    return await axios.request(requestConfig);
  }

  async batchDelete({
    resource,
    ids,
    queryParams,
    versionString = null,
    accessToken,
    additionalConfig = {}
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);
    const encodedQueryParamString = paramEncode({
      ids,
      ...queryParams
    });
    const requestConfig = _.merge({
      method: 'DELETE',
      url: `${baseUrl}${resource}?${encodedQueryParamString}`,
      headers: getRestliRequestHeaders({
        restliMethodType: constants.RESTLI_METHODS.BATCH_DELETE,
        accessToken,
        versionString
      })
    }, additionalConfig);
    return await axios.request(requestConfig);
  }

  async finder({
    resource,
    finderName,
    finderParams,
    versionString = null,
    accessToken,
    additionalConfig = {}
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);
    const encodedQueryParamString = paramEncode({
      q: finderName,
      ...finderParams
    });
    const requestConfig = _.merge({
      method: 'GET',
      url: `${baseUrl}${resource}?${encodedQueryParamString}`,
      headers: getRestliRequestHeaders({
        restliMethodType: constants.RESTLI_METHODS.FINDER,
        accessToken,
        versionString
      }), additionalConfig
    });
    return await axios.request(requestConfig);
  }

  async batchFinder({
    resource,
    batchFinderName,
    queryParams,
    versionString = null,
    accessToken,
    additionalConfig = {}
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);
    const encodedQueryParamString = paramEncode({
      bq: batchFinderName,
      ...queryParams
    });
    const requestConfig = _.merge({
      method: 'GET',
      url: `${baseUrl}${resource}?${encodedQueryParamString}`,
      headers: getRestliRequestHeaders({
        restliMethodType: constants.RESTLI_METHODS.BATCH_FINDER,
        accessToken,
        versionString
      }), additionalConfig
    });
    return await axios.request(requestConfig);
  }

  async action({
    resource,
    actionName,
    data,
    versionString = null,
    accessToken,
    additionalConfig
  }) {
    const baseUrl = getRestApiBaseUrl(versionString);
    const requestConfig = _.merge({
      method: 'POST',
      url: `${baseUrl}${resource}?action=${actionName}`,
      data,
      headers: getRestliRequestHeaders({
        restliMethodType: constants.RESTLI_METHODS.ACTION,
        accessToken,
        versionString
      }), additionalConfig
    });
    return await axios.request(requestConfig);
  }
}
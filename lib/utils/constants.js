module.exports = {
  OAUTH_BASE_URL: 'https://www.linkedin.com/oauth/v2',
  NON_VERSIONED_BASE_URL: 'https://api.linkedin.com/v2',
  VERSIONED_BASE_URL: 'https://api.linkedin.com/rest',

  HEADERS: {
    CONTENT_TYPE: 'Content-Type',
    CONNECTION: 'Connection',
    RESTLI_PROTOCOL_VERSION: 'X-RestLi-Protocol-Version',
    RESTLI_METHOD: 'X-RestLi-Method',
    CREATED_ENTITY_ID: 'x-restli-id',
    LINKEDIN_VERSION: 'LinkedIn-Version',
    AUTHORIZATION: 'Authorization'
  },

  RESTLI_METHODS: {
    GET: 'GET',
    BATCH_GET: 'BATCH_GET',
    GET_ALL: 'GET_ALL',
    UPDATE: 'UPDATE',
    BATCH_UPDATE: 'BATCH_UPDATE',
    PARTIAL_UPDATE: 'PARTIAL_UPDATE',
    BATCH_PARTIAL_UPDATE: 'BATCH_PARTIAL_UPDATE',
    CREATE: 'CREATE',
    BATCH_CREATE: 'BATCH_CREATE',
    DELETE: 'DELETE',
    BATCH_DELETE: 'BATCH_DELETE',
    FINDER: 'FINDER',
    BATCH_FINDER: 'BATCH_FINDER',
    ACTION: 'ACTION'
  }
}
const constants = require('./constants');

module.exports = {
  generateMemberAuthorizationUrl(params) {
    const queryParams = new URLSearchParams({
      'response_type': 'code',
      'client_id': params.clientId,
      'redirect_uri': params.redirectUrl,
      'state': params.state,
      'scope': ''
    });
    return `${constants.OAUTH_BASE_URL}/authorization?${queryParams.toString()}${encodeURIComponent(params.scopes.join(' '))}`;
  }
}
const constants = require('./constants');

export function generateMemberAuthorizationUrl({
  clientId,
  redirectUrl,
  state = undefined,
  scopes = []
}) {
  const queryParams = new URLSearchParams({
    'response_type': 'code',
    'client_id': clientId,
    'redirect_uri': redirectUrl,
    'state': state,
    'scope': ''
  });
  return `${constants.OAUTH_BASE_URL}/authorization?${queryParams.toString()}${encodeURIComponent(scopes.join(' '))}`;
}
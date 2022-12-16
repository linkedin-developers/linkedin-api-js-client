import { OAUTH_BASE_URL } from './constants';

export function generateMemberAuthorizationUrl({
  clientId,
  redirectUrl,
  state = undefined,
  scopes = []
}) {
  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUrl,
    state,
    scope: ''
  });
  return `${OAUTH_BASE_URL}/authorization?${queryParams.toString()}${encodeURIComponent(scopes.join(' '))}`;
}

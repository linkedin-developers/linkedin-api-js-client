import { OAUTH_BASE_URL } from './constants';

export function generateMemberAuthorizationUrl({
  clientId,
  redirectUrl,
  state = null,
  scopes = []
}): string {
  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUrl,
    state,
    scope: ''
  });
  if (!state) {
    queryParams.delete('state');
  }
  return `${OAUTH_BASE_URL}/authorization?${queryParams.toString()}${encodeURIComponent(
    scopes.join(' ')
  )}`;
}

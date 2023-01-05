import { OAUTH_BASE_URL } from './constants';
import qs from 'qs';

/**
 * Generates the member authorization URL to redirect users to in order to
 * authorize the requested scopes for an application.
 */
export function generateMemberAuthorizationUrl(params: {
  clientId: string;
  redirectUrl: string;
  scopes: string[];
  state?: string;
}): string {
  if (!params.clientId) {
    throw new Error('The client ID must be specified.');
  }
  if (!params.redirectUrl) {
    throw new Error('The OAuth 2.0 redirect URL must be specified.');
  }
  if (!params.scopes?.length) {
    throw new Error('At least one scope must be specified');
  }

  const queryParamString = qs.stringify(
    {
      response_type: 'code',
      client_id: params.clientId,
      redirect_uri: params.redirectUrl,
      scope: params.scopes.join(','),
      state: params.state
    },
    { encode: false }
  );
  return `${OAUTH_BASE_URL}/authorization?${queryParamString}`;
}

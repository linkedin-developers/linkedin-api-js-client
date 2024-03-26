import { generateMemberAuthorizationUrl } from '../../lib/utils/oauth-utils';

describe('oauth-utils', () => {
  test('generateMemberAuthorizationUrl basic', () => {
    expect(
      generateMemberAuthorizationUrl({
        clientId: 'abc123',
        redirectUrl: 'https://www.linkedin.com/developers',
        scopes: ['profile']
      })
    ).toBe(
      'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=abc123&redirect_uri=https://www.linkedin.com/developers&scope=profile'
    );
  });

  test('generateMemberAuthorizationUrl with multiple scopes', () => {
    expect(
      generateMemberAuthorizationUrl({
        clientId: 'abc123',
        redirectUrl: 'https://www.linkedin.com/developers',
        scopes: ['profile', 'r_ads', 'r_organization']
      })
    ).toBe(
      'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=abc123&redirect_uri=https://www.linkedin.com/developers&scope=profile,r_ads,r_organization'
    );
  });

  test('generateMemberAuthorizationUrl with state parameter', () => {
    expect(
      generateMemberAuthorizationUrl({
        clientId: 'abc123',
        redirectUrl: 'https://www.linkedin.com/developers',
        scopes: ['profile'],
        state: 'foobar'
      })
    ).toBe(
      'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=abc123&redirect_uri=https://www.linkedin.com/developers&scope=profile&state=foobar'
    );
  });

  test('generateMemberAuthorizationUrl missing scopes', () => {
    expect(() => {
      generateMemberAuthorizationUrl({
        clientId: 'abc123',
        redirectUrl: 'https://www.linkedin.com/developers',
        scopes: []
      });
    }).toThrow('At least one scope must be specified');
  });
});

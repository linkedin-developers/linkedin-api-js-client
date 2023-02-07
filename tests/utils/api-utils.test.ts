import { buildRestliUrl, getRestliRequestHeaders } from '../../lib/utils/api-utils';
import { version } from '../../package.json';

describe('api-utils', () => {
  test.each([
    {
      resourcePath: '/adAccounts',
      pathKeys: null,
      versionString: null,
      expectedUrl: 'https://api.linkedin.com/v2/adAccounts'
    },
    {
      resourcePath: '/adAccounts',
      pathKeys: null,
      versionString: '202209',
      expectedUrl: 'https://api.linkedin.com/rest/adAccounts'
    },
    {
      resourcePath: '/adAccounts/{id}',
      pathKeys: {
        id: 123
      },
      versionString: '202209',
      expectedUrl: 'https://api.linkedin.com/rest/adAccounts/123'
    },
    {
      resourcePath: '/socialActions/{actionUrn}/comments/{commentId}',
      pathKeys: {
        actionUrn: 'urn:li:share:123',
        commentId: 'foobar123'
      },
      versionString: '202209',
      expectedUrl:
        'https://api.linkedin.com/rest/socialActions/urn%3Ali%3Ashare%3A123/comments/foobar123'
    },
    {
      resourcePath: '/testResource/{complexKey}',
      pathKeys: {
        complexKey: { member: 'urn:li:member:123', account: 'urn:li:account:456' }
      },
      expectedUrl:
        'https://api.linkedin.com/v2/testResource/(member:urn%3Ali%3Amember%3A123,account:urn%3Ali%3Aaccount%3A456)'
    }
  ])('buildRestliUrl', ({ resourcePath, pathKeys, versionString, expectedUrl }) => {
    expect(buildRestliUrl(resourcePath, pathKeys, versionString)).toBe(expectedUrl);
  });

  test('getRestliRequestHeaders', () => {
    expect(
      getRestliRequestHeaders({
        restliMethodType: 'BATCH_CREATE',
        accessToken: 'ABC123'
      })
    ).toStrictEqual({
      Connection: 'Keep-Alive',
      'X-RestLi-Protocol-Version': '2.0.0',
      'X-RestLi-Method': 'batch_create',
      Authorization: 'Bearer ABC123',
      'Content-Type': 'application/json',
      'user-agent': `linkedin-api-js-client/${version}`
    });

    expect(
      getRestliRequestHeaders({
        restliMethodType: 'BATCH_CREATE',
        accessToken: 'ABC123',
        versionString: '202209',
        httpMethodOverride: 'get',
        contentType: 'multipart/form-data'
      })
    ).toStrictEqual({
      Connection: 'Keep-Alive',
      'X-RestLi-Protocol-Version': '2.0.0',
      'X-RestLi-Method': 'batch_create',
      Authorization: 'Bearer ABC123',
      'Content-Type': 'multipart/form-data',
      'user-agent': `linkedin-api-js-client/${version}`,
      'LinkedIn-Version': '202209',
      'X-HTTP-Method-Override': 'GET'
    });
  });
});

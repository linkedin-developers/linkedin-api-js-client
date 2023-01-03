import { getRestApiBaseUrl, getRestliRequestHeaders } from '../../lib/utils/api-utils';
import { version } from '../../package.json';

describe('api-utils', () => {
  test('getRestApiBaseUrl', () => {
    expect(getRestApiBaseUrl()).toBe('https://api.linkedin.com/v2');
    expect(getRestApiBaseUrl('202209')).toBe('https://api.linkedin.com/rest');
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

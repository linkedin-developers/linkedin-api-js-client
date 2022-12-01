import { linkedInApiClient } from './../lib/client';
import nock from 'nock';

const TEST_BEARER_TOKEN = 'ABC123';
const NON_VERSIONED_BASE_URL = 'https://api.linkedin.com/v2';
const VERSIONED_BASE_URL = 'https://api.linkedin.com/rest';
// 4000 characters
const LONG_STRING = '421yg4h2cqta89yov4x39ojnzinhhph9y36depvp4f249j5unznzl52jlgok1bxgwt965i58cyd3afdmlxuobebizt3ju7qwrwim9pl5omz4k5dwzkqy6cni9ys7o9w32fl0ysdp4lrwji8dcxi9eqlfb0ym6ykz4r93udolzrw9eci06w55ksqs0zw47jzfx1upe7bishjxdndgp5ya5y61z78ay83xhqakvac8h5b84398o82c93bpnzjrxoggn2xqx6qyrb2dw4s9008wlwcivskni2ztjvcaq0hk2odvrmrijwyzfbf443u0g4jmorgdrqye9ee9bberkx9n7u4m16ekrapvxgkcezhbborbaa5lzjz92c1vgr44cn7olhb7yt0nsrsoug7dzj2c6mv7cady17by66me0cdj9la10o2v1x5yls9tmdp4qlyxgu2o5f83sgezs1570imkzorp7xqjlzrm4zlhq8729ljoqrj5zb2400u5cgty81el9wos2t0p1ghlv0v7izzlskgdpe0dxglbvpdi53ys392p9dp6lta8ms286r0pqvqgjepzzb5s4x5bq5mga1o1iwx2l4qn6oi3wqvr3octwb37s90h3ikw0b1imjko9i1z8b2bn05ud6df0nmkftsx2g3n32zdk8o9rgv428ifbc2n7nspyykljj4f8fc7xyhbx5aq3bwz6bca3yp8jebaxo92dbbo393cm41mjotdd2wov7agiydl6kv3gk2sa93p8j31bbne6t96gg5zamemcejj468hw1qbed4oiz5xkt4riuqsqawhb7uqgn4fa6ntonymyycgpq0zsuu66cxw011xp3sxehzgkesytivtx08pa0dtbv25xqx78ok9gc2fvockdnzkzpz46kchex2qyn742wty5d1ljsi7ffau5zpi62ntxid5px6zs2yuprc7rhq9s9j4plw0mqs21grdjmhmzgsn2ro640ezuoh0421yg4h2cqta89yov4x39ojnzinhhph9y36depvp4f249j5unznzl52jlgok1bxgwt965i58cyd3afdmlxuobebizt3ju7qwrwim9pl5omz4k5dwzkqy6cni9ys7o9w32fl0ysdp4lrwji8dcxi9eqlfb0ym6ykz4r93udolzrw9eci06w55ksqs0zw47jzfx1upe7bishjxdndgp5ya5y61z78ay83xhqakvac8h5b84398o82c93bpnzjrxoggn2xqx6qyrb2dw4s9008wlwcivskni2ztjvcaq0hk2odvrmrijwyzfbf443u0g4jmorgdrqye9ee9bberkx9n7u4m16ekrapvxgkcezhbborbaa5lzjz92c1vgr44cn7olhb7yt0nsrsoug7dzj2c6mv7cady17by66me0cdj9la10o2v1x5yls9tmdp4qlyxgu2o5f83sgezs1570imkzorp7xqjlzrm4zlhq8729ljoqrj5zb2400u5cgty81el9wos2t0p1ghlv0v7izzlskgdpe0dxglbvpdi53ys392p9dp6lta8ms286r0pqvqgjepzzb5s4x5bq5mga1o1iwx2l4qn6oi3wqvr3octwb37s90h3ikw0b1imjko9i1z8b2bn05ud6df0nmkftsx2g3n32zdk8o9rgv428ifbc2n7nspyykljj4f8fc7xyhbx5aq3bwz6bca3yp8jebaxo92dbbo393cm41mjotdd2wov7agiydl6kv3gk2sa93p8j31bbne6t96gg5zamemcejj468hw1qbed4oiz5xkt4riuqsqawhb7uqgn4fa6ntonymyycgpq0zsuu66cxw011xp3sxehzgkesytivtx08pa0dtbv25xqx78ok9gc2fvockdnzkzpz46kchex2qyn742wty5d1ljsi7ffau5zpi62ntxid5px6zs2yuprc7rhq9s9j4plw0mqs21grdjmhmzgsn2ro640ezuoh0421yg4h2cqta89yov4x39ojnzinhhph9y36depvp4f249j5unznzl52jlgok1bxgwt965i58cyd3afdmlxuobebizt3ju7qwrwim9pl5omz4k5dwzkqy6cni9ys7o9w32fl0ysdp4lrwji8dcxi9eqlfb0ym6ykz4r93udolzrw9eci06w55ksqs0zw47jzfx1upe7bishjxdndgp5ya5y61z78ay83xhqakvac8h5b84398o82c93bpnzjrxoggn2xqx6qyrb2dw4s9008wlwcivskni2ztjvcaq0hk2odvrmrijwyzfbf443u0g4jmorgdrqye9ee9bberkx9n7u4m16ekrapvxgkcezhbborbaa5lzjz92c1vgr44cn7olhb7yt0nsrsoug7dzj2c6mv7cady17by66me0cdj9la10o2v1x5yls9tmdp4qlyxgu2o5f83sgezs1570imkzorp7xqjlzrm4zlhq8729ljoqrj5zb2400u5cgty81el9wos2t0p1ghlv0v7izzlskgdpe0dxglbvpdi53ys392p9dp6lta8ms286r0pqvqgjepzzb5s4x5bq5mga1o1iwx2l4qn6oi3wqvr3octwb37s90h3ikw0b1imjko9i1z8b2bn05ud6df0nmkftsx2g3n32zdk8o9rgv428ifbc2n7nspyykljj4f8fc7xyhbx5aq3bwz6bca3yp8jebaxo92dbbo393cm41mjotdd2wov7agiydl6kv3gk2sa93p8j31bbne6t96gg5zamemcejj468hw1qbed4oiz5xkt4riuqsqawhb7uqgn4fa6ntonymyycgpq0zsuu66cxw011xp3sxehzgkesytivtx08pa0dtbv25xqx78ok9gc2fvockdnzkzpz46kchex2qyn742wty5d1ljsi7ffau5zpi62ntxid5px6zs2yuprc7rhq9s9j4plw0mqs21grdjmhmzgsn2ro640ezuoh0421yg4h2cqta89yov4x39ojnzinhhph9y36depvp4f249j5unznzl52jlgok1bxgwt965i58cyd3afdmlxuobebizt3ju7qwrwim9pl5omz4k5dwzkqy6cni9ys7o9w32fl0ysdp4lrwji8dcxi9eqlfb0ym6ykz4r93udolzrw9eci06w55ksqs0zw47jzfx1upe7bishjxdndgp5ya5y61z78ay83xhqakvac8h5b84398o82c93bpnzjrxoggn2xqx6qyrb2dw4s9008wlwcivskni2ztjvcaq0hk2odvrmrijwyzfbf443u0g4jmorgdrqye9ee9bberkx9n7u4m16ekrapvxgkcezhbborbaa5lzjz92c1vgr44cn7olhb7yt0nsrsoug7dzj2c6mv7cady17by66me0cdj9la10o2v1x5yls9tmdp4qlyxgu2o5f83sgezs1570imkzorp7xqjlzrm4zlhq8729ljoqrj5zb2400u5cgty81el9wos2t0p1ghlv0v7izzlskgdpe0dxglbvpdi53ys392p9dp6lta8ms286r0pqvqgjepzzb5s4x5bq5mga1o1iwx2l4qn6oi3wqvr3octwb37s90h3ikw0b1imjko9i1z8b2bn05ud6df0nmkftsx2g3n32zdk8o9rgv428ifbc2n7nspyykljj4f8fc7xyhbx5aq3bwz6bca3yp8jebaxo92dbbo393cm41mjotdd2wov7agiydl6kv3gk2sa93p8j31bbne6t96gg5zamemcejj468hw1qbed4oiz5xkt4riuqsqawhb7uqgn4fa6ntonymyycgpq0zsuu66cxw011xp3sxehzgkesytivtx08pa0dtbv25xqx78ok9gc2fvockdnzkzpz46kchex2qyn742wty5d1ljsi7ffau5zpi62ntxid5px6zs2yuprc7rhq9s9j4plw0mqs21grdjmhmzgsn2ro640ezuoh0';

describe('LinkedInApiClient', () => {

  test.each([
    {
      description: 'Get request for a non-versioned collection resource',
      requestOptions: {
        resource: '/adAccounts',
        id: 123,
        accessToken: TEST_BEARER_TOKEN
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/adAccounts/123'
      },
      expectedResponse: {
        data: { name: 'TestAdAccount' },
        status: 200
      }
    },
    {
      description: 'Get request for a simple resource',
      requestOptions: {
        resource: '/me',
        accessToken: TEST_BEARER_TOKEN
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/me'
      },
      expectedResponse: {
        data: { name: 'Jojo' },
        status: 200
      }
    },
    {
      description: 'Get request for versioned collection resource',
      requestOptions: {
        resource: '/adAccounts',
        id: 123,
        versionString: '202209',
        accessToken: TEST_BEARER_TOKEN
      },
      expectedRequest: {
        baseUrl: VERSIONED_BASE_URL,
        path: '/adAccounts/123'
      },
      expectedResponse: {
        data: { name: 'TestAdAccount' },
        status: 200
      }
    },
    {
      description: 'Get request with complex key and query parameters',
      requestOptions: {
        resource: '/accountRoles',
        id: { member: 'urn:li:person:123', account: 'urn:li:account:234'},
        queryParams: {
          param1: 'foobar',
          param2: { prop1: 'abc', prop2: 'def' }
        },
        accessToken: TEST_BEARER_TOKEN
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/accountRoles/(member:urn%3Ali%3Aperson%3A123,account:urn%3Ali%3Aaccount%3A234)?param1=foobar&param2=(prop1:abc,prop2:def)'
      },
      expectedResponse: {
        data: { name: 'Steven' },
        status: 200
      }
    },
    {
      description: 'Error response',
      requestOptions: {
        resource: '/adAccounts',
        id: 123,
        accessToken: TEST_BEARER_TOKEN
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/adAccounts/123'
      },
      expectedResponse: {
        data: {
          status: 429,
          code: 'QUOTA_EXCEEDED',
          message: 'Daily request quota exceeded'
        },
        status: 429,
        isError: true
      }
    }
  ])('$description', async ({ requestOptions, expectedRequest, expectedResponse}) => {
    const expectedCommonHeaders = {
      'x-restli-protocol-version': '2.0.0',
      'x-restli-method': 'get',
      'authorization': `Bearer ${TEST_BEARER_TOKEN}`
    };

    nock(expectedRequest.baseUrl, {
      reqheaders: {...expectedCommonHeaders}
    })
      .get(expectedRequest.path)
      .reply(expectedResponse.status, expectedResponse.data);

    if (expectedResponse.isError) {
      try {
        await linkedInApiClient.get(requestOptions);
      } catch (error) {
        expect(error.response.status).toBe(expectedResponse.status);
        expect(error.response.data).toStrictEqual(expectedResponse.data);
      }
    } else {
      const response = await linkedInApiClient.get(requestOptions);
      expect(response);
      expect(response.data).toStrictEqual(expectedResponse.data);
      expect(response.status).toBe(expectedResponse.status);
    }
  });

});
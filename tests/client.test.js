import { linkedInApiClient } from './../lib/client';
import { constants } from './../lib/utils/constants';
import nock from 'nock';
import _ from 'lodash';

const TEST_BEARER_TOKEN = 'ABC123';
const NON_VERSIONED_BASE_URL = 'https://api.linkedin.com/v2';
const VERSIONED_BASE_URL = 'https://api.linkedin.com/rest';
// 4000 characters
const LONG_STRING = '421yg4h2cqta89yov4x39ojnzinhhph9y36depvp4f249j5unznzl52jlgok1bxgwt965i58cyd3afdmlxuobebizt3ju7qwrwim9pl5omz4k5dwzkqy6cni9ys7o9w32fl0ysdp4lrwji8dcxi9eqlfb0ym6ykz4r93udolzrw9eci06w55ksqs0zw47jzfx1upe7bishjxdndgp5ya5y61z78ay83xhqakvac8h5b84398o82c93bpnzjrxoggn2xqx6qyrb2dw4s9008wlwcivskni2ztjvcaq0hk2odvrmrijwyzfbf443u0g4jmorgdrqye9ee9bberkx9n7u4m16ekrapvxgkcezhbborbaa5lzjz92c1vgr44cn7olhb7yt0nsrsoug7dzj2c6mv7cady17by66me0cdj9la10o2v1x5yls9tmdp4qlyxgu2o5f83sgezs1570imkzorp7xqjlzrm4zlhq8729ljoqrj5zb2400u5cgty81el9wos2t0p1ghlv0v7izzlskgdpe0dxglbvpdi53ys392p9dp6lta8ms286r0pqvqgjepzzb5s4x5bq5mga1o1iwx2l4qn6oi3wqvr3octwb37s90h3ikw0b1imjko9i1z8b2bn05ud6df0nmkftsx2g3n32zdk8o9rgv428ifbc2n7nspyykljj4f8fc7xyhbx5aq3bwz6bca3yp8jebaxo92dbbo393cm41mjotdd2wov7agiydl6kv3gk2sa93p8j31bbne6t96gg5zamemcejj468hw1qbed4oiz5xkt4riuqsqawhb7uqgn4fa6ntonymyycgpq0zsuu66cxw011xp3sxehzgkesytivtx08pa0dtbv25xqx78ok9gc2fvockdnzkzpz46kchex2qyn742wty5d1ljsi7ffau5zpi62ntxid5px6zs2yuprc7rhq9s9j4plw0mqs21grdjmhmzgsn2ro640ezuoh0421yg4h2cqta89yov4x39ojnzinhhph9y36depvp4f249j5unznzl52jlgok1bxgwt965i58cyd3afdmlxuobebizt3ju7qwrwim9pl5omz4k5dwzkqy6cni9ys7o9w32fl0ysdp4lrwji8dcxi9eqlfb0ym6ykz4r93udolzrw9eci06w55ksqs0zw47jzfx1upe7bishjxdndgp5ya5y61z78ay83xhqakvac8h5b84398o82c93bpnzjrxoggn2xqx6qyrb2dw4s9008wlwcivskni2ztjvcaq0hk2odvrmrijwyzfbf443u0g4jmorgdrqye9ee9bberkx9n7u4m16ekrapvxgkcezhbborbaa5lzjz92c1vgr44cn7olhb7yt0nsrsoug7dzj2c6mv7cady17by66me0cdj9la10o2v1x5yls9tmdp4qlyxgu2o5f83sgezs1570imkzorp7xqjlzrm4zlhq8729ljoqrj5zb2400u5cgty81el9wos2t0p1ghlv0v7izzlskgdpe0dxglbvpdi53ys392p9dp6lta8ms286r0pqvqgjepzzb5s4x5bq5mga1o1iwx2l4qn6oi3wqvr3octwb37s90h3ikw0b1imjko9i1z8b2bn05ud6df0nmkftsx2g3n32zdk8o9rgv428ifbc2n7nspyykljj4f8fc7xyhbx5aq3bwz6bca3yp8jebaxo92dbbo393cm41mjotdd2wov7agiydl6kv3gk2sa93p8j31bbne6t96gg5zamemcejj468hw1qbed4oiz5xkt4riuqsqawhb7uqgn4fa6ntonymyycgpq0zsuu66cxw011xp3sxehzgkesytivtx08pa0dtbv25xqx78ok9gc2fvockdnzkzpz46kchex2qyn742wty5d1ljsi7ffau5zpi62ntxid5px6zs2yuprc7rhq9s9j4plw0mqs21grdjmhmzgsn2ro640ezuoh0421yg4h2cqta89yov4x39ojnzinhhph9y36depvp4f249j5unznzl52jlgok1bxgwt965i58cyd3afdmlxuobebizt3ju7qwrwim9pl5omz4k5dwzkqy6cni9ys7o9w32fl0ysdp4lrwji8dcxi9eqlfb0ym6ykz4r93udolzrw9eci06w55ksqs0zw47jzfx1upe7bishjxdndgp5ya5y61z78ay83xhqakvac8h5b84398o82c93bpnzjrxoggn2xqx6qyrb2dw4s9008wlwcivskni2ztjvcaq0hk2odvrmrijwyzfbf443u0g4jmorgdrqye9ee9bberkx9n7u4m16ekrapvxgkcezhbborbaa5lzjz92c1vgr44cn7olhb7yt0nsrsoug7dzj2c6mv7cady17by66me0cdj9la10o2v1x5yls9tmdp4qlyxgu2o5f83sgezs1570imkzorp7xqjlzrm4zlhq8729ljoqrj5zb2400u5cgty81el9wos2t0p1ghlv0v7izzlskgdpe0dxglbvpdi53ys392p9dp6lta8ms286r0pqvqgjepzzb5s4x5bq5mga1o1iwx2l4qn6oi3wqvr3octwb37s90h3ikw0b1imjko9i1z8b2bn05ud6df0nmkftsx2g3n32zdk8o9rgv428ifbc2n7nspyykljj4f8fc7xyhbx5aq3bwz6bca3yp8jebaxo92dbbo393cm41mjotdd2wov7agiydl6kv3gk2sa93p8j31bbne6t96gg5zamemcejj468hw1qbed4oiz5xkt4riuqsqawhb7uqgn4fa6ntonymyycgpq0zsuu66cxw011xp3sxehzgkesytivtx08pa0dtbv25xqx78ok9gc2fvockdnzkzpz46kchex2qyn742wty5d1ljsi7ffau5zpi62ntxid5px6zs2yuprc7rhq9s9j4plw0mqs21grdjmhmzgsn2ro640ezuoh0421yg4h2cqta89yov4x39ojnzinhhph9y36depvp4f249j5unznzl52jlgok1bxgwt965i58cyd3afdmlxuobebizt3ju7qwrwim9pl5omz4k5dwzkqy6cni9ys7o9w32fl0ysdp4lrwji8dcxi9eqlfb0ym6ykz4r93udolzrw9eci06w55ksqs0zw47jzfx1upe7bishjxdndgp5ya5y61z78ay83xhqakvac8h5b84398o82c93bpnzjrxoggn2xqx6qyrb2dw4s9008wlwcivskni2ztjvcaq0hk2odvrmrijwyzfbf443u0g4jmorgdrqye9ee9bberkx9n7u4m16ekrapvxgkcezhbborbaa5lzjz92c1vgr44cn7olhb7yt0nsrsoug7dzj2c6mv7cady17by66me0cdj9la10o2v1x5yls9tmdp4qlyxgu2o5f83sgezs1570imkzorp7xqjlzrm4zlhq8729ljoqrj5zb2400u5cgty81el9wos2t0p1ghlv0v7izzlskgdpe0dxglbvpdi53ys392p9dp6lta8ms286r0pqvqgjepzzb5s4x5bq5mga1o1iwx2l4qn6oi3wqvr3octwb37s90h3ikw0b1imjko9i1z8b2bn05ud6df0nmkftsx2g3n32zdk8o9rgv428ifbc2n7nspyykljj4f8fc7xyhbx5aq3bwz6bca3yp8jebaxo92dbbo393cm41mjotdd2wov7agiydl6kv3gk2sa93p8j31bbne6t96gg5zamemcejj468hw1qbed4oiz5xkt4riuqsqawhb7uqgn4fa6ntonymyycgpq0zsuu66cxw011xp3sxehzgkesytivtx08pa0dtbv25xqx78ok9gc2fvockdnzkzpz46kchex2qyn742wty5d1ljsi7ffau5zpi62ntxid5px6zs2yuprc7rhq9s9j4plw0mqs21grdjmhmzgsn2ro640ezuoh0';


describe('LinkedInApiClient', () => {

  test.each([
    /**
     * GET Method
     */
    {
      description: 'Get request for a non-versioned collection resource',
      inputRequestRestliMethod: 'GET',
      inputRequestOptions: {
        resource: '/adAccounts',
        id: 123,
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: { name: 'TestAdAccount' },
        status: 200
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/adAccounts/123'
      }
    },
    {
      description: 'Get request for a simple resource',
      inputRequestRestliMethod: 'GET',
      inputRequestOptions: {
        resource: '/me',
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: { name: 'Jojo' },
        status: 200
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/me'
      }
    },
    {
      description: 'Get request for versioned collection resource',
      inputRequestRestliMethod: 'GET',
      inputRequestOptions: {
        resource: '/adAccounts',
        id: 123,
        versionString: '202209',
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: { name: 'TestAdAccount' },
        status: 200
      },
      expectedRequest: {
        baseUrl: VERSIONED_BASE_URL,
        path: '/adAccounts/123',
        additionalHeaders: {
          'linkedin-version': '202209'
        }
      }
    },
    {
      description: 'Get request with complex key and query parameters',
      inputRequestRestliMethod: 'GET',
      inputRequestOptions: {
        resource: '/accountRoles',
        id: { member: 'urn:li:person:123', account: 'urn:li:account:234'},
        queryParams: {
          param1: 'foobar',
          param2: { prop1: 'abc', prop2: 'def' }
        },
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: { name: 'Steven' },
        status: 200
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/accountRoles/(member:urn%3Ali%3Aperson%3A123,account:urn%3Ali%3Aaccount%3A234)?param1=foobar&param2=(prop1:abc,prop2:def)'
      }
    },
    {
      description: 'Get request with error response',
      inputRequestRestliMethod: 'GET',
      inputRequestOptions: {
        resource: '/adAccounts',
        id: 123,
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: {
          status: 429,
          code: 'QUOTA_EXCEEDED',
          message: 'Daily request quota exceeded'
        },
        status: 429,
        isError: true
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/adAccounts/123'
      },
    },
    {
      description: 'Get request with query tunneling',
      inputRequestRestliMethod: 'GET',
      inputRequestOptions: {
        resource: '/adAccounts',
        id: 123,
        queryParams: {
          longParam: LONG_STRING
        },
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: { name: 'TestAdAccount' },
        status: 200
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/adAccounts/123',
        overrideMethod: 'post',
        body: `longParam=${LONG_STRING}`,
        additionalHeaders: {
          'x-http-method-override': 'GET',
          'content-type': 'application/x-www-form-urlencoded'
        }
      },
    },

    /**
     * BATCH_GET Method
     */
    {
      description: 'Batch get request for a non-versioned collection resource',
      inputRequestRestliMethod: 'BATCH_GET',
      inputRequestOptions: {
        resource: '/testResource',
        ids: [123, 456, 789],
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: {
          results: {
            123: { name: 'A' },
            456: { name: 'B' },
            789: { name: 'C' }
          }
        },
        status: 200
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/testResource?ids=List(123,456,789)'
      }
    },
    {
      description: 'Batch get request with complex key and query parameters',
      inputRequestRestliMethod: 'BATCH_GET',
      inputRequestOptions: {
        resource: '/testResource',
        ids: [
          { member: 'urn:li:person:123', account: 'urn:li:account:234' },
          { member: 'urn:li:person:234', account: 'urn:li:account:345' },
          { member: 'urn:li:person:345', account: 'urn:li:account:456' }
        ],
        queryParams: {
          param1: 'foobar',
          param2: { prop1: 'abc', prop2: 'def' }
        },
        versionString: '202210',
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: {
          results: {
            '(member:urn%3Ali%3Aperson%3A123,account:urn%3Ali%3Aaccount%3A234)': { name: 'A' },
            '(member:urn%3Ali%3Aperson%3A234,account:urn%3Ali%3Aaccount%3A345)': { name: 'B' },
            '(member:urn%3Ali%3Aperson%3A345,account:urn%3Ali%3Aaccount%3A456)': { name: 'C' }
          }
        },
        status: 200
      },
      expectedRequest: {
        baseUrl: VERSIONED_BASE_URL,
        path: '/testResource?ids=List((member:urn%3Ali%3Aperson%3A123,account:urn%3Ali%3Aaccount%3A234),(member:urn%3Ali%3Aperson%3A234,account:urn%3Ali%3Aaccount%3A345),(member:urn%3Ali%3Aperson%3A345,account:urn%3Ali%3Aaccount%3A456))&param1=foobar&param2=(prop1:abc,prop2:def)'
      },
    },
    {
      description: 'Batch get request with error response',
      inputRequestRestliMethod: 'BATCH_GET',
      inputRequestOptions: {
        resource: '/testResource',
        ids: [123, 456, 789],
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: {
          status: 429,
          code: 'QUOTA_EXCEEDED',
          message: 'Daily request quota exceeded'
        },
        status: 429,
        isError: true
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/testResource?ids=List(123,456,789)'
      },
    },
    {
      description: 'Batch get request with query tunneling',
      inputRequestRestliMethod: 'BATCH_GET',
      inputRequestOptions: {
        resource: '/testResource',
        ids: [123, 456, 789],
        queryParams: {
          longParam: LONG_STRING
        },
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: {
          results: {
            123: { name: 'A' },
            456: { name: 'B' },
            789: { name: 'C' }
          }
        },
        status: 200
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/testResource',
        overrideMethod: 'post',
        body: `ids=List(123,456,789)&longParam=${LONG_STRING}`,
        additionalHeaders: {
          'x-http-method-override': 'GET',
          'content-type': 'application/x-www-form-urlencoded'
        }
      },
    },

    /**
     * GET_ALL Method
     */
    {
      description: 'Get all request for a non-versioned collection resource',
      inputRequestRestliMethod: 'GET_ALL',
      inputRequestOptions: {
        resource: '/testResource',

        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: {
          elements: [
            { name: 'A' },
            { name: 'B' }
          ]
        },
        status: 200
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/testResource',

      }
    },

    /**
     * CREATE Method
     */
    {
      description: 'Create request for a non-versioned resource',
      inputRequestRestliMethod: 'CREATE',
      inputRequestOptions: {
        resource: '/testResource',
        data: {
          name: 'TestApp1'
        },
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: null,
        status: 201
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/testResource',
        body: {
          name: 'TestApp1'
        }
      }
    },

    /**
     * BATCH_CREATE Method
     */
    {
      desription: 'Batch create request for a non-versioned resource',
      inputRequestRestliMethod: 'BATCH_CREATE',
      inputRequestOptions: {
        resource: '/adCampaignGroups',
        entities: [
          {
            account: 'urn:li:sponsoredAccount:111',
            name: 'Test1'
          },
          {
            account: 'urn:li:sponsoredAccount:222',
            name: 'Test2'
          }
        ],
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: {
          elements: [
            { status: 201 },
            { status: 400 }
          ]
        },
        status: 201
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/adCampaignGroups',
        body: {
          elements: [
            {
              account: 'urn:li:sponsoredAccount:111',
              name: 'Test1'
            },
            {
              account: 'urn:li:sponsoredAccount:222',
              name: 'Test2'
            }
          ]
        }
      }
    },

    /**
     * PARTIAL_UPDATE Method
     */
    {
      description: 'Partial update using original/modified entity',
      inputRequestRestliMethod: 'PARTIAL_UPDATE',
      inputRequestOptions: {
        resource: '/testResource',
        id: 123,
        originalEntity: {
          name: 'TestApp1',
          organization: 'urn:li:organization:123',
          description: 'foobar'
        },
        modifiedEntity: {
          name: 'TestApp1',
          organization: 'urn:li:organization:1234',
          description: 'foobar2'
        },
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: null,
        status: 204
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/testResource/123',
        body: {
          patch: {
            $set: {
              organization: 'urn:li:organization:1234',
              description: 'foobar2'
            }
          }
        }
      }
    },
    {
      description: 'Partial update using patchSetObject',
      inputRequestRestliMethod: 'PARTIAL_UPDATE',
      inputRequestOptions: {
        resource: '/testResource',
        id: 123,
        patchSetObject: {
          organization: 'urn:li:organization:123',
          description: 'foobar'
        },
        accessToken: TEST_BEARER_TOKEN
      },
      inputResponse: {
        data: null,
        status: 204
      },
      expectedRequest: {
        baseUrl: NON_VERSIONED_BASE_URL,
        path: '/testResource/123',
        body: {
          patch: {
            $set: {
              organization: 'urn:li:organization:123',
              description: 'foobar'
            }
          }
        }
      }
    }

  ])('$description', async ({ inputRequestRestliMethod, inputRequestOptions, inputResponse, expectedRequest}) => {
    const expectedCommonHeaders = {
      'x-restli-protocol-version': '2.0.0',
      'x-restli-method': inputRequestRestliMethod.toLowerCase(),
      'authorization': `Bearer ${TEST_BEARER_TOKEN}`
    };

    // Mock the expected http request

    /**
     * If the expected request uses a different http method than the standard
     * Rest.li method mapping (due to query tunneling), then use that instead.
     */
    const httpMethod = expectedRequest.overrideMethod || constants.RESTLI_METHOD_TO_HTTP_METHOD_MAP[inputRequestRestliMethod];
    nock(expectedRequest.baseUrl, {
      reqheaders: {...expectedCommonHeaders, ...expectedRequest.additionalHeaders}
    })
      [httpMethod.toLowerCase()](expectedRequest.path, expectedRequest.body)
      .reply(inputResponse.status, inputResponse.data);


    // Make request using LinkedIn API client
    const apiClientMethod = _.camelCase(inputRequestRestliMethod);
    if (inputResponse.isError) {
      // If expecting error response
      try {
        await linkedInApiClient[apiClientMethod](inputRequestOptions);
      } catch (error) {
        expect(error.response.status).toBe(inputResponse.status);
        expect(error.response.data).toStrictEqual(inputResponse.data);
      }
    } else {
      // If expecting success response
      const response = await linkedInApiClient[apiClientMethod](inputRequestOptions);
      expect(response);
      expect(response.data).toStrictEqual(inputResponse.data);
      expect(response.status).toBe(inputResponse.status);
    }
  });

});
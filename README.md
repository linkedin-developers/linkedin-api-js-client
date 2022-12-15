## Overview

This library provides a thin JavaScript client for making requests to LinkedIn APIs, utilizing the [Axios](https://axios-http.com/docs/intro) HTTP client library and written in TypeScript. LinkedIn's APIs are built on the [Rest.li](https://linkedin.github.io/rest.li/) framework with additional LinkedIn-specific constraints, which results in a robust yet complex protocol that can be challening to implement correctly.

This library helps reduce this complexity by formatting requests correctly, providing proper request headers, and providing interfaces to develop against for responses. The library also provides an auth client for inspecting, generating, and refreshing access tokens, along with other helpful utilities.

This library is intended to be used within a NodeJS server application. API requests from browser environments are not supported for LinkedIn APIs due to CORS policy.

### Features

- Generic support for all Rest.li methods used in LinkedIn APIs
- Supports Rest.li protocol version 2.0.0
- Provide typescript interfaces for request options/response payloads
- Built-in parameter encoding
- Partial update patch generation utilities
- LinkedIn URN utilities
- Supports versioned APIs
- Automatic query tunneling of requests
- 2-legged and 3-legged OAuth2 support

### Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Pre-requisites](#pre-requisites)
  - [Simple API request example](#simple-api-request-example)
  - [Running Samples](#running-samples)
- [API Client](#api-client)
  - [Constructor](#constructor)
  - [Properties](#properties)
  - [Methods](#methods)
    - [`restliClient.get(params)`](#restliclientgetparams)
    - [`restliClient.batchGet(params)`](#restliclientbatchgetparams)
    - [`restliClient.getAll(params)`](#restliclientgetallparams)
    - [`restliClient.finder(params)`](#restliclientfinderparams)
    - [`restliClient.batchFinder(params)`](#restliclientbatchfinderparams)
    - [`restliClient.create(params)`](#restliclientcreateparams)
    - [`restliClient.batchCreate(params)`](#restliclientbatchcreateparams)
    - [`restliClient.update(params)`](#restliclientupdateparams)
    - [`restliClient.batchUpdate(params)`](#restliclientbatchupdateparams)
    - [`restliClient.partialUpdate(params)`](#restliclientpartialupdateparams)
    - [`restliClient.batchPartialUpdate(params)`](#restliclientbatchpartialupdateparams)
    - [`restliClient.delete(params)`](#restliclientdeleteparams)
    - [`restliClient.batchDelete(params)`](#restliclientbatchdeleteparams)
    - [`restliClient.action(params)`](#restliclientactionparams)
- [Auth Client](#auth-client)
  - [Constructor](#constructor-1)
  - [Methods](#methods-1)
    - [`authClient.generateMemberAuthorizationUrl(scopes, state)`](#authclientgeneratememberauthorizationurlscopes-state)
    - [`authClient.exchangeAuthCodeForAccessToken(code)`](#authclientexchangeauthcodeforaccesstokencode)
    - [`authClient.exchangeRefreshTokenForAccessToken(refreshToken)`](#authclientexchangerefreshtokenforaccesstokenrefreshtoken)
    - [`authClient.getTwoLeggedAccessToken()`](#authclientgettwoleggedaccesstoken)
    - [`authClient.introspectAccessToken(accessToken)`](#authclientintrospectaccesstokenaccesstoken)
- [Utilities](#utilities)
  - [Methods](#methods-2)
    - [`utils.paramEncode(queryParams)`](#utilsparamencodequeryparams)
    - [`utils.encode(value)`](#utilsencodevalue)
    - [`utils.createUrnFromAttrs()`](#utilscreateurnfromattrs)
    - [`utils.getCreatedEntityId(response)`](#utilsgetcreatedentityidresponse)
    - [`utils.getPatchObject(original, modified)`](#utilsgetpatchobjectoriginal-modified)
- [List of dependencies](#list-of-dependencies)

## Installation

Using npm:

```sh
npm install linkedin-api-js-client
```
Using yarn:

```sh
yarn add linkedin-api-js-client
```

## Getting Started

### Pre-requisites

1. Create or use an existing developer application from the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps/)
2. Request access to the Sign In With LinkedIn API product. This is a self-serve product that will be provisioned immediately to your application.
3. Generate a 3-legged access token using the Developer Portal [token generator tool](https://www.linkedin.com/developers/tools/oauth/token-generator), selecting the r_liteprofile scope.

### Simple API request example

From the [API docs](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin?context=linkedin%2Fconsumer%2Fcontext) for the Sign In with LinkedIn API product, we see this is a simple get request to fetch the current user's profile.

```js
const { RestliClient } = require('linkedin-api-js-client');

...
const restliClient = new RestliClient();

restliClient.get({
  resource: '/me',
  accessToken: <THREE_LEGGED_ACCESS_TOKEN>
}).then(response => {
  const profile = response.data;
});
...
```

### Running Samples



## API Client

The API client defines instance methods for all the Rest.li methods which are used by LinkedIn APIs. Rest.li defines a standard set of methods that can operate on a resource, each of which maps to an HTTP method. Depending on the resource, some Rest.li methods are not applicable or not implemented. Read the API docs to determine what Rest.li method is applicable and the applicable request parameters.

### Constructor

An instance of the API client must be created before using.

```
const { RestliClient } = require('linkedin-api-js-client');

const restliClient = new RestliClient(config);
```

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `config` | Object : [AxiosRequestConfig](https://axios-http.com/docs/req_config) | No | An initial, optional config that used to configure the axios instance (e.g. default timeout). |

### Properties

| Property | Description |
|---|---|
| `axiosInstance` | The axios instance used for making http requests. This is exposed to allow for additional configuration (e.g. adding custom request/response interceptors). |

### Methods

#### Base Request Options

All methods of the API client require passing in a request options object, all of which extend the following BaseRequestOptions object:

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `BaseRequestOptions.resource` | String | Yes | The API resource name, which should begin with a forward slash (e.g. "/adAccounts") |
| `BaseRequestOptions.queryParams` | Object | No | A map of query parameters. The parameter keys and values will be correctly encoded by this method, so these should not be encoded. |
| `BaseRequestOptions.accessToken` | String | Yes | The access token that should provide the application access to the specified API |
| `BaseRequestOptions.versionString` | String | No | An optional version string of the format "YYYYMM" or "YYYYMM.RR". If specified, the version header will be passed and the request will use the versioned APIs base URL |
| `BaseRequestOptions.additionalConfig` | Object : [AxiosRequestConfig](https://axios-http.com/docs/req_config) | No | An optional Axios request config object that will be merged into the request config. This will override any properties the client method sets and any properties passed in during the RestliClient instantiation, which may cause unexpected errors. Query params should not be passed here--instead they should be set in the `queryParams` proeprty for proper Rest.li encoding. |

#### Base Response Object

All methods of the API client return a Promise that resolves to a response object that extends [AxiosResponse](https://axios-http.com/docs/res_schema). This client provides more detailed interfaces of the specific response data payload that is useful for static type-checking and IDE auto-completion.

#### `restliClient.get(params)`

Makes a Rest.li GET request to fetch the specified entity on a resource. This method will perform query tunneling if necessary.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| `params.id` | String \|\| Number \|\| Object | No | The id or key of the entity to fetch. For simple resources, this is not specified. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| `response.data` | Object | The JSON-serialized Rest.li entity |

**Example:**
```js
restliClient.get({
  resource: '/adAccounts',
  id: 123,
  queryParams: {
    fields: 'id,name'
  },
  accessToken: MY_ACCESS_TOKEN,
  versionString: '202210'
}).then(response => {
  const entity = response.data;
});
```

#### `restliClient.batchGet(params)`

Makes a Rest.li BATCH_GET request to fetch multiple entities on a resource. This method will perform query tunneling if necessary.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| `params.ids` | String[] \|\| Number[] \|\| Object[] | Yes | The list of ids to fetch on the resource. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| `response.data.results` | Object | A map of entities that were successfully retrieved, with the key being the encoded entity id, and the value being the JSON-serialized entity. |
| `response.data.errors` | Object | A map containing entities that could not be successfully fetched, with the key being the encoded entity id, and the value being the error response. |
| `response.data.statuses` | Object | A map of entities and status code, with the key being the encoded entity id, and the value being the status code number value. |

**Example:**
```js
restliClient.batchGet({
  resource: '/adCampaignGroups',
  id: [123, 456, 789],
  accessToken: MY_ACCESS_TOKEN,
  versionString: '202210'
}).then(response => {
  const entity = response.data.results;
});
```

#### `restliClient.getAll(params)`

Makes a Rest.li GET_ALL request to fetch all entities on a resource.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| `response.data.elements` | Object[] | The list of JSON-serialized Rest.li entities |
| `response.data.paging` | Object | Paging metadata object

**Example:**
```js
restliClient.getAll({
  resource: '/fieldsOfStudy',
  queryParams: {
    start: 0,
    count: 15
  },
  accessToken: MY_ACCESS_TOKEN,
  versionString: '202210'
}).then(response => {
  const elements = response.data.elements;
  const total = response.data.paging.total;
});
```

#### `restliClient.finder(params)`

Makes a Rest.li FINDER request to find entities by some specified criteria.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| `params.finderName` | String | Yes | The Rest.li finder name. This will be included in the request query parameters. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| `response.data.elements` | Object[] | The list of entities found based on the search criteria. |
| `response.data.paging` | Object | Paging metadata object |

**Example:**
```js
restliClient.finder({
  resource: '/adAccounts',
  finderName: 'search'
  queryParams: {
    search: {
      status: {
        values: ['DRAFT', 'ACTIVE', 'REMOVED']
      },
      reference: {
        values: ['urn:li:organization:123']
      },
      test: false
    }
  },
  accessToken: MY_ACCESS_TOKEN,
  versionString: '202210'
}).then(response => {
  const elements = response.data.elements;
  const total = response.data.paging.total;
});
```

#### `restliClient.batchFinder(params)`

Makes a Rest.li BATCH_FINDER request to find entities by multiple sets of criteria.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| `params.batchFinderName` | String | Yes | The Rest.li batch finder name. This will be included in the request query parameters. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| `response.data.elements` | Object[] | An array of finder search results in the same order as the array of search criteria provided to the batch finder. |
| `response.data.elements[].elements` | Object[] | An array of entities found based on the corresponding search criteria. |
| `response.data.elements[].paging` | Object | Paging metadata object |
| `response.data.elements[].metadata` | Object | Optional finder results metadata object |
| `response.data.elements[].error` | Object | Error response object if this finder request encountered an error. |
| `response.data.elements[].isError` | boolean | Flag indicating whether the finder request encountered an error. |

**Example:**
```js
restliClient.batchFinder({
  resource: '/organizationAuthorizations',
  batchFinderName: 'authorizationActionsAndImpersonator'
  queryParams: {
    authorizationActions: [
      {
        'OrganizationRoleAuthorizationAction': {
          actionType: 'ADMINISTRATOR_READ'
        }
      },
      {
        'OrganizationContentAuthorizationAction': {
          actionType: 'ORGANIC_SHARE_DELETE'
        }
      }
    ]
  },
  accessToken: MY_ACCESS_TOKEN,
  versionString: '202210'
}).then(response => {
  const allFinderResults = response.data.elements;
});
```

#### `restliClient.create(params)`

Makes a Rest.li CREATE request to create a new entity on the resource.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| `params.entity` | Object | Yes | The JSON-serialized value of the entity to create |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| `response.createdEntityId` | String \|\| Number | The id of the created entity |

**Example:**
```js
restliClient.create({
  resource: '/adAccountsV2',
  entity: {
    name: 'Test Ad Account',
    type: 'BUSINESS',
    test: true
  },
  accessToken: MY_ACCESS_TOKEN
}).then(response => {
  const createdEntityId = response.createdEntityId;
});
```

#### `restliClient.batchCreate(params)`

Makes a Rest.li BATCH_CREATE request to create multiple entities in a single call.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| `params.entities` | Object[] | Yes | The JSON-serialized values of the entities to create |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| `response.data.elements` | Object[] | A list of entity creation response data in the same order as the entities provided in the batch create request. |
| `response.data.elements[].status` | Number | The response status when creating the entity. |
| `response.data.elements[].id` | String \|\| Number | The encoded id of the newly-created entity, if creation was successful. |
| `response.data.elements[].error` | Object | The error object details when creating an entity, if creation failed. |

**Example:**
```js
restliClient.batchCreate({
  resource: '/adCampaignGroups',
  entities: [
    {
      account: 'urn:li:sponsoredAccount:111',
      name: 'CampaignGroupTest1',
      status: 'DRAFT'
    },
    {
      account: 'urn:li:sponsoredAccount:222',
      name: 'CampaignGroupTest2',
      status: 'DRAFT'
    }
  ],
  versionString: '202209',
  accessToken: MY_ACCESS_TOKEN
}).then(response => {
  const createdElementsInfo = response.data.elements;
});
```

#### `restliClient.update(params)`

Makes a Rest.li UPDATE request to update an entity (overwriting the entire entity).

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| `params.id` | String \|\| Number \|\| Object | Yes | The id or key of the entity to update. For simple resources, this is not specified. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |

**Example:**
```js
restliClient.update({
  resource: '/adAccountUsers',
  id: {
    account: 'urn:li:sponsoredAccount:123',
    user: 'urn:li:person:foobar'
  },
  entity: {
    account: 'urn:li:sponsoredAccount:123',
    user: 'urn:li:person:foobar',
    role: 'VIEWER'
  },
  versionString: '202210',
  accessToken: MY_ACCESS_TOKEN
}).then(response => {
  const status = response.status;
});
```

#### `restliClient.batchUpdate(params)`

Makes a Rest.li BATCH_UPDATE request to update multiple entities in a single call.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| `params.ids` | String[] \|\| Number[] \|\| Object[] | Yes | The list of entity ids to update |
| `params.entities` | Object[] | Yes | The list of JSON-serialized values of entities with updated values. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |

**Example:**
```js
restliClient.batchUpdate({
  resource: '/campaignConversions',
  ids: [
    { campaign: 'urn:li:sponsoredCampaign:123', conversion: 'urn:lla:llaPartnerConversion:456' },
    { campaign: 'urn:li:sponsoredCampaign:123', conversion: 'urn:lla:llaPartnerConversion:789' }
  ],
  entities: [
    { campaign: 'urn:li:sponsoredCampaign:123', conversion: 'urn:lla:llaPartnerConversion:456' },
    { campaign: 'urn:li:sponsoredCampaign:123', conversion: 'urn:lla:llaPartnerConversion:789' }
  ]
  accessToken: MY_ACCESS_TOKEN
}).then(response => {
  const results = response.data.results;
});
```

#### `restliClient.partialUpdate(params)`

Makes a Rest.li PARTIAL_UPDATE request to update part of an entity. One can either directly pass the patch object to send in the request, or one can pass the full original and modified entity objects, with the method computing the correct patch object.

When an entity has nested fields that can be modified, passing in the original and modified entities may produce a complex patch object that is a technically correct format for the Rest.li framework, but may not be supported for most LinkedIn APIs which mainly support partial update of only top-level fields on an entity. In these cases it is better to specify `patchSetObject` directly.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| `params.id` | String \|\| Number \|\| Object | No | The id or key of the entity to update. For simple resources, this is not specified. |
| `params.patchSetObject` | Object | No | The JSON-serialized value of the entity with only the modified fields present. If specified, this will be directly sent as the patch object. |
| `params.originalEntity` | Object | No | The JSON-serialized value of the original entity. If specified and `patchSetObject` is not provided, this will be used in conjunction with `modifiedEntity` to compute the patch object. |
| `params.modifiedEntity` | Object | No | The JSON-serialized value of the modified entity. If specified and `patchSetObject` is not provided, this will be used in conjunction with `originalEntity` to compute the patch object. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |

**Example:**
```js
restliClient.partialUpdate({
  resource: '/adAccounts',
  id: 123,
  patchSetObject: {
    name: 'TestAdAccountModified',
    reference: 'urn:li:organization:456'
  },
  versionString: '202210',
  accessToken: MY_ACCESS_TOKEN
}).then(response => {
  const status = response.status;
});
```

#### `restliClient.batchPartialUpdate(params)`

Makes a Rest.li BATCH_PARTIAL_UPDATE request to partially update multiple entites at once.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| `params.ids` | String[] \|\| Number[] \|\| Object[] | Yes | The list of entity ids to update |
| `params.patchSetObjects` | Object[] | No | The list of JSON-serialized values of the entities with only the modified fields present. If specified, this will be directly sent as the patch object |
| `params.originalEntities` | Object[] | No | The list of JSON-serialized values of the original entities. If specified and `patchSetObjects` is not provided, this will be used in conjunction with `modifiedEntities` to compute patch object for each entity. |
| `params.modifiedEntities` | Object[] | No | The list of JSON-serialized values of the modified entities. If specified and `patchSetObjects` is not provided, this will be used in conjunction with `originalEntities` to compute the patch object for each entity. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| `response.data.results` | Object | A map where the key is the encoded entity id and the value is an object containing the corresponding response status. |
| `response.data.errors` | Object | A map where the keys are the encoded entity ids that failed to be updated, and the values include the error response. |

**Example:**
```js
restliClient.batchPartialUpdate({
  resource: '/adCampaignGroups',
  id: [123, 456],
  patchSetObjects: [
    { status: 'ACTIVE' },
    {
      runSchedule: {
        start: 1678029270721,
        end: 1679029270721
      }
    }
  },
  versionString: '202210',
  accessToken: MY_ACCESS_TOKEN
}).then(response => {
  const results = response.data.results;
});
```

#### `restliClient.delete(params)`

Makes a Rest.li DELETE request to delete an entity.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| `params.id` | String \|\| Number \|\| Object | No | The id or key of the entity to delete. For simple resources, this is not specified. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |

**Example:**
```js
restliClient.delete({
  resource: '/adAccounts',
  id: 123,
  versionString: '202210',
  accessToken: MY_ACCESS_TOKEN
}).then(response => {
  const status = response.status;
});
```

#### `restliClient.batchDelete(params)`

Makes a Rest.li BATCH_DELETE request to delete multiple entities at once.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| `params.ids` | String[] \|\| Number[] \|\| Object[] | Yes | The ids of the entities to delete. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| `response.data.results` | Object | A map where the keys are the encoded entity ids that were successfully deleted, and the values are the delete results, which include the status code. |
| `response.data.errors` | Object | A map where the keys are the encoded entity ids that failed to be deleted, and the values include the error response. |

**Example:**
```js
restliClient.batchDelete({
  resource: '/adAccounts',
  ids: [123, 456],
  versionString: '202210',
  accessToken: MY_ACCESS_TOKEN
}).then(response => {
  const results = response.data.results;
});
```

#### `restliClient.action(params)`

Makes a Rest.li ACTION request to perform an action on a specified resource.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| `params.actionName` | String | Yes | The Rest.li action name |
| `params.data` | Object | No | The request body data to pass to the action. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| `response` | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| `response.data.value` | String \|\| Number \|\| Object | The action response value. |

**Example:**
```js
restliClient.action({
  resource: '/testResource',
  actionName: 'doSomething',
  accessToken: MY_ACCESS_TOKEN
}).then(response => {
  const result = response.data.value;
});
```

## Auth Client

While we recommend using any of several popular, open-source libraries for robustly managing OAuth 2.0 authentication, we provide a basic Auth Client as a convenience for testing APIs and getting started.

### Constructor

```js
const { AuthClient } = require('linkedin-api-js-client');

const authClient = new AuthClient(params);
```

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `params` | Object | Yes | |
| `params.clientId` | String | Yes | Client ID of your developer application. This can be found on your application auth settings page in the Developer Portal. |
| `params.clientSecret` | String | Yes | Client secret of your developer application. This can be found on your application auth settings page in the Developer Portal. |
| `params.redirectUrl` | String | No | If your integration will be using the authorization code flow to obtain 3-legged access tokens, this should be provided. This redirect URL must match one of the redirect URLs configured in the app auth settings page in the Developer Portal. |

### Methods

#### `authClient.generateMemberAuthorizationUrl(scopes, state)`

Generates the member authorization URL to direct members to. Once redirected, the member will be presented with LinkedIn's OAuth consent page showing the OAuth scopes your application is requesting on behalf of the user.

**Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `scopes` | String[] | Yes | An array of OAuth scopes (3-legged member permissions) your application is requesting on behalf of the user. |
| `state` | String | No | An optional string that can be provided to test against CSRF attacks. |

**Returns** `memberAuthorizationUrl`

| Field | Type | Description |
|---|---|---|
| `memberAuthorizationUrl` | String | The member authorization URL |


#### `authClient.exchangeAuthCodeForAccessToken(code)`

Exchanges an authorization code for a 3-legged access token. After member authorization, the browser redirects to the provided redirect URL, setting the authorization code on the `code` query parameter.

**Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `code` | String | Yes | The authorization code to exchange for an access token |

**Returns** `Promise<tokenDetails>`

| Field | Type | Description |
|---|---|---|
| `tokenDetails` | Object | Token details object |
| `tokenDetails.access_token` | String | The 3-legged access token |
| `tokenDetails.expires_in` | Number | The TTL of the access token, in seconds |
| `tokenDetails.refresh_token` | String | The refresh token value. This is only present if refresh tokens are enabled for the application. |
| `tokenDetails.refresh_token_expires_in` | Number | The TTL of the refresh token, in seconds. This is only present if refresh tokens are enabled for the application. |
| `tokenDetails.scope` | String | A comma-separated list of scopes authorized by the member (e.g. "r_liteprofile,r_ads") |

#### `authClient.exchangeRefreshTokenForAccessToken(refreshToken)`

Exchanges a refresh token for a new 3-legged access token. This allows access tokens to be refreshed without having the member reauthorize your application.

**Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `refreshToken` | String | Yes | The refresh token to exchange for an access token |

**Returns** `Promise<tokenDetails>`

| Field | Type | Description |
|---|---|---|
| `tokenDetails` | Object | Token details object |
| `tokenDetails.access_token` | String | The 3-legged access token |
| `tokenDetails.expires_in` | Number | The TTL of the access token, in seconds |
| `tokenDetails.refresh_token` | String | The refresh token value |
| `tokenDetails.refresh_token_expires_in` | Number | The TTL of the refresh token, in seconds |


#### `authClient.getTwoLeggedAccessToken()`

Use client credential flow (2-legged OAuth) to retrieve a 2-legged access token for accessing APIs that are not member-specific. Developer applications do not have the client credential flow enabled by default.

**Returns** `Promise<tokenDetails>`

| Field | Type | Description |
|---|---|---|
| `tokenDetails` | Object | Token details object |
| `tokenDetails.access_token` | String | The 2-legged access token |
| `tokenDetails.expires_in` | Number | The TTL of the access token, in seconds |

#### `authClient.introspectAccessToken(accessToken)`

Introspect a 2-legged, 3-legged or Enterprise access token to get information on status, expiry, and other details.

**Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `accessToken` | String | Yes | A 2-legged, 3-legged or Enterprise access token. |

**Returns** `Promise<tokenDetails>`

| Field | Type | Description |
|---|---|---|
| `tokenDetails` | Object | Token introspection details object |
| `tokenDetails.active` | String | Flag whether the token is a valid, active token. |
| `tokenDetails.auth_type` | String | The auth type of the token ("2L", "3L" or "Enterprise_User") |
| `tokenDetails.authorized_at` | String | Epoch time in seconds, indicating when the token was authorized |
| `tokenDetails.client_id` | Number | Developer application client ID |
| `tokenDetails.created_at` | String | Epoch time in seconds, indicating when this token was originally issued |
| `tokenDetails.expires_at` | Number | Epoch time in seconds, indicating when this token will expire |
| `tokenDetails.scope` | String | A string containing a comma-separated list of scopes associated with this token. This is only returned for 3-legged member tokens. |
| `tokenDetails.status` | String | The token status, which is an enum string with values "revoked", "expired" or "active" |

## Utilities

### Methods

#### `utils.paramEncode(queryParams)`

#### `utils.encode(value)`

#### `utils.createUrnFromAttrs()`

#### `utils.getCreatedEntityId(response)`

#### `utils.getPatchObject(original, modified)`

---

## List of dependencies

The following table is a list of production dependencies.

| Component Name | License | Linked | Modified |
|---|---|---|---|
| [axios](https://github.com/axios/axios) | MIT | Static | No |
| [lodash](https://github.com/lodash/lodash) | MIT | Static | No |
| [qs](https://github.com/ljharb/qs) | BSD-3-Clause | Static | No |
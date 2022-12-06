## Overview

This library provides a thin JavaScript client for making requests to LinkedIn APIs, utilizing the [Axios](https://axios-http.com/docs/intro) HTTP client library and written in TypeScript. LinkedIn's APIs are built on the [Rest.li](https://linkedin.github.io/rest.li/) framework with additional LinkedIn-specific constraints, which results in a robust yet complex protocol that can be challening to implement correctly.

This library helps reduce this complexity by formatting requests correctly, providing proper request headers, and providing interfaces to develop against for responses. The library also provides an auth client for inspecting, generating, and refreshing access tokens, along with other helpful utilities.

This library is intended to be used within a NodeJS server application. API requests from browser environments are not supported for LinkedIn APIs due to CORS policy.

### Features

- Generic support for all (14) Rest.li methods used in LinkedIn APIs
- Supports Rest.li protocol version 2.0.0
- Provide typescript interfaces for request options/response payloads
- Built-in parameter encoding
- Partial update patch generation utilities
- LinkedIn URN utilities
- Supports versioned APIs
- Automatic query tunneling of requests
- 2-legged and 3-legged OAuth2 support

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
const { apiClient } = require('linkedin-api-js-client');

...
apiClient.get({
  resource: '/me',
  accessToken: <THREE_LEGGED_ACCESS_TOKEN>
}).then(response => {
  const profile = response.data;
});
...
```

### Running Samples



## API Client

The API client has methods for all the Rest.li methods which are used by LinkedIn APIs. Rest.li defines a standard set of methods that can operate on a resource, each of which maps to an HTTP method. Depending on the resource, some Rest.li methods are not applicable or not implemented. Read the API docs to determine what Rest.li method is applicable and the applicable request parameters.

- [GET](#apiclientgetparams)
- [BATCH_GET](#apiclientbatchgetparams)
- [GET_ALL](#apiclientgetallparams)
- [FINDER](#apiclientfinderparams)
- [BATCH_FINDER](#apiclientbatchfinderparams)
- [CREATE](#apiclientcreateparams)
- [BATCH_CREATE](#apiclientbatchcreateparams)
- [UPDATE](#apiclientupdateparams)
- [BATCH_UPDATE](#apiclientbatchupdateparams)
- [PARTIAL_UPDATE](#apiclientpartialupdateparams)
- [BATCH_PARTIAL_UPDATE](#apiclientbatchpartialupdateparams)
- [DELETE](#apiclientdeleteparams)
- [BATCH_DELETE](#apiclientbatchdeleteparams)
- [ACTION](#apiclientactionparams)

### Base Request Options

All methods of the API client require passing in a request options object, all of which extend the following BaseRequestOptions object:

| Parameter | Type | Required? | Description |
|---|---|---|---|
| BaseRequestOptions.resource | String | Yes | The API resource name, which should begin with a forward slash (e.g. "/adAccounts") |
| BaseRequestOptions.queryParams | Object | No | A map of query parameters. The parameter keys and values will be correctly encoded by this method, so these should not be encoded. |
| BaseRequestOptions.accessToken | String | Yes | The access token that should provide the application access to the specified API |
| BaseRequestOptions.versionString | String | No | An optional version string of the format "YYYYMM" or "YYYYMM.RR". If specified, the version header will be passed and the request will use the versioned APIs base URL

### Base Response Object

All methods of the API client return a Promise that resolves to a response object that extends [AxiosResponse](https://axios-http.com/docs/res_schema). This client provides more detailed interfaces of the specific response data payload that is useful for static type-checking and IDE auto-completion.

### `apiClient.get(params)`

Makes a Rest.li GET request to fetch the specified entity on a resource. This method will perform query tunneling if necessary.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| params.id | String \|\| Number \|\| Object | No | The id or key of the entity to fetch. For simple resources, this is not specified. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| response.data | Object | The JSON-serialized Rest.li entity |

**Example:**
```js
client.get({
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

### `apiClient.batchGet(params)`

Makes a Rest.li BATCH_GET request to fetch multiple entities on a resource. This method will perform query tunneling if necessary.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| params.ids | String[] \|\| Number[] \|\| Object[] | Yes | The list of ids to fetch on the resource. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| response.data | Object | The JSON-serialized Rest.li entity |

**Example:**
```js
client.batchGet({
  resource: '/adCampaignGroups',
  id: [123, 456, 789],
  accessToken: MY_ACCESS_TOKEN,
  versionString: '202210'
}).then(response => {
  const entity = response.data.results;
});
```

### `apiClient.getAll(params)`

Makes a Rest.li GET_ALL request to fetch all entities on a resource.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| response.data.elements | Object[] | The list of JSON-serialized Rest.li entities |
| response.data.paging | Object | Paging metadata object

**Example:**
```js
client.getAll({
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

### `apiClient.finder(params)`

Makes a Rest.li FINDER request to find entities by some specified criteria.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| params.finderName | String | Yes | The Rest.li finder name. This will be included in the request query parameters. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| response.data.elements | Object[] | The list of entities found based on the search criteria. |
| response.data.paging | Object | Paging metadata object |

**Example:**
```js
client.finder({
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

### `apiClient.batchFinder(params)`

Makes a Rest.li BATCH_FINDER request to find entities by multiple sets of criteria.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| params.batchFinderName | String | Yes | The Rest.li batch finder name. This will be included in the request query parameters. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| response.data.elements | Object[] | An array of finder search results in the same order as the array of search criteria provided to the batch finder. |
| response.data.elements[].elements | Object[] | An array of entities found based on the corresponding search criteria. |
| response.data.elements[].paging | Object | Paging metadata object |
| response.data.elements[].metadata | Object | Optional finder results metadata object |
| response.data.elements[].error | Object | Error response object if this finder request encountered an error. |
| response.data.elements[].isError | boolean | Flag indicating whether the finder request encountered an error. |

**Example:**
```js
client.batchFinder({
  resource: '/organizationAuthorizations',
  finderName: 'authorizationActionsAndImpersonator'
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

### `apiClient.create(params)`

Makes a Rest.li CREATE request to create a new entity on the resource.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| params.entity | Object | Yes | The JSON-serialized value of the entity to create |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| response.createdEntityId | String \|\| Number | The id of the created entity |

**Example:**
```js
client.create({
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

### `apiClient.batchCreate(params)`

Makes a Rest.li BATCH_CREATE request to create multiple entities in a single call.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| params.entities | Object[] | Yes | The JSON-serialized values of the entities to create |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| response.data.elements | Object[] | A list of entity creation response data in the same order as the entities provided in the batch create request. |
| response.data.elements[].status | Number | The response status when creating the entity. |
| response.data.elements[].id | String \|\| Number | The encoded id of the newly-created entity, if creation was successful. |
| response.data.elements[].error | Object | The error object details when creating an entity, if creation failed. |

**Example:**
```js
client.batchCreate({
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

### `apiClient.update(params)`

Makes a Rest.li UPDATE request to update an entity (overwriting the entire entity).

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| params.id | String \|\| Number \|\| Object | Yes | The id or key of the entity to update. For simple resources, this is not specified. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |

**Example:**
```js
client.update({
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

### `apiClient.batchUpdate(params)`

Makes a Rest.li BATCH_UPDATE request to update multiple entities in a single call.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| params.ids | String[] \|\| Number[] \|\| Object[] | Yes | The list of entity ids to update |
| params.entities | Object[] | Yes | The list of JSON-serialized values of entities with updated values. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |

**Example:**
```js
client.batchUpdate({
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

### `apiClient.partialUpdate(params)`

Makes a Rest.li PARTIAL_UPDATE request to update part of an entity. One can either directly pass the patch object to send in the request, or one can pass the full original and modified entity objects, with the method computing the correct patch object.

When an entity has nested fields that can be modified, passing in the original and modified entities may produce a complex patch object that is a technically correct format for the Rest.li framework, but may not be supported for most LinkedIn APIs which mainly support partial update of only top-level fields on an entity. In these cases it is better to specify `patchSetObject` directly.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| params.id | String \|\| Number \|\| Object | No | The id or key of the entity to update. For simple resources, this is not specified. |
| params.patchSetObject | Object | No | The JSON-serialized value of the entity with only the modified fields present. If specified, this will be directly sent as the patch object. |
| params.originalEntity | Object | No | The JSON-serialized value of the original entity. If specified and `patchSetObject` is not provided, this will be used in conjunction with `modifiedEntity` to compute the patch object. |
| params.modifiedEntity | Object | No | The JSON-serialized value of the modified entity. If specified and `patchSetObject` is not provided, this will be used in conjunction with `originalEntity` to compute the patch object. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |

**Example:**
```js
client.partialUpdate({
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

### `apiClient.batchPartialUpdate(params)`

Makes a Rest.li BATCH_PARTIAL_UPDATE request to partially update multiple entites at once.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| params.ids | String[] \|\| Number[] \|\| Object[] | Yes | The list of entity ids to update |
| params.patchSetObjects | Object[] | No | The list of JSON-serialized values of the entities with only the modified fields present. If specified, this will be directly sent as the patch object |
| params.originalEntities | Object[] | No | The list of JSON-serialized values of the original entities. If specified and `patchSetObjects` is not provided, this will be used in conjunction with `modifiedEntities` to compute patch object for each entity. |
| params.modifiedEntities | Object[] | No | The list of JSON-serialized values of the modified entities. If specified and `patchSetObjects` is not provided, this will be used in conjunction with `originalEntities` to compute the patch object for each entity. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| response.data.results | Object | A map where the key is the encoded entity id and the value is an object containing the corresponding response status. |
| response.data.errors | Object | A map where the keys are the encoded entity ids that failed to be updated, and the values include the error response. |

**Example:**
```js
client.batchPartialUpdate({
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

### `apiClient.delete(params)`

Makes a Rest.li DELETE request to delete an entity.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| params.id | String \|\| Number \|\| Object | No | The id or key of the entity to delete. For simple resources, this is not specified. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |

**Example:**
```js
client.delete({
  resource: '/adAccounts',
  id: 123,
  versionString: '202210',
  accessToken: MY_ACCESS_TOKEN
}).then(response => {
  const status = response.status;
});
```

### `apiClient.batchDelete(params)`

Makes a Rest.li BATCH_DELETE request to delete multiple entities at once.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| params.ids | String[] \|\| Number[] \|\| Object[] | Yes | The ids of the entities to delete. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| response.data.results | Object | A map where the keys are the encoded entity ids that were successfully deleted, and the values are the delete results, which include the status code. |
| response.data.errors | Object | A map where the keys are the encoded entity ids that failed to be deleted, and the values include the error response. |

**Example:**
```js
client.batchDelete({
  resource: '/adAccounts',
  ids: [123, 456],
  versionString: '202210',
  accessToken: MY_ACCESS_TOKEN
}).then(response => {
  const results = response.data.results;
});
```

### `apiClient.action(params)`

Makes a Rest.li ACTION request to perform an action on a specified resource.

**Request Parameters:**

| Parameter | Type | Required? | Description |
|---|---|---|---|
| params | Object extends [BaseRequestOptions](#base-request-options) | Yes | Standard request options |
| params.actionName | String | Yes | The Rest.li action name |
| params.data | Object | No | The request body data to pass to the action. |

**Resolved Response Object:**

| Field | Type | Description |
|---|---|---|
| response | Object extends [AxiosResponse](https://axios-http.com/docs/res_schema) | Axios response object |
| response.data.value | String \|\| Number \|\| Object | The action response value. |

**Example:**
```js
client.action({
  resource: '/testResource',
  actionName: 'doSomething',
  accessToken: MY_ACCESS_TOKEN
}).then(response => {
  const result = response.data.value;
});
```

## Auth Client

## Utilities



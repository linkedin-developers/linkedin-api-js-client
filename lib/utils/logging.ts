import { AxiosResponse } from 'axios';

export function logSuccess(response: AxiosResponse): void {
  console.log(`${new Date().toISOString()} [linkedin-api-client]: Success Response`);
  console.group();
  console.log(
    JSON.stringify(
      {
        method: response.config?.method,
        url: response.config?.url,
        status: response.status,
        requestHeaders: response.config?.headers,
        requestData: response.config?.data,
        responseHeaders: response.headers,
        responseData: response.data
      },
      null,
      2
    )
  );
  console.groupEnd();
}

export function logError(error: any): void {
  const dateString = new Date().toISOString();
  if (error.response) {
    console.error(`${dateString} [linkedin-api-client]: Error Response`);
    console.group();
    console.error(
      JSON.stringify(
        {
          method: error.response?.config?.method,
          url: error.response?.config?.url,
          status: error.response?.status,
          requestHeaders: error.response?.config?.headers,
          requestData: error.response?.config?.data,
          responseHeaders: error.response?.headers,
          responseData: error.response?.data
        },
        null,
        2
      )
    );
    console.groupEnd();
  } else {
    console.error(`${dateString} [linkedin-api-client]: Other Error`);
    console.group();
    console.error(`${error.name}: ${error.message}`);
    console.error(
      JSON.stringify(
        {
          method: error.config?.method,
          url: error.config?.url,
          requestHeaders: error.config?.headers,
          requestData: error.config?.data
        },
        null,
        2
      )
    );
    console.groupEnd();
  }
}

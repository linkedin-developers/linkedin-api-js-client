/**
 * Example of configuring custom interceptors for global handling of request/responses.
 * This example contains:
 *
 * - A request interceptor that corrects the API request url on the second retry
 * - A response interceptor to log when a success or error response is received
 * - A response interceptor configured using axios-retry to set the retry condition,
 *   max # of retries, retry exponential delay
 *
 * The 3-legged member access token should include the 'r_liteprofile' scope, which
 * is part of the Sign In With LinkedIn API product.
 */

import { RestliClient } from 'linkedin-api-client';
import dotenv from 'dotenv';
import axiosRetry from 'axios-retry';

dotenv.config();

async function main(): Promise<void> {
  const restliClient = new RestliClient();
  const accessToken = process.env.ACCESS_TOKEN || '';

  /**
   * Configure a custom request interceptor
   */
  restliClient.axiosInstance.interceptors.request.use(function (req) {
    // @ts-expect-error
    if (req['axios-retry'].retryCount === 2) {
      // On the second retry, remove the invalid query parameter so request will be successful
      req.url = 'https://api.linkedin.com/v2/me';
    }
    return req;
  }, undefined);

  /**
   * Configure a custom response interceptor.
   */
  restliClient.axiosInstance.interceptors.response.use(
    function (res) {
      console.log('Hit custom response interceptor.');
      return res;
    },
    async function (error) {
      /**
       * Resetting the config headers is a necessary workaround for retrying the request correctly.
       * See axios issue here: https://github.com/axios/axios/issues/5089
       */
      const config = error.config;
      config.headers = JSON.parse(JSON.stringify(config.headers || {}));
      console.log(
        `Hit custom error response interceptor. Retry count: ${config['axios-retry'].retryCount}`
      );
      return await Promise.reject(error);
    }
  );

  /**
   * Use the axios-retry library to configure retry condition, exponential retry
   * delay, and number of retries.
   */
  axiosRetry(restliClient.axiosInstance, {
    retryCondition: (error) => {
      const status = error.response?.status;
      if (status) {
        return status >= 400 && status < 500;
      } else {
        return false;
      }
    },
    retryDelay: axiosRetry.exponentialDelay,
    retries: 3
  });

  /**
   * Make a call that is deliberately a bad request to test out the retry logic and
   * request interceptors.
   */
  const response = await restliClient.get({
    resourcePath: '/me',
    queryParams: {
      invalidParam: true
    },
    accessToken
  });
  console.log(response.data);
}

main()
  .then(() => {
    console.log('Completed');
  })
  .catch((error) => {
    console.log(`Error encountered: ${error.message}`);
  });

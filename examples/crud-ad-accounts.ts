/**
 * Example calls to perform CRUD and finder operations on ad accounts using versioned APIs.
 * The 3-legged member access token should include the 'rw_ads' scope, which
 * is part of the Marketing Developer Platform API product.
 */

import { RestliClient } from 'linkedin-api-client';
import dotenv from 'dotenv';

dotenv.config();

const MDP_VERSION = '202212';
const AD_ACCOUNTS_RESOURCE = '/adAccounts';
const AD_ACCOUNTS_ENTITY_RESOURCE = '/adAccounts/{id}';

async function main(): Promise<void> {
  const restliClient = new RestliClient();
  restliClient.setDebugParams({ enabled: true });
  const accessToken = process.env.ACCESS_TOKEN || '';

  /**
   * Create a test ad account
   */
  const createResponse = await restliClient.create({
    resourcePath: AD_ACCOUNTS_RESOURCE,
    entity: {
      name: 'Test Ad Account',
      reference: 'urn:li:organization:123',
      status: 'DRAFT',
      type: 'BUSINESS',
      test: true
    },
    accessToken,
    versionString: MDP_VERSION
  });
  const adAccountId = createResponse.createdEntityId as string;
  console.log(`Successfully created ad account: ${adAccountId}\n`);

  /**
   * Get the created ad account
   */
  const getResponse = await restliClient.get({
    resourcePath: AD_ACCOUNTS_ENTITY_RESOURCE,
    pathKeys: {
      id: adAccountId
    },
    accessToken,
    versionString: MDP_VERSION
  });
  console.log(`Successfully fetched ad acccount: ${JSON.stringify(getResponse.data, null, 2)}\n`);

  /**
   * Partial update on ad account
   */
  await restliClient.partialUpdate({
    resourcePath: AD_ACCOUNTS_ENTITY_RESOURCE,
    pathKeys: {
      id: adAccountId
    },
    patchSetObject: {
      name: 'Modified Test Ad Account'
    },
    accessToken,
    versionString: MDP_VERSION
  });
  console.log('Successfully did partial update of ad account\n');

  /**
   * Find all ad accounts according to a specified search criteria
   */
  const finderResponse = await restliClient.finder({
    resourcePath: AD_ACCOUNTS_RESOURCE,
    finderName: 'search',
    queryParams: {
      search: {
        reference: {
          values: ['urn:li:organization:123']
        },
        name: {
          values: ['Modified Test Ad Account']
        },
        test: true
      }
    },
    accessToken,
    versionString: MDP_VERSION
  });
  console.log(
    `Successfully searched ad accounts: ${JSON.stringify(finderResponse.data.elements, null, 2)}\n`
  );

  /**
   * Delete ad account
   */
  await restliClient.delete({
    resourcePath: AD_ACCOUNTS_ENTITY_RESOURCE,
    pathKeys: {
      id: adAccountId
    },
    accessToken,
    versionString: MDP_VERSION
  });
  console.log('Successfully deleted ad account\n');
}

main()
  .then(() => {
    console.log('Completed');
  })
  .catch((error) => {
    console.log(`Error encountered: ${error.message}`);
  });

/**
 * Example calls to perform BATCH_GET on campaign groups and illustrate automatic
 * query tunneling.
 *
 * The 3-legged member access token should include the 'r_ads' scope, which
 * is part of the Marketing Developer Platform API product.
 */

import { RestliClient } from 'linkedin-api-client';
import dotenv from 'dotenv';

dotenv.config();

const MDP_VERSION = '202212';
const AD_CAMPAIGN_GROUPS_RESOURCE = '/adCampaignGroups';
// Set a large number of entities to fetch to require query tunneling
const NUMBER_OF_ENTITIES = 300;

async function main(): Promise<void> {
  const restliClient = new RestliClient();
  restliClient.setDebugParams({ enabled: true });
  const accessToken = process.env.ACCESS_TOKEN || '';

  /**
   * Randomly generate campaign group ids and send in a BATCH_GET request (we expect all 404 responses).
   * The client should automatically do query tunneling and perform a POST request.
   */
  const campaignGroupIds = Array.from({ length: NUMBER_OF_ENTITIES }).map((_) =>
    Math.floor(Math.random() * 99999999999999)
  );
  const batchGetResponse = await restliClient.batchGet({
    resourcePath: AD_CAMPAIGN_GROUPS_RESOURCE,
    ids: campaignGroupIds,
    accessToken,
    versionString: MDP_VERSION
  });
  console.log(
    `Successfully made a BATCH_GET request on /adCampaignGroups. HTTP Method: ${batchGetResponse.config.method}]`
  );
}

main()
  .then(() => {
    console.log('Completed');
  })
  .catch((error) => {
    console.log(`Error encountered: ${error.message}`);
  });

/**
 * Example calls to create a post on LinkedIn. This requires a member-based token with the following
 * scopes (r_liteprofile, w_member_social), which is provided by the Sign in with LinkedIn and Share on LinkedIn
 * API products.
 *
 * The steps include:
 * 1. Fetching the authenticated member's profile to obtain the member's identifier (a person URN)
 * 2. Create a post using /ugcPosts endpoint (legacy) or /posts endpoint (new)
 *
 * To view these posts, go to linkedin.com and click Me > Posts & Activity.
 *
 * BEWARE: This will make an actual post to the main feed which is visible to anyone.
 */

import { RestliClient } from 'linkedin-api-client';
import dotenv from 'dotenv';

dotenv.config();

const ME_RESOURCE = '/me';
const UGC_POSTS_RESOURCE = '/ugcPosts';
const POSTS_RESOURCE = '/posts';
const API_VERSION = '202302';

async function main(): Promise<void> {
  const restliClient = new RestliClient();
  restliClient.setDebugParams({ enabled: true });
  const accessToken = process.env.ACCESS_TOKEN || '';

  const meResponse = await restliClient.get({
    resourcePath: ME_RESOURCE,
    accessToken
  });
  console.log(meResponse.data);

  /**
   * Calling the legacy /ugcPosts API to create a text post on behalf of the
   * authenticated member.
   */
  const ugcPostsCreateResponse = await restliClient.create({
    resourcePath: UGC_POSTS_RESOURCE,
    entity: {
      author: `urn:li:person:${meResponse.data.id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: 'Sample text post created with /ugcPosts API'
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    },
    accessToken
  });
  // This is the created share URN
  console.log(ugcPostsCreateResponse.createdEntityId);

  /**
   * Calling the newer, more streamlined (and versioned) /posts API to create
   * a text post on behalf of the authenticated member.
   */
  const postsCreateResponse = await restliClient.create({
    resourcePath: POSTS_RESOURCE,
    entity: {
      author: `urn:li:person:${meResponse.data.id}`,
      lifecycleState: 'PUBLISHED',
      visibility: 'PUBLIC',
      commentary: 'Sample text post created with /posts API',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      }
    },
    accessToken,
    versionString: API_VERSION
  });
  // This is the created share URN
  console.log(postsCreateResponse.createdEntityId);
}

main()
  .then(() => {
    console.log('Completed');
  })
  .catch((error) => {
    console.log(`Error encountered: ${error.message}`);
  });

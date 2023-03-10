## LinkedIn API JavaScript Client Examples

This directory contains examples showing how to use the LinkedIn API JavaScript client library.

### Steps to Run

1. Navigate inside the `/examples` directory
2. Run `npm install`
3. Create a `.env` file that contains the following variables that will be used when running the examples. Only some of these variables may actually be needed to run a particular script. Check the specific example comments on more specific requirements (e.g. required scopes for the access token).
  ```sh
  ACCESS_TOKEN="your_valid_access_token"
  CLIENT_ID="your_app_client_id"
  CLIENT_SECRET="your_app_client_secret"
  OAUTH2_REDIRECT_URL="your_app_oauth2_redirect_url"
  ```
4. Execute the desired example script: `npx ts-node {script filename}`. For example: `npx ts-node get-profile.ts`

### Example Notes

| Example filename | Description |
|---|---|
| `oauth-member-auth-redirect.ts` | Demonstrates the member oauth redirect flow (authorization code flow) to obtain a 3-legged access token. |
| `get-profile.ts` | Uses Sign In With LinkedIn v1 to fetch member profile. Also demonstrates use of field projections and decoration. |
| `create-posts.ts` | Uses Sign In With LinkedIn and Share on LinkedIn to create posts. |
| `crud-ad-accounts.ts` | Performs create, get, finder, partial update, and delete requests on ad accounts. |
| `batch-get-campaign-groups-query-tunneling.ts` | Demonstrates a request that requires query tunneling, which is performed automatically by the client. |
| `retry-and-interceptors.ts` | Adds retry logic and response interceptors to the client. |
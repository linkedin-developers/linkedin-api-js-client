/**
 * This example illustrates a basic example of the oauth authorization code flow.
 *
 * Pre-requisites:
 * 1. Add CLIENT_ID, CLIENT_SECRET, and OAUTH2_REDIRECT_URL variables to the examples/.env file.
 * 2. The associated developer app you are using should have access to r_liteprofile, which can be
 * obtained through requesting the self-serve Sign In With LinkedIn API product on the LinkedIn
 * Developer Portal.
 * 3. Set your developer app's OAuth redirect URL to "http://localhost:3000/oauth"
 *
 * Steps:
 * 1. Run script
 * 2. Navigate to localhost:3000
 * 3. Login as LinkedIn member and authorize application
 * 4. View member profile data
 */

import express from 'express';
import dotenv from 'dotenv';
import { AuthClient, RestliClient } from 'linkedin-api-client';

dotenv.config();

const app = express();
const port = 3000;

// Start off with no access token
let accessToken = '';

// Initialize auth and restli clients
if (!(process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.OAUTH2_REDIRECT_URL)) {
  throw new Error(
    'The CLIENT_ID, CLIENT_SECRET, and OAUTH2_REDIRECT_URL variables must be set in the .env file.'
  );
}
const authClient = new AuthClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUrl: process.env.OAUTH2_REDIRECT_URL
});
const restliClient = new RestliClient();
restliClient.setDebugParams({ enabled: true });

// Route to display profile details
app.get('/', (_req, res) => {
  if (!accessToken) {
    // If no access token, have member authorize again
    res.redirect(authClient.generateMemberAuthorizationUrl(['r_liteprofile', 'rw_ads']));
  } else {
    // Fetch profile details
    restliClient
      .get({
        resourcePath: '/me',
        accessToken
      })
      .then((response) => {
        res.json(response.data);
      })
      .catch(() => {
        res.send('Error encountered while fetching profile.');
      });
  }
});

// OAuth callback route handler
app.get('/oauth', (req, res) => {
  const authCode = req.query?.code as string;
  if (authCode) {
    // Exchange auth code for an access token and redirect to main page
    authClient
      .exchangeAuthCodeForAccessToken(authCode)
      .then((response) => {
        accessToken = response.access_token;
        console.log(`Access token: ${accessToken}`);
        res.redirect('/');
      })
      .catch(() => {
        res.send('Error exchanging auth code for access token.');
      });
  } else {
    if (req.query?.error_description) {
      res.send(`Error: ${req.query?.error_description as string}`);
    } else {
      res.send('Expecting "code" query parameter');
    }
  }
});

app.listen(port, () => {
  console.log(`Navigate to example app at http://localhost:${port}`);
});

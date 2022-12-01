import axios from 'axios';
import { constants } from './utils/constants';
import qs from 'qs';

export class AuthClient {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;

  constructor({ clientId = null, clientSecret = null, redirectUrl = null } = {}) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUrl = redirectUrl;
  }

  async getTwoLeggedAccessToken() {
    return await axios.request({
      method: constants.HTTP_METHODS.POST,
      url: `${constants.OAUTH_BASE_URL}/accessToken`,
      data: qs.stringify({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      }),
      headers: {
        [constants.HEADERS.CONTENT_TYPE]: constants.CONTENT_TYPE.URL_ENCODED
      }
    });
  }

  async exchangeAuthCodeForAccessToken(code: string) {
    return await axios.request({
      method: constants.HTTP_METHODS.POST,
      url: `${constants.OAUTH_BASE_URL}/accessToken`,
      data: {
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUrl
      },
      headers: {
        [constants.HEADERS.CONTENT_TYPE]: constants.CONTENT_TYPE.URL_ENCODED
      }
    });
  }

  async exchangeRefreshTokenForAccessToken(refreshToken) {
    return await axios.request({
      method: constants.HTTP_METHODS.POST,
      url: `${constants.OAUTH_BASE_URL}/accessToken`,
      data: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      },
      headers: {
        [constants.HEADERS.CONTENT_TYPE]: constants.CONTENT_TYPE.URL_ENCODED
      }
    });
  }

  async introspectAccessToken(accessToken) {
    return await axios.request({
      method: constants.HTTP_METHODS.POST,
      url: `${constants.OAUTH_BASE_URL}/introspectToken`,
      data: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        token: accessToken
      },
      headers: {
        [constants.HEADERS.CONTENT_TYPE]: constants.CONTENT_TYPE.URL_ENCODED
      }
    });
  }
}
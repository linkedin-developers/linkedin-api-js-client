/**
 * Utilities related to working with LinkedIn's APIs
 */

import { VERSIONED_BASE_URL, NON_VERSIONED_BASE_URL, HEADERS } from './constants';
import { encode } from './encoder';
import { version } from '../../package.json';

/**
 * Method to build the URL (not including query parameters) for a REST-based API call to LinkedIn
 */
export function buildRestliUrl(
  resourcePath: string,
  pathKeys: Record<string, any> = null,
  versionString?: string
): string {
  const baseUrl = versionString ? VERSIONED_BASE_URL : NON_VERSIONED_BASE_URL;
  pathKeys = pathKeys || {};

  const PLACEHOLDER_REGEX = /\{\w+\}/g;
  // Validate resourcePath and pathKeys
  const placeholderMatches = resourcePath.match(PLACEHOLDER_REGEX);
  const numPlaceholders = placeholderMatches ? placeholderMatches.length : 0;

  if (numPlaceholders !== Object.keys(pathKeys).length) {
    throw new Error(
      `The number of placeholders in the resourcePath (${resourcePath}) does not match the number of entries in the pathKeys argument`
    );
  }

  const resourcePathWithKeys = resourcePath.replace(PLACEHOLDER_REGEX, (match) => {
    // match looks like "{id}", so remove the curly braces to get the placeholder
    const placeholder = match.substring(1, match.length - 1);
    if (Object.prototype.hasOwnProperty.call(pathKeys, placeholder)) {
      return encode(pathKeys[placeholder]);
    } else {
      throw new Error(
        `The placeholder ${match} was found in resourcePath, which does not have a corresponding entry in pathKeys`
      );
    }
  });

  return `${baseUrl}${resourcePathWithKeys}`;
}

export function getRestliRequestHeaders({
  restliMethodType,
  accessToken,
  versionString,
  httpMethodOverride,
  contentType = 'application/json'
}: {
  restliMethodType: string;
  accessToken: string;
  versionString?: string | null;
  httpMethodOverride?: string;
  contentType?: string;
}): Record<string, any> {
  const headers = {
    [HEADERS.CONNECTION]: 'Keep-Alive',
    [HEADERS.RESTLI_PROTOCOL_VERSION]: '2.0.0',
    [HEADERS.RESTLI_METHOD]: restliMethodType.toLowerCase(),
    [HEADERS.AUTHORIZATION]: `Bearer ${accessToken}`,
    [HEADERS.CONTENT_TYPE]: contentType,
    [HEADERS.USER_AGENT]: `linkedin-api-js-client/${version}`
  };
  if (versionString) {
    headers[HEADERS.LINKEDIN_VERSION] = versionString;
  }
  if (httpMethodOverride) {
    headers[HEADERS.HTTP_METHOD_OVERRIDE] = httpMethodOverride.toUpperCase();
  }
  return headers;
}

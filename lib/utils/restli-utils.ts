import { AxiosResponse } from 'axios';
import { reducedDecode } from './decoder';
import { paramEncode } from './encoder';

/**
 * Miscellaneous Rest.li Utils
 */

import { HEADERS } from './constants';

/**
 * Returns the created entity id, provided the raw response. By default, the created
 * entity id will be the decoded value.
 */
export function getCreatedEntityId(
  /** The raw response object from a Rest.li create request. */
  response: AxiosResponse,
  /** Flag whether to decode the created entity id. The entity is decoded by default (e.g. "urn:li:myEntity:123"), otherwise the raw, reduced encoded value is returned (e.g. "urn%3A%li%3AmyEntity%3A123"). */
  decode: boolean = true
): string | string[] | Record<string, string> {
  const reducedEncodedEntityId = response?.headers[HEADERS.CREATED_ENTITY_ID];
  return decode ? reducedDecode(reducedEncodedEntityId) : reducedEncodedEntityId;
}

/**
 * This wrapper function on top of encoder.paramEncode is needed specifically to handle the
 * "fields" query parameter for field projections. Although Rest.li protocol version 2.0.0 should
 * have supported a query param string like "?fields=List(id,firstName,lastName)" it still requires
 * the Rest.li protocol version 1.0.0 format of "?fields=id,firstName,lastName". Thus, if "fields"
 * is provided as a query parameter for HTTP GET requests, it should not be encoded like all the other
 * parameters.
 */
export function encodeQueryParamsForGetRequests(queryParams: Record<string, any>): string {
  const { fields, ...otherQueryParams } = queryParams;
  let encodedQueryParamString = paramEncode(otherQueryParams);
  if (fields) {
    encodedQueryParamString = [encodedQueryParamString, `fields=${fields}`].join('&');
  }
  return encodedQueryParamString;
}

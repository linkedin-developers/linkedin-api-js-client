import { AxiosResponse } from 'axios';
import { reducedDecode } from './decoder';

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
  return decode
    ? reducedDecode(reducedEncodedEntityId)
    : reducedEncodedEntityId;
}

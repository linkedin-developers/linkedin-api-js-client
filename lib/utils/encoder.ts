import { LIST_PREFIX, LIST_SUFFIX, OBJ_PREFIX, OBJ_SUFFIX } from './constants';

// rest.li special characters:
const badChars = /[,()':]/g;
const possible = /[,()':]/;

type Primitive = string | number | boolean;
type TypeOrArray<T> = T | T[];
type TypeOrArrayOrRecord<T> = TypeOrArray<T> | Record<string, T>;
type PrimitiveOrNull = null | Primitive;
type PrimitiveOrNullOrUndefined = PrimitiveOrNull | undefined;
type JSONBlob = Record<string, TypeOrArrayOrRecord<PrimitiveOrNullOrUndefined>>;

/**
 * Check if a parameter is object-like, assert via TS and throw Error if not object-like
 * @param json - unknown parameter to be checked
 */
function assertIsObjectNotArray(json: unknown, errorMessage: string): asserts json is JSONBlob {
  if (Array.isArray(json) || typeof json !== 'object' || json === null) {
    throw new Error(errorMessage);
  }
}

/**
 * Entry point to encode a JSON object to the rest.li spec with URL encoding.
 *
 * NOTES:
 * - `undefined` values will be removed from the passed in JSON.
 * - `null` values will be turned into the string 'null'.
 * - `true` values will be turned into the string 'true'.
 * - `false` values will be turned into the string 'false'.
 */
export function encode(value: any): string {
  // This will remove undefined values from an object
  const parsedValue: any = JSON.parse(JSON.stringify(value));

  return encodeAnyType(parsedValue, false);
}

/**
 * Entry point to encode a JSON object to the rest.li spec with body encoding.
 */
export function reducedEncode(value: any): string {
  const parsedValue: any = JSON.parse(JSON.stringify(value));

  return encodeAnyType(parsedValue, true);
}

/**
 * Entry point for serializing an arbitrary map of rest.li objects to querystring
 */
export function paramEncode(json: unknown): string {
  if (!json) {
    return '';
  }

  const parsedJson: unknown = JSON.parse(JSON.stringify(json));

  assertIsObjectNotArray(parsedJson, 'You must pass an object to the paramEncode function.');

  const query = Object.keys(parsedJson).map((property) => {
    return `${encodePrimitive(property)}=${encodeAnyType(parsedJson[property], false)}`;
  });
  return query.join('&');
}

function isRecord(value: JSONBlob | PrimitiveOrNullOrUndefined): value is JSONBlob {
  return typeof value === 'object' && value !== null;
}

/**
 * Used to branch based upon value type.
 */

function encodeAnyType(
  value: PrimitiveOrNullOrUndefined[] | JSONBlob | null,
  reduced: boolean
): string;
function encodeAnyType(
  value: PrimitiveOrNullOrUndefined,
  reduced: boolean
): PrimitiveOrNullOrUndefined;
function encodeAnyType(
  value: JSONBlob | TypeOrArray<PrimitiveOrNullOrUndefined>,
  reduced: boolean
): string | PrimitiveOrNullOrUndefined;
function encodeAnyType(
  value: JSONBlob | TypeOrArray<PrimitiveOrNullOrUndefined>,
  reduced: boolean
): string | PrimitiveOrNullOrUndefined {
  if (Array.isArray(value)) {
    return encodeArray(value, reduced);
  } else if (isRecord(value)) {
    return encodeObject(value, reduced);
  } else {
    return encodePrimitive(value, reduced);
  }
}

/**
 * Escapes an array.
 */
function encodeArray(value: PrimitiveOrNullOrUndefined[], reduced: boolean): string {
  const nested = new Array(value.length);
  for (let i = 0; i < value.length; i++) {
    nested[i] = encodeAnyType(value[i], reduced);
  }
  return `${LIST_PREFIX}${nested.join(',')}${LIST_SUFFIX}`;
}

/**
 * Escapes an object.
 */
function encodeObject(value: JSONBlob, reduced: boolean): string {
  const nested = Object.keys(value).map((property) => {
    return `${encodePrimitive(property, reduced)}:${encodeAnyType(value[property], reduced)}`;
  });
  return `${OBJ_PREFIX}${nested.join(',')}${OBJ_SUFFIX}`;
}

/**
 * Escapes a primitive value.
 */
function encodePrimitive(
  value: PrimitiveOrNullOrUndefined,
  reduced = false
): PrimitiveOrNullOrUndefined {
  if (value === '') {
    return "''";
  } else if (reduced && typeof value === 'string' && possible.test(value)) {
    return value.replace(badChars, escape);
  } else if (!reduced) {
    // TODO avoid casting here. encodeURIComponent type is not correct as it actually accepts null and undefined
    return encodeURIComponent(value as string).replace(badChars, escape);
  } else {
    return value;
  }
}

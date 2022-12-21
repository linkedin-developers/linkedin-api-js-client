import { LIST_PREFIX, LIST_SUFFIX, OBJ_PREFIX, OBJ_SUFFIX } from './constants';

// rest.li special characters: ,()':
const escapedChars = /(%2C|%28|%29|%27|%3A)/g;
const testEscapedChars = /(%2C|%28|%29|%27|%3A)/;

type StringOrStringObject = string | string[] | Record<string, string>;

/**
 * Polyfill startsWith for IE11
 *
 * @param {string} str
 * @param {string} search
 * @param {number} [pos]
 * @returns {boolean}
 */
function strStartsWith(str: string, search: string, pos = 0): boolean {
  return str.indexOf(search, pos) === pos;
}

/**
 * Validate that input ends with a specified suffix.
 * The suffix has to be a single-character string.
 *
 * @param {string} serializedrestli
 * @param {string} suffix a single-character string
 */
function validateSuffix(serializedrestli: string, suffix: string): void {
  if (serializedrestli[serializedrestli.length - 1] !== suffix) {
    throw new Error(`Input has unbalanced prefix and suffix: ${serializedrestli}`);
  }
}

/**
 * Find Last bracket to match, starting from pos
 *
 * @param {string} str
 * @param {number} [pos=0]
 * @returns {number}
 */
function findLastRightBracket(str: string, pos = 0): number {
  let numLeft = 0;
  let hasMetFirst = false;
  const L = '(';
  const R = ')';
  while (pos < str.length) {
    const currChar = str[pos];
    if (currChar === L) {
      numLeft++;
      hasMetFirst = true;
    }
    if (currChar === R) numLeft--;
    if (numLeft === 0 && hasMetFirst) break;
    pos++;
  }
  return pos;
}

/**
 * Reverse the rest.li escaping, called during the decoding.
 */
function restliUnescape(value: string, reduced: boolean): string {
  if (!reduced) {
    value = decodeURIComponent(value);
  } else if (testEscapedChars.test(value)) {
    value = value.replace(escapedChars, unescape);
  }
  return value === undefined || value === "''" ? '' : value;
}

export function paramDecode(querystring: string): Record<string, StringOrStringObject> {
  return querystring
    .split('&')
    .reduce(function (previous: Record<string, StringOrStringObject>, current: string) {
      // Short circuit if there isn't a key.
      if (!current.length) {
        return previous;
      }
      if (current.indexOf('=') === 0) {
        return previous;
      }

      let [key = '', value] = current.split('=');

      // Rest.li special-cases empty strings.
      if (key === "''") {
        key = '';
      }
      if (value === undefined || value === '') {
        value = "''";
      }

      previous[decodeURIComponent(key)] = decode(value);
      return previous;
    }, {});
}

/**
 * Entry point to decode a URL encoded rest.li object.
 *
 * NOTES:
 * - The Rest.li format is lossy. All values come out of this as strings.
 */
export function decode(serializedrestli: string): StringOrStringObject {
  return internalDecode(serializedrestli, false);
}

/**
 * Entry point to decode a body encoded rest.li object.
 */
export function reducedDecode(serializedrestli: string): StringOrStringObject {
  return internalDecode(serializedrestli, true);
}

function internalDecode(
  serializedrestli: string | undefined,
  reduced: boolean
): StringOrStringObject {
  if (serializedrestli === undefined || serializedrestli === "''") {
    serializedrestli = '';
  }
  if (strStartsWith(serializedrestli, LIST_PREFIX)) {
    validateSuffix(serializedrestli, LIST_SUFFIX);
    return decodeList(serializedrestli.substring(5, serializedrestli.length - 1), reduced);
  } else if (strStartsWith(serializedrestli, OBJ_PREFIX)) {
    validateSuffix(serializedrestli, OBJ_SUFFIX);
    return decodeObject(serializedrestli.substring(1, serializedrestli.length - 1), reduced);
  } else {
    return restliUnescape(serializedrestli, reduced);
  }
}

/**
 * @param {string} list e.g. 1,2,(k:v),3
 * @param {boolean} reduced
 * @returns {Array<*>}
 */
function decodeList(str: string, reduced = false): string[] {
  const retList = [];
  let idx = 0;
  while (idx < str.length) {
    if (strStartsWith(str, LIST_PREFIX, idx) || strStartsWith(str, OBJ_PREFIX, idx)) {
      const rightBracketIdx = findLastRightBracket(str, idx);
      retList.push(
        internalDecode(str.substring(idx, rightBracketIdx + 1), reduced) as string // TODO type overload _decode so we don't need this cast
      );
      idx = rightBracketIdx + 2; // skip the next comma
      continue;
    }
    let endIdx = str.indexOf(',', idx);
    if (endIdx < 0) endIdx = str.length;
    retList.push(restliUnescape(str.substring(idx, endIdx), reduced));
    idx = endIdx + 1;
  }
  return retList;
}

/**
 * @param {string} str e.g. k1:v1,k2:List(1,2,3),k3:v3
 * @param {boolean} reduced
 * @returns {Object}
 */
function decodeObject(str: string, reduced = false): Record<string, string> {
  const retObj: Record<string, string> = {};
  let idx = 0;
  while (idx < str.length) {
    const colonIdx = str.indexOf(':', idx);
    const key = restliUnescape(str.substring(idx, colonIdx), reduced);
    idx = colonIdx + 1;
    if (str.startsWith(LIST_PREFIX, idx) || str.startsWith(OBJ_PREFIX, idx)) {
      const rightBracketIdx = findLastRightBracket(str, idx);
      retObj[key] = internalDecode(str.substring(idx, rightBracketIdx + 1), reduced) as string; // TODO type overload _decode so we don't need this cast
      idx = rightBracketIdx + 2; // skip the next comma
      continue;
    }
    let endIdx = str.indexOf(',', idx);
    if (endIdx < 0) endIdx = str.length;
    const value = restliUnescape(str.substring(idx, endIdx), reduced);
    retObj[key] = value;
    idx = endIdx + 1;
  }
  return retObj;
}

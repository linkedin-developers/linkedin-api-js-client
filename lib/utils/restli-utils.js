const constants = require('./constants');

const LIST_PREFIX = 'List(';
const LIST_SUFFIX = ')';
const OBJ_PREFIX = '(';
const OBJ_SUFFIX = ')';

// rest.li special characters:
const badChars = /[,()':]/g;
const possible = /[,()':]/;

function isRecord(value) {
  return typeof value === 'object' && value !== null;
}

function encodeAnyType(value, reduced) {
  if (Array.isArray(value)) {
    return encodeArray(value, reduced);
  } else if (isRecord(value)) {
    return encodeObject(value, reduced);
  } else {
    return encodePrimitive(value, reduced);
  }
}

function encodeArray(value, reduced) {
  const encodedArrayValues = new Array(value.length);
  for (let i = 0; i < value.length; i++) {
    encodedArrayValues[i] = encodeAnyType(value[i], reduced);
  }
  return `${LIST_PREFIX}${encodedArrayValues.join(',')}${LIST_SUFFIX}`;
}

function encodeObject(value, reduced) {
  const encodedKeyValues = Object.keys(value).map(property => {
    return `${encodePrimitive(property, reduced)}:${encodeAnyType(
      value[property],
      reduced
    )}`;
  });
  return `${OBJ_PREFIX}${encodedKeyValues.join(',')}${OBJ_SUFFIX}`;
}

function encodePrimitive(value, reduced) {
  if (value === "") {
    return "''";
  } else if (reduced && typeof value === 'string' && possible.test(value)) {
    return value.replace(badChars, escape);
  } else if (!reduced) {
    return encodeURIComponent(value).replace(badChars, escape);
  } else {
    return value;
  }
}

module.exports = {
  encode(json) {
    const parsedJson = JSON.parse(JSON.stringify(json));

    return encodeAnyType(parsedJson, false);
  },

  paramEncode(json) {
    if (!json) {
      return '';
    }

    const parsedJson = JSON.parse(JSON.stringify(json));

    const encodedQueryParams = Object.keys(parsedJson).map(property => {
      return `${encodePrimitive(property)}=${encodeAnyType(parsedJson[property], false)}`;
    });
    return encodedQueryParams.join('&');
  },

  getPatchObject: require('./patch-generator').getPatchObject,

  getCreatedEntityId(response) {
    return response?.headers[constants.HEADERS.CREATED_ENTITY_ID];
  }
}
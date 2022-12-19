const isString = (val) => typeof val === 'string';
const isNumber = (val) => typeof val === 'number';
const isBoolean = (val) => typeof val === 'boolean';
const isObject = (obj) => typeof obj === 'object';

const SET = '$set';
const DELETE = '$delete';
const PATCH = 'patch';

/**
 * Pegasus/Restli diff generator - required for partial updates
 * https://github.com/linkedin/rest.li/wiki/Rest.li-Protocol#partial-update
 */

/**
 * Determines if a value is empty - null, undefined or an empty string.
 *
 * @method isEmpty
 * @param {*} value
 * @return {boolean}
 * @private
 */
function isValueEmpty(value) {
  return value === null || value === undefined || value === '';
}

/**
 * Stores the value as a DELETE.
 *
 * @method storeAsDeleteOp
 * @param {Object} obj
 * @param {string| number} key
 * @private
 */
function storeAsDeleteOp(obj, key) {
  if (!(obj && key)) {
    return;
  }

  obj[DELETE] = obj[DELETE] || [];
  obj[DELETE].push(key);
}

/**
 * Stores the value as a SET.
 *
 * @method storeAsSetOp
 * @param {Object} obj
 * @param {string| number} key
 * @param {*} value
 * @private
 */
function storeAsSetOp(obj, key, value) {
  if (!(obj && key)) {
    return;
  }
  obj[SET] = obj[SET] || {};
  obj[SET][key] = value;
}

/**
 * Determines if the array (modifiedArr), is indeed modified when
 * compared to the originalArr. The arrays are considered different, when:
 * 1. Sizes are different
 * 2. If sizes are same, at least one item of the array is different from the
 *    corresponding item in the other array.
 *
 * @method isArrayModified
 * @param {Array} originalArr
 * @param {Array} modifiedArr
 * @return {boolean}
 * @private
 */
function isArrayModified(originalArr, modifiedArr) {
  if (!(Array.isArray(originalArr) && Array.isArray(modifiedArr))) {
    return false;
  }

  const oLength = originalArr.length;

  if (oLength !== modifiedArr.length) {
    return true;
  }

  for (let oIndex = 0; oIndex < oLength; oIndex = oIndex + 1) {
    const originalArrItem = originalArr[oIndex];
    const modifiedArrItem = modifiedArr[oIndex];

    if (
      isString(originalArrItem) ||
      isString(modifiedArrItem) ||
      isNumber(originalArrItem) ||
      isNumber(modifiedArrItem) ||
      isBoolean(originalArrItem) ||
      isBoolean(modifiedArrItem)
    ) {
      if (originalArrItem !== modifiedArrItem) {
        if (typeof originalArrItem !== typeof modifiedArrItem) {
          console.error('Modified changes have diffirent primitive types');
        }

        return true;
      }
    } else {
      const arrDiff = generateDiff(originalArrItem, modifiedArrItem);

      if (arrDiff !== null) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Returns the updated diff between two values.
 *
 * @method getUpdatedDiff
 * @param {*} oValue
 * @param {*} mValue
 * @param {string} oKey
 * @param {Object} diff
 * @return {Object}
 * @private
 */
function getUpdatedDiff({ oValue, mValue, oKey, diff }) {
  let updatedDiff = diff;

  if (isObject(oValue) && isObject(mValue)) {
    const subDiff = generateDiff(oValue, mValue);

    if (subDiff !== null) {
      updatedDiff = updatedDiff || {};
      updatedDiff[oKey] = subDiff;
    }
  } else if (Array.isArray(oValue) && Array.isArray(mValue)) {
    if (isArrayModified(oValue, mValue)) {
      updatedDiff = updatedDiff || {};
      storeAsSetOp(updatedDiff, oKey, mValue);
    }
  } else if (oValue !== mValue) {
    updatedDiff = updatedDiff || {};
    storeAsSetOp(updatedDiff, oKey, mValue);
  }

  return updatedDiff;
}

/**
 * @method generateDiff
 * @param {Object} original
 * @param {Object} modified
 * @return {Object}
 * @private
 */
function generateDiff(original, modified) {
  let diff = null;

  let oValue;

  let mValue;

  if (!(original && modified)) {
    return diff;
  }

  const oKeys = Object.keys(original);

  oKeys.forEach((oKey) => {
    oValue = original[oKey];
    mValue = modified[oKey];

    if (!isValueEmpty(oValue)) {
      if (isValueEmpty(mValue)) {
        // Key has been removed
        diff = diff || {};
        storeAsDeleteOp(diff, oKey);
      } else {
        // Key exists, compare the two values for diffs
        diff = getUpdatedDiff({ oValue, mValue, oKey, diff });
      }
    }
  });

  const mKeys = Object.keys(modified);

  mKeys.forEach((mKey) => {
    mValue = modified[mKey];
    oValue = original[mKey];

    if (!isValueEmpty(mValue) && isValueEmpty(oValue)) {
      // New key has been added
      diff = diff || {};
      storeAsSetOp(diff, mKey, mValue);
    }
  });

  return diff;
}

/**
 * Generates a pegasus/restli diff for two Objects.
 * For more information about the format, read:
 * https://github.com/linkedin/rest.li/wiki/Rest.li-Protocol#partial-update
 *
 * @method getDiff
 * @param {Object} original
 * @param {Object} modified
 * @return {Object}
 */
export function getPatchObject(original, modified) {
  return {
    [PATCH]: generateDiff(original, modified)
  };
}

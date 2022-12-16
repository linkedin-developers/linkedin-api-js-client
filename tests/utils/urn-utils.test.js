const { createUrnFromAttrs } = require('lib/utils/urn-utils');

describe('urn utils', () => {
  test('basic urn formatting', () => {
    expect(createUrnFromAttrs('developerApplication', 123)).toBe('urn:li:developerApplication:123');
  });
});

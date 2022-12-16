import { getCreatedEntityId } from '../../lib/utils/restli-utils';

describe('restli-utils', () => {
  test.each([
    {
      description: 'Id is a string',
      inputHeaderIdValue: 'foobar',
      shouldDecode: true,
      expectedIdValue: 'foobar'
    },
    {
      description: 'Id has special characters, decode = true',
      inputHeaderIdValue: 'urn%3Ali%3Atest%3Afoo bar',
      shouldDecode: true,
      expectedIdValue: 'urn:li:test:foo bar'
    },
    {
      description: 'Id has special characters, decode = false',
      inputHeaderIdValue: 'urn%3Ali%3Atest%3Afoo bar',
      shouldDecode: false,
      expectedIdValue: 'urn%3Ali%3Atest%3Afoo bar'
    }
  ])('$description', ({ inputHeaderIdValue, shouldDecode, expectedIdValue }) => {
    const inputResponse: any = {
      headers: {
        'x-restli-id': inputHeaderIdValue
      }
    };
    expect(getCreatedEntityId(inputResponse, shouldDecode)).toBe(expectedIdValue);
  });
});

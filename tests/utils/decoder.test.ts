import { decode, paramDecode, reducedDecode } from '../../lib/utils/decoder';
import { encode, paramEncode, reducedEncode } from '../../lib/utils/encoder';

const example = {
  k1: 'v1',
  k2: 'value with spaces',
  k3: [1, 2, 3],
  k4: "List(value:with%reserved,chars,'')",
  k5: {
    k51: 'v51',
    k52: 'v52'
  },
  "dangerous('),:key:": 'value',
  emptystring: '',
  emptyList: [],
  emptyListString: [''],
  'querystri"ngbreaker1': '?key=value',
  querystringbreaker2: '&key=value&',
  boom: null,
  true: true,
  false: false,
  multibyte: '株式会社', // %E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE
  株式会社: 'multibytekey',
  '': 'emptystringkey'
};

const stringCoercedExample = {
  k1: 'v1',
  k2: 'value with spaces',
  k3: ['1', '2', '3'],
  k4: "List(value:with%reserved,chars,'')",
  k5: {
    k51: 'v51',
    k52: 'v52'
  },
  "dangerous('),:key:": 'value',
  emptystring: '',
  emptyList: [],
  emptyListString: [''],
  'querystri"ngbreaker1': '?key=value',
  querystringbreaker2: '&key=value&',
  boom: 'null',
  true: 'true',
  false: 'false',
  multibyte: '株式会社', // %E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE
  株式会社: 'multibytekey',
  '': 'emptystringkey'
};

describe('restli decode', () => {
  test.each([
    {
      encodedString: 'List(1,2,(k:v),3)',
      decodedValue: ['1', '2', { k: 'v' }, '3']
    },
    {
      encodedString: 'List(List(1))',
      decodedValue: [['1']]
    },
    {
      encodedString: 'List((k:List(1)))',
      decodedValue: [{ k: ['1'] }]
    },
    {
      encodedString: 'List(%28v1%2C2%29,%28v2%2C2%29)',
      decodedValue: ['(v1,2)', '(v2,2)']
    },
    {
      encodedString: '',
      decodedValue: ''
    },
    {
      encodedString: "List('')",
      decodedValue: ['']
    },
    {
      encodedString: 'List()',
      decodedValue: []
    },
    {
      encodedString: '(k1:v1,k2:List(1,2,3),k3:v3)',
      decodedValue: {
        k1: 'v1',
        k2: ['1', '2', '3'],
        k3: 'v3'
      }
    },
    {
      encodedString: '(k1:List())',
      decodedValue: { k1: [] }
    },
    {
      encodedString: encode(example),
      decodedValue: stringCoercedExample
    }
  ])('decode', ({ encodedString, decodedValue }) => {
    expect(decode(encodedString)).toEqual(decodedValue);
  });

  test('decodePrefixSuffixValidation', () => {
    // test suffix validation
    const unbalancedSuffixInputs = [
      'List((k1:v1)',
      'List((k1:List(v1))',
      '(k1:List((k2:(k3:v1,k4:List((string:v2)))))'
    ];
    unbalancedSuffixInputs.forEach((unbalancedSuffixInput) => {
      expect(() => {
        decode(unbalancedSuffixInput);
      }).toThrow();
    });
  });

  test('reducedDecode', () => {
    const reducedEncodedStr = reducedEncode(example);

    expect(reducedDecode(reducedEncodedStr)).toEqual(stringCoercedExample);
  });

  test('handles decoding empty key', () => {
    expect(paramDecode("''=foo")).toEqual({
      '': 'foo'
    });
  });

  describe('paramEncode', () => {
    test('works with basic example', () => {
      expect(paramDecode(paramEncode(example))).toEqual(stringCoercedExample);
    });

    test('works with empty map', () => {
      expect(paramDecode(paramEncode({}))).toEqual({});
    });

    test('ignores value without a property key', () => {
      expect(paramDecode('=foo')).toEqual({});
    });

    test('handles key with no value', () => {
      expect(paramDecode('foo=')).toEqual({
        foo: ''
      });
    });
  });
});

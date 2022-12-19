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
  k6: ['(v1,2)', '(v2,2)'],
  "dangerous('),:key:": 'value',
  emptystring: '',
  querystringbreaker1: '?key=value',
  querystringbreaker2: '&key=value&',
  boom: null,
  boom2: undefined,
  true: true,
  false: false,
  multibyte: '株式会社', // %E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE
  株式会社: 'multibytekey',
  '': 'emptystringkey',
  emptyList: [],
  emptyListString: ['']
};

const expected = {
  encode:
    "(k1:v1,k2:value%20with%20spaces,k3:List(1,2,3),k4:List%28value%3Awith%25reserved%2Cchars%2C%27%27%29,k5:(k51:v51,k52:v52),k6:List(%28v1%2C2%29,%28v2%2C2%29),dangerous%28%27%29%2C%3Akey%3A:value,emptystring:'',querystringbreaker1:%3Fkey%3Dvalue,querystringbreaker2:%26key%3Dvalue%26,boom:null,true:true,false:false,multibyte:%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE,%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE:multibytekey,'':emptystringkey,emptyList:List(),emptyListString:List(''))",
  reducedEncode:
    "(k1:v1,k2:value with spaces,k3:List(1,2,3),k4:List%28value%3Awith%reserved%2Cchars%2C%27%27%29,k5:(k51:v51,k52:v52),k6:List(%28v1%2C2%29,%28v2%2C2%29),dangerous%28%27%29%2C%3Akey%3A:value,emptystring:'',querystringbreaker1:?key=value,querystringbreaker2:&key=value&,boom:null,true:true,false:false,multibyte:株式会社,株式会社:multibytekey,'':emptystringkey,emptyList:List(),emptyListString:List(''))",
  paramEncode:
    "k1=v1&k2=value%20with%20spaces&k3=List(1,2,3)&k4=List%28value%3Awith%25reserved%2Cchars%2C%27%27%29&k5=(k51:v51,k52:v52)&k6=List(%28v1%2C2%29,%28v2%2C2%29)&dangerous%28%27%29%2C%3Akey%3A=value&emptystring=''&querystringbreaker1=%3Fkey%3Dvalue&querystringbreaker2=%26key%3Dvalue%26&boom=null&true=true&false=false&multibyte=%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE&%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE=multibytekey&''=emptystringkey&emptyList=List()&emptyListString=List('')",
  _arrayParamEncode: {
    array: [null, null, null],
    array2: [1, 2, 3],
    boom: null,
    true: true,
    false: false,
    multibyte: '株式会社',
    株式会社: 'multibytekey',
    '': 'emptystringkey'
  }
};

describe('restli encode', () => {
  test('processes correctly in each format', () => {
    expect(encode(example)).toBe(expected.encode);
    expect(reducedEncode(example)).toBe(expected.reducedEncode);
    expect(paramEncode(example)).toBe(expected.paramEncode);
  });

  test('throws an error when using invalid arguments to paramEncode', () => {
    expect(function () {
      paramEncode([] as any);
    }).toThrow();
    expect(function () {
      paramEncode(new Date() as any);
    }).toThrow();
  });
});

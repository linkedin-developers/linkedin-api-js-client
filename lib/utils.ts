import * as oauthUtils from './utils/oauth-utils';
import * as restliUtils from './utils/restli-utils';
import * as apiUtils from './utils/api-utils';
import * as urnUtils from './utils/urn-utils';
import * as patchUtils from './utils/patch-generator';
import * as queryTunnelingUtils from './utils/query-tunneling';
import * as constants from './utils/constants';
import * as encoderUtils from './utils/encoder';
import { decode, paramDecode, reducedDecode } from './utils/decoder';

export const utils = {
  ...oauthUtils,
  ...restliUtils,
  ...apiUtils,
  ...urnUtils,
  ...patchUtils,
  ...queryTunnelingUtils,
  ...constants,
  ...encoderUtils,
  decode,
  paramDecode,
  reducedDecode
};

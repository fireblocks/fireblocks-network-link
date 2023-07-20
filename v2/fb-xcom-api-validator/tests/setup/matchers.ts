import { expect } from 'expect';
import { toBeListedAsset } from '../matchers/to-be-listed-asset';

expect.extend({
  toBeListedAsset,
});

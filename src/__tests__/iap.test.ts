import {NativeModules} from 'react-native';

import {initConnection} from '../iap';

jest.mock(
  '../../node_modules/react-native/Libraries/Utilities/Platform',
  () => ({
    OS: 'android',
    select: (dict: {[x: string]: any}) => dict.android,
  }),
);

describe('Google Play IAP', () => {
  it("should call init on Google Play's native module but not on Amazon's", async () => {
    await initConnection();
    expect(NativeModules.RNIapModule.initConnection).toBeCalled();
    expect(NativeModules.RNIapAmazonModule.initConnection).not.toBeCalled();
  });
});

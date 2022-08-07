import {NativeModules} from 'react-native';

import {initConnection} from '../methods';

const rnLib = '../../node_modules/react-native/Libraries';

describe('Google Play IAP', () => {
  beforeEach(() => {
    jest.mock(rnLib + '/Utilities/Platform', () => ({
      OS: 'android',
      select: (dict: {[x: string]: any}) => dict.android,
    }));
  });

  it("should call init on Google Play's native module but not on Amazon's", async () => {
    await initConnection();
    expect(NativeModules.RNIapModule.initConnection).toBeCalled();
    expect(NativeModules.RNIapAmazonModule.initConnection).not.toBeCalled();
  });
});

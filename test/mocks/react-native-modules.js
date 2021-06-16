import {NativeModules, Platform} from 'react-native';
NativeModules.RNIapModule = {
  ...NativeModules.RNIapModule,
  initConnection: jest.fn(() => Promise.resolve(true)),
  endConnection: jest.fn(),
  getInstallSource: jest.fn(),
};

NativeModules.RNIapAmazonModule = {
  ...NativeModules.RNIapAmazonModule,
  initConnection: jest.fn(() => Promise.resolve(true)),
  endConnection: jest.fn(),
  getInstallSource: jest.fn(),
};

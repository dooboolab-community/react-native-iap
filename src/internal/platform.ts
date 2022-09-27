import {NativeModules, Platform} from 'react-native';

import {ErrorCode} from '../purchaseError';

const {RNIapIos, RNIapIosSk2, RNIapModule, RNIapAmazonModule} = NativeModules;

export const isIos = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isAmazon = isAndroid && !!RNIapAmazonModule;

// Android

let androidNativeModule = RNIapModule;

export const setAndroidNativeModule = (
  nativeModule: typeof RNIapModule,
): void => {
  androidNativeModule = nativeModule;
};

export const checkNativeAndroidAvailable = (): void => {
  if (!RNIapModule && !RNIapAmazonModule) {
    throw new Error(ErrorCode.E_IAP_NOT_AVAILABLE);
  }
};

export const getAndroidModule = ():
  | typeof RNIapModule
  | typeof RNIapAmazonModule => {
  checkNativeAndroidAvailable();

  return androidNativeModule
    ? androidNativeModule
    : RNIapModule
    ? RNIapModule
    : RNIapAmazonModule;
};

export const getNativeModule = ():
  | typeof RNIapModule
  | typeof RNIapAmazonModule
  | typeof RNIapIos
  | typeof RNIapIosSk2 => {
  return isAndroid ? getAndroidModule() : getIosModule();
};

// iOS

let iosNativeModule: typeof RNIapIos | typeof RNIapIosSk2 = RNIapIos;

export const isStorekit2Avaiable = (): boolean =>
  isIos && RNIapIosSk2?.isAvailable() === 1;

export const isIosStorekit2 = () =>
  isIos &&
  !!iosNativeModule &&
  iosNativeModule === RNIapIosSk2 &&
  isStorekit2Avaiable();

export const setIosNativeModule = (
  nativeModule: typeof RNIapIos | typeof RNIapIosSk2,
): void => {
  iosNativeModule = nativeModule;
};

export const storekit2Mode = () => {
  iosNativeModule = RNIapIosSk2;
  if (isStorekit2Avaiable()) {
    RNIapIos.disable();
    return true;
  }
  if (isIos) {
    console.warn('Storekit 2 is not available on this device');
    return false;
  }
  return true;
};

export const storekit1Mode = () => {
  iosNativeModule = RNIapIos;
  if (isStorekit2Avaiable()) {
    RNIapIosSk2.disable();
    return true;
  }
  return false;
};

export const storekitHybridMode = () => {
  if (isStorekit2Avaiable()) {
    iosNativeModule = RNIapIosSk2;
    console.info('Using Storekit 2');
    return true;
  } else {
    iosNativeModule = RNIapIos;
    console.info('Using Storekit 1');
    return true;
  }
};

const checkNativeIOSAvailable = (): void => {
  if (!RNIapIos && !isStorekit2Avaiable()) {
    throw new Error(ErrorCode.E_IAP_NOT_AVAILABLE);
  }
};

export const getIosModule = (): typeof RNIapIos | typeof RNIapIosSk2 => {
  checkNativeIOSAvailable();

  return iosNativeModule
    ? iosNativeModule
    : RNIapIosSk2
    ? RNIapIosSk2
    : RNIapIos;
};

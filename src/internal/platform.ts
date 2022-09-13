import {NativeModules, Platform} from 'react-native';

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
    throw new Error('IAP_NOT_AVAILABLE');
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

export const isIosStorekit2 = () => iosNativeModule === RNIapIosSk2;

export const isStorekit2Avaiable = (): boolean => !!RNIapIosSk2;

export const setIosNativeModule = (
  nativeModule: typeof RNIapIos | typeof RNIapIosSk2,
): void => {
  iosNativeModule = nativeModule;
};

export const enableStorekit2 = () => {
  if (RNIapIosSk2) {
    iosNativeModule = RNIapIosSk2;
    return true;
  }
  console.warn('Storekit 2 is not available on this device');

  return false;
};

const checkNativeIOSAvailable = (): void => {
  if (!RNIapIos && !RNIapIosSk2) {
    throw new Error('IAP_NOT_AVAILABLE');
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

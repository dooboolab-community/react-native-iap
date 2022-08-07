import {isAndroid} from '../utils/platform';

import type {AmazonModuleProps} from './amazon';
import {AndroidModule, AndroidModuleProps} from './android';
import {IosModule, IosModuleProps} from './ios';

declare module 'react-native' {
  interface NativeModulesStatic {
    RNIapIos: IosModuleProps;
    RNIapModule: AndroidModuleProps;
    RNIapAmazonModule: AmazonModuleProps;
  }
}

export * from './amazon';
export * from './android';
export * from './ios';

export const NativeModule = isAndroid ? AndroidModule : IosModule;

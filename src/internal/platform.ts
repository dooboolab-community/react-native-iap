import {NativeModules, Platform} from 'react-native';

const {RNIapAmazonModule} = NativeModules;

export const isIos = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isAmazon = isAndroid && !!RNIapAmazonModule;

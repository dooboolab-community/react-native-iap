import {Platform} from 'react-native';

const productSkus = Platform.select({
  ios: ['com.cooni.point1000', 'com.cooni.point5000'],

  android: [
    'android.test.purchased',
    'android.test.canceled',
    'android.test.refunded',
    'android.test.item_unavailable',
  ],

  default: [],
}) as string[];

const subscriptionSkus = Platform.select({
  ios: ['com.cooni.sub1000', 'com.cooni.sub5000'],
  android: ['test.sub1'],
  default: [],
}) as string[];

export const constants = {
  productSkus,
  subscriptionSkus,
};

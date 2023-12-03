import {Platform} from 'react-native';

import {isAmazon} from 'react-native-iap/src/internal';

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
  android: isAmazon
    ? [
        'com.amazon.sample.iap.subscription.mymagazine.month',
        'com.amazon.sample.iap.subscription.mymagazine.quarter',
      ]
    : ['test.sub1'],
  default: [],
}) as string[];
const amazonBaseSku = 'com.amazon.sample.iap.subscription.mymagazine';
export const constants = {
  productSkus,
  subscriptionSkus,
  amazonBaseSku,
};

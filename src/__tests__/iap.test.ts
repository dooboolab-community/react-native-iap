import {NativeModules} from 'react-native';

import {initConnection} from '../iap';
import type {SubscriptionAndroid} from '../types';
import {SubscriptionPlatform} from '../types';

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

  it('has correct typings for an Android subscription', () => {
    // This actually doesn't test any logic, but just verifies the typings
    // are correct
    const subscription: SubscriptionAndroid = {
      platform: SubscriptionPlatform.android,
      // The rest of this is pasted in from a `console.log` result of an
      // Android getSubscriptions call from 2022-10-11.
      subscriptionOfferDetails: [
        {
          pricingPhases: {
            pricingPhaseList: [
              {
                recurrenceMode: 1,
                priceAmountMicros: '49990000',
                billingCycleCount: 0,
                billingPeriod: 'P1Y',
                priceCurrencyCode: 'USD',
                formattedPrice: '$49.99',
              },
            ],
          },
          offerTags: [],
          offerToken: 'dGVzdA==',
          basePlanId: 'basePlanId',
          offerId: 'offerId',
        },
      ],
      name: 'MyApp Pro: Annual Plan',
      productType: 'subs',
      description: '',
      title: 'MyApp Pro: Annual Plan (MyApp - Productivity App)',
      productId: 'app_4999_1y_1w0',
    };

    expect(subscription).toBeTruthy();
  });
});

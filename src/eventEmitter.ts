import {NativeEventEmitter} from 'react-native';

import {getAndroidModule, getNativeModule} from './iap';
import {isAndroid} from './internal';
import type {Purchase} from './types';

const eventEmitter = new NativeEventEmitter(getNativeModule());

/**
 * Add IAP purchase event
 * TODO: Rename to transactionUpdatedListener
 */
export const purchaseUpdatedListener = (
  listener: (event: Purchase) => void,
) => {
  const emitterSubscription = eventEmitter.addListener(
    'transaction-updated',
    listener,
  );

  if (isAndroid) {
    getAndroidModule().startListening();
  }

  return emitterSubscription;
};

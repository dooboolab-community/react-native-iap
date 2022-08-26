import {EmitterSubscription, NativeEventEmitter} from 'react-native';

import {getAndroidModule, getIosModule, getNativeModule} from './iap';
import {isAndroid, isIos} from './internal';
import type {PurchaseError} from './purchaseError';
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

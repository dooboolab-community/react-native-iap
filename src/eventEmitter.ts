import {EmitterSubscription, NativeEventEmitter} from 'react-native';

import {getAndroidModule, getIosModule, getNativeModule} from './iap';
import {isAndroid, isIos} from './internal';
import type {PurchaseError} from './purchaseError';
import type {Purchase} from './types';

/**
 * Add IAP purchase event
 */
export const purchaseUpdatedListener = (
  listener: (event: Purchase) => void,
) => {
  const eventEmitter = new NativeEventEmitter(getNativeModule());
  const emitterSubscription = eventEmitter.addListener(
    'purchase-updated',
    listener,
  );

  if (isAndroid) {
    getAndroidModule().startListening();
  }

  return emitterSubscription;
};

/**
 * Add IAP purchase error event
 */
export const purchaseErrorListener = (
  listener: (error: PurchaseError) => void,
): EmitterSubscription => {
  const eventEmitter = new NativeEventEmitter(getNativeModule());
  return eventEmitter.addListener('purchase-error', listener);
};

/**
 * Add IAP promoted subscription event
 *
 * @platform iOS
 */
export const promotedProductListener = (listener: () => void) => {
  if (isIos) {
    const eventEmitter = new NativeEventEmitter(getIosModule());
    return eventEmitter.addListener('iap-promoted-product', listener);
  }

  return null;
};

import {EmitterSubscription, NativeEventEmitter} from 'react-native';

import {getAndroidModule, getIosModule, getNativeModule} from './iap';
import {isAndroid, isIos} from './internal';
import type {PurchaseError} from './purchaseError';
import type {Purchase} from './types';

const eventEmitter = new NativeEventEmitter(getNativeModule());

/**
 * Add IAP purchase event
 */
export const purchaseUpdatedListener = (
  listener: (event: Purchase) => void,
) => {
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
): EmitterSubscription => eventEmitter.addListener('purchase-error', listener);

/**
 * Add IAP promoted subscription event
 *
 * @platform iOS
 */
export const promotedProductListener = (listener: () => void) => {
  if (isIos) {
    return new NativeEventEmitter(getIosModule()).addListener(
      'iap-promoted-product',
      listener,
    );
  }

  return null;
};

import {EmitterSubscription, NativeEventEmitter} from 'react-native';

import {isAndroid, isIos} from './utils/platform';
import type {PurchaseError} from './error';
import {AndroidModule, IosModule, NativeModule} from './modules';
import type {Purchase} from './types';

const eventEmitter = new NativeEventEmitter(NativeModule);

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
    AndroidModule.startListening();
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
 * Only available on iOS
 */
export const promotedProductListener = (listener: () => void) => {
  if (isIos) {
    return new NativeEventEmitter(IosModule).addListener(
      'iap-promoted-product',
      listener,
    );
  }

  return null;
};

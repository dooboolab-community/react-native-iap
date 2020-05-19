import * as Apple from './type/apple';

import {
  DeviceEventEmitter,
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

const { RNIapIos, RNIapModule } = NativeModules;

interface Common {
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
}

export enum IAPErrorCode {
  E_IAP_NOT_AVAILABLE = 'E_IAP_NOT_AVAILABLE',
  E_UNKNOWN = 'E_UNKNOWN',
  E_USER_CANCELLED = 'E_USER_CANCELLED',
  E_USER_ERROR = 'E_USER_ERROR',
  E_ITEM_UNAVAILABLE = 'E_ITEM_UNAVAILABLE',
  E_REMOTE_ERROR = 'E_REMOTE_ERROR',
  E_NETWORK_ERROR = 'E_NETWORK_ERROR',
  E_SERVICE_ERROR = 'E_SERVICE_ERROR',
  E_RECEIPT_FAILED = 'E_RECEIPT_FAILED',
  E_RECEIPT_FINISHED_FAILED = 'E_RECEIPT_FINISHED_FAILED',
  E_NOT_PREPARED = 'E_NOT_PREPARED',
  E_NOT_ENDED = 'E_NOT_ENDED',
  E_ALREADY_OWNED = 'E_ALREADY_OWNED',
  E_DEVELOPER_ERROR = 'E_DEVELOPER_ERROR',
  E_BILLING_RESPONSE_JSON_PARSE_ERROR = 'E_BILLING_RESPONSE_JSON_PARSE_ERROR',
}

export enum ProrationModesAndroid {
  IMMEDIATE_WITH_TIME_PRORATION = 1,
  IMMEDIATE_AND_CHARGE_PRORATED_PRICE = 2,
  IMMEDIATE_WITHOUT_PRORATION = 3,
  DEFERRED = 4,
  UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY = 0,
}

export interface Discount {
  identifier: string;
  type: string;
  numberOfPeriods: string;
  price: string;
  localizedPrice: string;
  paymentMode: string;
  subscriptionPeriod: string;
}

export interface Product extends Common {
  type: 'inapp' | 'iap';
  productId: string;
}

export interface Subscription extends Common {
  type: 'subs' | 'sub';
  productId: string;

  discounts?: Discount[];

  introductoryPrice?: string;
  introductoryPricePaymentModeIOS?: string;
  introductoryPriceNumberOfPeriodsIOS?: string;
  introductoryPriceSubscriptionPeriodIOS?: string;

  subscriptionPeriodNumberIOS?: string;
  subscriptionPeriodUnitIOS?: string;

  introductoryPriceCyclesAndroid?: string;
  introductoryPricePeriodAndroid?: string;
  subscriptionPeriodAndroid?: string;
  freeTrialPeriodAndroid?: string;
}

export enum PurchaseStateAndroid {
  UNSPECIFIED_STATE = 0,
  PURCHASED = 1,
  PENDING = 2,
}

export interface ProductPurchase {
  productId: string;
  transactionId?: string;
  transactionDate: number;
  transactionReceipt: string;
  purchaseToken?: string;
  dataAndroid?: string;
  signatureAndroid?: string;
  autoRenewingAndroid?: boolean;
  purchaseStateAndroid?: PurchaseStateAndroid;
  originalTransactionDateIOS?: string;
  originalTransactionIdentifierIOS?: string;
  isAcknowledgedAndroid?: boolean;
}

export interface PurchaseResult {
  responseCode?: number;
  debugMessage?: string;
  code?: string;
  message?: string;
}

export interface PurchaseError {
  responseCode?: number;
  debugMessage?: string;
  code?: string;
  message?: string;
}

export type InAppPurchase = ProductPurchase;

export interface SubscriptionPurchase extends ProductPurchase {
  autoRenewingAndroid?: boolean;
  originalTransactionDateIOS?: string;
  originalTransactionIdentifierIOS?: string;
}

export type Purchase = InAppPurchase | SubscriptionPurchase;

const ANDROID_ITEM_TYPE_SUBSCRIPTION = 'subs';
const ANDROID_ITEM_TYPE_IAP = 'inapp';
export const PROMOTED_PRODUCT = 'iap-promoted-product';

function checkNativeAndroidAvailable(): Promise<void> {
  if (!RNIapModule) {
    return Promise.reject(new Error(IAPErrorCode.E_IAP_NOT_AVAILABLE));
  }
}

function checkNativeiOSAvailable(): Promise<void> {
  if (!RNIapIos) {
    return Promise.reject(new Error(IAPErrorCode.E_IAP_NOT_AVAILABLE));
  }
}
/**
 * Init module for purchase flow. Required on Android. In ios it will check wheter user canMakePayment.
 * @returns {Promise<boolean>}
 */
export const initConnection = (): Promise<boolean> =>
  Platform.select({
    ios: async () => {
      if (!RNIapIos) {
        return Promise.resolve();
      }
      return RNIapIos.canMakePayments();
    },
    android: async () => {
      if (!RNIapModule) {
        return Promise.resolve();
      }
      return RNIapModule.initConnection();
    },
  })();

/**
 * End module for purchase flow.
 * @returns {Promise<void>}
 */
export const endConnection = (): Promise<void> =>
  Platform.select({
    ios: async () => {
      if (!RNIapIos) {
        console.warn('Native ios module does not exists');
        return Promise.resolve();
      }
      return RNIapIos.endConnection();
    },
    android: async () => {
      if (!RNIapModule) {
        console.warn('Native ios module does not exists');
        return Promise.resolve();
      }
      return RNIapModule.endConnection();
    },
  })();

/**
 * @deprecated
 * End module for purchase flow. Required on Android. No-op on iOS.
 * @returns {Promise<void>}
 */
export const endConnectionAndroid = (): Promise<void> => {
  console.warn('endConnectionAndroid is deprecated and will be removed in the future. Please use endConnection instead');
  return Platform.select({
    ios: async () => Promise.resolve(),
    android: async () => {
      if (!RNIapModule) {
        return Promise.resolve();
      }
      return RNIapModule.endConnection();
    },
  })();
};

/**
 * Consume all remaining tokens. Android only.
 * @returns {Promise<string[]>}
 */
export const consumeAllItemsAndroid = (): Promise<string[]> =>
  Platform.select({
    ios: async () => Promise.resolve(),
    android: async () => {
      checkNativeAndroidAvailable();
      return RNIapModule.refreshItems();
    },
  })();

/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 * @param {string[]} skus The item skus
 * @returns {Promise<Product[]>}
 */
export const getProducts = (skus: string[]): Promise<Product[]> =>
  Platform.select({
    ios: async () => {
      if (!RNIapIos) {
        return [];
      }
      return RNIapIos.getItems(skus).then((items: Product[]) =>
        items.filter((item: Product) => item.productId),
      );
    },
    android: async () => {
      if (!RNIapModule) {
        return [];
      }
      return RNIapModule.getItemsByType(ANDROID_ITEM_TYPE_IAP, skus);
    },
  })();

/**
 * Get a list of subscriptions
 * @param {string[]} skus The item skus
 * @returns {Promise<Subscription[]>}
 */
export const getSubscriptions = (skus: string[]): Promise<Subscription[]> =>
  Platform.select({
    ios: async () => {
      checkNativeiOSAvailable();
      return RNIapIos.getItems(skus).then((items: Subscription[]) =>
        items.filter((item: Subscription) => skus.includes(item.productId)),
      );
    },
    android: async () => {
      checkNativeAndroidAvailable();
      return RNIapModule.getItemsByType(ANDROID_ITEM_TYPE_SUBSCRIPTION, skus);
    },
  })();

/**
 * Gets an invetory of purchases made by the user regardless of consumption status
 * @returns {Promise<(InAppPurchase | SubscriptionPurchase)[]>}
 */
export const getPurchaseHistory = (): Promise<(
InAppPurchase | SubscriptionPurchase
)[]> =>
  Platform.select({
    ios: async () => {
      checkNativeiOSAvailable();
      return RNIapIos.getAvailableItems();
    },
    android: async () => {
      checkNativeAndroidAvailable();
      const products = await RNIapModule.getPurchaseHistoryByType(
        ANDROID_ITEM_TYPE_IAP,
      );
      const subscriptions = await RNIapModule.getPurchaseHistoryByType(
        ANDROID_ITEM_TYPE_SUBSCRIPTION,
      );
      return products.concat(subscriptions);
    },
  })();

/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * @returns {Promise<(InAppPurchase | SubscriptionPurchase)[]>}
 */
export const getAvailablePurchases = (): Promise<(
InAppPurchase | SubscriptionPurchase
)[]> =>
  Platform.select({
    ios: async () => {
      checkNativeiOSAvailable();
      return RNIapIos.getAvailableItems();
    },
    android: async () => {
      checkNativeAndroidAvailable();
      const products = await RNIapModule.getAvailableItemsByType(
        ANDROID_ITEM_TYPE_IAP,
      );
      const subscriptions = await RNIapModule.getAvailableItemsByType(
        ANDROID_ITEM_TYPE_SUBSCRIPTION,
      );
      return products.concat(subscriptions);
    },
  })();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @param {boolean} [andDangerouslyFinishTransactionAutomaticallyIOS] You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.
 * @param {string} [developerIdAndroid] Specify an optional obfuscated string of developer profile name.
 * @param {string} [userIdAndroid] Specify an optional obfuscated string that is uniquely associated with the user's account in.
 * @returns {Promise<InAppPurchase>}
 */
export const requestPurchase = (
  sku: string,
  andDangerouslyFinishTransactionAutomaticallyIOS?: boolean,
  developerIdAndroid?: string,
  accountIdAndroid?: string,
): Promise<InAppPurchase> =>
  Platform.select({
    ios: async () => {
      andDangerouslyFinishTransactionAutomaticallyIOS =
        andDangerouslyFinishTransactionAutomaticallyIOS === undefined
          ? false
          : andDangerouslyFinishTransactionAutomaticallyIOS;
      if (andDangerouslyFinishTransactionAutomaticallyIOS) {
        console.warn(
          'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
        );
      }
      checkNativeiOSAvailable();
      return RNIapIos.buyProduct(
        sku,
        andDangerouslyFinishTransactionAutomaticallyIOS,
      );
    },
    android: async () => {
      checkNativeAndroidAvailable();
      return RNIapModule.buyItemByType(
        ANDROID_ITEM_TYPE_IAP,
        sku,
        null,
        0,
        developerIdAndroid,
        accountIdAndroid,
      );
    },
  })();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @param {boolean} [andDangerouslyFinishTransactionAutomaticallyIOS] You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.
 * @param {string} [oldSkuAndroid] SKU that the user is upgrading or downgrading from.
 * @param {ProrationModesAndroid} [prorationModeAndroid] UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY, IMMEDIATE_WITH_TIME_PRORATION, IMMEDIATE_AND_CHARGE_PRORATED_PRICE, IMMEDIATE_WITHOUT_PRORATION, DEFERRED
 * @param {string} [developerIdAndroid] Specify an optional obfuscated string of developer profile name.
 * @param {string} [userIdAndroid] Specify an optional obfuscated string that is uniquely associated with the user's account in.
 * @returns {Promise<void>}
 */
export const requestSubscription = (
  sku: string,
  andDangerouslyFinishTransactionAutomaticallyIOS?: boolean,
  oldSkuAndroid?: string,
  prorationModeAndroid?: ProrationModesAndroid,
  developerIdAndroid?: string,
  userIdAndroid?: string,
): Promise<SubscriptionPurchase> =>
  Platform.select({
    ios: async () => {
      andDangerouslyFinishTransactionAutomaticallyIOS =
        andDangerouslyFinishTransactionAutomaticallyIOS === undefined
          ? false
          : andDangerouslyFinishTransactionAutomaticallyIOS;
      if (andDangerouslyFinishTransactionAutomaticallyIOS) {
        console.warn(
          'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
        );
      }
      checkNativeiOSAvailable();
      return RNIapIos.buyProduct(
        sku,
        andDangerouslyFinishTransactionAutomaticallyIOS,
      );
    },
    android: async () => {
      checkNativeAndroidAvailable();
      if (!prorationModeAndroid) prorationModeAndroid = -1;
      return RNIapModule.buyItemByType(
        ANDROID_ITEM_TYPE_SUBSCRIPTION,
        sku,
        oldSkuAndroid,
        prorationModeAndroid,
        developerIdAndroid,
        userIdAndroid,
      );
    },
  })();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @returns {Promise<void>}
 */
export const requestPurchaseWithQuantityIOS = (
  sku: string,
  quantity: number,
): Promise<InAppPurchase> =>
  Platform.select({
    ios: async () => {
      checkNativeiOSAvailable();
      return RNIapIos.buyProductWithQuantityIOS(sku, quantity);
    },
  })();

/**
 * Finish Transaction (iOS only)
 *   Similar to `consumePurchaseAndroid`. Tells StoreKit that you have delivered the purchase to the user and StoreKit can now let go of the transaction.
 *   Call this after you have persisted the purchased state to your server or local data in your app.
 *   `react-native-iap` will continue to deliver the purchase updated events with the successful purchase until you finish the transaction. **Even after the app has relaunched.**
 * @param {string} transactionId The transactionId of the function that you would like to finish.
 * @returns {Promise<void>}
 */
export const finishTransactionIOS = (transactionId: string): Promise<void> =>
  Platform.select({
    ios: async () => {
      checkNativeiOSAvailable();
      return RNIapIos.finishTransaction(transactionId);
    },
  })();
/**
 * Finish Transaction (both platforms)
 *   Abstracts `finishTransactionIOS`, `consumePurchaseAndroid`, `acknowledgePurchaseAndroid` in to one method.
 * @param {object} purchase The purchase that you would like to finish.
 * @param {boolean} isConsumable Checks if purchase is consumable. Has effect on `android`.
 * @param {string} developerPayloadAndroid Android developerPayload.
 * @returns {Promise<string | void> }
 */
export const finishTransaction = (
  purchase: InAppPurchase | ProductPurchase,
  isConsumable?: boolean,
  developerPayloadAndroid?: string,
): Promise<string | void> => {
  return Platform.select({
    ios: async () => {
      checkNativeiOSAvailable();
      return RNIapIos.finishTransaction(purchase.transactionId);
    },
    android: async () => {
      if (purchase) {
        if (isConsumable) {
          return RNIapModule.consumeProduct(
            purchase.purchaseToken,
            developerPayloadAndroid,
          );
        } else if (
          !purchase.isAcknowledgedAndroid &&
          purchase.purchaseStateAndroid === PurchaseStateAndroid.PURCHASED
        ) {
          return RNIapModule.acknowledgePurchase(
            purchase.purchaseToken,
            developerPayloadAndroid,
          );
        } else {
          throw new Error('purchase is not suitable to be purchased');
        }
      } else {
        throw new Error('purchase is not assigned');
      }
    },
  })();
};

/**
 * Clear Transaction (iOS only)
 *   Finish remaining transactions. Related to issue #257 and #801
 *     link : https://github.com/dooboolab/react-native-iap/issues/257
 *            https://github.com/dooboolab/react-native-iap/issues/801
 * @returns {Promise<void>}
 */
export const clearTransactionIOS = (): Promise<void> => {
  return Platform.select({
    ios: async () => {
      checkNativeiOSAvailable();
      return RNIapIos.clearTransaction();
    },
    android: async () => Promise.resolve(),
  })();
};

/**
 * Clear valid Products (iOS only)
 *   Remove all products which are validated by Apple server.
 * @returns {void}
 */
export const clearProductsIOS = (): void =>
  Platform.select({
    ios: () => {
      checkNativeiOSAvailable();
      return RNIapIos.clearProducts();
    },
    android: async () => Promise.resolve,
  })();

/**
 * Acknowledge a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise<PurchaseResult | void>}
 */
export const acknowledgePurchaseAndroid = (
  token: string,
  developerPayload?: string,
): Promise<PurchaseResult | void> =>
  Platform.select({
    ios: async () => Promise.resolve(),
    android: async () => {
      checkNativeAndroidAvailable();
      return RNIapModule.acknowledgePurchase(token, developerPayload);
    },
  })();

/**
 * Consume a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise<PurchaseResult>}
 */
export const consumePurchaseAndroid = (
  token: string,
  developerPayload?: string,
): Promise<PurchaseResult> =>
  Platform.select({
    ios: async () => Promise.resolve(),
    android: async () => {
      checkNativeAndroidAvailable();
      return RNIapModule.consumeProduct(token, developerPayload);
    },
  })();

/**
 * Should Add Store Payment (iOS only)
 *   Indicates the the App Store purchase should continue from the app instead of the App Store.
 * @returns {Promise<Product>}
 */
export const getPromotedProductIOS = (): Promise<Product> =>
  Platform.select({
    ios: async () => {
      checkNativeiOSAvailable();
      return RNIapIos.promotedProduct();
    },
    android: async () => Promise.resolve(),
  })();

/**
 * Buy the currently selected promoted product (iOS only)
 *   Initiates the payment process for a promoted product. Should only be called in response to the `iap-promoted-product` event.
 * @returns {Promise<void>}
 */
export const buyPromotedProductIOS = (): Promise<void> =>
  Platform.select({
    ios: async () => {
      checkNativeiOSAvailable();
      return RNIapIos.buyPromotedProduct();
    },
    android: async () => Promise.resolve(),
  })();

/**
 * Buy products or subscriptions with offers (iOS only)
 *
 * Runs the payment process with some infor you must fetch
 * from your server.
 * @param {string} sku The product identifier
 * @param {string} forUser  An user identifier on you system
 * @param {Apple.PaymentDiscount} withOffer The offer information
 * @param {string} withOffer.identifier The offer identifier
 * @param {string} withOffer.keyIdentifier Key identifier that it uses to generate the signature
 * @param {string} withOffer.nonce An UUID returned from the server
 * @param {string} withOffer.signature The actual signature returned from the server
 * @param {number} withOffer.timestamp The timestamp of the signature
 * @returns {Promise<void>}
 */
export const requestPurchaseWithOfferIOS = (
  sku: string,
  forUser: string,
  withOffer: Apple.PaymentDiscount,
): Promise<void> =>
  Platform.select({
    ios: async () => {
      checkNativeiOSAvailable();
      return RNIapIos.buyProductWithOffer(sku, forUser, withOffer);
    },
    android: async () => Promise.resolve(),
  })();

/**
 * Validate receipt for iOS.
 * @param {object} receiptBody the receipt body to send to apple server.
 * @param {boolean} isTest whether this is in test environment which is sandbox.
 * @returns {Promise<Apple.ReceiptValidationResponse | false>}
 */
export const validateReceiptIos = async (
  receiptBody: object,
  isTest?: boolean,
): Promise<Apple.ReceiptValidationResponse | false> => {
  const url = isTest
    ? 'https://sandbox.itunes.apple.com/verifyReceipt'
    : 'https://buy.itunes.apple.com/verifyReceipt';

  const response = await fetch(url, {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(receiptBody),
  });

  if (!response.ok) {
    throw Object.assign(new Error(response.statusText), {
      statusCode: response.status,
    });
  }

  return response.json();
};

/**
 * Validate receipt for Android.
 * @param {string} packageName package name of your app.
 * @param {string} productId product id for your in app product.
 * @param {string} productToken token for your purchase.
 * @param {string} accessToken accessToken from googleApis.
 * @param {boolean} isSub whether this is subscription or inapp. `true` for subscription.
 * @returns {Promise<object>}
 */
export const validateReceiptAndroid = async (
  packageName: string,
  productId: string,
  productToken: string,
  accessToken: string,
  isSub?: boolean,
): Promise<object | false> => {
  const type = isSub ? 'subscriptions' : 'products';
  const url =
    'https://www.googleapis.com/androidpublisher/v3/applications' +
    `/${packageName}/purchases/${type}/${productId}` +
    `/tokens/${productToken}?access_token=${accessToken}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: new Headers({ Accept: 'application/json' }),
  });

  if (!response.ok) {
    throw Object.assign(new Error(response.statusText), {
      statusCode: response.status,
    });
  }

  return response.json();
};

/**
 * Add IAP purchase event in ios.
 * @returns {callback(e: InAppPurchase | ProductPurchase)}
 */
export const purchaseUpdatedListener = (
  e: InAppPurchase | SubscriptionPurchase | any,
): EmitterSubscription => {
  if (Platform.OS === 'ios') {
    checkNativeiOSAvailable();
    const myModuleEvt = new NativeEventEmitter(RNIapIos);
    return myModuleEvt.addListener('purchase-updated', e);
  } else {
    const emitterSubscription = DeviceEventEmitter.addListener(
      'purchase-updated',
      e,
    );
    RNIapModule.startListening();
    return emitterSubscription;
  }
};

/**
 * Add IAP purchase error event in ios.
 * @returns {callback(e: PurchaseError)}
 */
export const purchaseErrorListener = (
  e: PurchaseError | any,
): EmitterSubscription => {
  if (Platform.OS === 'ios') {
    checkNativeiOSAvailable();
    const myModuleEvt = new NativeEventEmitter(RNIapIos);
    return myModuleEvt.addListener('purchase-error', e);
  } else {
    return DeviceEventEmitter.addListener('purchase-error', e);
  }
};

/**
 * Get the current receipt base64 encoded in IOS.
 * @returns {Promise<string>}
 */
export const getReceiptIOS = (): Promise<string> => {
  if (Platform.OS === 'ios') {
    checkNativeiOSAvailable();
    return RNIapIos.requestReceipt();
  }
};

/**
 * Get the pending purchases in IOS.
 * @returns {Promise<ProductPurchase[]>}
 */
export const getPendingPurchasesIOS = (): Promise<ProductPurchase[]> => {
  if (Platform.OS === 'ios') {
    checkNativeiOSAvailable();
    return RNIapIos.getPendingTransactions();
  }
};

const iapUtils = {
  IAPErrorCode,
  initConnection,
  endConnection,
  endConnectionAndroid,
  getProducts,
  getSubscriptions,
  getPurchaseHistory,
  getAvailablePurchases,
  getPendingPurchasesIOS,
  consumeAllItemsAndroid,
  clearProductsIOS,
  clearTransactionIOS,
  acknowledgePurchaseAndroid,
  consumePurchaseAndroid,
  validateReceiptIos,
  validateReceiptAndroid,
  requestPurchase,
  requestPurchaseWithQuantityIOS,
  finishTransactionIOS,
  finishTransaction,
  requestSubscription,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getReceiptIOS,
  getPromotedProductIOS,
  buyPromotedProductIOS,
};

export default iapUtils;

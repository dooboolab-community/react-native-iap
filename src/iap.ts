import {Linking, NativeModules, Platform} from 'react-native';
import type {ResponseBody as ReceiptValidationResponse} from '@jeremybarbet/apple-api-types';

import type * as Amazon from './types/amazon';
import type * as Android from './types/android';
import type * as Apple from './types/apple';
import {
  enhancedFetch,
  fillProductsWithAdditionalData,
  isAmazon,
  isAndroid,
} from './internal';
import {
  Product,
  ProductPurchase,
  ProductType,
  ProrationModesAndroid,
  Purchase,
  PurchaseResult,
  Sku,
  Subscription,
  SubscriptionOffer,
  SubscriptionPurchase,
} from './types';
import {InstallSourceAndroid, PurchaseStateAndroid} from './types';

const {RNIapIos, RNIapModule, RNIapAmazonModule} = NativeModules;
const ANDROID_ITEM_TYPE_SUBSCRIPTION = ProductType.subs;
const ANDROID_ITEM_TYPE_IAP = ProductType.inapp;

export const getInstallSourceAndroid = (): InstallSourceAndroid => {
  return RNIapModule
    ? InstallSourceAndroid.GOOGLE_PLAY
    : InstallSourceAndroid.AMAZON;
};

let androidNativeModule = RNIapModule;

export const setAndroidNativeModule = (
  nativeModule: typeof RNIapModule,
): void => {
  androidNativeModule = nativeModule;
};

const checkNativeAndroidAvailable = (): void => {
  if (!RNIapModule && !RNIapAmazonModule) {
    throw new Error('IAP_NOT_AVAILABLE');
  }
};

export const getAndroidModule = ():
  | typeof RNIapModule
  | typeof RNIapAmazonModule => {
  checkNativeAndroidAvailable();

  return androidNativeModule
    ? androidNativeModule
    : RNIapModule
    ? RNIapModule
    : RNIapAmazonModule;
};

const checkNativeIOSAvailable = (): void => {
  if (!RNIapIos) {
    throw new Error('IAP_NOT_AVAILABLE');
  }
};

export const getIosModule = (): typeof RNIapIos => {
  checkNativeIOSAvailable();

  return RNIapIos;
};

export const getNativeModule = ():
  | typeof RNIapModule
  | typeof RNIapAmazonModule
  | typeof RNIapIos => {
  return isAndroid ? getAndroidModule() : getIosModule();
};

/**
 * Init module for purchase flow. Required on Android. In ios it will check whether user canMakePayment.
 * @returns {Promise<boolean>}
 */
export const initConnection = (): Promise<boolean> =>
  getNativeModule().initConnection();

/**
 * Disconnects from native SDK
 * Usage
 * ```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {endConnection} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    return () => {
      void endConnection();
    };
  }, []);

  return <View />;
};
```
 * @returns {Promise<void>}
 */
export const endConnection = (): Promise<boolean> =>
  getNativeModule().endConnection();

/**
 * Consume all 'ghost' purchases (that is, pending payment that already failed but is still marked as pending in Play Store cache). Android only.
 * @returns {Promise<boolean>}
 */
export const flushFailedPurchasesCachedAsPendingAndroid =
  (): Promise<boolean> =>
    getAndroidModule().flushFailedPurchasesCachedAsPending();

/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 * @param {string[]} skus The item skus
 * @returns {Promise<Product[]>}
 */
export const getProducts = ({
  skus,
}: {
  skus: string[];
}): Promise<Array<Product>> =>
  (
    Platform.select({
      ios: async () => {
        const items = (await getIosModule().getItems(skus)) as Product[];

        return items.filter(
          (item: Product) =>
            skus.includes(item.productId) && item.type === 'iap',
        );
      },
      android: async () => {
        const products = await getAndroidModule().getItemsByType(
          ANDROID_ITEM_TYPE_IAP,
          skus,
        );

        return fillProductsWithAdditionalData(products);
      },
    }) || (() => Promise.reject(new Error('Unsupported Platform')))
  )();

/**
 * Get a list of subscriptions
 * @param {string[]} skus The item skus
 * @returns {Promise<Subscription[]>}
 */
export const getSubscriptions = ({
  skus,
}: {
  skus: string[];
}): Promise<Subscription[]> =>
  (
    Platform.select({
      ios: async () => {
        const items = (await getIosModule().getItems(skus)) as Subscription[];

        return items.filter(
          (item: Subscription) =>
            skus.includes(item.productId) && item.type === 'subs',
        );
      },
      android: async () => {
        const subscriptions = (await getAndroidModule().getItemsByType(
          ANDROID_ITEM_TYPE_SUBSCRIPTION,
          skus,
        )) as Subscription[];

        return fillProductsWithAdditionalData(subscriptions);
      },
    }) || (() => Promise.reject(new Error('Unsupported Platform')))
  )();

/**
 * Gets an inventory of purchases made by the user regardless of consumption status
 * @returns {Promise<(ProductPurchase | SubscriptionPurchase)[]>}
 */
export const getPurchaseHistory = (): Promise<
  (ProductPurchase | SubscriptionPurchase)[]
> =>
  (
    Platform.select({
      ios: async () => {
        return getIosModule().getAvailableItems();
      },
      android: async () => {
        if (RNIapAmazonModule) {
          return await RNIapAmazonModule.getAvailableItems();
        }

        const products = await RNIapModule.getPurchaseHistoryByType(
          ANDROID_ITEM_TYPE_IAP,
        );

        const subscriptions = await RNIapModule.getPurchaseHistoryByType(
          ANDROID_ITEM_TYPE_SUBSCRIPTION,
        );

        return products.concat(subscriptions);
      },
    }) || (() => Promise.resolve([]))
  )();

/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * @returns {Promise<(ProductPurchase | SubscriptionPurchase)[]>}
 */
export const getAvailablePurchases = (): Promise<
  (ProductPurchase | SubscriptionPurchase)[]
> =>
  (
    Platform.select({
      ios: async () => {
        return getIosModule().getAvailableItems();
      },
      android: async () => {
        if (RNIapAmazonModule) {
          return await RNIapAmazonModule.getAvailableItems();
        }

        const products = await RNIapModule.getAvailableItemsByType(
          ANDROID_ITEM_TYPE_IAP,
        );

        const subscriptions = await RNIapModule.getAvailableItemsByType(
          ANDROID_ITEM_TYPE_SUBSCRIPTION,
        );

        return products.concat(subscriptions);
      },
    }) || (() => Promise.resolve([]))
  )();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @param {string} [applicationUsername] The purchaser's user ID
 * @param {boolean} [andDangerouslyFinishTransactionAutomaticallyIOS] You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.
 * @param {string} [obfuscatedAccountIdAndroid] Specifies an optional obfuscated string that is uniquely associated with the user's account in your app.
 * @param {string} [obfuscatedProfileIdAndroid] Specifies an optional obfuscated string that is uniquely associated with the user's profile in your app.
 * @param {string[]} [skus] Product Ids to purchase. Note that this is only for Android. iOS only uses a single SKU. If not provided, it'll default to using [sku] for backward-compatibility
 * @param {boolean} [isOfferPersonalized] Defaults to false, Only for Android V5
 * @returns {Promise<ProductPurchase>}
 */

export const requestPurchase = ({
  sku,
  andDangerouslyFinishTransactionAutomaticallyIOS = false,
  applicationUsername,
  obfuscatedAccountIdAndroid,
  obfuscatedProfileIdAndroid,
  skus,
  isOfferPersonalized,
}: {
  sku?: Sku;
  andDangerouslyFinishTransactionAutomaticallyIOS?: boolean;
  applicationUsername?: string;
  obfuscatedAccountIdAndroid?: string;
  obfuscatedProfileIdAndroid?: string;
  /** For Google Play Billing Library 5 https://developer.android.com/google/play/billing/integrate#personalized-price */
  skus?: Sku[];
  isOfferPersonalized?: boolean;
}): Promise<ProductPurchase | void> =>
  (
    Platform.select({
      ios: async () => {
        if (!sku) {
          return Promise.reject(new Error('sku is required for iOS purchase'));
        }
        if (andDangerouslyFinishTransactionAutomaticallyIOS) {
          console.warn(
            'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
          );
        }

        return getIosModule().buyProduct(
          sku,
          andDangerouslyFinishTransactionAutomaticallyIOS,
          applicationUsername,
        );
      },
      android: async () => {
        if (isAmazon) {
          if (!sku) {
            return Promise.reject(
              new Error('sku is required for Amazon purchase'),
            );
          }
          return RNIapAmazonModule.buyItemByType(sku);
        } else {
          if (!sku?.length && !sku) {
            return Promise.reject(
              new Error('skus is required for Android purchase'),
            );
          }
          return getAndroidModule().buyItemByType(
            ANDROID_ITEM_TYPE_IAP,
            skus?.length ? skus : [sku],
            undefined,
            -1,
            obfuscatedAccountIdAndroid,
            obfuscatedProfileIdAndroid,
            [],
            isOfferPersonalized ?? false,
          );
        }
      },
    }) || Promise.resolve
  )();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} [sku] The product's sku/ID
 * @param {string} [applicationUsername] The purchaser's user ID
 * @param {boolean} [andDangerouslyFinishTransactionAutomaticallyIOS] You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.
 * @param {string} [purchaseTokenAndroid] purchaseToken that the user is upgrading or downgrading from (Android).
 * @param {ProrationModesAndroid} [prorationModeAndroid] UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY, IMMEDIATE_WITH_TIME_PRORATION, IMMEDIATE_AND_CHARGE_PRORATED_PRICE, IMMEDIATE_WITHOUT_PRORATION, DEFERRED
 * @param {string} [obfuscatedAccountIdAndroid] Specifies an optional obfuscated string that is uniquely associated with the user's account in your app.
 * @param {string} [obfuscatedProfileIdAndroid] Specifies an optional obfuscated string that is uniquely associated with the user's profile in your app.
 * @param {SubscriptionOffers[]} [subscriptionOffers] Array of SubscriptionOffers. Every sku must be paired with a corresponding offerToken
 * @returns {Promise<SubscriptionPurchase | null>} Promise resolves to null when using proratioModesAndroid=DEFERRED, and to a SubscriptionPurchase otherwise
 */
export const requestSubscription = ({
  sku,
  andDangerouslyFinishTransactionAutomaticallyIOS = false,
  applicationUsername,
  purchaseTokenAndroid,
  prorationModeAndroid = -1,
  subscriptionOffers,
  obfuscatedAccountIdAndroid,
  obfuscatedProfileIdAndroid,
  isOfferPersonalized = undefined,
}: {
  sku?: Sku;
  andDangerouslyFinishTransactionAutomaticallyIOS?: boolean;
  applicationUsername?: string;
  purchaseTokenAndroid?: string;
  prorationModeAndroid?: ProrationModesAndroid;
  /** For Google Play Billing Library 5 */
  subscriptionOffers?: SubscriptionOffer[];
  obfuscatedAccountIdAndroid?: string;
  obfuscatedProfileIdAndroid?: string;
  /** For Google Play Billing Library 5 https://developer.android.com/google/play/billing/integrate#personalized-price */
  isOfferPersonalized?: boolean;
}): Promise<SubscriptionPurchase | null | void> =>
  (
    Platform.select({
      ios: async () => {
        if (!sku) {
          return Promise.reject(
            new Error('sku is required for iOS subscription'),
          );
        }
        if (andDangerouslyFinishTransactionAutomaticallyIOS) {
          console.warn(
            'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
          );
        }

        return getIosModule().buyProduct(
          sku,
          andDangerouslyFinishTransactionAutomaticallyIOS,
          applicationUsername,
        );
      },
      android: async () => {
        if (isAmazon) {
          if (!sku) {
            return Promise.reject(
              new Error('sku is required for Amazon purchase'),
            );
          }
          return RNIapAmazonModule.buyItemByType(sku);
        } else {
          if (!subscriptionOffers?.length) {
            return Promise.reject(
              'subscriptionOffers are required for Google Play Subscriptions',
            );
          }
          return RNIapModule.buyItemByType(
            ANDROID_ITEM_TYPE_SUBSCRIPTION,
            subscriptionOffers?.map((so) => so.sku),
            purchaseTokenAndroid,
            prorationModeAndroid,
            obfuscatedAccountIdAndroid,
            obfuscatedProfileIdAndroid,
            subscriptionOffers?.map((so) => so.offerToken),
            isOfferPersonalized ?? false,
          );
        }
      },
    }) || (() => Promise.resolve(null))
  )();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @returns {Promise<void>}
 */
export const requestPurchaseWithQuantityIOS = ({
  sku,
  quantity,
}: {
  sku: Sku;
  quantity: number;
}): Promise<ProductPurchase> =>
  getIosModule().buyProductWithQuantityIOS(sku, quantity);

/**
 * Finish Transaction (both platforms)
 *   Abstracts  Finish Transaction
 *   iOS: Tells StoreKit that you have delivered the purchase to the user and StoreKit can now let go of the transaction.
 *   Call this after you have persisted the purchased state to your server or local data in your app.
 *   `react-native-iap` will continue to deliver the purchase updated events with the successful purchase until you finish the transaction. **Even after the app has relaunched.**
 *   Android: it will consume purchase for consumables and acknowledge purchase for non-consumables.
 *   
```tsx
import React from 'react';
import {Button} from 'react-native';
import {finishTransaction} from 'react-native-iap';

const App = () => {
  const handlePurchase = async () => {
    // ... handle the purchase request

    const result = finishTransaction(purchase);
  };

  return <Button title="Buy product" onPress={handlePurchase} />;
};
``` 
 */
export const finishTransaction = ({
  purchase,
  isConsumable,
  developerPayloadAndroid,
}: {
  purchase: ProductPurchase | ProductPurchase;
  isConsumable?: boolean;
  developerPayloadAndroid?: string;
}): Promise<PurchaseResult | boolean> => {
  return (
    Platform.select({
      ios: async () => {
        const transactionId = purchase.transactionId;

        if (!transactionId) {
          return Promise.reject(
            new Error('transactionId required to finish iOS transaction'),
          );
        }
        return getIosModule().finishTransaction(transactionId);
      },
      android: async () => {
        if (purchase?.purchaseToken) {
          if (isConsumable) {
            return getAndroidModule().consumeProduct(
              purchase.purchaseToken,
              developerPayloadAndroid,
            );
          } else if (
            purchase.userIdAmazon ||
            (!purchase.isAcknowledgedAndroid &&
              purchase.purchaseStateAndroid === PurchaseStateAndroid.PURCHASED)
          ) {
            return getAndroidModule().acknowledgePurchase(
              purchase.purchaseToken,
              developerPayloadAndroid,
            );
          } else {
            return Promise.reject(
              new Error('purchase is not suitable to be purchased'),
            );
          }
        }
        return Promise.reject(
          new Error('purchase is not suitable to be purchased'),
        );
      },
    }) || (() => Promise.reject(new Error('Unsupported Platform')))
  )();
};

/**
 * Clear Transaction (iOS only)
 *   Finish remaining transactions. Related to issue #257 and #801
 *     link : https://github.com/dooboolab/react-native-iap/issues/257
 *            https://github.com/dooboolab/react-native-iap/issues/801
 * @returns {Promise<void>}
 */
export const clearTransactionIOS = (): Promise<void> =>
  getIosModule().clearTransaction();

/**
 * Clear valid Products (iOS only)
 *   Remove all products which are validated by Apple server.
 * @returns {void}
 */
export const clearProductsIOS = (): Promise<void> =>
  getIosModule().clearProducts();

/**
 * Acknowledge a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise<PurchaseResult | void>}
 */
export const acknowledgePurchaseAndroid = ({
  token,
  developerPayload,
}: {
  token: string;
  developerPayload?: string;
}): Promise<PurchaseResult | boolean | void> => {
  return getAndroidModule().acknowledgePurchase(token, developerPayload);
};

/**
 * Deep link to subscriptions screen on Android. No-op on iOS.
 * @param {string} sku The product's SKU (on Android)
 * @returns {Promise<void>}
 */
export const deepLinkToSubscriptionsAndroid = async ({
  sku,
}: {
  sku: Sku;
}): Promise<void> => {
  checkNativeAndroidAvailable();

  return Linking.openURL(
    `https://play.google.com/store/account/subscriptions?package=${await RNIapModule.getPackageName()}&sku=${sku}`,
  );
};

/**
 * Should Add Store Payment (iOS only)
 *   Indicates the the App Store purchase should continue from the app instead of the App Store.
 * @returns {Promise<Product | null>} promoted product
 */
export const getPromotedProductIOS = (): Promise<Product | null> =>
  getIosModule().promotedProduct();

/**
 * Buy the currently selected promoted product (iOS only)
 *   Initiates the payment process for a promoted product. Should only be called in response to the `iap-promoted-product` event.
 * @returns {Promise<void>}
 */
export const buyPromotedProductIOS = (): Promise<void> =>
  getIosModule().buyPromotedProduct();

const TEST_RECEIPT = 21007;
const requestAgnosticReceiptValidationIos = async (
  receiptBody: Record<string, unknown>,
): Promise<ReceiptValidationResponse | false> => {
  const response = await enhancedFetch<ReceiptValidationResponse>(
    'https://buy.itunes.apple.com/verifyReceipt',
    {
      method: 'POST',
      body: receiptBody,
    },
  );

  // Best practice is to check for test receipt and check sandbox instead
  // https://developer.apple.com/documentation/appstorereceipts/verifyreceipt
  if (response && response.status === TEST_RECEIPT) {
    const testResponse = await enhancedFetch<ReceiptValidationResponse>(
      'https://sandbox.itunes.apple.com/verifyReceipt',
      {
        method: 'POST',
        body: receiptBody,
      },
    );

    return testResponse;
  }

  return response;
};

/**
 * Buy products or subscriptions with offers (iOS only)
 *
 * Runs the payment process with some info you must fetch
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
export const requestPurchaseWithOfferIOS = ({
  sku,
  forUser,
  withOffer,
}: {
  sku: Sku;
  forUser: string;
  withOffer: Apple.PaymentDiscount;
}): Promise<Purchase> =>
  getIosModule().buyProductWithOffer(sku, forUser, withOffer);

/**
 * Validate receipt for iOS.
 * @param {object} receiptBody the receipt body to send to apple server.
 * @param {boolean} isTest whether this is in test environment which is sandbox.
 * @returns {Promise<Apple.ReceiptValidationResponse | false>}
 */
export const validateReceiptIos = async ({
  receiptBody,
  isTest,
}: {
  receiptBody: Record<string, unknown>;
  isTest?: boolean;
}): Promise<ReceiptValidationResponse | false> => {
  if (isTest == null) {
    return await requestAgnosticReceiptValidationIos(receiptBody);
  }

  const url = isTest
    ? 'https://sandbox.itunes.apple.com/verifyReceipt'
    : 'https://buy.itunes.apple.com/verifyReceipt';

  return await enhancedFetch<ReceiptValidationResponse>(url);
};

/**
 * Validate receipt for Android. NOTE: This method is here for debugging purposes only. Including
 * your access token in the binary you ship to users is potentially dangerous.
 * Use server side validation instead for your production builds
 * @param {string} packageName package name of your app.
 * @param {string} productId product id for your in app product.
 * @param {string} productToken token for your purchase.
 * @param {string} accessToken accessToken from googleApis.
 * @param {boolean} isSub whether this is subscription or inapp. `true` for subscription.
 * @returns {Promise<object>}
 */
export const validateReceiptAndroid = async ({
  packageName,
  productId,
  productToken,
  accessToken,
  isSub,
}: {
  packageName: string;
  productId: string;
  productToken: string;
  accessToken: string;
  isSub?: boolean;
}): Promise<Android.ReceiptType> => {
  const type = isSub ? 'subscriptions' : 'products';

  const url =
    'https://androidpublisher.googleapis.com/androidpublisher/v3/applications' +
    `/${packageName}/purchases/${type}/${productId}` +
    `/tokens/${productToken}?access_token=${accessToken}`;

  return await enhancedFetch<Android.ReceiptType>(url);
};

/**
 * Validate receipt for Amazon. NOTE: This method is here for debugging purposes only. Including
 * your developer secret in the binary you ship to users is potentially dangerous.
 * Use server side validation instead for your production builds
 * @param {string} developerSecret: from the Amazon developer console.
 * @param {string} userId who purchased the item.
 * @param {string} receiptId long obfuscated string returned when purchasing the item
 * @param {boolean} useSandbox Defaults to true, use sandbox environment or production.
 * @returns {Promise<object>}
 */
export const validateReceiptAmazon = async ({
  developerSecret,
  userId,
  receiptId,
  useSandbox = true,
}: {
  developerSecret: string;
  userId: string;
  receiptId: string;
  useSandbox: boolean;
}): Promise<Amazon.ReceiptType> => {
  const sandBoxUrl = useSandbox ? 'sandbox/' : '';
  const url = `https://appstore-sdk.amazon.com/${sandBoxUrl}version/1.0/verifyReceiptId/developer/${developerSecret}/user/${userId}/receiptId/${receiptId}`;

  return await enhancedFetch<Amazon.ReceiptType>(url);
};

/**
 * Get the current receipt base64 encoded in IOS.
 * @param {forceRefresh?:boolean}
 * @returns {Promise<ProductPurchase[]>}
 */
export const getPendingPurchasesIOS = async (): Promise<ProductPurchase[]> =>
  getIosModule().getPendingTransactions();

/**
 * Get the current receipt base64 encoded in IOS.
 * @param {forceRefresh?:boolean}
 * @returns {Promise<string>}
 */
export const getReceiptIOS = async ({
  forceRefresh,
}: {
  forceRefresh?: boolean;
}): Promise<string> => getIosModule().requestReceipt(forceRefresh ?? false);

/**
 * Launches a modal to register the redeem offer code in IOS.
 * @returns {Promise<null>}
 */
export const presentCodeRedemptionSheetIOS = async (): Promise<null> =>
  getIosModule().presentCodeRedemptionSheet();

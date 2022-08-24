import {Linking, NativeModules, Platform} from 'react-native';

import type * as Amazon from './types/amazon';
import type * as Android from './types/android';
import type * as Apple from './types/apple';
import {ReceiptValidationStatus} from './types/apple';
import {
  enhancedFetch,
  fillProductsWithAdditionalData,
  isAmazon,
  isAndroid,
} from './internal';
import type {
  Product,
  ProductPurchase,
  PurchaseResult,
  RequestPurchase,
  RequestSubscription,
  Sku,
  Subscription,
  SubscriptionPurchase,
} from './types';
import {InstallSourceAndroid, PurchaseStateAndroid} from './types';

const {RNIapIos, RNIapModule, RNIapAmazonModule} = NativeModules;
const ANDROID_ITEM_TYPE_SUBSCRIPTION = 'subs';
const ANDROID_ITEM_TYPE_IAP = 'inapp';

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
 * End module for purchase flow.
 * @returns {Promise<void>}
 */
export const endConnection = (): Promise<void> =>
  getNativeModule().endConnection();

/**
 * Consume all 'ghost' purchases (that is, pending payment that already failed but is still marked as pending in Play Store cache). Android only.
 * @returns {Promise<boolean>}
 */
export const flushFailedPurchasesCachedAsPendingAndroid = (): Promise<
  string[]
> => getAndroidModule().flushFailedPurchasesCachedAsPending();

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
        const items = await getIosModule().getItems(skus);

        return items.filter((item: Product) => item.subscription === null);
      },
      android: async () => {
        const products = await getAndroidModule().getItemsByType(
          ANDROID_ITEM_TYPE_IAP,
          skus,
        );

        return fillProductsWithAdditionalData(products);
      },
    }) || Promise.resolve
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
        const items = await getIosModule().getItems(skus);

        return items.filter(
          (item: Subscription) =>
            skus.includes(item.productId) && item.type === 'subs',
        );
      },
      android: async () => {
        const subscriptions = await getAndroidModule().getItemsByType(
          ANDROID_ITEM_TYPE_SUBSCRIPTION,
          skus,
        );

        return fillProductsWithAdditionalData(subscriptions);
      },
    }) || Promise.resolve
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

        const products = await getAndroidModule().getPurchaseHistoryByType(
          ANDROID_ITEM_TYPE_IAP,
        );

        const subscriptions = await getAndroidModule().getPurchaseHistoryByType(
          ANDROID_ITEM_TYPE_SUBSCRIPTION,
        );

        return products.concat(subscriptions);
      },
    }) || Promise.resolve
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
        return getIosModule().currentEntitlements();
      },
      android: async () => {
        if (RNIapAmazonModule) {
          return await RNIapAmazonModule.getAvailableItems();
        }

        const products = await getAndroidModule().getAvailableItemsByType(
          ANDROID_ITEM_TYPE_IAP,
        );

        const subscriptions = await getAndroidModule().getAvailableItemsByType(
          ANDROID_ITEM_TYPE_SUBSCRIPTION,
        );

        return products.concat(subscriptions);
      },
    }) || Promise.resolve
  )();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @param {string} [appAccountToken] UUID representing the purchaser
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
  obfuscatedAccountIdAndroid,
  obfuscatedProfileIdAndroid,
  appAccountToken,
  skus, // Android Billing V5
  isOfferPersonalized = undefined, // Android Billing V5
  quantity,
  withOffer,
}: RequestPurchase): Promise<ProductPurchase> =>
  (
    Platform.select({
      ios: async () => {
        if (andDangerouslyFinishTransactionAutomaticallyIOS) {
          console.warn(
            'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
          );
        }

        return getIosModule().buyProduct(
          sku,
          andDangerouslyFinishTransactionAutomaticallyIOS,
          appAccountToken,
          quantity ?? -1,
          withOffer,
        );
      },
      android: async () => {
        if (isAmazon) {
          return RNIapAmazonModule.buyItemByType(sku);
        } else {
          return getAndroidModule().buyItemByType(
            ANDROID_ITEM_TYPE_IAP,
            skus?.length ? skus : [sku],
            null,
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
 * @param {string} [appAccountToken] The purchaser's user ID
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
  purchaseTokenAndroid,
  prorationModeAndroid = -1,
  obfuscatedAccountIdAndroid,
  obfuscatedProfileIdAndroid,
  subscriptionOffers = undefined, // Android Billing V5
  isOfferPersonalized = undefined, // Android Billing V5
  appAccountToken,
}: RequestSubscription): Promise<SubscriptionPurchase | null> =>
  (
    Platform.select({
      ios: async () => {
        if (andDangerouslyFinishTransactionAutomaticallyIOS) {
          console.warn(
            'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
          );
        }

        return getIosModule().buyProduct(
          sku,
          andDangerouslyFinishTransactionAutomaticallyIOS,
          appAccountToken,
        );
      },
      android: async () => {
        if (isAmazon) {
          return RNIapAmazonModule.buyItemByType(sku);
        } else {
          if (!subscriptionOffers?.length) {
            Promise.reject(
              'subscriptionOffers are required for Google Play Subscriptions',
            );
            return;
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
    }) || Promise.resolve
  )();

/**
 * Finish Transaction (both platforms)
 *   Abstracts  Finish Transaction
 *   iOS: Tells StoreKit that you have delivered the purchase to the user and StoreKit can now let go of the transaction.
 *   Call this after you have persisted the purchased state to your server or local data in your app.
 *   `react-native-iap` will continue to deliver the purchase updated events with the successful purchase until you finish the transaction. **Even after the app has relaunched.**
 *   Android: it will consume purchase for consumables and acknowledge purchase for non-consumables.
 * @param {object} purchase The purchase that you would like to finish.
 * @param {boolean} isConsumable Checks if purchase is consumable. Has effect on `android`.
 * @param {string} developerPayloadAndroid Android developerPayload.
 * @returns {Promise<string | void> }
 */
export const finishTransaction = ({
  purchase,
  isConsumable,
  developerPayloadAndroid,
}: {
  purchase: ProductPurchase | SubscriptionPurchase;
  isConsumable?: boolean;
  developerPayloadAndroid?: string;
}): Promise<string | void> => {
  return (
    Platform.select({
      ios: async () => {
        return getIosModule().finishTransaction(purchase.transactionId);
      },
      android: async () => {
        if (purchase) {
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
            throw new Error('purchase is not suitable to be purchased');
          }
        } else {
          throw new Error('purchase is not assigned');
        }
      },
    }) || Promise.resolve
  )();
};

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
}): Promise<PurchaseResult | void> => {
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
 * Launches a modal to register the redeem offer code in IOS.
 * @returns {Promise<null>}
 */
export const presentCodeRedemptionSheetIOS = async (): Promise<null> =>
  getIosModule().presentCodeRedemptionSheet();

import * as Android from './types/android';
import * as Amazon from './types/amazon';
import * as Apple from './types/apple';

import {
  EmitterSubscription,
  Linking,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import {
  IAPErrorCode,
  InAppPurchase,
  InstallSourceAndroid,
  Product,
  ProductCommon,
  ProductPurchase,
  ProrationModesAndroid,
  PurchaseError,
  PurchaseResult,
  PurchaseStateAndroid,
  Subscription,
  SubscriptionPurchase,
} from './types';

const {RNIapIos, RNIapModule, RNIapAmazonModule} = NativeModules;

const ANDROID_ITEM_TYPE_SUBSCRIPTION = 'subs';
const ANDROID_ITEM_TYPE_IAP = 'inapp';

export const getInstallSourceAndroid = (): InstallSourceAndroid => {
  return RNIapModule
    ? InstallSourceAndroid.GOOGLE_PLAY
    : InstallSourceAndroid.AMAZON;
};

const checkNativeAndroidAvailable = (): void => {
  if (!RNIapModule && !RNIapAmazonModule)
    throw new Error(IAPErrorCode.E_IAP_NOT_AVAILABLE);
};

const getAndroidModule = (): typeof RNIapModule | typeof RNIapAmazonModule => {
  checkNativeAndroidAvailable();

  return RNIapModule ? RNIapModule : RNIapAmazonModule;
};

const checkNativeiOSAvailable = (): void => {
  if (!RNIapIos) throw new Error(IAPErrorCode.E_IAP_NOT_AVAILABLE);
};

const getIosModule = (): typeof RNIapIos => {
  checkNativeiOSAvailable();

  return RNIapIos;
};

const getNativeModule = ():
  | typeof RNIapModule
  | typeof RNIapAmazonModule
  | typeof RNIapIos => {
  return RNIapModule
    ? RNIapModule
    : RNIapAmazonModule
    ? RNIapAmazonModule
    : RNIapIos;
};

/**
 * Init module for purchase flow. Required on Android. In ios it will check wheter user canMakePayment.
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
 * Fill products with additional data
 * @param {Array<ProductCommon>} products Products
 */
const fillProductsAdditionalData = async (
  products: Array<ProductCommon>,
): Promise<Array<ProductCommon>> => {
  // Amazon
  if (RNIapAmazonModule) {
    // On amazon we must get the user marketplace to detect the currency
    const user = await RNIapAmazonModule.getUser();

    const currencies = {
      CA: 'CAD',
      ES: 'EUR',
      AU: 'AUD',
      DE: 'EUR',
      IN: 'INR',
      US: 'USD',
      JP: 'JPY',
      GB: 'GBP',
      IT: 'EUR',
      BR: 'BRL',
      FR: 'EUR',
    };

    const currency = currencies[user.userMarketplaceAmazon];

    // Add currency to products
    products.forEach((product) => {
      if (currency) product.currency = currency;
    });
  }

  return products;
};

/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 * @param {string[]} skus The item skus
 * @returns {Promise<Product[]>}
 */
export const getProducts = (skus: string[]): Promise<Array<Product>> =>
  (
    Platform.select({
      ios: async () => {
        const items = await getIosModule().getItems(skus);

        return items.filter((item: Product) => skus.includes(item.productId));
      },
      android: async () => {
        const products = await getAndroidModule().getItemsByType(
          ANDROID_ITEM_TYPE_IAP,
          skus,
        );

        return fillProductsAdditionalData(products);
      },
    }) || Promise.resolve
  )();

/**
 * Get a list of subscriptions
 * @param {string[]} skus The item skus
 * @returns {Promise<Subscription[]>}
 */
export const getSubscriptions = (skus: string[]): Promise<Subscription[]> =>
  (
    Platform.select({
      ios: async () => {
        const items = await getIosModule().getItems(skus);

        return items.filter((item: Subscription) =>
          skus.includes(item.productId),
        );
      },
      android: async () => {
        const subscriptions = await getAndroidModule().getItemsByType(
          ANDROID_ITEM_TYPE_SUBSCRIPTION,
          skus,
        );

        return fillProductsAdditionalData(subscriptions);
      },
    }) || Promise.resolve
  )();

/**
 * Gets an invetory of purchases made by the user regardless of consumption status
 * @returns {Promise<(InAppPurchase | SubscriptionPurchase)[]>}
 */
export const getPurchaseHistory = (): Promise<
  (InAppPurchase | SubscriptionPurchase)[]
> =>
  (
    Platform.select({
      ios: async () => {
        return getIosModule().getAvailableItems();
      },
      android: async () => {
        if (RNIapAmazonModule)
          return await RNIapAmazonModule.getAvailableItems();

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
 * @returns {Promise<(InAppPurchase | SubscriptionPurchase)[]>}
 */
export const getAvailablePurchases = (): Promise<
  (InAppPurchase | SubscriptionPurchase)[]
> =>
  (
    Platform.select({
      ios: async () => {
        return getIosModule().getAvailableItems();
      },
      android: async () => {
        if (RNIapAmazonModule)
          return await RNIapAmazonModule.getAvailableItems();

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
 * @param {boolean} [andDangerouslyFinishTransactionAutomaticallyIOS] You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.
 * @param {string} [obfuscatedAccountIdAndroid] Specifies an optional obfuscated string that is uniquely associated with the user's account in your app.
 * @param {string} [obfuscatedProfileIdAndroid] Specifies an optional obfuscated string that is uniquely associated with the user's profile in your app.
 * @returns {Promise<InAppPurchase>}
 */
export const requestPurchase = (
  sku: string,
  andDangerouslyFinishTransactionAutomaticallyIOS: boolean = false,
  obfuscatedAccountIdAndroid: string | undefined = undefined,
  obfuscatedProfileIdAndroid: string | undefined = undefined,
): Promise<InAppPurchase> =>
  (
    Platform.select({
      ios: async () => {
        if (andDangerouslyFinishTransactionAutomaticallyIOS)
          // eslint-disable-next-line no-console
          console.warn(
            // eslint-disable-next-line max-len
            'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
          );

        return getIosModule().buyProduct(
          sku,
          andDangerouslyFinishTransactionAutomaticallyIOS,
        );
      },
      android: async () => {
        return getAndroidModule().buyItemByType(
          ANDROID_ITEM_TYPE_IAP,
          sku,
          null,
          0,
          obfuscatedAccountIdAndroid,
          obfuscatedProfileIdAndroid,
        );
      },
    }) || Promise.resolve
  )();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} [sku] The product's sku/ID
 * @param {boolean} [andDangerouslyFinishTransactionAutomaticallyIOS] You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.
 * @param {string} [purchaseTokenAndroid] purchaseToken that the user is upgrading or downgrading from (Android).
 * @param {ProrationModesAndroid} [prorationModeAndroid] UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY, IMMEDIATE_WITH_TIME_PRORATION, IMMEDIATE_AND_CHARGE_PRORATED_PRICE, IMMEDIATE_WITHOUT_PRORATION, DEFERRED
 * @param {string} [obfuscatedAccountIdAndroid] Specifies an optional obfuscated string that is uniquely associated with the user's account in your app.
 * @param {string} [obfuscatedProfileIdAndroid] Specifies an optional obfuscated string that is uniquely associated with the user's profile in your app.
 * @returns {Promise<SubscriptionPurchase | null>} Promise resolves to null when using proratioModesAndroid=DEFERRED, and to a SubscriptionPurchase otherwise
 */
export const requestSubscription = (
  sku: string,
  andDangerouslyFinishTransactionAutomaticallyIOS: boolean = false,
  purchaseTokenAndroid: string | undefined = undefined,
  prorationModeAndroid: ProrationModesAndroid = -1,
  obfuscatedAccountIdAndroid: string | undefined = undefined,
  obfuscatedProfileIdAndroid: string | undefined = undefined,
): Promise<SubscriptionPurchase | null> =>
  (
    Platform.select({
      ios: async () => {
        if (andDangerouslyFinishTransactionAutomaticallyIOS)
          // eslint-disable-next-line no-console
          console.warn(
            // eslint-disable-next-line max-len
            'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
          );

        return getIosModule().buyProduct(
          sku,
          andDangerouslyFinishTransactionAutomaticallyIOS,
        );
      },
      android: async () => {
        return getAndroidModule().buyItemByType(
          ANDROID_ITEM_TYPE_SUBSCRIPTION,
          sku,
          purchaseTokenAndroid,
          prorationModeAndroid,
          obfuscatedAccountIdAndroid,
          obfuscatedProfileIdAndroid,
        );
      },
    }) || Promise.resolve
  )();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @returns {Promise<void>}
 */
export const requestPurchaseWithQuantityIOS = (
  sku: string,
  quantity: number,
): Promise<InAppPurchase> =>
  getIosModule().buyProductWithQuantityIOS(sku, quantity);

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
export const finishTransaction = (
  purchase: InAppPurchase | ProductPurchase,
  isConsumable?: boolean,
  developerPayloadAndroid?: string,
): Promise<string | void> => {
  return (
    Platform.select({
      ios: async () => {
        return getIosModule().finishTransaction(purchase.transactionId);
      },
      android: async () => {
        if (purchase)
          if (isConsumable)
            return getAndroidModule().consumeProduct(
              purchase.purchaseToken,
              developerPayloadAndroid,
            );
          else if (
            purchase.userIdAmazon ||
            (!purchase.isAcknowledgedAndroid &&
              purchase.purchaseStateAndroid === PurchaseStateAndroid.PURCHASED)
          )
            return getAndroidModule().acknowledgePurchase(
              purchase.purchaseToken,
              developerPayloadAndroid,
            );
          else throw new Error('purchase is not suitable to be purchased');
        else throw new Error('purchase is not assigned');
      },
    }) || Promise.resolve
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
export const acknowledgePurchaseAndroid = (
  token: string,
  developerPayload?: string,
): Promise<PurchaseResult | void> => {
  return getAndroidModule().acknowledgePurchase(token, developerPayload);
};

/**
 * Deep link to subscriptions screen on Android. No-op on iOS.
 * @param {string} sku The product's SKU (on Android)
 * @returns {Promise<void>}
 */
export const deepLinkToSubscriptionsAndroid = (sku: string): Promise<void> => {
  checkNativeAndroidAvailable();

  return Linking.openURL(
    `https://play.google.com/store/account/subscriptions?package=${RNIapModule.getPackageName()}&sku=${sku}`,
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

const fetchJsonOrThrow = async (
  url: string,
  receiptBody: Record<string, unknown>,
): Promise<Apple.ReceiptValidationResponse | false> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(receiptBody),
  });

  if (!response.ok)
    throw Object.assign(new Error(response.statusText), {
      statusCode: response.status,
    });

  return response.json();
};

const requestAgnosticReceiptValidationIos = async (
  receiptBody: Record<string, unknown>,
): Promise<Apple.ReceiptValidationResponse | false> => {
  const response = await fetchJsonOrThrow(
    'https://buy.itunes.apple.com/verifyReceipt',
    receiptBody,
  );

  // Best practice is to check for test receipt and check sandbox instead
  // https://developer.apple.com/documentation/appstorereceipts/verifyreceipt
  if (
    response &&
    response.status === Apple.ReceiptValidationStatus.TEST_RECEIPT
  ) {
    const testResponse = await fetchJsonOrThrow(
      'https://sandbox.itunes.apple.com/verifyReceipt',
      receiptBody,
    );

    return testResponse;
  }

  return response;
};

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
): Promise<void> => getIosModule().buyProductWithOffer(sku, forUser, withOffer);

/**
 * Validate receipt for iOS.
 * @param {object} receiptBody the receipt body to send to apple server.
 * @param {boolean} isTest whether this is in test environment which is sandbox.
 * @returns {Promise<Apple.ReceiptValidationResponse | false>}
 */
export const validateReceiptIos = async (
  receiptBody: Record<string, unknown>,
  isTest?: boolean,
): Promise<Apple.ReceiptValidationResponse | false> => {
  if (isTest == null)
    return await requestAgnosticReceiptValidationIos(receiptBody);

  const url = isTest
    ? 'https://sandbox.itunes.apple.com/verifyReceipt'
    : 'https://buy.itunes.apple.com/verifyReceipt';

  const response = await fetchJsonOrThrow(url, receiptBody);

  return response;
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
export const validateReceiptAndroid = async (
  packageName: string,
  productId: string,
  productToken: string,
  accessToken: string,
  isSub?: boolean,
): Promise<Android.ReceiptType> => {
  const type = isSub ? 'subscriptions' : 'products';

  const url =
    'https://androidpublisher.googleapis.com/androidpublisher/v3/applications' +
    `/${packageName}/purchases/${type}/${productId}` +
    `/tokens/${productToken}?access_token=${accessToken}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok)
    throw Object.assign(new Error(response.statusText), {
      statusCode: response.status,
    });

  return response.json();
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
export const validateReceiptAmazon = async (
  developerSecret: string,
  userId: string,
  receiptId: string,
  useSandbox: boolean = true,
): Promise<Amazon.ReceiptType> => {
  const sandoboxUrl = useSandbox ? 'sandbox/' : '';
  const url = `https://appstore-sdk.amazon.com/${sandoboxUrl}version/1.0/verifyReceiptId/developer/${developerSecret}/user/${userId}/receiptId/${receiptId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok)
    throw Object.assign(new Error(response.statusText), {
      statusCode: response.status,
    });

  return response.json();
};

/**
 * Add IAP purchase event
 * @returns {callback(e: InAppPurchase | ProductPurchase)}
 */
export const purchaseUpdatedListener = (
  listener: (event: InAppPurchase | SubscriptionPurchase) => void,
): EmitterSubscription => {
  const myModuleEvt = new NativeEventEmitter(getNativeModule());

  const emitterSubscription = myModuleEvt.addListener(
    'purchase-updated',
    listener,
  );
  if (Platform.OS === 'android') getAndroidModule().startListening();

  return emitterSubscription;
};

/**
 * Add IAP purchase error event
 * @returns {callback(e: PurchaseError)}
 */
export const purchaseErrorListener = (
  listener: (errorEvent: PurchaseError) => void,
): EmitterSubscription =>
  new NativeEventEmitter(getNativeModule()).addListener(
    'purchase-error',
    listener,
  );

/**
 * Get the current receipt base64 encoded in IOS.
 * @param {forceRefresh?:boolean}
 * @returns {Promise<string>}
 */
export const getReceiptIOS = async (forceRefresh?: boolean): Promise<string> =>
  getIosModule().requestReceipt(forceRefresh ?? false);

/**
 * Get the pending purchases in IOS.
 * @returns {Promise<ProductPurchase[]>}
 */
export const getPendingPurchasesIOS = async (): Promise<ProductPurchase[]> =>
  getIosModule().getPendingTransactions();

/**
 * Launches a modal to register the redeem offer code in IOS.
 * @returns {Promise<null>}
 */
export const presentCodeRedemptionSheetIOS = async (): Promise<null> =>
  getIosModule().presentCodeRedemptionSheet();

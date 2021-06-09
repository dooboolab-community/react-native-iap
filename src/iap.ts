import * as Android from './types/android';
import * as Apple from './types/apple';

import {
  DeviceEventEmitter,
  EmitterSubscription,
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

let iapInstallSourceAndroid = InstallSourceAndroid.NOT_SET;
let iapFallbackInstallSourceAndroid = InstallSourceAndroid.GOOGLE_PLAY;

export function setFallbackInstallSourceAndroid(
  installSourceAndroid: InstallSourceAndroid,
): void {
  iapFallbackInstallSourceAndroid = installSourceAndroid;
}

export function setInstallSourceAndroid(
  installSourceAndroid: InstallSourceAndroid,
): void {
  iapInstallSourceAndroid = installSourceAndroid;
}

export function getInstallSourceAndroid(): InstallSourceAndroid {
  return iapInstallSourceAndroid;
}

async function detectInstallSourceAndroid(): Promise<void> {
  const detectedInstallSourceAndroid = RNIapModule? await RNIapModule.getInstallSource(): 'AMAZON';
  let newInstallSourceAndroid = iapFallbackInstallSourceAndroid;

  switch (detectedInstallSourceAndroid) {
    case 'GOOGLE_PLAY':
      newInstallSourceAndroid = InstallSourceAndroid.GOOGLE_PLAY;
      break;
    case 'AMAZON':
      newInstallSourceAndroid = InstallSourceAndroid.AMAZON;
      break;
  }

  setInstallSourceAndroid(newInstallSourceAndroid);
}

function getAndroidModule(): any {
  let myRNIapModule = null;

  switch (iapInstallSourceAndroid) {
    case InstallSourceAndroid.AMAZON:
      myRNIapModule = RNIapAmazonModule;
      break;
    default:
      myRNIapModule = RNIapModule;
      break;
  }

  return myRNIapModule;
}

function checkNativeAndroidAvailable(myRNIapModule: any): Promise<void> {
  if (!myRNIapModule)
    return Promise.reject(new Error(IAPErrorCode.E_IAP_NOT_AVAILABLE));
  return Promise.resolve()
}

function checkNativeiOSAvailable(): Promise<void> {
  if (!RNIapIos)
    return Promise.reject(new Error(IAPErrorCode.E_IAP_NOT_AVAILABLE));
  return Promise.resolve()
}

/**
 * Init module for purchase flow. Required on Android. In ios it will check wheter user canMakePayment.
 * @returns {Promise<boolean>}
 */
export const initConnection = (): Promise<boolean> =>
  (Platform.select({
    ios: async () => {
      if (!RNIapIos) return Promise.resolve();

      return RNIapIos.canMakePayments();
    },
    android: async () => {
      await detectInstallSourceAndroid();

      const myRNIapModule = getAndroidModule();

      if (!RNIapModule && !RNIapAmazonModule) return Promise.reject("Unable to detect Android platform modules");

      return myRNIapModule.initConnection();
    },
  }) || Promise.resolve)();

/**
 * End module for purchase flow.
 * @returns {Promise<void>}
 */
export const endConnection = (): Promise<void> =>
  (Platform.select({
    ios: async () => {
      if (!RNIapIos) {
        console.warn('Native ios module does not exist');

        return Promise.resolve();
      }

      return RNIapIos.endConnection();
    },
    android: async () => {
      const myRNIapModule = getAndroidModule();

      if (!RNIapModule && !RNIapAmazonModule) {
        console.info('Native android module does not exist, while calling end connection');

        return Promise.resolve();
      }

      return myRNIapModule.endConnection();
    },
  }) || Promise.resolve)();

/**
 * @deprecated
 * End module for purchase flow. Required on Android. No-op on iOS.
 * @returns {Promise<void>}
 */
export const endConnectionAndroid = (): Promise<void> => {
  console.warn(
    'endConnectionAndroid is deprecated and will be removed in the future. Please use endConnection instead',
  );

  return (Platform.select({
    ios: async () => Promise.resolve(),
    android: async () => {
      switch (iapInstallSourceAndroid) {
        case InstallSourceAndroid.AMAZON:
          return Promise.resolve();
        default:
          if (!RNIapModule) return Promise.resolve();

          return RNIapModule.endConnection();
      }
    },
  }) || Promise.resolve)();
};

/**
 * Consume all remaining tokens. Android only.
 * This is considered dangerous as you should deliver the purchased feature BEFORE consuming it.
 * If you used this method to refresh Play Store cache (of failed pending payment still marked as failed),
 *  prefer using flushFailedPurchasesCachedAsPendingAndroid
 * @deprecated
 * @returns {Promise<string[]>}
 */
export const consumeAllItemsAndroid = (): Promise<string[]> => {
  console.warn(
    'consumeAllItemsAndroid is deprecated and will be removed in the future. Please use flushFailedPurchasesCachedAsPendingAndroid instead',
  );

  return (Platform.select({
    ios: async () => Promise.resolve(),
    android: async () => {
      const myRNIapModule = getAndroidModule();

      await checkNativeAndroidAvailable(myRNIapModule);

      return myRNIapModule.refreshItems();
    },
  }) || Promise.resolve)();
};

/**
 * Consume all 'ghost' purchases (that is, pending payment that already failed but is still marked as pending in Play Store cache). Android only.
 * @returns {Promise<boolean>}
 */
export const flushFailedPurchasesCachedAsPendingAndroid = (): Promise<
  string[]
> =>
  (Platform.select({
    ios: async () => Promise.resolve(),
    android: async () => {
      const myRNIapModule = getAndroidModule();

      await checkNativeAndroidAvailable(myRNIapModule);

      return RNIapModule ? RNIapModule.flushFailedPurchasesCachedAsPending() :[];
    },
  }) || Promise.resolve)();

/**
 * Fill products with additional data
 * @param {Array<ProductCommon>} products Products
 */
const fillProductsAdditionalData = async (
  products: Array<ProductCommon>,
): Promise<Array<ProductCommon>> => {
  const myRNIapModule = getAndroidModule();

  // Amazon
  if (iapInstallSourceAndroid === InstallSourceAndroid.AMAZON) {
    // On amazon we must get the user marketplace to detect the currency
    const user = await myRNIapModule.getUser();

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
export const getProducts = <SkuType extends string>(
  skus: SkuType[],
): Promise<Array<Product<SkuType>>> =>
  (Platform.select({
    ios: async () => {
      if (!RNIapIos) return [];

      return RNIapIos.getItems(skus).then((items: Product[]) =>
        items.filter((item: Product) =>
          skus.includes(item.productId as SkuType),
        ),
      );
    },
    android: async () => {
      const myRNIapModule = getAndroidModule();

      await checkNativeAndroidAvailable(myRNIapModule);
      
      const products = await myRNIapModule.getItemsByType(
        ANDROID_ITEM_TYPE_IAP,
        skus,
      );
        
      return fillProductsAdditionalData(products);
    },
  }) || Promise.resolve)();

/**
 * Get a list of subscriptions
 * @param {string[]} skus The item skus
 * @returns {Promise<Subscription[]>}
 */
export const getSubscriptions = (skus: string[]): Promise<Subscription[]> =>
  (Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

      return RNIapIos.getItems(skus).then((items: Subscription[]) =>
        items.filter((item: Subscription) => skus.includes(item.productId)),
      );
    },
    android: async () => {
      const myModule = getAndroidModule();

      await checkNativeAndroidAvailable(myModule);

      const subscriptions = await myModule.getItemsByType(
        ANDROID_ITEM_TYPE_SUBSCRIPTION,
        skus,
      );

      return fillProductsAdditionalData(subscriptions);
    },
  }) || Promise.resolve)();

/**
 * Gets an invetory of purchases made by the user regardless of consumption status
 * @returns {Promise<(InAppPurchase | SubscriptionPurchase)[]>}
 */
export const getPurchaseHistory = (): Promise<
  (InAppPurchase | SubscriptionPurchase)[]
> =>
  (Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

      return RNIapIos.getAvailableItems();
    },
    android: async () => {
      const myRNIapModule = getAndroidModule();

      await checkNativeAndroidAvailable(myRNIapModule);

      const products = await myRNIapModule.getPurchaseHistoryByType(
        ANDROID_ITEM_TYPE_IAP,
      );

      const subscriptions = await myRNIapModule.getPurchaseHistoryByType(
        ANDROID_ITEM_TYPE_SUBSCRIPTION,
      );

      return products.concat(subscriptions);
    },
  }) || Promise.resolve)();

/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * @returns {Promise<(InAppPurchase | SubscriptionPurchase)[]>}
 */
export const getAvailablePurchases = (): Promise<
  (InAppPurchase | SubscriptionPurchase)[]
> =>
  (Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

      return RNIapIos.getAvailableItems();
    },
    android: async () => {
      const myRNIapModule = getAndroidModule();

      await checkNativeAndroidAvailable(myRNIapModule);

      const products = await myRNIapModule.getAvailableItemsByType(
        ANDROID_ITEM_TYPE_IAP,
      );

      const subscriptions = await myRNIapModule.getAvailableItemsByType(
        ANDROID_ITEM_TYPE_SUBSCRIPTION,
      );

      return products.concat(subscriptions);
    },
  }) || Promise.resolve)();

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
  andDangerouslyFinishTransactionAutomaticallyIOS?: boolean,
  obfuscatedAccountIdAndroid?: string,
  obfuscatedProfileIdAndroid?: string,
): Promise<InAppPurchase> =>
  (Platform.select({
    ios: async () => {
      andDangerouslyFinishTransactionAutomaticallyIOS =
        andDangerouslyFinishTransactionAutomaticallyIOS === undefined
          ? false
          : andDangerouslyFinishTransactionAutomaticallyIOS;

      if (andDangerouslyFinishTransactionAutomaticallyIOS)
        console.warn(
          // eslint-disable-next-line max-len
          'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
        );

      await checkNativeiOSAvailable();

      return RNIapIos.buyProduct(
        sku,
        andDangerouslyFinishTransactionAutomaticallyIOS,
      );
    },
    android: async () => {
      const myRNIapModule = getAndroidModule();

      await checkNativeAndroidAvailable(myRNIapModule);

      return myRNIapModule.buyItemByType(
        ANDROID_ITEM_TYPE_IAP,
        sku,
        null,
        null,
        0,
        obfuscatedAccountIdAndroid,
        obfuscatedProfileIdAndroid,
      );
    },
  }) || Promise.resolve)();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @param {boolean} [andDangerouslyFinishTransactionAutomaticallyIOS] You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.
 * @param {string} [oldSkuAndroid] SKU that the user is upgrading or downgrading from.
 * @param {string} [purchaseTokenAndroid] purchaseToken that the user is upgrading or downgrading from (Android).
 * @param {string} [obfuscatedAccountIdAndroid] Specifies an optional obfuscated string that is uniquely associated with the user's account in your app.
 * @param {string} [obfuscatedProfileIdAndroid] Specifies an optional obfuscated string that is uniquely associated with the user's profile in your app.
 * @param {ProrationModesAndroid} [prorationModeAndroid] UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY, IMMEDIATE_WITH_TIME_PRORATION, IMMEDIATE_AND_CHARGE_PRORATED_PRICE, IMMEDIATE_WITHOUT_PRORATION, DEFERRED
 * @returns {Promise<void>}
 */
export const requestSubscription = (
  sku: string,
  andDangerouslyFinishTransactionAutomaticallyIOS?: boolean,
  oldSkuAndroid?: string,
  purchaseTokenAndroid?: string,
  prorationModeAndroid?: ProrationModesAndroid,
  obfuscatedAccountIdAndroid?: string,
  obfuscatedProfileIdAndroid?: string,
): Promise<SubscriptionPurchase> =>
  (Platform.select({
    ios: async () => {
      andDangerouslyFinishTransactionAutomaticallyIOS =
        andDangerouslyFinishTransactionAutomaticallyIOS === undefined
          ? false
          : andDangerouslyFinishTransactionAutomaticallyIOS;

      if (andDangerouslyFinishTransactionAutomaticallyIOS)
        console.warn(
          // eslint-disable-next-line max-len
          'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
        );

      await checkNativeiOSAvailable();

      return RNIapIos.buyProduct(
        sku,
        andDangerouslyFinishTransactionAutomaticallyIOS,
      );
    },
    android: async () => {
      if (!prorationModeAndroid) prorationModeAndroid = -1;

      const myRNIapModule = getAndroidModule();

      await checkNativeAndroidAvailable(myRNIapModule);

      return myRNIapModule.buyItemByType(
        ANDROID_ITEM_TYPE_SUBSCRIPTION,
        sku,
        oldSkuAndroid,
        purchaseTokenAndroid,
        prorationModeAndroid,
        obfuscatedAccountIdAndroid,
        obfuscatedProfileIdAndroid,
      );
    },
  }) || Promise.resolve)();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @returns {Promise<void>}
 */
export const requestPurchaseWithQuantityIOS = (
  sku: string,
  quantity: number,
): Promise<InAppPurchase> =>
  (Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

      return RNIapIos.buyProductWithQuantityIOS(sku, quantity);
    },
  }) || Promise.resolve)();

/**
 * Finish Transaction (iOS only)
 *   Similar to `consumePurchaseAndroid`. Tells StoreKit that you have delivered the purchase to the user and StoreKit can now let go of the transaction.
 *   Call this after you have persisted the purchased state to your server or local data in your app.
 *   `react-native-iap` will continue to deliver the purchase updated events with the successful purchase until you finish the transaction. **Even after the app has relaunched.**
 * @param {string} transactionId The transactionId of the function that you would like to finish.
 * @returns {Promise<void>}
 */
export const finishTransactionIOS = (transactionId: string): Promise<void> =>
  (Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

      return RNIapIos.finishTransaction(transactionId);
    },
  }) || Promise.resolve)();
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
  return (Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

      return RNIapIos.finishTransaction(purchase.transactionId);
    },
    android: async () => {
      const myRNIapModule = getAndroidModule();

      if (purchase)
        if (isConsumable)
          return myRNIapModule.consumeProduct(
            purchase.purchaseToken,
            developerPayloadAndroid,
          );
        else if (
          purchase.userIdAmazon ||
          (!purchase.isAcknowledgedAndroid &&
            purchase.purchaseStateAndroid === PurchaseStateAndroid.PURCHASED)
        )
          return myRNIapModule.acknowledgePurchase(
            purchase.purchaseToken,
            developerPayloadAndroid,
          );
        else throw new Error('purchase is not suitable to be purchased');
      else throw new Error('purchase is not assigned');
    },
  }) || Promise.resolve)();
};

/**
 * Clear Transaction (iOS only)
 *   Finish remaining transactions. Related to issue #257 and #801
 *     link : https://github.com/dooboolab/react-native-iap/issues/257
 *            https://github.com/dooboolab/react-native-iap/issues/801
 * @returns {Promise<void>}
 */
export const clearTransactionIOS = (): Promise<void> => {
  return (Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

      return RNIapIos.clearTransaction();
    },
    android: async () => Promise.resolve(),
  }) || Promise.resolve)();
};

/**
 * Clear valid Products (iOS only)
 *   Remove all products which are validated by Apple server.
 * @returns {void}
 */
export const clearProductsIOS = (): Promise<void> =>
  (Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

      return RNIapIos.clearProducts();
    },
    android: async () => undefined,
  }) || Promise.resolve)();

/**
 * Acknowledge a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise<PurchaseResult | void>}
 */
export const acknowledgePurchaseAndroid = (
  token: string,
  developerPayload?: string,
): Promise<PurchaseResult | void> =>
  (Platform.select({
    ios: async () => Promise.resolve(),
    android: async () => {
      const myRNIapModule = getAndroidModule();

      await checkNativeAndroidAvailable(myRNIapModule);

      return myRNIapModule.acknowledgePurchase(token, developerPayload);
    },
  }) || Promise.resolve)();

/**
 * Consume a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise<PurchaseResult>}
 */
export const consumePurchaseAndroid = (
  token: string,
  developerPayload?: string,
): Promise<PurchaseResult> =>
  (Platform.select({
    ios: async () => Promise.resolve(),
    android: async () => {
      const myRNIapModule = getAndroidModule();

      await checkNativeAndroidAvailable(myRNIapModule);

      return myRNIapModule.consumeProduct(token, developerPayload);
    },
  }) || Promise.resolve)();

/**
 * Should Add Store Payment (iOS only)
 *   Indicates the the App Store purchase should continue from the app instead of the App Store.
 * @returns {Promise<Product>}
 */
export const getPromotedProductIOS = (): Promise<Product> =>
  (Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

      return RNIapIos.promotedProduct();
    },
    android: async () => Promise.resolve(),
  }) || Promise.resolve)();

/**
 * Buy the currently selected promoted product (iOS only)
 *   Initiates the payment process for a promoted product. Should only be called in response to the `iap-promoted-product` event.
 * @returns {Promise<void>}
 */
export const buyPromotedProductIOS = (): Promise<void> =>
  (Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

      return RNIapIos.buyPromotedProduct();
    },
    android: async () => Promise.resolve(),
  }) || Promise.resolve)();

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
): Promise<void> =>
  (Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

      return RNIapIos.buyProductWithOffer(sku, forUser, withOffer);
    },
    android: async () => Promise.resolve(),
  }) || Promise.resolve)();

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
 * Add IAP purchase event in ios.
 * @returns {callback(e: InAppPurchase | ProductPurchase)}
 */
export const purchaseUpdatedListener = (
  listener: (event: InAppPurchase | SubscriptionPurchase) => void,
): EmitterSubscription => {
  if (Platform.OS === 'ios') {
    checkNativeiOSAvailable();

    const myModuleEvt = new NativeEventEmitter(RNIapIos);

    return myModuleEvt.addListener('purchase-updated', listener);
  } else {
    const myRNIapModule = getAndroidModule();
    const myModuleEvt = new NativeEventEmitter(myRNIapModule);
    const emitterSubscription = myModuleEvt.addListener(
      'purchase-updated',
      listener,
    );

    myRNIapModule.startListening();

    return emitterSubscription;
  }
};

/**
 * Add IAP purchase error event in ios.
 * @returns {callback(e: PurchaseError)}
 */
export const purchaseErrorListener = (
  listener: (errorEvent: PurchaseError) => void,
): EmitterSubscription => {
  if (Platform.OS === 'ios') {
    checkNativeiOSAvailable();

    const myModuleEvt = new NativeEventEmitter(RNIapIos);

    return myModuleEvt.addListener('purchase-error', listener);
  } else return DeviceEventEmitter.addListener('purchase-error', listener);
};

/**
 * Get the current receipt base64 encoded in IOS.
 * @param {forceRefresh?:boolean}
 * @returns {Promise<string>}
 */
export const getReceiptIOS = async (forceRefresh?:boolean): Promise<string> => {
  if (Platform.OS === 'ios') {
    await checkNativeiOSAvailable();

    return RNIapIos.requestReceipt(forceRefresh??false);
  }
  return Promise.reject("This API is only available on iOS");
};

/**
 * Get the pending purchases in IOS.
 * @returns {Promise<ProductPurchase[]>}
 */
export const getPendingPurchasesIOS = async (): Promise<ProductPurchase[]> => {
  if (Platform.OS === 'ios') {
    await checkNativeiOSAvailable();

    return RNIapIos.getPendingTransactions();
  }
  return Promise.reject("This API is only available on iOS")
};

/**
 * Launches a modal to register the redeem offer code in IOS.
 * @returns {Promise<null>}
 */
export const presentCodeRedemptionSheetIOS = async (): Promise<null> => {
  if (Platform.OS === 'ios') {
    await checkNativeiOSAvailable();

    return RNIapIos.presentCodeRedemptionSheet();
  }
  return Promise.reject("This API is only available on iOS")
};

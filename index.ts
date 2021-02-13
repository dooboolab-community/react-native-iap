import * as Apple from './type/apple';

import {
  DeviceEventEmitter,
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

const {RNIapIos, RNIapModule, RNIapAmazonModule} = NativeModules;

interface Common {
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;

  countryCodeIOS?: string;
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
  E_DEFERRED_PAYMENT = 'E_DEFERRED_PAYMENT',
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
  paymentMode: '' | 'FREETRIAL' | 'PAYASYOUGO' | 'PAYUPFRONT';
  subscriptionPeriod: string;
}

export interface Product<ProductId extends string = string> extends Common {
  type: 'inapp' | 'iap';
  productId: ProductId;
}

export interface Subscription extends Common {
  type: 'subs' | 'sub';
  productId: string;

  discounts?: Discount[];

  introductoryPrice?: string;
  introductoryPriceAsAmountIOS?: string;
  introductoryPricePaymentModeIOS?:
    | ''
    | 'FREETRIAL'
    | 'PAYASYOUGO'
    | 'PAYUPFRONT';
  introductoryPriceNumberOfPeriodsIOS?: string;
  introductoryPriceSubscriptionPeriodIOS?:
    | 'DAY'
    | 'WEEK'
    | 'MONTH'
    | 'YEAR'
    | '';

  subscriptionPeriodNumberIOS?: string;
  subscriptionPeriodUnitIOS?: '' | 'YEAR' | 'MONTH' | 'WEEK' | 'DAY';

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
  packageNameAndroid?: string;
  developerPayloadAndroid?: string;
  obfuscatedAccountIdAndroid?: string;
  obfuscatedProfileIdAndroid?: string;
  userIdAmazon?: string;
  userMarketplaceAmazon?: string;
  userJsonAmazon?: string;
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
  productId?: string;
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

export enum InstallSourceAndroid {
  NOT_SET = 0,
  GOOGLE_PLAY = 1,
  AMAZON = 2,
}

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
  const detectedInstallSourceAndroid = await RNIapModule.getInstallSource();
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
}

function checkNativeiOSAvailable(): Promise<void> {
  if (!RNIapIos)
    return Promise.reject(new Error(IAPErrorCode.E_IAP_NOT_AVAILABLE));
}

/**
 * Init module for purchase flow. Required on Android. In ios it will check wheter user canMakePayment.
 * @returns {Promise<boolean>}
 */
export const initConnection = (): Promise<boolean> =>
  Platform.select({
    ios: async () => {
      if (!RNIapIos) return Promise.resolve();

      return RNIapIos.canMakePayments();
    },
    android: async () => {
      await detectInstallSourceAndroid();

      const myRNIapModule = getAndroidModule();

      if (!RNIapModule || !RNIapAmazonModule) return Promise.resolve();

      return myRNIapModule.initConnection();
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
        console.warn('Native ios module does not exist');

        return Promise.resolve();
      }

      return RNIapIos.endConnection();
    },
    android: async () => {
      const myRNIapModule = getAndroidModule();

      if (!RNIapModule || !RNIapAmazonModule) {
        console.warn('Native android module does not exist');

        return Promise.resolve();
      }

      return myRNIapModule.endConnection();
    },
  })();

/**
 * @deprecated
 * End module for purchase flow. Required on Android. No-op on iOS.
 * @returns {Promise<void>}
 */
export const endConnectionAndroid = (): Promise<void> => {
  console.warn(
    'endConnectionAndroid is deprecated and will be removed in the future. Please use endConnection instead',
  );

  return Platform.select({
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
  })();
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

  return Platform.select({
    ios: async () => Promise.resolve(),
    android: async () => {
      const myRNIapModule = getAndroidModule();

      await checkNativeAndroidAvailable(myRNIapModule);

      return myRNIapModule.refreshItems();
    },
  })();
};

/**
 * Consume all 'ghost' purchases (that is, pending payment that already failed but is still marked as pending in Play Store cache). Android only.
 * @returns {Promise<boolean>}
 */
export const flushFailedPurchasesCachedAsPendingAndroid = (): Promise<
  string[]
> =>
  Platform.select({
    ios: async () => Promise.resolve(),
    android: async () => {
      const myRNIapModule = getAndroidModule();

      await checkNativeAndroidAvailable(myRNIapModule);

      return RNIapModule.flushFailedPurchasesCachedAsPending();
    },
  })();

/**
 * Fill products with additional data
 * @param {Array<Common>} products Products
 */
const fillProductsAdditionalData = async (
  products: Array<Common>,
): Promise<Array<Common>> => {
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
  Platform.select({
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
  })();

/**
 * Get a list of subscriptions
 * @param {string[]} skus The item skus
 * @returns {Promise<Subscription[]>}
 */
export const getSubscriptions = (skus: string[]): Promise<Subscription[]> =>
  Platform.select({
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
  })();

/**
 * Gets an invetory of purchases made by the user regardless of consumption status
 * @returns {Promise<(InAppPurchase | SubscriptionPurchase)[]>}
 */
export const getPurchaseHistory = (): Promise<
  (InAppPurchase | SubscriptionPurchase)[]
> =>
  Platform.select({
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
  })();

/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * @returns {Promise<(InAppPurchase | SubscriptionPurchase)[]>}
 */
export const getAvailablePurchases = (): Promise<
  (InAppPurchase | SubscriptionPurchase)[]
> =>
  Platform.select({
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
  })();

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
  Platform.select({
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
  })();

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
  Platform.select({
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
      await checkNativeiOSAvailable();

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
      await checkNativeiOSAvailable();

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
      await checkNativeiOSAvailable();

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
export const clearProductsIOS = (): Promise<void> =>
  Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

      return RNIapIos.clearProducts();
    },
    android: async () => undefined,
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
      const myRNIapModule = getAndroidModule();

      await checkNativeAndroidAvailable(myRNIapModule);

      return myRNIapModule.acknowledgePurchase(token, developerPayload);
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
      const myRNIapModule = getAndroidModule();

      await checkNativeAndroidAvailable(myRNIapModule);

      return myRNIapModule.consumeProduct(token, developerPayload);
    },
  })();

/**
 * Should Add Store Payment (iOS only)
 *   Indicates the the App Store purchase should continue from the app instead of the App Store.
 * @returns {Promise<Product>}
 */
export const getPromotedProductIOS = (): Promise<string> =>
  Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

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
      await checkNativeiOSAvailable();

      return RNIapIos.buyPromotedProduct();
    },
    android: async () => Promise.resolve(),
  })();

const fetchJsonOrThrow = async (
  url: string,
  receiptBody: Record<string, unknown>,
): Promise<Apple.ReceiptValidationResponse | false> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
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
    const response = await fetchJsonOrThrow(
      'https://sandbox.itunes.apple.com/verifyReceipt',
      receiptBody,
    );

    return response;
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
  Platform.select({
    ios: async () => {
      await checkNativeiOSAvailable();

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
): Promise<Record<string, unknown> | false> => {
  const type = isSub ? 'subscriptions' : 'products';

  const url =
    'https://www.googleapis.com/androidpublisher/v3/applications' +
    `/${packageName}/purchases/${type}/${productId}` +
    `/tokens/${productToken}?access_token=${accessToken}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: new Headers({Accept: 'application/json'}),
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
    const emitterSubscription = DeviceEventEmitter.addListener(
      'purchase-updated',
      listener,
    );

    const myRNIapModule = getAndroidModule();

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
 * @returns {Promise<string>}
 */
export const getReceiptIOS = async (): Promise<string> => {
  if (Platform.OS === 'ios') {
    await checkNativeiOSAvailable();

    return RNIapIos.requestReceipt();
  }
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
  flushFailedPurchasesCachedAsPendingAndroid,
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
  presentCodeRedemptionSheetIOS,
};

export default iapUtils;

import * as Apple from './apple';
import { EmitterSubscription } from 'react-native';
interface Common {
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
}
export declare enum IAPErrorCode {
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
export interface ProductPurchase {
  productId: string;
  transactionId?: string;
  transactionDate: number;
  transactionReceipt: string;
  purchaseToken?: string;
  dataAndroid?: string;
  signatureAndroid?: string;
  autoRenewingAndroid?: boolean;
  purchaseStateAndroid?: number;
  originalTransactionDateIOS?: string;
  originalTransactionIdentifierIOS?: string;
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
export interface InAppPurchase extends ProductPurchase {
  isAcknowledgedAndroid?: boolean;
}
export interface SubscriptionPurchase extends ProductPurchase {
  autoRenewingAndroid?: boolean;
  originalTransactionDateIOS?: string;
  originalTransactionIdentifierIOS?: string;
}
export declare type Purchase = InAppPurchase | SubscriptionPurchase;
export declare const PROMOTED_PRODUCT = 'iap-promoted-product';
/**
 * Init module for purchase flow. Required on Android. In ios it will check wheter user canMakePayment.
 * @returns {Promise<string>}
 */
export declare const initConnection: () => Promise<string>;
/**
 * End module for purchase flow. Required on Android. No-op on iOS.
 * @returns {Promise<void>}
 */
export declare const endConnectionAndroid: () => Promise<void>;
/**
 * Consume all remaining tokens. Android only.
 * @returns {Promise<string[]>}
 */
export declare const consumeAllItemsAndroid: () => Promise<string[]>;
/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 * @param {string[]} skus The item skus
 * @returns {Promise<InAppPurchase[]>}
 */
export declare const getProducts: (skus: string[]) => Promise<InAppPurchase[]>;
/**
 * Get a list of subscriptions
 * @param {string[]} skus The item skus
 * @returns {Promise<SubscriptionPurchase[]>}
 */
export declare const getSubscriptions: (
  skus: string[],
) => Promise<SubscriptionPurchase[]>;
/**
 * Gets an invetory of purchases made by the user regardless of consumption status
 * @returns {Promise<(InAppPurchase | SubscriptionPurchase)[]>}
 */
export declare const getPurchaseHistory: () => Promise<
  (InAppPurchase | SubscriptionPurchase)[]
>;
/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * @returns {Promise<(InAppPurchase | SubscriptionPurchase)[]>}
 */
export declare const getAvailablePurchases: () => Promise<
  (InAppPurchase | SubscriptionPurchase)[]
>;
/**
 * @deprecated Deprecated since 3.0.0. This will be removed in the future. Use `requestPurchase` instead.
 * Buy a product
 * @param {string} sku The product's sku/ID
 * @returns {Promise<InAppPurchase>}
 */
export declare const buyProduct: (sku: string) => Promise<InAppPurchase>;
/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @param {boolean} andDangerouslyFinishTransactionAutomatically You should set this to false
 * and call finishTransaction manually when you have delivered the purchased goods to the user.
 * It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.
 * @returns {Promise<string>}
 */
export declare const requestPurchase: (
  sku: string,
  andDangerouslyFinishTransactionAutomatically: boolean,
) => Promise<string>;
/**
 * @deprecated Deprecated since 3.0.0. This will be removed in the future. Use `requestSubscription` instead.
 * Create a subscription to a sku
 * @param {string} sku The product's sku/ID
 * @param {string} [oldSku] Optional old product's ID for upgrade/downgrade (Android only)
 * @param {number} [prorationMode] Optional proration mode for upgrade/downgrade (Android only)
 * @returns {Promise<SubscriptionPurchase>}
 */
export declare const buySubscription: (
  sku: string,
  oldSku: string,
  prorationMode: number,
) => Promise<SubscriptionPurchase>;
/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @returns {Promise<string>}
 */
export declare const requestSubscription: (
  sku: string,
  oldSku: string,
  prorationMode: number,
) => Promise<string>;
/**
 * @deprecated Deprecated since 3.0.0. This will be removed in the future. Use `requestPurchaseWithQuantityIOS` instead.
 * Buy a product with a specified quantity (iOS only)
 * @param {string} sku The product's sku/ID
 * @param {number} quantity The amount of product to buy
 * @returns {Promise<ProductPurchase>}
 */
export declare const buyProductWithQuantityIOS: (
  sku: string,
  quantity: number,
) => Promise<ProductPurchase>;
/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @returns {Promise<string>}
 */
export declare const requestPurchaseWithQuantityIOS: (
  sku: string,
  quantity: number,
) => Promise<string>;
/**
 * Finish Transaction (iOS only)
 *  Similar to `consumePurchaseAndroid`.
 *  Tells StoreKit that you have delivered the purchase to the user
 *  and StoreKit can now let go of the transaction.
 *  Call this after you have persisted the purchased state to your server or local data in your app.
 *  `react-native-iap` will continue to deliver the purchase updated events
 *  with the successful purchase until you finish the transaction.
 * **Even after the app has relaunched.**
 * @param {string} transactionId The transactionId of the function that you would like to finish.
 * @returns {Promise<string | void>}
 */
export declare const finishTransactionIOS: (
  transactionId: string,
) => Promise<string | void>;
/**
 * Clear Transaction (iOS only)
 *   Finish remaining transactions. Related to issue #257
 *     link : https://github.com/dooboolab/react-native-iap/issues/257
 * @returns {Promise<string | void>}
 */
export declare const clearTransactionIOS: () => Promise<string | void>;
/**
 * Clear valid Products (iOS only)
 *   Remove all products which are validated by Apple server.
 * @returns {Promise<void>}
 */
export declare const clearProductsIOS: () => Promise<void>;
/**
 * Acknowledge a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise<PurchaseResult | void>}
 */
export declare const acknowledgePurchaseAndroid: (
  token: string,
  developerPayload: string,
) => Promise<void | PurchaseResult>;
/**
 * Consume a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise<PurchaseResult>}
 */
export declare const consumePurchaseAndroid: (
  token: string,
  developerPayload: string,
) => Promise<PurchaseResult>;
/**
 * Should Add Store Payment (iOS only)
 *   Indicates the the App Store purchase should continue from the app instead of the App Store.
 * @returns {Promise<Product>}
 */
export declare const getPromotedProductIOS: () => Promise<Product>;
/**
 * Buy the currently selected promoted product (iOS only)
 *   Initiates the payment process for a promoted product.
 *   Should only be called in response to the `iap-promoted-product` event.
 * @returns {Promise<void>}
 */
export declare const buyPromotedProductIOS: () => Promise<void>;
/**
 * Buy products or subscriptions with offers (iOS only)
 *
 * Runs the payment process with some infor you must fetch
 * from your server.
 * @param {string} sku The product identifier
 * @param {string} forUser  An user identifier on you system
 * @param {object} withOffer The offer information
 * @param {string} withOffer.identifier The offer identifier
 * @param {string} withOffer.keyIdentifier Key identifier that it uses to generate the signature
 * @param {string} withOffer.nonce An UUID returned from the server
 * @param {string} withOffer.signature The actual signature returned from the server
 * @param {number} withOffer.timestamp The timestamp of the signature
 * @returns {Promise}
 */
export declare const buyProductWithOfferIOS: (
  sku: string,
  forUser: string,
  withOffer: Apple.PaymentDiscount,
) => Promise<void>;
/**
 * Validate receipt for iOS.
 * @param {object} receiptBody the receipt body to send to apple server.
 * @param {boolean} isTest whether this is in test environment which is sandbox.
 * @returns {Promise<Apple.ReceiptValidationResponse | false>}
 */
export declare const validateReceiptIos: (
  receiptBody: object,
  isTest: boolean,
) => Promise<false | Apple.ReceiptValidationResponse>;
/**
 * Validate receipt for Android.
 * @param {string} packageName package name of your app.
 * @param {string} productId product id for your in app product.
 * @param {string} productToken token for your purchase.
 * @param {string} accessToken accessToken from googleApis.
 * @param {boolean} isSub whether this is subscription or inapp. `true` for subscription.
 * @returns {Promise<object>}
 */
export declare const validateReceiptAndroid: (
  packageName: string,
  productId: string,
  productToken: string,
  accessToken: string,
  isSub: boolean,
) => Promise<false | object>;
/**
 * @deprecated Deprecated since 3.0.0. This will be removed in the future. Use `purchaseUpdatedLister` with `requestPurchase`.
 * Add IAP purchase event in ios.
 * @returns {callback(e: Event)}
 */
export declare const addAdditionalSuccessPurchaseListenerIOS: (
  e: any,
) => EmitterSubscription;
/**
 * Add IAP purchase event in ios.
 * @returns {callback(e: ProductPurchase)}
 */
export declare const purchaseUpdatedListener: (e: any) => EmitterSubscription;
/**
 * Add IAP purchase error event in ios.
 * @returns {callback(e: ProductPurchase)}
 */
export declare const purchaseErrorListener: (e: any) => EmitterSubscription;
/**
 * Get the current receipt base64 encoded in IOS.
 * @returns {Promise<string>}
 */
export declare const requestReceiptIOS: () => Promise<string>;
/**
 * Get the pending purchases in IOS.
 * @returns {Promise<ProductPurchase[]>}
 */
export declare const getPendingPurchasesIOS: () => Promise<ProductPurchase[]>;
declare const _default: {
  IAPErrorCode: typeof IAPErrorCode;
  initConnection: () => Promise<string>;
  endConnectionAndroid: () => Promise<void>;
  getProducts: (skus: string[]) => Promise<InAppPurchase[]>;
  getSubscriptions: (skus: string[]) => Promise<SubscriptionPurchase[]>;
  getPurchaseHistory: () => Promise<(InAppPurchase | SubscriptionPurchase)[]>;
  getAvailablePurchases: () => Promise<
    (InAppPurchase | SubscriptionPurchase)[]
  >;
  getPendingPurchasesIOS: () => Promise<ProductPurchase[]>;
  consumeAllItemsAndroid: () => Promise<string[]>;
  buySubscription: (
    sku: string,
    oldSku: string,
    prorationMode: number,
  ) => Promise<SubscriptionPurchase>;
  buyProduct: (sku: string) => Promise<InAppPurchase>;
  buyProductWithQuantityIOS: (
    sku: string,
    quantity: number,
  ) => Promise<ProductPurchase>;
  clearProductsIOS: () => Promise<void>;
  clearTransactionIOS: () => Promise<string | void>;
  acknowledgePurchaseAndroid: (
    token: string,
    developerPayload: string,
  ) => Promise<void | PurchaseResult>;
  consumePurchaseAndroid: (
    token: string,
    developerPayload: string,
  ) => Promise<PurchaseResult>;
  validateReceiptIos: (
    receiptBody: object,
    isTest: boolean,
  ) => Promise<false | Apple.ReceiptValidationResponse>;
  validateReceiptAndroid: (
    packageName: string,
    productId: string,
    productToken: string,
    accessToken: string,
    isSub: boolean,
  ) => Promise<false | object>;
  addAdditionalSuccessPurchaseListenerIOS: (e: any) => EmitterSubscription;
  requestPurchase: (
    sku: string,
    andDangerouslyFinishTransactionAutomatically: boolean,
  ) => Promise<string>;
  requestPurchaseWithQuantityIOS: (
    sku: string,
    quantity: number,
  ) => Promise<string>;
  finishTransactionIOS: (transactionId: string) => Promise<string | void>;
  requestSubscription: (
    sku: string,
    oldSku: string,
    prorationMode: number,
  ) => Promise<string>;
  purchaseUpdatedListener: (e: any) => EmitterSubscription;
  purchaseErrorListener: (e: any) => EmitterSubscription;
  requestReceiptIOS: () => Promise<string>;
  getPromotedProductIOS: () => Promise<Product>;
  buyPromotedProductIOS: () => Promise<void>;
};
export default _default;

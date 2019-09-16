import { EmitterSubscription } from 'react-native';

import * as Apple from './apple';

interface ID extends string {}

interface Common {
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
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

export interface Product<ID> extends Common {
  type: 'inapp' | 'iap';
  productId: ID;
}

export interface Subscription<ID> extends Common {
  type: 'subs' | 'sub';
  productId: ID;

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

export type Purchase = InAppPurchase | SubscriptionPurchase;

/**
 * Init module for purchase flow. Required on Android. In ios it will check wheter user canMakePayment.
 * @returns {Promise<boolean>}
 */
export function initConnection(): Promise<boolean>;

/**
 * End billing client. Will enchance android app's performance by releasing service. No-op on iOS.
 * @returns {Promise<void>}
 */
export function endConnectionAndroid(): Promise<void>;

/**
 * Consume all items in android. No-op in iOS.
 * @returns {Promise<void>}
 */
export function consumeAllItemsAndroid(): Promise<void>;

/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 * @param skus The item skus
 */
export function getProducts<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string
>(
  skus: [A, B, C, D, E, F],
): Promise<
  [Product<A>, Product<B>, Product<C>, Product<D>, Product<E>, Product<F>]
>;
export function getProducts<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string
>(
  skus: [A, B, C, D, E],
): Promise<[Product<A>, Product<B>, Product<C>, Product<D>, Product<E>]>;
export function getProducts<
  A extends string,
  B extends string,
  C extends string,
  D extends string
>(
  skus: [A, B, C, D],
): Promise<[Product<A>, Product<B>, Product<C>, Product<D>]>;
export function getProducts<
  A extends string,
  B extends string,
  C extends string
>(skus: [A, B, C]): Promise<[Product<A>, Product<B>, Product<C>]>;
export function getProducts<A extends string, B extends string>(
  skus: [A, B],
): Promise<[Product<A>, Product<B>]>;
export function getProducts<A extends string>(skus: [A]): Promise<[Product<A>]>;
export function getProducts(skus: string[]): Promise<Product<string>[]>;

/**
 * Get a list of subscriptions
 * @param skus The item skus
 */
export function getSubscriptions<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string
>(
  skus: [A, B, C, D, E, F],
): Promise<
  [
    Subscription<A>,
    Subscription<B>,
    Subscription<C>,
    Subscription<D>,
    Subscription<E>,
    Subscription<F>,
  ]
>;
export function getSubscriptions<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string
>(
  skus: [A, B, C, D, E],
): Promise<
  [
    Subscription<A>,
    Subscription<B>,
    Subscription<C>,
    Subscription<D>,
    Subscription<E>,
  ]
>;
export function getSubscriptions<
  A extends string,
  B extends string,
  C extends string,
  D extends string
>(
  skus: [A, B, C, D],
): Promise<
  [Subscription<A>, Subscription<B>, Subscription<C>, Subscription<D>]
>;
export function getSubscriptions<
  A extends string,
  B extends string,
  C extends string
>(
  skus: [A, B, C],
): Promise<[Subscription<A>, Subscription<B>, Subscription<C>]>;
export function getSubscriptions<A extends string, B extends string>(
  skus: [A, B],
): Promise<[Subscription<A>, Subscription<B>]>;
export function getSubscriptions<A extends string>(
  skus: [A],
): Promise<[Subscription<A>]>;
export function getSubscriptions(
  skus: string[],
): Promise<Subscription<string>[]>;

/**
 * Gets an invetory of purchases made by the user regardless of consumption status
 * @returns {Promise<Purchase[]>}
 */
export function getPurchaseHistory(): Promise<Purchase[]>;

/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * @returns {Promise<Purchase[]>}
 */
export function getAvailablePurchases(): Promise<Purchase[]>;

/**
 * Request a purchase
 *
 * @param {string} sku The product's sku/ID
 * @param {boolean} andDangerouslyFinishTransactionAutomatically You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.
 * @returns {void}
 */
export function requestPurchase(
  sku: string,
  andDangerouslyFinishTransactionAutomatically?: boolean,
): void;

/**
 * Request a subscription to a sku
 *
 * @param {string} sku The product's sku/ID
 * @param {string} [oldSku] Optional old product's ID for upgrade/downgrade (Android only)
 * @param {number} [prorationMode] Optional proration mode for upgrade/downgrade (Android only)
 * @returns {void}
 */
export function requestSubscription(
  sku: string,
  oldSku?: string,
  prorationMode?: number,
): void;

/**
 * Buy a product with offer
 *
 * @param {string} sku The product unique identifier
 * @param {string} forUser An user identifier on your service (username or user id)
 * @param {Apple.PaymentDiscount} withOffer The offer information
 *
 * @returns {void}
 */
export function requestPurchaseWithOfferIOS(
  sku: string,
  forUser: string,
  withOffer: Apple.PaymentDiscount,
): void;

/**
 * Request a purchase with specified quantity (iOS only)
 *
 * @param {string} sku The product's sku/ID
 * @param {number} quantity The amount of product to buy
 * @returns {Promise<Purchase>}
 */
export function requestPurchaseWithQuantityIOS(
  sku: string,
  quantity: number,
): void;

/**
 * Finish Transaction (iOS only)
 *   Similar to `consumePurchaseAndroid`. Tells StoreKit that you have delivered the purchase to the user and StoreKit can now let go of the transaction.
 *   Call this after you have persisted the purchased state to your server or local data in your app.
 *   `react-native-iap` will continue to deliver the purchase updated events with the successful purchase until you finish the transaction. **Even after the app has relaunched.**
 * @param {string} transactionId The transactionId of the function that you would like to finish.
 * @returns {null}
 */
export function finishTransactionIOS(transactionId: string): void;

/**
 * Clear Transaction (iOS only)
 *   Finish remaining transactions. Related to issue #257
 *     link : https://github.com/dooboolab/react-native-iap/issues/257
 * @returns void
 */
export function clearTransactionIOS(): void;

/**
 * Clear valid Products (iOS only)
 *   Remove all products which are validated by Apple server.
 * @returns {null}
 */
export function clearProductsIOS(): void;

/**
 * Acknowledge a purchase (on Android.) No-op on iOS.
 * This is applied to non-consumable or subscriptions.
 * @param {string} token The product's token (on Android)
 * @returns {Promise}
 */
export function acknowledgePurchaseAndroid(
  token: string,
  developerPayload?: string,
): Promise<PurchaseResult>;

/**
 * Consume a purchase (on Android.) No-op on iOS.
 * It acknowledges consumable products. If it isn't consumable, use `acknowledgePurchaseAndroid` instead.
 * @param {string} token The product's token (on Android)
 * @returns {Promise}
 */
export function consumePurchaseAndroid(
  token: string,
  developerPayload?: string,
): Promise<PurchaseResult>;

/**
 * Validate receipt for iOS.
 * @param receiptBody the receipt body to send to apple server.
 * @param isTest whether this is in test environment which is sandbox.
 */
export function validateReceiptIos(
  receiptBody: Apple.ReceiptValidationRequest,
  isTest: boolean,
): Promise<Apple.ReceiptValidationResponse | false>;

/**
 * Validate receipt for Android.
 * @param packageName package name of your app.
 * @param productId product id for your in app product.
 * @param productToken token for your purchase. Found in `transanctionReceipt` after `requestPurchase` method.
 * @param accessToken accessToken from googleApis.
 * @param isSub whether this is subscription or inapp. `true` for subscription.
 */
export function validateReceiptAndroid(
  packageName: string,
  productId: string,
  productToken: string,
  accessToken: string,
  isSub: boolean,
): Promise<object | false>;

/**
 * Subscribe a listener when purchase is updated.
 * @returns {callback(e: ProductPurchase)}
 */
export function purchaseUpdatedListener(fn: Function): EmitterSubscription;

/**
 * Subscribe a listener when purchase got error.
 * @returns {callback(e: PurchaseError)}
 */
export function purchaseErrorListener(fn: Function): EmitterSubscription;

/**
 * Request current receipt base64 encoded (IOS only)
 * @returns {Promise<string>}
 */
export function getReceiptIOS(): Promise<string>;

/**
 * Request all the pending transactions (IOS only)
 * @returns {Promise<ProductPurchase[]>}
 */
export function getPendingPurchasesIOS(): Promise<ProductPurchase[]>;

import * as Apple from './apple'

export type SkuTypeAndroid = 'INAPP' | 'SUBS'
export type SkuTypeIOS = 'iap' | 'sub'

export interface SkuTypes {
  android: { [key: string]: SkuTypeAndroid }
  ios: { [key: string]: SkuTypeIOS }
}

export const SkuTypes: SkuTypes

export interface Product<ID extends string = string> {
  type: SkuTypeAndroid | SkuTypeIOS;
  productId: ID;
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
  subscriptionPeriodNumberIOS: string;
  subscriptionPeriodUnitIOS: number;
  subscriptionPeriodAndroid: string;
  introductoryPriceCyclesAndroid: number;
  introductoryPricePeriodAndroid: string;
  freeTrialPeriodAndroid: string;
}

export interface Subscription<ID extends string = string> extends Product<ID> {

}

export interface ProductPurchase {
  productId: string;
  transactionId: string;
  transactionDate: string;
  transactionReceipt: string;
  signatureAndroid?: string;
  dataAndroid?: string;
}

export interface SubscriptionPurchase extends ProductPurchase {
  autoRenewingAndroid: boolean;
  originalTransactionDateIOS: string;
  originalTransactionIdentifierIOS: string;
}

export type Purchase = ProductPurchase | SubscriptionPurchase

/**
 * Prepare module for purchase flow. Required on Android. No-op on iOS.
 * @returns {Promise<string>}
 */
export function prepare() : Promise<string>;

/**
 * End billing client. Will enchance android app's performance by releasing service. No-op on iOS.
 * @returns {Promise<void>}
 */
export function endConnection() : Promise<void>;

/**
 * Consume all items in android. No-op in iOS.
 * @returns {Promise<void>}
 */
export function consumeAllItems() : Promise<void>;

/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 * @param skus The item skus
 */
export function getProducts<A extends string, B extends string, C extends string, D extends string, E extends string, F extends string>(skus: [A, B, C, D, E, F]): Promise<[Product<A>, Product<B>, Product<C>, Product<D>, Product<E>, Product<F>]>;
export function getProducts<A extends string, B extends string, C extends string, D extends string, E extends string>(skus: [A, B, C, D, E]): Promise<[Product<A>, Product<B>, Product<C>, Product<D>, Product<E>]>;
export function getProducts<A extends string, B extends string, C extends string, D extends string>(skus: [A, B, C, D]): Promise<[Product<A>, Product<B>, Product<C>, Product<D>]>;
export function getProducts<A extends string, B extends string, C extends string>(skus: [A, B, C]): Promise<[Product<A>, Product<B>, Product<C>]>;
export function getProducts<A extends string, B extends string>(skus: [A, B]): Promise<[Product<A>, Product<B>]>;
export function getProducts<A extends string>(skus: [A]): Promise<[Product<A>]>;
export function getProducts(skus: string[]): Promise<Product[]>;

/**
 * Get a list of subscriptions
 * @param skus The item skus
 */
export function getSubscriptions<A extends string, B extends string, C extends string, D extends string, E extends string, F extends string>(skus: [A, B, C, D, E, F]): Promise<[Subscription<A>, Subscription<B>, Subscription<C>, Subscription<D>, Subscription<E>, Subscription<F>]>;
export function getSubscriptions<A extends string, B extends string, C extends string, D extends string, E extends string>(skus: [A, B, C, D, E]): Promise<[Subscription<A>, Subscription<B>, Subscription<C>, Subscription<D>, Subscription<E>]>;
export function getSubscriptions<A extends string, B extends string, C extends string, D extends string>(skus: [A, B, C, D]): Promise<[Subscription<A>, Subscription<B>, Subscription<C>, Subscription<D>]>;
export function getSubscriptions<A extends string, B extends string, C extends string>(skus: [A, B, C]): Promise<[Subscription<A>, Subscription<B>, Subscription<C>]>;
export function getSubscriptions<A extends string, B extends string>(skus: [A, B]): Promise<[Subscription<A>, Subscription<B>]>;
export function getSubscriptions<A extends string>(skus: [A]): Promise<[Subscription<A>]>;
export function getSubscriptions(skus: string[]): Promise<Subscription[]>;

/**
 * Gets an invetory of purchases made by the user regardless of consumption status
 * @returns {Promise<Purchase[]>}
 */
export function getPurchaseHistory() : Promise<Purchase[]>;

/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * @returns {Promise<Purchase[]>}
 */
export function getAvailablePurchases() : Promise<Purchase[]>;

/**
 * Create a subscription to a sku
 * @param {string} sku The product's sku/ID
 * @param {string} [oldSku] Optional old product's ID for upgrade/downgrade (Android only)
 * @returns {Promise<Purchase>}
 */
export function buySubscription(sku: string, oldSku?: string) : Promise<SubscriptionPurchase>;

/**
 * Buy a product
 * @param {string} sku The product's sku/ID
 * @returns {Promise<Purchase>}
 */
export function buyProduct(sku: string) : Promise<ProductPurchase>;

/**
 * Buy a product without finish transanction to sync with IOS purchasing consumables. Make sure to call finishTransanction when you are done with it or the purchase may not be transferred. Also, note that this method is not changed from buyProduct in android.
 * @param {string} sku The product's sku/ID
 * @returns {Promise<Purchase>}
 */
export function buyProductWithoutFinishTransaction(sku: string) : Promise<ProductPurchase>;

/**
 * Send finishTransaction call to Apple IAP server. Call this function after receipt validation process.
 * @returns void
 */
export function finishTransaction(): void;

/**
 * Consume a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise}
 */
export function consumePurchase(token: string) : Promise<void>;

/**
 * Validate receipt for iOS.
 * @param receiptBody the receipt body to send to apple server.
 * @param isTest whether this is in test environment which is sandbox.
 * @param RNVersion version of react-native.
 */
export function validateReceiptIos(receiptBody: Apple.ReceiptValidationRequest, isTest: boolean, RNVersion: number): Promise<Apple.ReceiptValidationResponse | false>;

/**
 * Validate receipt for Android.
 * @param packageName package name of your app.
 * @param productId product id for your in app product.
 * @param productToken token for your purchase. Found in `transanctionReceipt` after `buyProduct` method.
 * @param accessToken accessToken from googleApis.
 * @param isSub whether this is subscription or inapp. `true` for subscription.
 * @param RNVersion version of react-native.
 */
export function validateReceiptAndroid(packageName: string, productId: string, productToken: string, accessToken: string, isSub: boolean, RNVersion: number): Promise<object | false>;

import * as Apple from './apple'

interface Common {
  title: string
  description: string
  price: string
  currency: string
  localizedPrice: string
  localeIOS: string
}

export interface Product<ID extends string> extends Common {
  type: 'inapp' | 'iap'
  productId: ID
}

export interface Subscription<ID extends string> extends Common {
  type: 'subs' | 'sub'
  productId: ID

  subscriptionPeriodNumberIOS?: string
  subscriptionPeriodUnitIOS?: number

  freeTrialPeriodAndroid?: string
  introductoryPriceCyclesAndroid?: number
  introductoryPricePeriodAndroid?: string
  subscriptionPeriodAndroid?: string
}

export interface ProductPurchase {
  productId: string;
  transactionId: string;
  transactionDate: string;
  transactionReceipt: string;
  signatureAndroid?: string;
  dataAndroid?: string;
  purchaseToken?: string;
}

export interface SubscriptionPurchase extends ProductPurchase {
  autoRenewingAndroid: boolean;
  originalTransactionDateIOS: string;
  originalTransactionIdentifierIOS: string;
}

export type Purchase = ProductPurchase | SubscriptionPurchase

/**
 * @deprecated Deprecated since 2.0.0. Prepare module for purchase flow. Required on Android. No-op on iOS.
 * @returns {Promise<string>}
 */
export function prepare() : Promise<string>;

/**
 * Init module for purchase flow. Required on Android. In ios it will check wheter user canMakePayment.
 * @returns {Promise<string>}
 */
export function initConnection() : Promise<string>;

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
export function getProducts(skus: string[]): Promise<Product<string>[]>;

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
export function getSubscriptions(skus: string[]): Promise<Subscription<string>[]>;

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
 * @param {number} [prorationMode] Optional proration mode for upgrade/downgrade (Android only)
 * @returns {Promise<Purchase>}
 */
export function buySubscription(sku: string, oldSku?: string, prorationMode?: number) : Promise<SubscriptionPurchase>;

/**
 * Buy a product
 * @param {string} sku The product's sku/ID
 * @returns {Promise<Purchase>}
 */
export function buyProduct(sku: string) : Promise<ProductPurchase>;

/**
 * Buy a product with a specified quantity (iOS only)
 * @param {string} sku The product's sku/ID
 * @param {number} quantity The amount of product to buy
 * @returns {Promise<Purchase>}
 */
export function buyProductWithQuantityIOS(sku: string, quantity: number) : Promise<ProductPurchase>;

/**
 * Buy a product without finish transanction to sync with IOS purchasing consumables. Make sure to call finishTransanction when you are done with it or the purchase may not be transferred. Also, note that this method is not changed from buyProduct in android.
 * @param {string} sku The product's sku/ID
 * @returns {Promise<Purchase>}
 */
export function buyProductWithoutFinishTransaction(sku: string) : Promise<ProductPurchase>;

/**
 * Clear Transaction (iOS only)
 *   Finish remaining transactions. Related to issue #257
 *     link : https://github.com/dooboolab/react-native-iap/issues/257
 * @returns void
 */
export function clearTransaction(): void;

/**
 * Clear valid Products (iOS only)
 *   Remove all products which are validated by Apple server.
 * @returns {null}
 */
export function clearProducts(): void;

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
 */
export function validateReceiptIos(receiptBody: Apple.ReceiptValidationRequest, isTest: boolean): Promise<Apple.ReceiptValidationResponse | false>;

/**
 * Validate receipt for Android.
 * @param packageName package name of your app.
 * @param productId product id for your in app product.
 * @param productToken token for your purchase. Found in `transanctionReceipt` after `buyProduct` method.
 * @param accessToken accessToken from googleApis.
 * @param isSub whether this is subscription or inapp. `true` for subscription.
 */
export function validateReceiptAndroid(packageName: string, productId: string, productToken: string, accessToken: string, isSub: boolean): Promise<object | false>;

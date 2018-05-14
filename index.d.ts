export type SkuTypeAndroid = 'INAPP' | 'SUBS'
export type SkuTypeIOS = 'iap' | 'sub'

export interface SkuTypes {
  android: { [key: string]: SkuTypeAndroid }
  ios: { [key: string]: SkuTypeIOS }
}

export const SkuTypes: SkuTypes

export interface Product {
  type: SkuTypeAndroid | SkuTypeIOS;
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
}

export interface Subscription extends Product {

}

export interface ProductPurchase {
  productId: string;
  transactionId: string;
  transactionDate: string;
  transactionReceipt: string;
}

export interface SubscriptionPurchase extends ProductPurchase {
  autoRenewing: boolean;
}

export type Purchase = ProductPurchase | SubscriptionPurchase

/**
 * Prepare module for purchase flow. Required on Android. No-op on iOS.
 * @returns {Promise<void>}
 */
export function prepare() : Promise<void>;

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
 * @param {string[]} skus The item skus
 * @returns {Promise<Product[]>}
 */
export function getProducts(skus: string[]) : Promise<Product[]>;

/**
 * Get a list of subscriptions
 * @param {string[]} skus The item skus
 * @returns {Promise<Subscription[]>}
 */
export function getSubscriptions(skus: string[]) : Promise<Subscription[]>;

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
 * @returns {Promise<Purchase>}
 */
export function buySubscription(sku: string) : Promise<SubscriptionPurchase>;

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
 * Validate receipt for ios.
 * @param {receipt-data: string, password?: string} receiptBody the receipt body to send to apple server.
 * @param {string} isTest whether this is in test environment which is sandbox.
 * @param {number} RNVersion version of react-native.
 * @returns {json | boolean}
 */
export function validateReceiptIos(receiptBody: object, isTest:boolean) : object | boolean;

/**
 * Validate receipt for ios.
 * @param {string} packageName package name of your app.
 * @param {string} productId product id for your in app product.
 * @param {string} productToken token for your purchase. Found in `transanctionReceipt` after `buyProduct` method.
 * @param {string} accessToken accessToken from googleApis.
 * @param {boolean} isSub whether this is subscription or inapp. `true` for subscription.
 * @param {number} RNVersion version of react-native.
 * @returns {json | boolean}
 */
export function validateReceiptAndroid (packageName: string, productId: string, productToken: string, accessToken: string, isSub: boolean);

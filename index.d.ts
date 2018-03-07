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
 * Consume a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise}
 */
export function consumePurchase(token: string) : Promise<void>;

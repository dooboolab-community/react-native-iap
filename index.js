
import { NativeModules, Platform } from 'react-native';

const { RNIapIos, RNIapModule } = NativeModules;

const ANDROID_ITEM_TYPE_SUBSCRIPTION = 'subs';
const ANDROID_ITEM_TYPE_IAP = 'inapp';
const IOS_ITEM_TYPE_SUBSCRIPTION = 'sub';
const IOS_ITEM_TYPE_IAP = 'iap';

/**
 * Prepare module for purchase flow. Required on Android. No-op on iOS.
 * @returns {Promise<void>}
 */
export const prepare = () => Platform.select({
  ios: () => Promise.resolve(),
  android: () => RNIapModule.prepare()
})();

/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 * @param {string[]} skus The item skus
 * @returns {Promise<Product[]>}
 */
export const getProducts = (skus) => Platform.select({
  ios: () => RNIapIos.getItems(skus)
    .then(items => items.filter(item => item.type === IOS_ITEM_TYPE_IAP && skus.indexOf(item.productId) > -1)),
  android: () => RNIapModule.getItemsByType(ANDROID_ITEM_TYPE_IAP, skus)
})();

/**
 * Get a list of subscriptions
 * @param {string[]} skus The item skus
 * @returns {Promise<Subscription[]>}
 */
export const getSubscriptions = (skus) => Platform.select({
  ios: () => RNIapIos.getItems(skus)
    .then(items => items.filter(item => item.type === IOS_ITEM_TYPE_SUBSCRIPTION && skus.indexOf(item.productId) > -1)),
  android: () => RNIapModule.getItemsByType(ANDROID_ITEM_TYPE_SUBSCRIPTION, skus)
})();

/**
 * Gets an invetory of purchases made by the user regardless of consumption status
 * @returns {Promise<Purchase[]>}
 */
export const getPurchaseHistory = () => Platform.select({
  ios: () => RNIapIos.getAvailableItems(),
  android: () => async () => {
    let products = RNIapModule.getPurchaseHistoryByType(ANDROID_ITEM_TYPE_IAP);
    let subscriptions = RNIapModule.getPurchaseHistoryByType(ANDROID_ITEM_TYPE_SUBSCRIPTION);
    return products.concat(subscriptions);
  }
})();

/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * @returns {Promise<Purchase[]>}
 */
export const getAvailablePurchases = () => Platform.select({
  ios: () => RNIapIos.getAvailableItems(),
  android: () => async () => {
    let products = RNIapModule.getAvailableItemsByType(ANDROID_ITEM_TYPE_IAP);
    let subscriptions = RNIapModule.getAvailableItemsByType(ANDROID_ITEM_TYPE_SUBSCRIPTION);
    return products.concat(subscriptions);
  }
})();

/**
 * Create a subscription to a sku
 * @param {string} sku The product's sku/ID
 * @returns {Promise<SubscriptionPurchase>}
 */
export const buySubscription = (sku) => Platform.select({
  ios: () => RNIapIos.buyProduct(sku),
  android: () => RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_SUBSCRIPTION, sku)
})();

/**
 * Buy a product
 * @param {string} sku The product's sku/ID
 * @returns {Promise<ProductPurchase>}
 */
export const buyProduct = (sku) => Platform.select({
  ios: () => RNIapIos.buyProduct(sku),
  android: () => RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_INAPP_PRODUCT, sku)
})();

/**
 * Consume a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise}
 */
export const consumeProduct = (token) => Platform.select({
  ios: () => Promise.resolve(), // Consuming is a no-op on iOS, as soon as the product is purchased it is considered consumed.
  android: () => RNIapModule.consumeProduct(token)
})();

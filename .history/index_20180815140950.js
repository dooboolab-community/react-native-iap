
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
  ios: () => RNIapIos.canMakePayments(),
  android: () => RNIapModule.prepare()
})();

/**
 * End module for purchase flow. Required on Android. No-op on iOS.
 * @returns {Promise<void>}
 */
export const endConnection = () => Platform.select({
  ios: () => Promise.resolve(),
  android: () => RNIapModule.endConnection()
})();

/**
 * Consume all remaining tokens. Android only.
 * @returns {Promise<void>}
 */
export const consumeAllItems = () => Platform.select({
  ios: () => Promise.resolve(),
  android: () => RNIapModule.refreshItems(),
})();

/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 * @param {string[]} skus The item skus
 * @returns {Promise<Product[]>}
 */
export const getProducts = (skus) => Platform.select({
  ios: () => RNIapIos.getItems(skus)
    .then(items => items.filter(item => item.productId)),
  android: () => RNIapModule.getItemsByType(ANDROID_ITEM_TYPE_IAP, skus)
})();

/**
 * Get a list of subscriptions
 * @param {string[]} skus The item skus
 * @returns {Promise<Subscription[]>}
 */
export const getSubscriptions = (skus) => Platform.select({
  ios: () => RNIapIos.getItems(skus)
    .then(items => items.filter(item => item.productId)),
  android: () => RNIapModule.getItemsByType(ANDROID_ITEM_TYPE_SUBSCRIPTION, skus)
})();

/**
 * Gets an invetory of purchases made by the user regardless of consumption status
 * @returns {Promise<Purchase[]>}
 */
export const getPurchaseHistory = () => Platform.select({
  ios: () => RNIapIos.getAvailableItems(),
  android: async () => {
    let products = await RNIapModule.getPurchaseHistoryByType(ANDROID_ITEM_TYPE_IAP);
    let subscriptions = await RNIapModule.getPurchaseHistoryByType(ANDROID_ITEM_TYPE_SUBSCRIPTION);
    return products.concat(subscriptions);
  }
})();

/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * @returns {Promise<Purchase[]>}
 */
export const getAvailablePurchases = () => Platform.select({
  ios: () => RNIapIos.getAvailableItems(),
  android: async () => {
    let products = await RNIapModule.getAvailableItemsByType(ANDROID_ITEM_TYPE_IAP);
    let subscriptions = await RNIapModule.getAvailableItemsByType(ANDROID_ITEM_TYPE_SUBSCRIPTION);
    return products.concat(subscriptions);
  }
})();

/**
 * Create a subscription to a sku
 * @param {string} sku The product's sku/ID
 * @param {string} [oldSku] Optional old product's ID for upgrade/downgrade (Android only)
 * @returns {Promise<SubscriptionPurchase>}
 */
export const buySubscription = (sku, oldSku) => Platform.select({
  ios: () => RNIapIos.buyProduct(sku),
  android: () => RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_SUBSCRIPTION, sku, oldSku)
})();

/**
 * Buy a product
 * @param {string} sku The product's sku/ID
 * @returns {Promise<ProductPurchase>}
 */
export const buyProduct = (sku) => Platform.select({
  ios: () => RNIapIos.buyProduct(sku),
  android: () => RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_IAP, sku, null)
})();

/**
 * Buy a product with a specified quantity (iOS only)
 *   Call finishTransaction after receipt validation process.
 * @param {string} sku The product's sku/ID
 * @param {number} quantity The amount of product to buy
 * @returns {Promise<ProductPurchase>}
 */
export const buyProductWithQuantity = (sku, quantity) => Platform.select({
  ios: () => RNIapIos.buyProductWithQuantity(sku, quantity),
  android: () => RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_IAP, sku, null)
})();

/**
 * Buy a product without transaction finish (iOS only)
 *   Call finishTransaction after receipt validation process.
 * @param {string} sku The product's sku/ID
 * @param {number} quantity The amount of product to buy (optional, default = 1)
 * @returns {Promise<ProductPurchase>}
 */
export const buyProductWithoutFinishTransaction = (sku, quantity = 1) => Platform.select({
  ios: () => RNIapIos.buyProductWithoutAutoConfirm(sku, quantity),
  android: () => RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_IAP, sku, null)
})();




export const getPendingPurchases = () => Platform.select({
  ios: () => RNIapIos.getPendingPurchases(),
  android: () => Promise.resolve(),
})();






/**
 * Finish Transaction (iOS only)
 *   Explicitly call transaction finish
 * @returns {Promise<ProductPurchase>}
 */
export const finishTransaction = () => Platform.select({
  ios: () => RNIapIos.finishTransaction(),
  android: () => Promise.resolve(),
})();

/**
 * Consume a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise}
 */
export const consumePurchase = (token) => Platform.select({
  ios: () => Promise.resolve(), // Consuming is a no-op on iOS, as soon as the product is purchased it is considered consumed.
  android: () => RNIapModule.consumeProduct(token)
})();

/**
 * Validate receipt for ios.
 * @param {receipt-data: string, password?: string} receiptBody the receipt body to send to apple server.
 * @param {string} isTest whether this is in test environment which is sandbox.
 * @param {number} RNVersion version of react-native.
 * @returns {json | boolean}
 */
export const validateReceiptIos = async (receiptBody, isTest, RNVersion) => {
  if (Platform.OS === 'ios') {
    const URL = isTest ? 'https://sandbox.itunes.apple.com/verifyReceipt' : 'https://buy.itunes.apple.com/verifyReceipt';
    try {
      let res = await fetch(URL, {
        method: 'POST',
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(receiptBody),
      });

      if (res) {
        if (RNVersion < 54) {
          const json = JSON.parse(res._bodyInit);
          return json;
        }
  
        const json = await res.text();
        res = JSON.parse(json);
        return res;
      }
  
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  console.log('No ops in android.');
  return false;
};

/**
 * Validate receipt for ios.
 * @param {string} packageName package name of your app.
 * @param {string} productId product id for your in app product.
 * @param {string} productToken token for your purchase.
 * @param {string} accessToken accessToken from googleApis.
 * @param {boolean} isSub whether this is subscription or inapp. `true` for subscription.
 * @param {number} RNVersion version of react-native.
 * @returns {json | boolean}
 */
export const validateReceiptAndroid = async (packageName, productId, productToken, accessToken, isSub, RNVersion) => {
  const URL = !isSub
    ? `https://www.googleapis.com/androidpublisher/v2/applications/${packageName}/purchases/products/${productId}/tokens/${productToken}?access_token=${accessToken}`
    : `https://www.googleapis.com/androidpublisher/v2/applications/${packageName}/purchases/subscriptions/${productId}/tokens/${productToken}?access_token=${accessToken}`;
  try {
    let res = await fetch(URL, {
      method: 'GET',
      headers: new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }),
    });

    if (res) {
      if (RNVersion < 54) {
        const json = JSON.parse(res._bodyInit);
        return json;
      }
  
      const json = await res.text();
      res = JSON.parse(json);
    }

    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export default {
  prepare,
  endConnection,
  getProducts,
  getSubscriptions,
  getPurchaseHistory,
  getAvailablePurchases,
  consumeAllItems,
  buySubscription,
  buyProduct,
  buyProductWithQuantity,
  buyProductWithoutFinishTransaction,
  getPendingPurchases,
  finishTransaction,
  consumePurchase,
  validateReceiptIos,
  validateReceiptAndroid
};

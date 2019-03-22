
import { NativeModules, Platform, NativeEventEmitter } from 'react-native';

const { RNIapIos, RNIapModule } = NativeModules;

const ANDROID_ITEM_TYPE_SUBSCRIPTION = 'subs';
const ANDROID_ITEM_TYPE_IAP = 'inapp';
const IOS_ITEM_TYPE_SUBSCRIPTION = 'sub';
const IOS_ITEM_TYPE_IAP = 'iap';

export const PROMOTED_PRODUCT = 'iap-promoted-product';

/**
 * @deprecated Deprecated since 2.0.0. Use initConnection instead.
 * @returns {Promise<void>}
 */
export const prepare = () => {
  console.warn('The `prepare` method is deprecated. Use initConnection method instead.');
  Platform.select({
    ios: async() => {
      this.checkNativeiOSAvailable();
      return RNIapIos.canMakePayments();
    },
    android: async() => {
      this.checkNativeAndroidAvailable();
      return RNIapModule.initConnection();
    }
  })();
};

checkNativeAndroidAvailable = () => {
  if (!RNIapModule) {
    // throw new Error(
    //  'RNIapModule: not  available'
    // );
    return Promise.reject('E_IAP_NOT_AVAILABLE', 'The payment setup is not available in this version of the app. Contact admin.');
  }
};

checkNativeiOSAvailable = () => {
  if (!RNIapIos) {
    return Promise.reject('E_IAP_NOT_AVAILABLE', 'The payment setup is not available in this version of the app. Contact admin.');
  }
};
/**
 * Init module for purchase flow. Required on Android. In ios it will check wheter user canMakePayment.
 * @returns {Promise<string>}
 */
export const initConnection = () => Platform.select({
  ios: async() => {
    if (!RNIapIos) {
      return Promise.resolve();
    }
    return RNIapIos.canMakePayments();
  },
  android: async() => {
    if (!RNIapModule) {
      return Promise.resolve();
    }
    return RNIapModule.initConnection();
  },
})();

/**
 * End module for purchase flow. Required on Android. No-op on iOS.
 * @returns {Promise<void>}
 */
export const endConnection = () => Platform.select({
  ios: async() => Promise.resolve(),
  android: async() => {
    if (!RNIapModule) {
      return Promise.resolve();
    }
    return RNIapModule.endConnection(); 
  }
})();

/**
 * Consume all remaining tokens. Android only.
 * @returns {Promise<void>}
 */
export const consumeAllItems = () => Platform.select({
  ios: async() => Promise.resolve(),
  android: async() => {
    this.checkNativeAndroidAvailable();
    return RNIapModule.refreshItems();
  }
})();

/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 * @param {string[]} skus The item skus
 * @returns {Promise<Product[]>}
 */
export const getProducts = (skus) => Platform.select({
  ios: async() => {
    if (!RNIapIos) {
      return [];
    }
    return RNIapIos.getItems(skus)
    .then((items) => items.filter((item) => item.productId));
  },
  android: async() => {
    if (!RNIapModule) {
      return [];
    }
    return RNIapModule.getItemsByType(ANDROID_ITEM_TYPE_IAP, skus);
  }
})();

/**
 * Get a list of subscriptions
 * @param {string[]} skus The item skus
 * @returns {Promise<Subscription[]>}
 */
export const getSubscriptions = (skus) => Platform.select({
  ios: async() => {
    this.checkNativeiOSAvailable();
    return RNIapIos.getItems(skus)
    .then((items) => items.filter((item) => item.productId));
  },
  android: async() => {
    this.checkNativeAndroidAvailable();
    return RNIapModule.getItemsByType(ANDROID_ITEM_TYPE_SUBSCRIPTION, skus);
  }
})();

/**
 * Gets an invetory of purchases made by the user regardless of consumption status
 * @returns {Promise<Purchase[]>}
 */
export const getPurchaseHistory = () => Platform.select({
  ios: async() => {
    this.checkNativeiOSAvailable();
    return RNIapIos.getAvailableItems();
  },
  android: async() => {
    this.checkNativeAndroidAvailable();
    let products = await RNIapModule.getPurchaseHistoryByType(ANDROID_ITEM_TYPE_IAP);
    let subscriptions = await RNIapModule.getPurchaseHistoryByType(ANDROID_ITEM_TYPE_SUBSCRIPTION);
    return products.concat(subscriptions);
  },
})();

/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * @returns {Promise<Purchase[]>}
 */
export const getAvailablePurchases = () => Platform.select({
  ios: async() => {
    this.checkNativeiOSAvailable();
    return RNIapIos.getAvailableItems();
  },
  android: async() => {
    this.checkNativeAndroidAvailable();
    let products = await RNIapModule.getAvailableItemsByType(ANDROID_ITEM_TYPE_IAP);
    let subscriptions = await RNIapModule.getAvailableItemsByType(ANDROID_ITEM_TYPE_SUBSCRIPTION);
    return products.concat(subscriptions);
  },
})();

/**
 * Create a subscription to a sku
 * @param {string} sku The product's sku/ID
 * @param {string} [oldSku] Optional old product's ID for upgrade/downgrade (Android only)
 * @param {number} [prorationMode] Optional proration mode for upgrade/downgrade (Android only)
 * @returns {Promise<SubscriptionPurchase>}
 */
export const buySubscription = (sku, oldSku, prorationMode) => {
  return Platform.select({
    ios: async() => {
      this.checkNativeiOSAvailable();
      return RNIapIos.buyProduct(sku);
    },
    android: async() => {
      this.checkNativeAndroidAvailable();
      if (!prorationMode) prorationMode = -1;
      return RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_SUBSCRIPTION, sku, oldSku, prorationMode);
    },
  })();
};

/**
 * Buy a product
 * @param {string} sku The product's sku/ID
 * @returns {Promise<ProductPurchase>}
 */
export const buyProduct = (sku) => Platform.select({
  ios: async() => {
    this.checkNativeiOSAvailable();
    return RNIapIos.buyProduct(sku);
  },
  android: async() => {
    this.checkNativeAndroidAvailable();
    return RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_IAP, sku, null, 0);
  }
})();

/**
 * Buy a product with a specified quantity (iOS only)
 * @param {string} sku The product's sku/ID
 * @param {number} quantity The amount of product to buy
 * @returns {Promise<ProductPurchase>}
 */
export const buyProductWithQuantityIOS = (sku, quantity) => Platform.select({
  ios: async() => {
    this.checkNativeiOSAvailable();
    return RNIapIos.buyProductWithQuantityIOS(sku, quantity);
  },
  android: async() => Promise.resolve(),
})();

/**
 * Buy a product without transaction finish (iOS only)
 *   Call finishTransaction after receipt validation process.
 * @param {string} sku The product's sku/ID
 * @returns {Promise<ProductPurchase>}
 */
export const buyProductWithoutFinishTransaction = (sku) => Platform.select({
  ios: async() => {
    this.checkNativeiOSAvailable();
    return RNIapIos.buyProductWithoutAutoConfirm(sku);
  },
  android: async() => {
    this.checkNativeAndroidAvailable();
    return RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_IAP, sku, null, 0);
  }
})();

/**
 * Finish Transaction (iOS only)
 *   Explicitly call transaction finish
 * @returns {Promise<ProductPurchase>}
 */
export const finishTransaction = () => Platform.select({
  ios: async() => {
    this.checkNativeiOSAvailable();
    return RNIapIos.finishTransaction();
  },
  android: async() => Promise.resolve(),
})();

/**
 * Clear Transaction (iOS only)
 *   Finish remaining transactions. Related to issue #257
 *     link : https://github.com/dooboolab/react-native-iap/issues/257
 * @returns {null}
 */
export const clearTransaction = () => Platform.select({
  ios: async() => {
    this.checkNativeiOSAvailable();
    return RNIapIos.clearTransaction();
  },
  android: async() => Promise.resolve(),
})();

/**
 * Clear valid Products (iOS only)
 *   Remove all products which are validated by Apple server.
 * @returns {null}
 */
export const clearProducts = () => Platform.select({
  ios: async() => {
    this.checkNativeiOSAvailable();
    return RNIapIos.clearProducts();
  },
  android: async() => Promise.resolve,
})();

/**
 * Consume a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise}
 */
export const consumePurchase = (token) => Platform.select({
  ios: async() => Promise.resolve(), // Consuming is a no-op on iOS, as soon as the product is purchased it is considered consumed.
  android: async() => {
    this.checkNativeAndroidAvailable();
    return RNIapModule.consumeProduct(token);
  }
})();

/**
 * Should Add Store Payment (iOS only)
 *   Indicates the the App Store purchase should continue from the app instead of the App Store.
 * @returns {null}
 */
export const getPromotedProduct = () => Platform.select({
  ios: async() => {
    this.checkNativeiOSAvailable();
    return RNIapIos.promotedProduct();
  },
  android: async() => Promise.resolve(),
})();

/**
 * Buy the currently selected promoted product (iOS only)
 *   Initiates the payment process for a promoted product. Should only be called in response to the `iap-promoted-product` event. * @returns {null}
 */
export const buyPromotedProduct = () => Platform.select({
  ios: async() => {
    this.checkNativeiOSAvailable();
    return RNIapIos.buyPromotedProduct();
  },
  android: async() => Promise.resolve(),
})();

/**
 * Validate receipt for iOS.
 * @param {object} receiptBody the receipt body to send to apple server.
 * @param {string} isTest whether this is in test environment which is sandbox.
 * @returns {Promise<object>}
 */
export const validateReceiptIos = async(receiptBody, isTest) => {
  const url = isTest ? 'https://sandbox.itunes.apple.com/verifyReceipt' : 'https://buy.itunes.apple.com/verifyReceipt';

  const response = await fetch(url, {
    method: 'POST',
    headers: new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(receiptBody),
  });

  if (!response.ok) {
    throw Object.assign(new Error(response.statusText), { statusCode: response.status });
  }

  return response.json();
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
export const validateReceiptAndroid = async(packageName, productId, productToken, accessToken, isSub) => {
  const type = (isSub ? 'subscriptions' : 'products');
  const url = `https://www.googleapis.com/androidpublisher/v2/applications/${packageName}/purchases/${type}/${productId}/tokens/${productToken}?access_token=${accessToken}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: new Headers({ 'Accept': 'application/json' }),
  });

  if (!response.ok) {
    throw Object.assign(new Error(response.statusText), { statusCode: response.status });
  }

  return response.json();
};

/**
 * Add IAP purchase event in ios.
 * @returns {callback(e: Event)}
 */
export const addAdditionalSuccessPurchaseListenerIOS = (e) => {
  if (Platform.OS === 'ios') {
    this.checkNativeiOSAvailable();
    const myModuleEvt = new NativeEventEmitter(RNIapIos);
    return myModuleEvt.addListener('iap-purchase-event', e);
  } else {
    console.log('adding purchase listener is only provided in ios.');
  }
};

/**
 * deprecagted codes
 */
/*
export const validateReceiptIos = async (receiptBody, isTest) => {
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

  return response.json();
};
*/

export default {
  prepare,
  initConnection,
  endConnection,
  getProducts,
  getSubscriptions,
  getPurchaseHistory,
  getAvailablePurchases,
  consumeAllItems,
  buySubscription,
  buyProduct,
  buyProductWithQuantityIOS,
  buyProductWithoutFinishTransaction,
  finishTransaction,
  clearTransaction,
  consumePurchase,
  validateReceiptIos,
  validateReceiptAndroid,
  addAdditionalSuccessPurchaseListenerIOS,
};

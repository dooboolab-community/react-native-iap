
import { NativeModules, Platform, NativeEventEmitter, DeviceEventEmitter } from 'react-native';

const { RNIapIos, RNIapModule } = NativeModules;

const ANDROID_ITEM_TYPE_SUBSCRIPTION = 'subs';
const ANDROID_ITEM_TYPE_IAP = 'inapp';
const IOS_ITEM_TYPE_SUBSCRIPTION = 'sub';
const IOS_ITEM_TYPE_IAP = 'iap';

export const IAPErrorCode = {
  E_IAP_NOT_AVAILABLE: 'E_IAP_NOT_AVAILABLE',
  E_UNKNOWN: 'E_UNKNOWN',
  E_USER_CANCELLED: 'E_USER_CANCELLED',
  E_USER_ERROR: 'E_USER_ERROR',
  E_ITEM_UNAVAILABLE: 'E_ITEM_UNAVAILABLE',
  E_REMOTE_ERROR: 'E_REMOTE_ERROR',
  E_NETWORK_ERROR: 'E_NETWORK_ERROR',
  E_SERVICE_ERROR: 'E_SERVICE_ERROR',
  E_RECEIPT_FAILED: 'E_RECEIPT_FAILED',
  E_RECEIPT_FINISHED_FAILED: 'E_RECEIPT_FINISHED_FAILED',
  E_NOT_PREPARED: 'E_NOT_PREPARED',
  E_NOT_ENDED: 'E_NOT_ENDED',
  E_ALREADY_OWNED: 'E_ALREADY_OWNED',
  E_DEVELOPER_ERROR: 'E_DEVELOPER_ERROR',
  E_BILLING_RESPONSE_JSON_PARSE_ERROR: 'E_BILLING_RESPONSE_JSON_PARSE_ERROR',
};

export const PROMOTED_PRODUCT = 'iap-promoted-product';

function checkNativeAndroidAvailable() {
  if (!RNIapModule) {
    return Promise.reject(new Error(IAPErrorCode.E_IAP_NOT_AVAILABLE, 'The payment setup is not available in this version of the app. Contact admin.'));
  }
};

function checkNativeiOSAvailable() {
  if (!RNIapIos) {
    return Promise.reject(new Error(IAPErrorCode.E_IAP_NOT_AVAILABLE, 'The payment setup is not available in this version of the app. Contact admin.'));
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
export const endConnectionAndroid = () => Platform.select({
  ios: async() => Promise.resolve(),
  android: async() => {
    if (!RNIapModule) {
      return Promise.resolve();
    }
    return RNIapModule.endConnection();
  },
})();

/**
 * Consume all remaining tokens. Android only.
 * @returns {Promise<void>}
 */
export const consumeAllItemsAndroid = () => Platform.select({
  ios: async() => Promise.resolve(),
  android: async() => {
    checkNativeAndroidAvailable();
    return RNIapModule.refreshItems();
  },
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
  },
})();

/**
 * Get a list of subscriptions
 * @param {string[]} skus The item skus
 * @returns {Promise<Subscription[]>}
 */
export const getSubscriptions = (skus) => Platform.select({
  ios: async() => {
    checkNativeiOSAvailable();
    return RNIapIos.getItems(skus)
      .then((items) => items.filter((item) => skus.includes(item.productId)));
  },
  android: async() => {
    checkNativeAndroidAvailable();
    return RNIapModule.getItemsByType(ANDROID_ITEM_TYPE_SUBSCRIPTION, skus);
  },
})();

/**
 * Gets an invetory of purchases made by the user regardless of consumption status
 * @returns {Promise<Purchase[]>}
 */
export const getPurchaseHistory = () => Platform.select({
  ios: async() => {
    checkNativeiOSAvailable();
    return RNIapIos.getAvailableItems();
  },
  android: async() => {
    checkNativeAndroidAvailable();
    const products = await RNIapModule.getPurchaseHistoryByType(ANDROID_ITEM_TYPE_IAP);
    const subscriptions = await RNIapModule.getPurchaseHistoryByType(ANDROID_ITEM_TYPE_SUBSCRIPTION);
    return products.concat(subscriptions);
  },
})();

/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * @returns {Promise<Purchase[]>}
 */
export const getAvailablePurchases = () => Platform.select({
  ios: async() => {
    checkNativeiOSAvailable();
    return RNIapIos.getAvailableItems();
  },
  android: async() => {
    checkNativeAndroidAvailable();
    const products = await RNIapModule.getAvailableItemsByType(ANDROID_ITEM_TYPE_IAP);
    const subscriptions = await RNIapModule.getAvailableItemsByType(ANDROID_ITEM_TYPE_SUBSCRIPTION);
    return products.concat(subscriptions);
  },
})();

/**
 * @deprecated Deprecated since 3.0.0. This will be removed in the future. Use `requestPurchase` instead.
 * Buy a product
 * @param {string} sku The product's sku/ID
 * @returns {Promise<ProductPurchase>}
 */
export const buyProduct = (sku) => {
  console.warn('The `buyProduct` method is deprecated since 3.0.0. This will be removed in the future so please use `requestPurchase` instead.');
  Platform.select({
    ios: async() => {
      checkNativeiOSAvailable();
      return RNIapIos.buyProduct(sku, true);
    },
    android: async() => {
      checkNativeAndroidAvailable();
      return RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_IAP, sku, null, 0);
    },
  })();
};

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @param {boolean} andDangerouslyFinishTransactionAutomatically You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.
 * @returns {Promise<string>}
 */
export const requestPurchase = (sku, andDangerouslyFinishTransactionAutomatically) => Platform.select({
  ios: async() => {
    andDangerouslyFinishTransactionAutomatically = (andDangerouslyFinishTransactionAutomatically === undefined) ? true : andDangerouslyFinishTransactionAutomatically;
    if (andDangerouslyFinishTransactionAutomatically) {
      console.warn('You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.');
    }
    checkNativeiOSAvailable();
    return RNIapIos.buyProduct(sku, andDangerouslyFinishTransactionAutomatically);
  },
  android: async() => {
    checkNativeAndroidAvailable();
    return RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_IAP, sku, null, 0);
  },
})();

/**
 * @deprecated Deprecated since 3.0.0. This will be removed in the future. Use `requestSubscription` instead.
 * Create a subscription to a sku
 * @param {string} sku The product's sku/ID
 * @param {string} [oldSku] Optional old product's ID for upgrade/downgrade (Android only)
 * @param {number} [prorationMode] Optional proration mode for upgrade/downgrade (Android only)
 * @returns {Promise<SubscriptionPurchase>}
 */
export const buySubscription = (sku, oldSku, prorationMode) => {
  console.warn('Deprecated since 3.0.0. This will be removed in the future. Use `requestSubscription` instead');
  return Platform.select({
    ios: async() => {
      checkNativeiOSAvailable();
      return RNIapIos.buyProduct(sku, true);
    },
    android: async() => {
      checkNativeAndroidAvailable();
      if (!prorationMode) prorationMode = -1;
      return RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_SUBSCRIPTION, sku, oldSku, prorationMode);
    },
  })();
};

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @returns {Promise<string>}
 */
export const requestSubscription = (sku, oldSku, prorationMode) => Platform.select({
  ios: async() => {
    checkNativeiOSAvailable();
    return RNIapIos.buyProduct(sku, true);
  },
  android: async() => {
    checkNativeAndroidAvailable();
    if (!prorationMode) prorationMode = -1;
    return RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_SUBSCRIPTION, sku, oldSku, prorationMode);
  },
})();

/**
 * @deprecated Deprecated since 3.0.0. This will be removed in the future. Use `requestPurchaseWithQuantityIOS` instead.
 * Buy a product with a specified quantity (iOS only)
 * @param {string} sku The product's sku/ID
 * @param {number} quantity The amount of product to buy
 * @returns {Promise<ProductPurchase>}
 */
export const buyProductWithQuantityIOS = (sku, quantity) => {
  console.warn('Deprecated since 3.0.0. This will be removed in the future. Use `buyProductWithQuantityIOS` instead');
  Platform.select({
    ios: async() => {
      checkNativeiOSAvailable();
      return RNIapIos.buyProductWithQuantityIOS(sku, quantity);
    },
    android: async() => Promise.resolve(),
  })();
};

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @returns {Promise<string>}
 */
export const requestPurchaseWithQuantityIOS = (sku, quantity) => Platform.select({
  ios: async() => {
    checkNativeiOSAvailable();
    return RNIapIos.buyProductWithQuantityIOS(sku, quantity);
  },
  android: async() => Promise.resolve(),
})();

/**
 * Finish Transaction (iOS only)
 *   Similar to `consumePurchaseAndroid`. Tells StoreKit that you have delivered the purchase to the user and StoreKit can now let go of the transaction.
 *   Call this after you have persisted the purchased state to your server or local data in your app.
 *   `react-native-iap` will continue to deliver the purchase updated events with the successful purchase until you finish the transaction. **Even after the app has relaunched.**
 * @param {string} transactionId The transactionId of the function that you would like to finish.
 * @returns {null}
 */
export const finishTransactionIOS = (transactionId) => {
  Platform.select({
    ios: async() => {
      checkNativeiOSAvailable();
      return RNIapIos.finishTransaction(transactionId);
    },
    android: async() => Promise.resolve(),
  })();
};

/**
 * Clear Transaction (iOS only)
 *   Finish remaining transactions. Related to issue #257
 *     link : https://github.com/dooboolab/react-native-iap/issues/257
 * @returns {null}
 */
export const clearTransactionIOS = () => {
  console.warn('The `clearTransactionIOS` method is deprecated.');
  Platform.select({
    ios: async() => {
      checkNativeiOSAvailable();
      return RNIapIos.clearTransaction();
    },
    android: async() => Promise.resolve(),
  })();
};

/**
 * Clear valid Products (iOS only)
 *   Remove all products which are validated by Apple server.
 * @returns {null}
 */
export const clearProductsIOS = () => Platform.select({
  ios: async() => {
    checkNativeiOSAvailable();
    return RNIapIos.clearProducts();
  },
  android: async() => Promise.resolve,
})();

/**
 * Acknowledge a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise}
 */
export const acknowledgePurchaseAndroid = (token, developerPayload) => Platform.select({
  ios: async() => Promise.resolve(),
  android: async() => {
    checkNativeAndroidAvailable();
    return RNIapModule.acknowledgePurchase(token, developerPayload);
  },
})();

/**
 * Consume a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise}
 */
export const consumePurchaseAndroid = (token, developerPayload) => Platform.select({
  ios: async() => Promise.resolve(),
  android: async() => {
    checkNativeAndroidAvailable();
    return RNIapModule.consumeProduct(token, developerPayload);
  },
})();

/**
 * Should Add Store Payment (iOS only)
 *   Indicates the the App Store purchase should continue from the app instead of the App Store.
 * @returns {null}
 */
export const getPromotedProductIOS = () => Platform.select({
  ios: async() => {
    checkNativeiOSAvailable();
    return RNIapIos.promotedProduct();
  },
  android: async() => Promise.resolve(),
})();

/**
 * Buy the currently selected promoted product (iOS only)
 *   Initiates the payment process for a promoted product. Should only be called in response to the `iap-promoted-product` event.
 * @returns {null}
 */
export const buyPromotedProductIOS = () => Platform.select({
  ios: async() => {
    checkNativeiOSAvailable();
    return RNIapIos.buyPromotedProduct();
  },
  android: async() => Promise.resolve(),
})();

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
export const buyProductWithOfferIOS = (sku, forUser, withOffer) => Platform.select({
  ios: async() => {
    checkNativeiOSAvailable();
    return RNIapIos.buyProductWithOffer(sku, forUser, withOffer);
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
      Accept: 'application/json',
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
    headers: new Headers({ Accept: 'application/json' }),
  });

  if (!response.ok) {
    throw Object.assign(new Error(response.statusText), { statusCode: response.status });
  }

  return response.json();
};

/**
 * @deprecated Deprecated since 3.0.0. This will be removed in the future. Use `purchaseUpdatedLister` with `requestPurchase`.
 * Add IAP purchase event in ios.
 * @returns {callback(e: Event)}
 */
export const addAdditionalSuccessPurchaseListenerIOS = (e) => {
  console.warn('addAdditionalSuccessPurchaseListenerIOS is deprecated since 3.0.0 and will be removed in the future. Use `purchaseUpdatedListener` with `requestPurchase`.');
  if (Platform.OS === 'ios') {
    checkNativeiOSAvailable();
    const myModuleEvt = new NativeEventEmitter(RNIapIos);
    return myModuleEvt.addListener('iap-purchase-event', e);
  } else {
    console.log('adding purchase listener is only provided in ios.');
  }
};

/**
 * Add IAP purchase event in ios.
 * @returns {callback(e: ProductPurchase)}
 */
export const purchaseUpdatedListener = (e) => {
  if (Platform.OS === 'ios') {
    checkNativeiOSAvailable();
    const myModuleEvt = new NativeEventEmitter(RNIapIos);
    return myModuleEvt.addListener('purchase-updated', e);
  } else {
    const emitterSubscription = DeviceEventEmitter.addListener('purchase-updated', e);
    RNIapModule.startListening();
    return emitterSubscription;
  }
};

/**
 * Add IAP purchase error event in ios.
 * @returns {callback(e: ProductPurchase)}
 */
export const purchaseErrorListener = (e) => {
  if (Platform.OS === 'ios') {
    checkNativeiOSAvailable();
    const myModuleEvt = new NativeEventEmitter(RNIapIos);
    return myModuleEvt.addListener('purchase-error', e);
  } else {
    return DeviceEventEmitter.addListener('purchase-error', e);
  }
};

/**
 * Get the current receipt base64 encoded in IOS.
 * @returns {Promise<string>}
 */
export const requestReceiptIOS = () => {
  if (Platform.OS === 'ios') {
    checkNativeiOSAvailable();
    return RNIapIos.requestReceipt();
  }
};

/**
 * Get the pending purchases in IOS.
 * @returns {Promise<ProductPurchase[]>}
 */
export const getPendingPurchasesIOS = () => {
  if (Platform.OS === 'ios') {
    checkNativeiOSAvailable();
    return RNIapIos.getPendingTransactions();
  }
};

/**
 * deprecated codes
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
  IAPErrorCode,
  initConnection,
  endConnectionAndroid,
  getProducts,
  getSubscriptions,
  getPurchaseHistory,
  getAvailablePurchases,
  getPendingPurchasesIOS,
  consumeAllItemsAndroid,
  buySubscription,
  buyProduct,
  buyProductWithQuantityIOS,
  clearProductsIOS,
  clearTransactionIOS,
  acknowledgePurchaseAndroid,
  consumePurchaseAndroid,
  validateReceiptIos,
  validateReceiptAndroid,
  addAdditionalSuccessPurchaseListenerIOS,
  requestPurchase,
  requestPurchaseWithQuantityIOS,
  finishTransactionIOS,
  requestSubscription,
  purchaseUpdatedListener,
  purchaseErrorListener,
  requestReceiptIOS,
};

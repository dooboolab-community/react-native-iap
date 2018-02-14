
import { NativeModules, Platform } from 'react-native';

const { RNIapIos, RNIapModule } = NativeModules;

/**
 * Get 'INAPP' items.
 */
export const getItems = (skus) => {
  if (Platform.OS === 'ios') {
    return new Promise(function (resolve, reject) {
      if (!skus.ios) {
        reject(
          new Error('ios items are not defined. It should be defined inside param like items.ios.'),
        );
        return;
      }
      const thestr = JSON.stringify(skus.ios);
      RNIapIos.fetchProducts(thestr, (err, items) => {
        if (err) {
          reject(err);
          return;
        }
        const objs = items.map(o => JSON.parse(o));
        resolve(objs);
      });
    });
  } else if (Platform.OS === 'android') {
    return new Promise(function (resolve, reject) {
      if (!skus.android) {
        reject(new Error('android items are not defined. It should be defined inside param like items.android.'));
        return;
      }
      RNIapModule.getItems(
        JSON.stringify(skus.android),
        (err, items) => {
          if (err){
            reject(err);
            return;
          }
          const parsedItems = JSON.parse(items);
          resolve(parsedItems);
        }
      );
    });
  }
};

/**
 * Get 'SUBS' items.
 */
export const getSubscribeItems = (skus) => {
  if (Platform.OS === 'ios') {
    // ios will just use existing function
    return getItems(skus);
  }
  else if (Platform.OS === 'android') {
    return new Promise(function (resolve, reject) {
      if (!skus.android) {
        reject(new Error('android items are not defined. It should be defined inside param like items.android.'));
        return;
      }
      RNIapModule.getSubItems(
        JSON.stringify(skus.android),
        (err, items) => {
          if (err){
            reject(err);
            return;
          }
          const parsedItems = JSON.parse(items);
          resolve(parsedItems);
        }
      );
    });
  }
};

/**
 * buy 'INAPP' item.
 */
export const buyItem = (item) => {
  if (Platform.OS === 'ios') {
    return new Promise(function (resolve, reject) {
      // RCT_EXPORT_METHOD(purchaseItem:(NSString *)keyJson callback:(RCTResponseSenderBlock)callback) {
      RNIapIos.purchaseItem(item, (err, purchase) => {
        if (err) {
          reject(err);
          return;
        }
        // return string
        resolve(purchase);
      });
    });
  } else if (Platform.OS === 'android') {
    return new Promise(function (resolve, reject) {
      RNIapModule.buyItem(item, (err, purchase) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(purchase);
      });
    });
  }
};

/**
 * buy 'SUBS' item. This action will be same as buying item and IOS. Only differences are made to Android.
 */
export const buySubscribeItem = (item) => {
  if (Platform.OS === 'ios') {
    buyItem(item);
  } else if (Platform.OS === 'android') {
    return new Promise(function (resolve, reject) {
      RNIapModule.buySubscribeItem(item, (err, purchase) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(purchase);
      });
    });
  }
};

/**
 * refresh items to buy items again.
 */
export const refreshAllItems = () => {
  if (Platform.OS === 'ios') {
    return new Promise(function (resolve, reject) {
      RNIapIos.fetchHistory((err, items) => {
        if (err) {
          reject(err);
          return;
        }
        const objs = items.map(o => JSON.parse(o));
        resolve(objs);
      });
    });
  } else if (Platform.OS === 'android') {
    return new Promise(function (resolve, reject) {
      try {
        RNIapModule.refreshAllPurchaseItems((err, items) => {
          if ((typeof items) === 'string') {
            resolve(JSON.parse(items));
          } else {
            resolve(items);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

/**************** BELOW CODES ARE ONLY SUPPORTED IN ANDROID PLATFORM ************/

/**
 * prepare IAP module for android. For ios it will be automatically ignored
 */
export const prepareAndroid = () => {
  if (Platform.OS === 'android') {
    return new Promise(function (resolve, reject) {
      RNIapModule.prepare((err, msg) => {
        if (err) {
          reject (err);
          return;
        }
        RNIapModule.refreshPurchaseItems(null);
        resolve(msg);
      });
    });
  }
};

/**
 * Refresh items to buy item again for android. Able to put nothing or 'SUBS' in parameter.
 * Putting 'SUBS' string will refresh subscription items.
 */
export const refreshPurchaseItemsAndroid = (type: string | null) => {
  if (Platform.OS === 'android') {
    // Noramlly put null on type. If you want to fetch subscriptions item put 'SUBS' in type param
    RNIapModule.refreshPurchaseItems(type);
  }
};

/**
 * Get purchasedItems for android. Able to put nothing or 'SUBS' in parameter.
 */
export const getPurchasedItemsAndroid = (type: string | null) => {
  if (Platform.OS === 'android') {
    return new Promise(function (resolve, reject) {
      RNIapModule.getOwnedItems(type,
        (err, items) => {
          if (err) {
            reject(err);
            return;
          }
          const parsedItems = JSON.parse(items);
          resolve(parsedItems);
        }
      );
    });
  }
};

/**
 * User can consume consumable items which user purchased.
 */
export const consumeItemAndroid = (token: string) => {
  if (Platform.OS === 'android') {
    return new Promise(function (resolve, reject) {
      RNIapModule.consumeItem(token, (err, success) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(success);
      });
    });
  }
};

/**
 * iOS only methods
 */
export const restoreIosNonConsumableProducts = () => {
  // Duplication of refreshAllItems
  if (Platform.OS === "ios") {
    return new Promise(function(resolve, reject) {
      RNIapIos.fetchHistory((err, items) => {
        if (err) {
          reject(err);
          return;
        }
        const objs = items.map(o => JSON.parse(o));
        resolve(objs);
      });
    });
  } else {
    return null;
  }
};

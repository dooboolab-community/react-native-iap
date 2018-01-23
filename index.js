
import { NativeModules, Platform } from 'react-native';

const { RNIapIos, RNIapModule } = NativeModules;

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

export const getSubscribeItems = (skus) => {
  if (Platform.OS === 'ios') {
    // ios will just use existing function
    getItems(skus);
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
        RNIapModule.consumeItem(purchase.purchaseToken, (err, success) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(purchase);
        });
      });
    });
  }
};

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
    RNIapModule.refreshPurchaseItems(null);
    RNIapModule.refreshPurchaseItems('SUBS');
  }
}

// Below functions only supported in android.

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

export const refreshPurchaseItemsAndroid = (type: string | null) => {
  if (Platform.OS === 'android') {
    // Noramlly put null on type. If you want to fetch subscriptions item put 'SUBS' in type param
    RNIapModule.refreshPurchaseItems(type);
  }
};

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

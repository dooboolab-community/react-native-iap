
import { NativeModules, Platform } from 'react-native';

const { RNIapIos, RNIapModule } = NativeModules;

const ModuleIOS = {
  prepare() {
    return new Promise(function (resolve, reject) {
      const msg = 'ios do not need to prepare. Skip.';
      resolve(msg);
    });
  },
  fetchHistory() {
    console.log(' module : fetch history ');
    return new Promise(function (resolve, reject) {
      // if (!skus.ios) {
      //   console.lod('  Error skus.ios ');
      //   reject(new Error('ios items are not defined. It should be defined inside param like items.ios.'));
      //   return;
      // }

      RNIapIos.fetchHistory((err, items) => {
        if (err) {
          reject(err);
          return;
        }
        const objs = items.map(o => JSON.parse(o));
        resolve(objs);
      });
    });
  },
  getItems(skus) {
    return new Promise(function (resolve, reject) {
      if (!skus.ios) {
        console.log('Error skus.ios');
        reject(new Error('ios items are not defined. It should be defined inside param like items.ios.'));
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
  },
  buyItem(item) {
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
  },
  buySubscribeItem(item) {
    return new Promise(function (resolve, reject) {
      // RCT_EXPORT_METHOD(purchaseItem:(NSString *)keyJson callback:(RCTResponseSenderBlock)callback) {
      RNIapIos.purchaseSubscribeItem(item, (err, purchase) => {
        if (err) {
          reject(err);
          return;
        }
        // return string
        resolve(purchase);
      });
    });
  }
};

const ModuleAndroid = {
  getItems(skus) {
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
  },
  buyItem(item) {
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
  },
  buySubscribeItem(item) {
    return new Promise(function (resolve, reject) {
      RNIapModule.buySubscribeItem(item, (err, purchase) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(purchase);
      });
    });
  },
  prepare() {
    return new Promise(function (resolve, reject) {
      RNIapModule.prepare((err, msg) => {
        if (err) {
          reject (err);
          return;
        }
        RNIapModule.refreshPurchaseItems();
        resolve(msg);
      });
    });
  },
  refreshPurchaseItemsAndroid(type) {
    // Noramlly put null on type. If you want to fetch subscriptions item put 'SUBS' in type param
    RNIapModule.refreshPurchaseItems(type);
  },
  getPurchasedItemsAndroid(type) {
    // Noramlly put null on type. If you want to fetch subscriptions item put 'SUBS' in type param
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
  },
  consumeItemAndroid(token) {
    return new Promise(function (resolve, reject) {
      RNIapModule.consumeItem(token, (err, success) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(success);
      });
    });
  },
};

const RNIap = Platform.OS === 'ios' ?
  ModuleIOS : ModuleAndroid;

module.exports = RNIap
// export default RNIap;

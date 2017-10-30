
import { NativeModules, Platform } from 'react-native';

const { RNIapIos, RNIapModule } = NativeModules;

const ModuleIOS = {
  getItems(skus) {
    if (!skus.ios) {
      console.lod('  Error skus.ios ');
      return reject(new Error('ios items are not defined. It should be defined inside param like items.ios.'));
    }
    return new Promise(function (resolve, reject) {
      const thestr = JSON.stringify(skus.ios);
      RNIapIos.fetchProducts(thestr, (err, items) => {
        if (err) {
          return reject(err);
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
          return reject(err);
        }
        // return string
        resolve(purchase);
      });
    });
  }
};

const ModuleAndroid = {
  getItems(skus) {
    if (!skus.android) {
      return reject(new Error('android items are not defined. It should be defined inside param like items.android.'));
    }
    return new Promise(function (resolve, reject) {
      RNIapModule.getItems(
        JSON.stringify(skus.android),
        (err, items) => {
          if (err){
            return reject(err);
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
          return reject(err);
        }
        RNIapModule.consumeItem(parsedItem.purchaseToken, (err, success) => {
          if (err) {
            return reject(err);
          }
          resolve(purchase);
        });
      });
    });
  },
  prepareAndroid() {
    RNIapModule.prepare();
    RNIapModule.refreshPurchaseItems();
  },
  refreshPurchaseItemsAndroid() {
    RNIapModule.refreshPurchaseItems();
  },
  getPurchasedItemsAndroid() {
    return new Promise(function (resolve, reject) {
      RNIapModule.getOwnedItems(
        (err, items) => {
          if (err) {
            return reject(err);
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
          return reject(err);
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

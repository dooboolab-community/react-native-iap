
import { NativeModules, Platform } from 'react-native';

const { RNIapIos, RNIapModule } = NativeModules;

const ModuleIOS = {
  getItems(skus) {
    return new Promise(function (resolve, reject) {
      if (!skus.ios) {
        console.lod('  Error skus.ios ');
        reject(new Error('ios items are not defined. It should be defined inside param like items.ios.'));
        return;
      }
      const thestr = JSON.stringify(skus.ios);
      RNIapIos.fetchProducts(thestr, (err, items) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(JSON.parse(items));
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
        RNIapModule.consumeItem(parsedItem.purchaseToken, (err, success) => {
          if (err) {
            reject(err);
            return;
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

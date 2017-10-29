
import { NativeModules, Platform } from 'react-native';

const { RNIapIos, RNIapModule } = NativeModules;

const ModuleIOS = {
  prepare() {
    console.log('RN IAP Ios Module : prepare ::  void function ');
  },

  getItems(skus) {
    return new Promise(function (resolve, reject) {
      console.log('RN IAP Ios Module : getItems ::  skus >> ', skus);
      // RCT_EXPORT_METHOD(fetchProducts:(NSString *)prodID callback:(RCTResponseSenderBlock)callback) {
      const thestr = JSON.stringify(skus);
      RNIapIos.fetchProducts(thestr, (err, items) => {
        if (err) reject(err);
        resolve(items);
      });
    });
  },
  buyItem(id_item) {
    return new Promise(function (resolve, reject) {
      console.log('RN IAP Ios Module : buyItem ::  id_item >> ', id_item);
      // RCT_EXPORT_METHOD(purchaseItem:(NSString *)keyJson callback:(RCTResponseSenderBlock)callback) {
      RNIapIos.purchaseItem(id_item, (err, items) => {
        if (err) reject(err);
        resolve(items);
      });
    });
  }
}

const ModuleAndroid = {
  prepare() {
    RNIapModule.prepare();
  },
  refreshPurchaseItems() {
    RNIapModule.refreshPurchaseItems();
  },
  getItems(skus, cb) {
    RNIapModule.getItems(
      JSON.stringify(itemSkus),
      (err, items) => {
        if (err) {
          console.log('err');
          console.log(err);
          return;
        }
        const parsedItems = JSON.parse(items);
        console.log(parsedItems);
      }
    );
  }
}

const RNIap = Platform.OS === 'ios' ?
  ModuleIOS : ModuleAndroid;

module.exports = RNIap
// export default RNIap;

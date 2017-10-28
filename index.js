
import { NativeModules } from 'react-native';

const { RNIapIos, RNIapAndroid } = NativeModules;

// export default RNIap;


const ModuleIOS = {
  getItems(skus, cb) {
    console.log('RN IAP Ios Module : getItems ::  skus >> ', skus);
    // RCT_EXPORT_METHOD(fetchProducts:(NSString *)prodID callback:(RCTResponseSenderBlock)callback) {
    RNIapIos.fetchProducts(JSON.stringify(skus), cb);
  },
  buyItem(id_item, cb) {
    console.log('RN IAP Ios Module : buyItem ::  id_item >> ', id_item);
    // RCT_EXPORT_METHOD(purchaseItem:(NSString *)keyJson callback:(RCTResponseSenderBlock)callback) {
    RNIapIos.purchaseItem(id_item, cb);
  }
}

const ModuleAndroid = {
  // 안드로이드 관련 기능들..
}

const RNIap = Platform.OS === 'ios' ?
  ModuleIOSz : ModuleAndroid;

module.exports = RNIap

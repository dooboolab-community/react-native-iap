
import { NativeModules, Platform } from 'react-native';

// IAP : ios in app purchase.
const { InAppPurchase } = NativeModules; // 여기 이름은 달라야 함.

const InAppPurchaseIOS = {
  purchaseItem(item, callback) {
    InAppPurchase.purchaseItem(JSON.stringify(item), callback);
  },
}

// TODO IAB : android in app billing.




const RNReactNativeIap = Platform.OS === 'ios'
  ? InAppPurchaseIOS
  : InAppPurchaseIOS; // FIXME  안드로이드 모듈.

module.exports = { RNReactNativeIap }

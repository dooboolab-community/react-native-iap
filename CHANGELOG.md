## Changelogs
- **[2.3.19]**
  + Additional catch for npe.
- **[2.3.18]**
  + Resolve `true` rather than `null` in android with successful interaction.
- **[2.3.17]**
  + Avoid iml file to be uploaded to npm repo that may fail from build in android.
- **[2.3.16]**
  + Fixes not responding to successful purchase.
- **[2.3.9]**
  + Fixes for unsafe getting originalJson when restoring item and Android.
- **[2.3.6]**
  + Fixed `types` for `buySubscription`.
- **[2.3.5]**
  + Fixed `transactionReceipt` field in `android`.
- **[2.3.4]**
  + Get originalJson in Android as a transanctionReceipt for validation #277.
- **[2.3.3]**
  + Fixed regression in adding proration mode. #279.
- **[2.3.2]**
  + Replace deprecated 'compile' gradle configuration with 'implementation' #282
- **[2.3.1]**
  + Fixed breakings.
- **[2.3.0]**
  + Add prorationMode.
- **[2.2.2]**
  + Automatically handle connection initialization.
- **[2.2.1]**
  + Added types for `clearTransaction`.
- **[2.2.0]**
  + Added `clearTransaction` method which resolve #257.
- **[2.1.3]**
  + Use mutable array in ios not to clear up the array each time products are fetched.
- **[2.0.3]**
  + Properly setup new method `initConnection` and deprecate `prepare`.
- **[2.0.0]**
  + Renamed the variables returned from the action getting item and purchasing item.
  + Fixed some crashing.
  + Typescript improvement.
  + Dropped version < 54 for React Native (This only affects `validateReceiptIos` and `validateReceiptAndroid`).
  + Improve receipt validation.
  + nil check in `Introductory Price` in ios.
- **[1.3.6]**
  + Upgraded android billing client to 1.1.
- **[1.3.0]**
  + Better android build.gradle from [PR](https://github.com/dooboolab/react-native-iap/pull/213).
- **[1.2.6]**
  + Fixed invalid source in pod spec from [PR](https://github.com/dooboolab/react-native-iap/pull/212).
- **[1.2.5]**
  + Set android build version to that of `rootProject`'s to prevent from build failing cause of mismatched version.
- **[1.2.4]**
  + Implemented `canMakePayments` method in ios which is called in `prepare` method in the module. Related [issue](https://github.com/dooboolab/react-native-iap/pull/121).
- **[1.2.2]**
  + Return an err when it failse to parse json in android related to [issue](https://github.com/dooboolab/react-native-iap/pull/196).
- **[1.2.0]**
  + Fixed example project to work again.
- **[1.1.6]**
  + Fixed validate receiptIos bug from [issue](https://github.com/dooboolab/react-native-iap/issues/190) and the break in [issue](https://github.com/dooboolab/react-native-iap/pull/188).
- **[1.1.3]**
  + Android reject when preparing not-ended billing client from [PR](https://github.com/dooboolab/react-native-iap/pull/189).
- **[1.1.2]**
  + Handle network error related to [PR](https://github.com/dooboolab/react-native-iap/pull/186).
- **[1.1.0]**
  + Rebased rejection code when purchase failed in android related to [issue](https://github.com/dooboolab/react-native-iap/issues/183).
- **[1.0.8]**
  + Put another conditional statement when buying product which crashes when purchase is null related to [issue](https://github.com/dooboolab/react-native-iap/issues/177).
- **[1.0.6]**
  + Add signature and original purchase data to transaction from [PR](https://github.com/dooboolab/react-native-iap/pull/173)
- **[1.0.5]**
  + Prevent starting billing client in android when already called once related to [issue](https://github.com/dooboolab/react-native-iap/issues/152).
- **[1.0.4]**
  + Purchase is now tread-safe in ios related to [issue](https://github.com/dooboolab/react-native-iap/issues/106).
  + PurchaseData could be nil in ios. Fixed this related to [issue](https://github.com/dooboolab/react-native-iap/issues/158)
- **[1.0.0]**
  + Renamed `refreshItems` to `consumeAllItems` for clear understanding.
  + Fixed critical bug in ios which products are recognized as `subs` only.
- **[0.3.24]**
  + [existing iOS bug] `itemType` of `Product` information always returns `sub`. It is unnecessary in iOS and will be deprecated.
- **[0.3.21]**
  + Able to manage consumption in ios with `buyProductWithoutFinishTransaction` and `finishTransaction`.
- **[0.3.19]**
  + Updated `validateReceiptIos` and `validateReceiptAndroid` methods to support all RN version.
- **[0.3.17]**
  + Implemented receipt validation. See the `Receipt validation` section in the readme. For `android`, you should have your own backend to get `access_token` from `googleapis`.
- **[0.3.13]**
  + Implemented `refreshItems` in android. This is to consume all products in anroid to rebuy the item. Becareful to use this method because if will affect your history of playstore. Only use this when you don't care about the history in playstore. Use this method after `prepare` method.
- **[0.3.10]**
  + Implemented `endConnection` in android.
- **[0.3.9]**
  + stable version that fixes bug in `0.3.4` ~ `0.3.8`.
  + fix crash when localizedDescription is nil from [PR](https://github.com/dooboolab/react-native-iap/pull/112).
  + fix crash on launchBillingFlow failure in Android from [PR](https://github.com/dooboolab/react-native-iap/pull/107).
  + Fixed typings.
- **[0.3.1]**
  + Fixed linking manual dependency in ios from [PR](https://github.com/dooboolab/react-native-iap/pull/94).
  + Fixed returning localizedPrice when need actual price in Android from [ISSUE](https://github.com/dooboolab/react-native-iap/issues/86).
  + Fixed other minor bugs relied on ios.
  + Some purchasing senarios have been tested throughly.
- **[0.3.0-alpha1]**
  + Methods names are fully renamed to avoid the confusion. Current methods are `prepare`, `getProducts`, `getSubscriptions`, `getPurchaseHistory`, `getAvailablePurchases`, `buySubscription`, `buyProduct`, `consumeProduct`. Please compare these methods with your previous methods used in `0.2.*` if you want to upgrade to `0.3.0`.
- **[0.2.17]**
  + `refreshAllItems` has changed name to `fetchHistory` since android and ios had different functionality and fixed to fetching history of purchases.
- **[0.2.16]**
  + Changed android package name `com.reactlibrary.RNIapPackage` to `com.dooboolab.RNIap.RNIapPackage`;.
- **[0.2.15]**
  + Removed react dependency in pod(deprecated). Handle android `buySubscribeItem` callback.
- **[0.2.14]**
  + Improve typings with [JSDoc](https://github.com/dooboolab/react-native-iap/commit/5c91392136837a10c85c6c073cc254f4c2f98249).
- **[0.2.13]**
  + buyItem will now return object instead string. The receipt string will be result.data and signature is added in result.signature. Currently ios signature will be always empty string.
- **[0.2.12]**
  + Added signiture to android purchase. From this version, the verification string for json string after purchasing will be receipt.data instead of receipt itself because of changes in [here](https://github.com/dooboolab/react-native-iap/issues/31). We will apply this changes to ios too so you do not have to handle these two differently.
- **[0.2.11]**
  + [Move podspec to where "react-native link" expects it to be](https://github.com/dooboolab/react-native-iap/commit/6c2389719663f90de1862cf14dfd4d3e3d670d1b).
- **[0.2.9]**
  + Android catch error message when IAP service not prepared during refreshAllItems.
- **[0.2.8]**
  + `homepage` now is mandatory attribute in cocoapods from [pull request](https://github.com/dooboolab/react-native-iap/pull/21).
- **[0.2.7]**
  + Android `buyItem` cancel callback.
- **[0.2.6]**
  + Android buyItem method do not consume item right away from 0.2.6.
- **[0.2.5]**
  + types support.
    ![alt text](https://firebasestorage.googleapis.com/v0/b/bookoo-89f6c.appspot.com/o/typing%20screen%20shot.png?alt=media&token=ea2ef1f3-50af-4d9c-8388-7fd22ddc8aa0)
  + call new Method for android inside refreshItems(). This will now return object values like ios.
- **[0.2.3]**
  + Support annotations to hint while using our module.
- **[0.2.0]**
  + Implemented senario for consumable and non-consumable item.
  + Seperated methods that only exists in IOS and Android.
    - prepareAndroid()
    - refreshPurchaseItemsAndroid(type: string)
    - getPurchasedItemsAndroid(type: string)
    - consumeItemAndroid(token: string)
  + Able to call prepareAndroid() function without any conditional statement like if (Platform.OS === 'android'). Just use it.
  + Updated Readme.
- **[0.1.10]**
  + Fixed potential bug relied on preparing IAP module in Android. Updated readme to see how to use it.

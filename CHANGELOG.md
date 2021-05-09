## Changelogs

## 6.0.4
- [Android] Update deps, fix permissions on graddle wrapper [#1323](https://github.com/dooboolab/react-native-iap/pull/1323)
- [Amazon] Add promise handling for Amazon purchases instead of resolving immediately [1302](https://github.com/dooboolab/react-native-iap/pull/1302)

## 6.0.3
- Add force refresh receipt for ios [#1303](https://github.com/dooboolab/react-native-iap/pull/1303)

## 6.0.2
- Fix require cycle warning [#1271](https://github.com/dooboolab/react-native-iap/issues/1271) in [#1294](https://github.com/dooboolab/react-native-iap/pull/1294)

## 6.0.1

- Add `introductoryPriceAsAmountAndroid` [#1277](https://github.com/dooboolab/react-native-iap/pull/1277)

## 6.0.0

- React Naitve IAP hook is out. [Follow the medium post](https://medium.com/dooboolab/announcing-react-native-iap-hooks-96c7ffd3f19a) on how to use it.

## 5.2.14

- Remove IAPPromotionObserver for manual installation process [#1267](https://github.com/dooboolab/react-native-iap/pull/1267).

## 5.2.13

- Fixed android receipt validation url [#1262](https://github.com/dooboolab/react-native-iap/issues/1262).

## 5.2.12
- Rebuild again incase of missing pre-build.

## 5.2.11

- Fixed fetch requestheader [#1258](https://github.com/dooboolab/react-native-iap/issues/1258).

## 5.2.10

- Added more fields to android receipt type.

## 5.2.9

- Reduce size of import by removing prev packs.

## 5.2.8

- Support android receipt type `AndroidReceiptType` instead of only json.

## 5.2.7

- HotFix - `getProducts` returns fetched products only. Previously it returned both.

## 5.2.6

- Fixes regression issue in iOS not getting all params [#1245](https://github.com/dooboolab/react-native-iap/pull/1245). Related [#1203](https://github.com/dooboolab/react-native-iap/pull/1245).

## 5.2.5
- Fixes build issue [#1238](https://github.com/dooboolab/react-native-iap/issues/1238)

## 5.2.4
- Add sandbox agnostic receipt verification [#1228](https://github.com/dooboolab/react-native-iap/pull/1228)
- Fix tvos presentCodeRedemptionSheet not available [#1237](https://github.com/dooboolab/react-native-iap/pull/1237)

## 5.2.3
- Fixed posible problem clearTransactionsIOS [#1227](https://github.com/dooboolab/react-native-iap/pull/1227)

## 5.2.2
- Improving typescript types for iOS subscription [#1219](https://github.com/dooboolab/react-native-iap/pull/1219)
- Fix(presentCodeRedemptionSheet): Xcode 11 compatibility [#1218](https://github.com/dooboolab/react-native-iap/pull/1218)

## 5.2.1
- Patch clear transaction [#1215](https://github.com/dooboolab/react-native-iap/pull/1215)

## 5.2.0
- Added presentCodeRedemptionSheetIOS [#1201](https://github.com/dooboolab/react-native-iap/pull/1201)
  * By [@Bang9](https://github.com/Bang9)
- Fix that getPendingPurchasesIOS() may returns undefined [#1199](https://github.com/dooboolab/react-native-iap/pull/1199)
  * By [@gki](https://github.com/gki)

## 5.1.3
- Fixed Amazon products prices parsing [#1191](https://github.com/dooboolab/react-native-iap/pull/1191)

## 5.1.2
- Add introductory price as string without formating and currency [#1182](https://github.com/dooboolab/react-native-iap/pull/1182)
- Add iOS store country code [#1186](https://github.com/dooboolab/react-native-iap/pull/1186)

## 5.1.1
- Add type definition on `ProductPurchase`.

## 5.1.0
- Expose more variables in `android` [#1171](https://github.com/dooboolab/react-native-iap/pull/1171).

## 5.0.1
- Fix amazon buyItemByType missing parameters dooboolab/react-native-iap/pull/1149

## 5.0.0

- Support Amazon IAP feature[#1134](https://github.com/dooboolab/react-native-iap/pull/1134)
- Fixes on missing [userId] and [profileId] on android [#1141](https://github.com/dooboolab/react-native-iap/pull/1141)

## 4.6.3

- Renamed param to `purchaseTokenAndroid` in `requestSubscription` since this is android only [#1130](https://github.com/dooboolab/react-native-iap/pull/1130)
- Fix for 'RNIapModule.buyItemByType got 6 arguments, expected 7' [#1132](https://github.com/dooboolab/react-native-iap/pull/1132)

## 4.6.2

- Fix compatibility issue in android with detox [#1124](https://github.com/dooboolab/react-native-iap/pull/1124)
- Fix changing subscription on android [#1129](https://github.com/dooboolab/react-native-iap/pull/1129)

## 4.6.1

- Fix xcode 12 compatibility [#1115](https://github.com/dooboolab/react-native-iap/pull/1115)
- Prevent unsupported ops crashing in android [#1116](https://github.com/dooboolab/react-native-iap/pull/1116)

## 4.6.0
- Upgrade android billing sdk to 3 [#1112](https://github.com/dooboolab/react-native-iap/pull/1112)
  - `developerIdAndroid` and `accountIdAndroid` params are removed.

## 4.5.4

- Fix & avoid blindly consuming success purchases [#1085](https://github.com/dooboolab/react-native-iap/pull/1085)
- Allow specyfing string subtype for product ids [#1089](https://github.com/dooboolab/react-native-iap/pull/1089)
- Let user know which productId was the error about [#1100](https://github.com/dooboolab/react-native-iap/pull/1100)
- Be more specific in purchaseErrorListener param typing [#1101](https://github.com/dooboolab/react-native-iap/pull/1101)

## 4.5.3

- Ability to know when a SKPaymentTransactionStateDeferred purchase update occurs [#1080](https://github.com/dooboolab/react-native-iap/issues/1080).

## 4.5.2

- Fix promise not resolving on `ios14` [#1064](https://github.com/dooboolab/react-native-iap/pull/1064).

## 4.5.0

- Fix iap-promoted-product listener [#1039](https://github.com/dooboolab/react-native-iap/pull/1039)

## 4.4.11

- Fix regresion in `4.4.10`

## 4.4.10

- Fix iOS discount issue [#1038](https://github.com/dooboolab/react-native-iap/pull/1038)
- Fix return type of `getPromotedProductIOS` [#1037](https://github.com/dooboolab/react-native-iap/pull/1037)

## 4.4.9

- Upgrade packages and expose `ProductPurchase` type.

## 4.4.8

- Fixes [#989](https://github.com/dooboolab/react-native-iap/issues/989).

## 4.4.7
- Fix regression. Revert `andDangerouslyFinishTransactionAutomaticallyIOS` to false. This should actually be false in default.

## 4.4.6
- `andDangerouslyFinishTransactionAutomaticallyIOS` was set to true for default. I should be false.

## 4.4.5

- Implement `endConnection` method to declaratively finish observer in iOS.
- Remove `addTransactionObserver` in IAPPromotionObserver.m for dup observer problems.
- Automatically startPromotionObserver in `initConnection` for iOS.
- Deprecate `endConnectionAndroid`.

## 4.4.4
Add guide add `IAPPromotionObserver` in ios

- Resolve [#950](https://github.com/dooboolab/react-native-iap/issues/950)
- Resolve [#971](https://github.com/dooboolab/react-native-iap/issues/971)

## 4.4.3

- Bugfixes for [#849](https://github.com/dooboolab/react-native-iap/issues/849).

## 4.4.2

- Attempt to fix [#934](https://github.com/dooboolab/react-native-iap/issues/934).

## 4.4.1

- Upgrade packages.

## 4.4.0

- Update `requestionSubscription` on android side.
- The flow of the code were not clean and correct.
  - Support ProrationModesAndroid enum type for handling better proration mode
- Fixes [#888](https://github.com/dooboolab/react-native-iap/issues/888)
- PR [#893](https://github.com/dooboolab/react-native-iap/pull/893)

<!-- Changes under 4.4.0 are removed. Please see older commits. -->
# react-native-iap
<p align="left">
  <a href="https://npmjs.org/package/react-native-iap"><img alt="npm version" src="http://img.shields.io/npm/v/react-native-iap.svg?style=flat-square"></a>
  <a href="https://npmjs.org/package/react-native-iap"><img alt="npm version" src="http://img.shields.io/npm/dm/react-native-iap.svg?style=flat-square"></a>
</p>
This is a react-native link library project for in app purchase for both android and ios platforms. The goal for this project is to have similar experience between the two platforms for in-app-purchase. Basically android platform has more functions for in-app-purchase and is not our specific interests for this project.

We are willing to share same in-app-purchase experience for both android and ios platform and will continuously merge methods which are standing alone.

Android iap is implemented with iap version 3 which is currently recent.

## Playstore & Itunnesconnect configuration
  - Please refer to [Blog](https://medium.com/@dooboolab/react-native-in-app-purchase-121622d26b67).

## Important
Do not use version `0.3.4` ~ `0.3.8` because there was some issues in merging PR. Also please commit to `dev` branch and not `master` branch please if requesting PR.
`react-native-iap` module versions that are not described in `change logs` may not run as expected so please refer to version mentioned in `Changelogs` below.

## Migration Guide
To migrate `0.2.*` to `0.3.*`, You can follow below guide.

| 0.2.* | 0.3.* |
| --- | --- |
| `prepareAndroid` | `prepare` |
| `getItems` | `getProducts` |
| `getSubscribeItems` | `getSubscriptions` |
| `getPurchasedItemsAndroid` | `getPurchaseHistory` |
| `` | `getAvailablePurchases` |
| `buySubscribeItem` | `buySubscription` |
| `buyItem` | `buyProduct` |
| `consumeItemAndroid` | `consumePurchase` |
| `refreshAllItems` | <span style="color: red">Not Available</span> |
| `refreshPurchaseItemsAndroid` | <span style="color: red">Not Available</span> |

From above method changes, `getProducts` gets `itemSkus` as parameter in different way then as used in `getItems`. In `getItems` you had to put parameter as
```
const itemSkus = {
  ios: [
	'point_1000',
  ],
  android: [
    'point_1000',
  ],
};
```
But now you should do like below which will just pass single array instead of object.
```
const itemSkus = Platform.select({
  ios: [
	'point_1000',
  ],
  android: [
    'point_1000',
  ],
});
```
Also, note that this is our last migration for renaming method names without any deprecation warning. Thank you for your understanding.

## Breaking Changes
`0.3.0-alpha1` has released. All the methods are renamed and current methods are merged into each single method. See `Methods` section below to see what's been changed.

Breaking changes have made from `0.2.17`. `refreshAllItems` has changed name to `fetchHistory`. See the changelogs below.

Breaking changes have made from `0.2.16` in android. Package name has been fixed to `com.dooboolab.RNIap.RNIapPackage`. Read the changelogs below. There was linking [issue](https://github.com/dooboolab/react-native-iap/issues/49#issuecomment-369811257) with wrong package name.

Breaking changes have made from `0.2.12`. Please read the changelogs below. The summary of change is that it now returns receipt in different format.

Changes from `react-native-iap@0.1.*` to `react-native-iap@0.2.*` is that you have `prepare()` method deprecated which you should call before using `RNIap` methods. Now you have to call `prepareAndroid()` instead just to know that it is just android dependent method.
Also to import module, previously in `react-native-iap@0.1.*` you had to `import RNIap from 'react-native-iap'` but now you have to do like `import * as RNIap from 'react-native-iap'`.

For new method, refreshAllItems has been implemented for both ios and android. This feature will support senario for non-consumable products.
Also there are some other methods that is not supported in ios and implemented in android. You can see more in Changelogs below.
Lastly, this module also supports types for typescript users from `0.2.5`.

## Changelogs
- **[0.3.19]**
  + Upted `validateReceiptIos` and `validateReceiptAndroid` methods to support all RN version.
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

#### Methods
| Func  | Param  | Return | Description |
| :------------ |:---------------:| :---------------:| :-----|
| prepare |  | `Promise<void>` | Prepare IAP module. Must be called on Android before any other purchase flow methods. No-op on iOS.|
| getProducts | `string[]` Product IDs/skus | `Promise<Product[]>` | Get a list of products (consumable and non-consumable items, but not subscriptions). Note: On iOS versions earlier than 11.2 this method _will_ return subscriptions if they are included in your list of SKUs. This is because we cannot differentiate between IAP products and subscriptions prior to 11.2.  |
| getSubscriptions | `string[]` Subscription IDs/skus | `Promise<Subscription[]>` | Get a list of subscriptions. Note: On iOS versions earlier than 11.2 this method has the same output as `getProducts`. This is because we cannot differentiate between IAP products and subscriptions prior to 11.2. |
| getPurchaseHistory | | `Promise<Purchase[]>` | Gets an invetory of purchases made by the user regardless of consumption status (where possible) |
| getAvailablePurchases | | `Promise<Purchase[]>` | Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
| buySubscription | `string` Subscription ID/sku | `Promise<Purchase>` | Create (buy) a subscription to a sku |
| buyProduct | `string` Product ID/sku | `Promise<Purchase>` | Buy a product |
| buyProductWithoutFinishTransaction | `string` Product ID/sku | `Promise<Purchase>` | Buy a product without finish transaction call (iOS only) |
| finishTransaction | `void` | `void` | Send finishTransaction call to Apple IAP server. Call this function after receipt validation process |
| consumeProduct | `string` Purchase token | `Promise<void>` | Consume a product (on Android.) No-op on iOS. |
| endConnection | | `Promise<void>` | End billing connection (on Android.) No-op on iOS. |
| refreshItems | | `Promise<void>` | Consume all items in android so they are able to buy again (on Android.) No-op on iOS. |
| validateReceiptIos | `object` receiptBody, `boolean` isTest, `number` RNVersion | `object or boolean` result | validate receipt for ios. |
| validateReceiptAndroid | `string` packageName, `string` productId, `string` productToken, `string` accessToken, `boolean` isSubscription, `number` RNVersion | `object or boolean` result | validate receipt for android. |

## Npm repo
https://www.npmjs.com/package/react-native-iap

## Git repo
https://github.com/dooboolab/react-native-iap


## Getting started
`$ npm install react-native-iap --save`

### Mostly automatic installation
`$ react-native link react-native-iap`

**Note for Ejected iOS Apps:** 

The above command will add the following to your `Podfile`:

```ruby
pod 'RNIap', :path => '../node_modules/react-native-iap'
```

You should remove this before running `pod install` and follow the manual installation instructions below. 
 
### Manual installation

#### iOS
1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-iap` and add `RNIap.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNIap.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android
1. Open up `android/app/src/main/java/[...]/MainApplication.java`
  - Add `import com.dooboolab.RNIap.RNIapPackage;` to the imports at the top of the file
  - Add `new RNIapPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-iap'
  	project(':react-native-iap').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-iap/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-iap')
  	```
4. Add the following to the `<permission>` block in `android/app/src/main/AndroidManifest.xml`:
    ```
    <uses-permission android:name="com.android.vending.BILLING" />
    ```
     
## Usage
You can look in the RNIapExample folder to try the example. Below is basic implementation which is also provided in RNIapExample project.

## Prepare IAP, In App Billing.
First thing you should do is to define your items for iOS and android separately like defined below.
```javascript
import * as RNIap from 'react-native-iap';

const itemSkus = Platform.select({
  ios: [
    'com.example.coins100'
  ],
  android: [
    'com.example.coins100'
  ]
});
```

Next, call the prepare function (ios it's not needed, but android it is. No need to check platform though since nothing will happen in ios:

```javascript
async function() {
  try {
    await RNIap.prepare();
    // Ready to call RNIap.getProducts(), etc.
  } catch(err) {
    console.warn(err); // standardized err.code and err.message available
  }
}
```

## Get Valid Items
Once you called prepare(), call getProducts(). Both are async funcs. You can do it in componentDidMount(), or other area as appropriate for you app. Since a user may first start your app with a bad internet connection, then later have an internet connection, making preparing/getting items more than once may be a good idea. Like if the user has no IAPs available when the app first starts, you may want to check again when the user enters the your IAP store.
```javascript
async componentDidMount() {
  try {
    await RNIap.prepare();
    const products = await RNIap.getProducts(itemSkus);
    this.setState({ items });
  } catch(err) {
    console.warn(err); // standardized err.code and err.message available
  }
}
```
#### Each item is a JavaScript object containing these keys:
|    | iOS | Android | Comment |
|----|-----|---------|------|
|`price`| ✓ | ✓ | Will return localizedPrice on Android (default) or a string price (eg. `1.99`) (iOS) |
|`productId`| ✓ | ✓ | Returns a string needed to purchase the item later |
|`currency`| ✓ | ✓ | Returns the currency code |
|`localizedPrice`| ✓ | ✓ | Use localizedPrice if you want to display the price to the user so you don't need to worry about currency symbols. |
|`title`| ✓ | ✓ | Returns the title Android and localizedTitle on iOS |
|`description`| ✓ | ✓ | Returns the description of the product |
|`type`| ✓ | ✓ | Returns SKU type (subscription or in-app product). iOS < 11.2 will always return `null` |

## End Billing Connection
When you are done with the billing, you should release it for android([READ](https://developer.android.com/reference/com/android/billingclient/api/BillingClient.html#endConnection())). It is not needed in ios. No need to check platform either since nothing will happen in ios. This can be used in `componentWillUnMount`.

## Purchase
Once you have called getProducts(), and you have a valid response, you can call buyProduct().
```javascript
  // Will return a purchase object with a receipt which can be used to validate on your server.
  const purchase = await RNIap.buyProduct('com.example.coins100');
```

In RNIapExample, upon receiving receiving a purchase receipt, main page will navigate to Second.js.

## Purchase Example 2 (Advanced)
```javascript
this.setState({ progressTitle: 'Please wait...' });
RNIap.buyProduct('com.example.coins100').then(purchase => {
    this.setState({
      receipt: purchase.transactionReceipt, // save the receipt if you need it, whether locally, or to your server.
      progressTitle: 'Purchase Successful!',
      coins: this.state.coins + 100
    });
  }).catch(err => {
    // resetting UI
    console.warn(err); // standardized err.code and err.message available
    this.setState({ progressTitle: 'Buy 100 Coins for only $0.99' });
    alert(err.message);
  })
```

Subscribable products can be purchased just like consumable products.
Users can cancel subscriptions by using the iOS System Settings.


## Consumption and Restoring Purchases
You can use `getAvailablePurchases()` to do what's commonly understood as "restoring" purchases. Once an item is consumed, it will no longer be available in `getAvailablePurchases()` and will only be available via `getPurchaseHistory()`. However, this method has some caveats on Android -- namely that purchase history only exists for the single most recent purchase of each SKU -- so your best bet is to track consumption in your app yourself. By default all items that are purchased will not be consumed unless they are automatically consumed by the store (for example, if you create a consumable item for iOS.) This means that you must manage consumption yourself.  Purchases can be consumed by calling `consumePurchase()`. If you want to consume all items, you have to iterate over the purchases returned by `getAvailablePurchases()`.

```javascript
getPurchases = async() => {
  try {
    const purchases = await RNIap.getAvailablePurchases();
    let restoredTitles = '';
    let coins = CoinStore.getCount();
    purchases.forEach(purchase => {
      if (purchase.productId == 'com.example.premium') {
        this.setState({ premium: true });
        restoredTitles += 'Premium Version';
      } else if (purchase.productId == 'com.example.no_ads') {
        this.setState({ ads: false });
        restoredTitles += restoredTitles.length > 0 ? 'No Ads' : ', No Ads';
      } else if (purchase.productId == 'com.example.coins100') {
        CoinStore.addCoins(100);
        await RNIap.consumePurchase(purchase.transactionReceipt);
      }
    })
    Alert.alert('Restore Successful', 'You successfully restored the following purchases: ' + restoredTitles);
  } catch(err) {
    console.warn(err); // standardized err.code and err.message available
    Alert.alert(err.message);
  }
}
```
Returned purchases is an array of each purchase transaction with the following keys:
```javascript
{
  transactionDate,
  transactionId,
  productId,
  transactionReceipt,
  purchaseToken, // available on Android (same as transactionReceipt)
  autoRenewing, // available on Android
  originalTransactionDate, // available on iOS
  originalTransactionIdentifier // available on iOS
}
```
You need to test with one sandbox account, because the account holds previous purchase history.


## Receipt validation
From `react-native-iap@0.3.16`, we support receipt validation. For android, you need seperate json file from service account to get the `access_token` from `google-apis`, therefore it is impossible to implement serverlessly. You should have your own backend and get `access_token`. With `access_token` you can simplly call `validateReceiptAndroid` method we implemented. Further reading is [here](https://stackoverflow.com/questions/35127086/android-inapp-purchase-receipt-validation-google-play?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa).

Currently, serverless receipt validation is possible using `validateReceiptIos` method. First parameter, you should pass `transactionReceipt` which returns after `buyProduct`. Second parameter, you should pass whether this is `test` environment. If `true`, it will request to `sandbox` and `false` it will request to `production`.

```javascript
const receiptBody = {
  'receipt-data': purchase.transactionReceipt,
};
const result = await validateReceiptIos(receiptBody, false, 54);
console.log(result);
```
For further information, please refer to [guide](https://developer.apple.com/library/content/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html).

### iOS Purchasing process right way.

Purchasing consumable products in iOS consists of the following steps.

```sh
Step 1 : Purchasing via IAP (Apple server)
Step 2 : Check the validation of the receipt (either on device or server)
Step 3 : Apply the product to the Application
```

But, sometimes app doesn't make it to step 3, and user loose the product with successful payment.
Non-consumable products can be restored via getPurchaseHistory function, but consumable products can be lost.
In this case, use buyProductWithoutFinishTransaction to purchase action and use finishTransaction to finish payment after receipt validation and supply the products to user.

## Todo
- 

## Contribution Guide

### Issue
* Please search and register if you already have the issue you want to create. If you have a similar issue, you can add additional comments.
* Please write a problem or suggestion in the issue. Never include more than one item in an issue.
* Please be as detailed and concise as possible.
	* If necessary, please take a screenshot and upload an image.


### Pull request(PR)
* Do not modify the code in the `master` branch.
* PR allows only the `dev` branch.
* It is useful to use a topic branch that has the parent `dev` as its parent.


### Coding Guidelines
Please follow the Coding conventions as much as possible when contributing your code.
* The indent tab is two spaces.
* The class declaration and the `{}` in curly brackets such as function, if, foreach, for, and while should be in the following format. Also if you installed eslint in vscode or in your code editor, it will help you with linting.
	* `{` should be placed in same line and `}` should be placed in next line.
```
for (let i = 0; i < 10; i++) {
  ...
}
array.forEach((e) => {
  ...
});
```
  * Space before `(` and after `)`.
* **If you find code that does not fit in the coding convention, do not ever try to fix code that is not related to your purpose.**


## LICENSE

The MIT License (MIT)

Copyright (c) 2017 dooboolab

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


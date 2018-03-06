# react-native-iap
<p align="left">
  <a href="https://npmjs.org/package/react-native-iap"><img alt="npm version" src="http://img.shields.io/npm/v/react-native-iap.svg?style=flat-square"></a>
  <a href="https://npmjs.org/package/react-native-iap"><img alt="npm version" src="http://img.shields.io/npm/dm/react-native-iap.svg?style=flat-square"></a>
</p>
This is a react-native link library project for in-app-purchase for both android and ios project. The goal for this project is to have similar experience between the two platforms for in-app-purchase. Basically android platform has more functions for in-app-purchase and is not our specific interests for this project.

We are willing to share same in-app-purchase experience for both android and ios platform and will continuously merge methods which are standing alone.

Android iap is implemented with iap version 3 which is currently recent.

## Important
react-native-iap@0.2.0 has been published and it is recommended to use version after `0.2.0` from `2018/01/23`.
`react-native-iap` module versions that are not described in `change logs` may not run as expected so please refer to version mentioned in `Changelogs` below.

## Breaking Changes
Recent breaking changes have made from `0.2.16` in android. Pakcage name has been fixed to `com.dooboolab.RNIap.RNIapPackage`. Read the changelogs below. There was linking [issue](https://github.com/dooboolab/react-native-iap/issues/49#issuecomment-369811257) with wrong package name.

Breaking changes have made from `0.2.12`. Please read the changelogs below. The summary of change is that it now returns receipt in different format.

Changes from `react-native-iap@0.1.*` to `react-native-iap@0.2.*` is that you have `prepare()` method deprecated which you should call before using `RNIap` methods. Now you have to call `prepareAndroid()` instead just to know that it is just android dependent method.
Also to import module, previously in `react-native-iap@0.1.*` you had to `import RNIap from 'react-native-iap'` but now you have to do like `import * as RNIap from 'react-native-iap'`.

For new method, refreshAllItems has been implemented for both ios and android. This feature will support senario for non-consumable products.
Also there are some other methods that is not supported in ios and implemented in android. You can see more in Changelogs below.
Lastly, this module also supports types for typescript users from `0.2.5`.

## Changelogs
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
| getProducts | `string[]` Product IDs/skus | `Promise<Product[]>` | Get a list of products (consumable and non-consumable items, but not subscriptions) |
| getSubscriptions | `string[]` Subscription IDs/skus | `Promise<Subscription[]>` | Get a list of subscriptions |
| getPurchaseHistory | | `Promise<Purchase[]>` | Gets an invetory of purchases made by the user regardless of consumption status (where possible) |
| getAvailablePurchases | | `Promise<Purchase[]>` | Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
| buySubscription | `string` Subscription ID/sku | `Promise<Purchase>` | Create (buy) a subscription to a sku |
| buyProduct | `string` Product ID/sku | `Promise<Purchase>` | Buy a product |
| consumeProduct | `string` Purchase token | `Promise<void>` | Consume a product (on Android.) No-op on iOS. |

## Npm repo
https://www.npmjs.com/package/react-native-iap

## Git repo
https://github.com/dooboolab/react-native-iap


## Getting started
`$ npm install react-native-iap --save`

### Mostly automatic installation
`$ react-native link react-native-iap`

### Manual installation

#### iOS
1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-iap` and add `RNIap.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNIap.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android
1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.RNIapPackage;` to the imports at the top of the file
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
|`type`| ✓ | ✓ | Returns SKU type (subscription or in-app product). iOS < 11.2 will always return `iap` |


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
You can use `getAvailablePurchases()` to do what's commonly understood as "restoring" purchases. Once an item is consumed, it will no longer be available in `getAvailablePurchases()` and will only be available via `getPurchaseHistory()`. However, this method has some caviats on Android -- namely that purchase history only exists for the single most recent purchase of each SKU -- so your best bet is to track consumption in your app yourself. By default all items that are purchased will not be consumed unless they are automatically consumed by the store (for example, if you create a consumable item for iOS.) This means that you must manage consumption yourself.  Purchases can be consumed by calling `consumePurchase()`. If you want to consume all items, you have to iterate over the purchases returned by `getAvailablePurchases()`.

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
      }
    })
    Alert.alert("Restore Successful", "You successfully restored the following purchases: " + restoredTitles);
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

## Todo

Nothing at the moment.

Thanks.

by JJMoon and dooboolab.

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

## Migration Guide
Difference between `0.3.*` and `1.0.0` has only one method renaming `refreshItems` to `consumeAllItems`.

To migrate `0.2.*` to `0.3.*`, You can follow below guide.

| 0.2.* | 0.3.* | 1.* |
| --- | --- | --- |
| `prepareAndroid` | `prepare` | `prepare` |
| `getItems` | `getProducts` | `getProducts` |
| `getSubscribeItems` | `getSubscriptions` | `getSubscriptions` |
| `getPurchasedItemsAndroid` | `getPurchaseHistory` | `getPurchaseHistory` |
| `` | `getAvailablePurchases` | `getAvailablePurchases` |
| `buySubscribeItem` | `buySubscription` | `buySubscription` |
| `buyItem` | `buyProduct` | `buyProduct` |
| `consumeItemAndroid` | `consumePurchase` | `consumePurchase` |
| `refreshAllItems` | <span style="color: red">Not Available</span> | `consumeAllItems` |
| `refreshPurchaseItemsAndroid` | <span style="color: red">Not Available</span> | <span style="color: red">Not Available</span> |

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

#### Methods
| Func  | Param  | Return | Description |
| :------------ |:---------------:| :---------------:| :-----|
| prepare |  | `Promise<void>` | Prepare IAP module. Must be called on Android before any other purchase flow methods. In ios, it will simply call `canMakePayments` method and return value.|
| getProducts | `string[]` Product IDs/skus | `Promise<Product[]>` | Get a list of products (consumable and non-consumable items, but not subscriptions). Note: On iOS versions earlier than 11.2 this method _will_ return subscriptions if they are included in your list of SKUs. This is because we cannot differentiate between IAP products and subscriptions prior to 11.2.  |
| getSubscriptions | `string[]` Subscription IDs/skus | `Promise<Subscription[]>` | Get a list of subscriptions. Note: On iOS  this method has the same output as `getProducts`. Because iOS does not differentiate between IAP products and subscriptions.  |
| getPurchaseHistory | | `Promise<Purchase[]>` | Gets an invetory of purchases made by the user regardless of consumption status (where possible) |
| getAvailablePurchases | | `Promise<Purchase[]>` | Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
| buySubscription | `string` Subscription ID/sku, `string` Old Subscription ID/sku (on Android) | `Promise<Purchase>` | Create (buy) a subscription to a sku. For upgrading/downgrading subscription on Android pass second parameter with current subscription ID, on iOS this is handled automatically by store. |
| buyProduct | `string` Product ID/sku | `Promise<Purchase>` | Buy a product |
| buyProductWithoutFinishTransaction | `string` Product ID/sku | `Promise<Purchase>` | Buy a product without finish transaction call (iOS only) |
| finishTransaction | `void` | `void` | Send finishTransaction call to Apple IAP server. Call this function after receipt validation process |
| consumeProduct | `string` Purchase token | `Promise<void>` | Consume a product (on Android.) No-op on iOS. |
| endConnection | | `Promise<void>` | End billing connection (on Android.) No-op on iOS. |
| consumeAllItems | | `Promise<void>` | Consume all items in android so they are able to buy again (on Android.) No-op on iOS. |
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
    this.setState({ products });
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
```javascript
componentWillUnmount() {
  RNIap.endConnection();
}
```

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
        await RNIap.consumePurchase(purchase.purchaseToken);
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

----

## Supporting react-native-iap

`react-native` is open source project with MIT license. We are willing to maintain this repository to support devs to monetize around the world. Since, `IAP` itself is not perfect in each platform, we desperately needs this project to be maintained. If you'd like to help us, please consider to be with us in [Open Collective](https://opencollective.com/react-native-iap).

### Sponsors
Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/react-native-iap#sponsor)]

### Backers
Please be our [Backers](https://opencollective.com/react-native-iap#backer).
<a href="https://opencollective.com/react-native-iap#backers" target="_blank"><img src="https://opencollective.com/react-native-iap/backers.svg?width=890"></a>

### Contributing
Please make sure to read the [Contributing Guide](CONTRIBUTING.md) before making a pull request.
Thank you to all the people who helped to maintain and upgrade this project!

<a href="graphs/contributors"><img src="https://opencollective.com/react-native-iap/contributors.svg?width=890" /></a>
<hr>

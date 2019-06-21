# react-native-iap
[![Version](http://img.shields.io/npm/v/react-native-iap.svg?style=flat-square)](https://npmjs.org/package/react-native-iap)
[![Download](http://img.shields.io/npm/dm/react-native-iap.svg?style=flat-square)](https://npmjs.org/package/react-native-iap)
[![License](https://img.shields.io/npm/l/react-native-iap.svg)](https://npmjs.org/package/react-native-iap)
[![Build Status](https://travis-ci.com/dooboolab/react-native-iap.svg?branch=master)](https://travis-ci.com/dooboolab/react-native-iap)
[![Vulnerabilites](https://img.shields.io/snyk/vulnerabilities/github/dooboolab/react-native-iap.svg)](https://github.com/dooboolab/react-native-iap)
[![Issue Opened](https://img.shields.io/opencollective/all/react-native-iap.svg)](https://opencollective.com/react-native-iap#backers)
[![Issue Opened](https://img.shields.io/github/issues/dooboolab/react-native-iap.svg)](https://github.com/dooboolab/react-native-iap/issues)
[![Issue Closed](https://img.shields.io/github/issues-closed/dooboolab/react-native-iap.svg)](https://github.com/dooboolab/react-native-iap/issues?q=is%3Aissue+is%3Aclosed)
[![PR Opened](https://img.shields.io/github/issues-pr/dooboolab/react-native-iap.svg)](https://github.com/dooboolab/react-native-iap/pulls)
[![PR Closed](https://img.shields.io/github/issues-pr-closed/dooboolab/react-native-iap.svg)](https://github.com/dooboolab/react-native-iap/pulls?q=is%3Apr+is%3Aclosed) [![Greenkeeper badge](https://badges.greenkeeper.io/dooboolab/react-native-iap.svg)](https://greenkeeper.io/)

> This is a react-native link library project for in-app purchase for both android and ios platforms. The goal for this project is to have similar experience between the two platforms for in-app-purchase. Basically, android platform has more functions for in-app-purchase and is not our specific interests for this project. We are willing to share same in-app-purchase experience for both `android` and `ios`.

> Checkout example code<br/>
![wjl0ak0fgj](https://user-images.githubusercontent.com/27461460/52619625-87aa8a80-2ee5-11e9-9aee-6691c34408f3.gif)

## Playstore & Itunnesconnect configuration
  - Please refer to [Blog](https://medium.com/@dooboolab/react-native-in-app-purchase-121622d26b67).

## [Deprecated README](https://github.com/dooboolab/react-native-iap/blob/master/README_DEPRECATED.md)
  - If you are using `react-native-iap` version below `3.0.0`, please follow above readme.

## News on major releases
  - [react-native-iap V3 note](https://medium.com/dooboolab/react-native-iap-v3-1259e0b0c017)

#### Methods
| Func  | Param  | Return | Description |
| :------------ |:---------------:| :---------------:| :-----|
| initConnection |  | `Promise<boolean>` | Init IAP module. On Android this can be called to preload the connection to Play Services. In iOS, it will simply call `canMakePayments` method and return value.|
| getProducts | `string[]` Product IDs/skus | `Promise<Product[]>` | Get a list of products (consumable and non-consumable items, but not subscriptions). Note: On iOS versions earlier than 11.2 this method _will_ also return subscriptions if they are included in your list of SKUs. This is because we cannot differentiate between IAP products and subscriptions prior to 11.2. |
| getSubscriptions | `string[]` Subscription IDs/skus | `Promise<Subscription[]>` | Get a list of subscriptions. Note: On iOS versions earlier than 11.2 this method _will_ also return products if they are included in your list of SKUs. This is because we cannot differentiate between IAP products and subscriptions prior to 11.2. |
| getPurchaseHistory | | `Promise<Purchase[]>` | Gets an inventory of purchases made by the user regardless of consumption status (where possible) |
| getAvailablePurchases | | `Promise<Purchase[]>` | Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
| ~~buyProduct~~ | `string` Product ID/sku | `Promise<Purchase>` | Buy a product |
| requestPurchase | `string` Product ID/sku | `Promise<string>` | Request a purchase. `purchaseUpdatedListener` will receive the result. |
| ~~buyProductWithQuantityIOS~~ | `string` Product ID/sku, `number` Quantity | `Promise<Purchase>` | Buy a product with a specified quantity (iOS only) |
| requestPurchaseWithQuantityIOS | `string` Product ID/sku, `number` Quantity | `Promise<Purchase>` | Buy a product with a specified quantity (iOS only). `purchaseUpdatedListener` will receive the result |
| ~~buySubscription~~ | `string` Subscription ID/sku, `string` Old Subscription ID/sku (on Android), `int` Proration Mode (on Android) | `Promise<Purchase>` | Create (buy) a subscription to a sku. For upgrading/downgrading subscription on Android pass the second parameter with current subscription ID, on iOS this is handled automatically by store. You can also optionally pass in a proration mode integer for upgrading/downgrading subscriptions on Android |
| requestSubscription | `string` Subscription ID/sku, `string` Old Subscription ID/sku (on Android), `int` Proration Mode (on Android) | `Promise<string>` | Create (buy) a subscription to a sku. For upgrading/downgrading subscription on Android pass the second parameter with current subscription ID, on iOS this is handled automatically by store. You can also optionally pass in a proration mode integer for upgrading/downgrading subscriptions on Android |
| clearTransactionIOS | `void` | `void` | Clear up the unfinished transanction which sometimes causes problem. Read more in below readme. |
| clearProductsIOS | `void` | `void` | Clear all products, subscriptions in ios. Read more in below readme. |
| consumePurchaseAndroid | `string` purchase token, `string` developerPayload | `Promise<void>` | Consume a product (on Android.) No-op on iOS. |
| endConnectionAndroid | | `Promise<void>` | End billing connection (on Android.) No-op on iOS. |
| consumeAllItemsAndroid | | `Promise<void>` | Consume all items in android so they are able to buy again (on Android.) No-op on iOS. |
| validateReceiptIos | `object` receiptBody, `boolean` isTest | `object or boolean` result | validate receipt for ios. |
| validateReceiptAndroid | `string` packageName, `string` productId, `string` productToken, `string` accessToken, `boolean` isSubscription | `object or boolean` result | validate receipt for android. |
| requestReceiptIOS |  | `Promise<string>` | Get the current receipt (on iOS.) No-op on Android. |

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
1. In XCode, in the project navigator, right-click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-iap` and add `RNIap.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNIap.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)

#### Android
1. Open up `android/app/src/main/java/[...]/MainApplication.java`
  - Add `import com.dooboolab.RNIap.RNIapPackage;` to the imports at the top of the file
  - Add `new RNIapPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  ```
  include ':react-native-iap'
  project(':react-native-iap').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-iap/android')
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

## Init IAP, In App Billing.
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

## Get Valid Items
To get a list of valid items, call `getProducts()`. You can do it in componentDidMount(), or another area as appropriate for you app. Since a user may first start your app with a bad internet connection, then later have an internet connection, making preparing/getting items more than once may be a good idea. Like if the user has no IAPs available when the app first starts, you may want to check again when the user enters your IAP store.
```javascript
async componentDidMount() {
  try {
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
|`description`| ✓ | ✓ | Returns the localized description on Android and iOS |
|`introductoryPrice`| ✓ | ✓ | Formatted introductory price of a subscription, including its currency sign, such as €3.99. The price doesn't include tax. |
|`introductoryPricePaymentModeIOS`| ✓ | | The payment mode for this product discount. |
|`introductoryPriceNumberOfPeriods`| ✓ | | An integer that indicates the number of periods the product discount is available. |
|`introductoryPriceNumberOfPeriodsIOS`| ✓ | | An integer that indicates the number of periods the product discount is available. |
|`introductoryPriceSubscriptionPeriod`| ✓ | | An object that defines the period for the product discount. |
|`introductoryPriceSubscriptionPeriodIOS`| ✓ | | An object that defines the period for the product discount. |
|`subscriptionPeriodNumberIOS`| ✓ |  | The unit number (in string) of subscription period. |
|`subscriptionPeriodUnitIOS`| ✓ |  | The unit in string like `DAY` or `WEEK` or `MONTH` or `YEAR`. |
|`subscriptionPeriodAndroid`|  | ✓ | Subscription period, specified in ISO 8601 format. For example, P1W equates to one week, P1M equates to one month, P3M equates to three months, P6M equates to six months, and P1Y equates to one year. |
|`introductoryPriceCyclesAndroid`|  | ✓ | The number of subscription billing periods for which the user will be given the introductory price, such as 3. |
|`introductoryPricePeriodAndroid`|  | ✓ | The billing period of the introductory price, specified in ISO 8601 format. |
|`freeTrialPeriodAndroid`|  | ✓ | Trial period configured in Google Play Console, specified in ISO 8601 format. For example, P7D equates to seven days. |

## End Billing Connection
When you are done with the billing, you should release it for android([READ](https://developer.android.com/reference/com/android/billingclient/api/BillingClient.html#endConnectionAndroid())). It is not needed in ios. No need to check platform either since nothing will happen in ios. This can be used in `componentWillUnMount`.
```javascript
componentWillUnmount() {
  RNIap.endConnectionAndroid();
}
```

## Purchase
> The flow of the `purchase` has been renewed by the founding in [issue #307](https://github.com/dooboolab/react-native-iap/issues/307). I've decided to redesign this `purchase flow` not relying on the `promises` or `callback`. There are some reasons not to approach in this way.
1. There may be more than one responses when requesting a payment.
2. The purchase responses are `asynchronuous` which means request that's made beforehand may not complete at first.
3. The purchase may be pended and hard to track what has been done ([example](https://github.com/dooboolab/react-native-iap/issues/307#issuecomment-447745027)).
4. Billing flow is more like and `events` rather than `callback` pattern.

Once you have called `getProducts()`, and you have a valid response, you can call `buyProduct()`. Subscribable products can be purchased just like consumable products and users can cancel subscriptions by using the iOS System Settings.

Before you request any purchase, you should set `purchaseUpdatedListener` from `react-native-iap`.
```javascript
  import RNIap, {
    ProductPurchase,
    purchaseUpdatedListener,
    purchaseErrorListener,
  } from 'react-native-iap';

  let purchaseUpdateSubscription;
  componentDidMount() {
    purchaseUpdateSubscription = purchaseUpdatedListener((purchase: ProductPurchase) => {
      console.log('purchaseUpdatedListener', purchase);
      this.setState({ receipt: purchase.transactionReceipt }, () => this.goNext());
    });
    purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      console.log('purchaseErrorListener', error);
      Alert.alert('purchase error', JSON.stringify(error));
    });
  }
  componentWillMount() {
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
   if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
  }
```

Then define the method like below and call it when user press the button.
```javascript
  requestPurchase = async(sku) => {
    try {
      RNIap.requestPurchase(sku);
    } catch (err) {
      console.warn(err.code, err.message);
    }
  }

  requestSubscription = async(sku) => {
    try {
      RNIap.requestSubscription(sku);
    } catch (err) {
      Alert.alert(err.message);
    }
  }

  render() {
    ...
      onPress={() => this.requestPurchase(product.productId)}
    ...
  }
```

##### New purchase flow
![image](https://user-images.githubusercontent.com/27461460/59160427-d1605600-8b10-11e9-9ca9-80fd2c08fd86.png)

Most likely, you'll want to handle the 'store kit flow' (detailed [here](https://forums.developer.apple.com/thread/6431#14831)), which happens when a user successfully pays after solving a problem with his or her account - for example, when the credit card information has expired.
In this scenario, the initial call to `RNIap.buyProduct` would fail and you'd need to add `addAdditionalSuccessPurchaseListenerIOS` to handle the successful purchase previously. We are planning to remove ~~additionalSuccessPurchaseListenerIOS~~ in future releases so avoid using it. Approach of new purchase flow will prevent such issue in [#307](https://github.com/dooboolab/react-native-iap/issues/307) which was privided in `2.4.0+`.

## Consumption and Restoring Purchases
You can use `getAvailablePurchases()` to do what's commonly understood as "restoring" purchases. Once an item is consumed, it will no longer be available in `getAvailablePurchases()` and will only be available via `getPurchaseHistory()`. However, this method has some caveats on Android -- namely, that purchase history only exists for the single most recent purchase of each SKU -- so your best bet is to track consumption in your app yourself. By default, all items that are purchased will not be consumed unless they are automatically consumed by the store (for example, if you create a consumable item for iOS.) This means that you must manage consumption yourself.  Purchases can be consumed by calling `consumePurchaseAndroid()`. If you want to consume all items, you have to iterate over the purchases returned by `getAvailablePurchases()`.

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
        await RNIap.consumePurchaseAndroid(purchase.purchaseToken);
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

|    | iOS | Android | Comment |
|----|-----|---------|------|
|`productId`| ✓ | ✓ | The product ID for the product. |
|`transactionReceipt`| ✓ | ✓ | `receipt` for ios and stringified JSON of the original purchase object for android. |
|`transactionId`| ✓ | ✓ | A unique order identifier for the transaction. |
|`transactionDate`| ✓ | ✓ | The time the product was purchased, in milliseconds since the epoch (Jan 1, 1970). |
|`purchaseToken`| | ✓ | A token that uniquely identifies a purchase for a given item and user pair. |
|`autoRenewingAndroid`|  | ✓ | Indicates whether the subscription renews automatically. If true, the subscription is active, and will automatically renew on the next billing date. If false, indicates that the user has canceled the subscription. |
|`dataAndroid`|  | ✓ | Original json for purchase data. |
|`signatureAndroid`|  | ✓ | String containing the signature of the purchase data that was signed with the private key of the developer. The data signature uses the RSASSA-PKCS1-v1_5 scheme. |
|`originalTransactionDateIOS`| ✓ |  | For a transaction that restores a previous transaction, the date of the original transaction. |
|`originalTransactionIdentifierIOS`| ✓ |  | For a transaction that restores a previous transaction, the transaction identifier of the original transaction. |

You need to test with one sandbox account, because the account holds previous purchase history.

## Receipt validation
From `react-native-iap@0.3.16`, we support receipt validation. For Android, you need separate json file from the service account to get the `access_token` from `google-apis`, therefore it is impossible to implement serverless. You should have your own backend and get `access_token`. With `access_token` you can simply call `validateReceiptAndroid` method we implemented. Further reading is [here](https://stackoverflow.com/questions/35127086/android-inapp-purchase-receipt-validation-google-play?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa).

Currently, serverless receipt validation is possible using `validateReceiptIos` method. The first parameter, you should pass `transactionReceipt` which returns after `buyProduct`. The second parameter, you should pass whether this is `test` environment. If `true`, it will request to `sandbox` and `false` it will request to `production`.

```javascript
const receiptBody = {
  'receipt-data': purchase.transactionReceipt,
  'password': '******'
};
const result = await RNIap.validateReceiptIos(receiptBody, false);
console.log(result);
```
For further information, please refer to [guide](https://developer.apple.com/library/content/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html).

Sometimes you will need to get the receipt at times other than after purchase. For example, when a user needs to ask for permission to buy a product (`Ask to buy` flow) or unstable internet connections. For these cases we have a convenience method `requestReceiptIOS` which gets the latest receipt for the app at any given time. The response is base64 encoded.

### iOS Purchasing process right way.
Issue regarding `valid products`
- In iOS, generally you are fetching valid products at App launching process. If you fetch again, or fetch valid subscription, the products are added to the array object in iOS side (objective-c NSMutableArray). This makes unexpected behavior when you fetch with a part of product lists.
(For example, if you have products of [A, B, C], and you call fetch function with only [A], this module returns [A, B, C]). This is weird, but it works.
- But, weird result is weird, so we made a new method which remove all valid products. If you need to clear all products, subscriptions in that array, just call `clearProducts()`, and do the fetching job again, and you will receive what you expected.

## Q & A

#### Can I buy product right away skipping fetching products if I already know productId?
- You could only in `Android` in `react-native-iap` below version 3. However, now you should always `fetchProducts` first in both platforms. It is because `android` billingClient has been updated `billingFlowParams` to include [SkuDetails](https://developer.android.com/reference/com/android/billingclient/api/SkuDetails) instead `sku` string which is hard to share between `react-native` and `android`. It happened in `com.android.billingclient:billing:2.0.+`. Therefore we've planned to store items to be fetched in `android` before requesting purchase from `react-native` side. Therefore, you should always fetch list of items to `purchase` before requesting purchase.
  * Related [blog](https://medium.com/ios-development-tips-and-tricks/working-with-ios-in-app-purchases-e4b55491479b).
  * Related issue in [#283](https://github.com/dooboolab/react-native-iap/issues/283).

#### How do I validate receipt in ios?
- Official doc is [here](https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html).
- Resolved issues in [#203](https://github.com/dooboolab/react-native-iap/issues/203), [#237](https://github.com/dooboolab/react-native-iap/issues/237).

#### How do I validate receipt in android?
- Offical doc is [here](https://developer.android.com/google/play/billing/billing_library_overview).
- I've developed this feature for other developers to contribute easily who are aware of these things. The doc says you can also get the `accessToken` via play console without any of your backend server. You can get this by following process.
  * Select your app > Services & APIs > "YOUR LICENSE KEY FOR THIS APPLICATION Base64-encoded RSA public key to include in your binary". [reference](https://stackoverflow.com/questions/27132443/how-to-find-my-google-play-services-android-base64-public-key).

#### How to make consumable product in android developer mode?
- If you are facing `"You already own this item"` on developer(test) mode you might check [related issue #126](https://github.com/dooboolab/react-native-iap/issues/126#issuecomment-439084872)

#### How do I use react-native-iap in expo?
- You should detach from `expo` and get `expokit` out of it.
- Releated issue in [#174](https://github.com/dooboolab/react-native-iap/issues/174).

#### How do I handle promoted products in ios?
- Offical doc is [here](https://developer.apple.com/app-store/promoting-in-app-purchases/)
- Start the IAPPromotionObserver in `-[application:didFinishLaunchingWithOptions:]` your AppDelegate:

    ```objc
    // Add '#import "IAPPromotionObserver.h"' to your imports
    [IAPPromotionObserver startObserving];
    ```

- Add an event listener for the `iap-promoted-product` event somewhere early in your app's lifecycle:

  ```javascript
  // Import the `NativeModules` and `NativeEventEmitter` components from 'react-native'
  const { RNIapIos } = NativeModules;
  const IAPEmitter = new NativeEventEmitter(RNIapIos);

  IAPEmitter.addListener('iap-promoted-product', async () => {
    // Check if there's a persisted promoted product
    const productID = await RNIap.getPromotedProduct();
    if (productID !== null) { // You may want to validate the product ID against your own SKUs
      try {
        await RNIap.buyPromotedProduct(); // This will trigger the App Store purchase process
      } catch(e) {
        console.warn(e);
      }
    }
  });
  ```

#### Invalid productId in ios.
- Please try below and make sure you've done belows.
  - Steps
    1. Completed an effective "Agreements, Tax, and Banking."
    2. Setup sandbox testing account in "Users and Roles."
    3. Signed into iOS device with sandbox account.
    3. Set up three In-App Purchases with the following status:
       i. Ready to Submit
       ii. Missing Metadata
       iii. Waiting for Review
    4. Enable "In-App Purchase" in Xcode "Capabilities" and in Apple Developer -> "App ID" setting.
Delete app / Restart device / Quit "store" related processes in Activity Monitor / Xcode Development Provisioning Profile -> Clean -> Build.
  - Related issues [#256](https://github.com/dooboolab/react-native-iap/issues/256) , [#263](https://github.com/dooboolab/react-native-iap/issues/263).

#### Module is not working as expected. Throws error.
- The `react-native link` script isn't perfect and sometimes broke. Please try `unlinking` and `linking` again. Or try manual installing.

#### getAvailablePurchases return empty array.
- `getAvailablePurchases` is used only when you purchase a non-consumable product. This can be restored only. If you want to find out if a user subscribes the product, you should check the receipt which you should store in your own database. Apple suggests you handle this in your own backend to do things like what you are trying to achieve.

#### Using Face ID & Touch to checkout on iOS
- After you have completed the setup and set your deployment target to iOS 12, FaceID and Touch to purchase will be activated by default in production. Please note that in development or TestFlight, it will **NOT** use FaceID / Touch to checkout because they are using the Sandbox environment.


## Supporting react-native-iap
`react-native` is an open source project with MIT license. We are willing to maintain this repository to support devs to monetize around the world. Since `IAP` itself is not perfect on each platform, we desperately need this project to be maintained. If you'd like to help us, please consider being with us in [Open Collective](https://opencollective.com/react-native-iap).

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

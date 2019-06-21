# react-native-iap (deprecated)
> This `readme` is for users who use `react-native-iap` version `< 3.0.0`. Since there are several updates covered in `3.0.0`, we moved this `README` to avoid confusion.

> Checkout example code<br/>
![wjl0ak0fgj](https://user-images.githubusercontent.com/27461460/52619625-87aa8a80-2ee5-11e9-9aee-6691c34408f3.gif)

## Playstore & Itunnesconnect configuration
  - Please refer to [Blog](https://medium.com/@dooboolab/react-native-in-app-purchase-121622d26b67).

## Migration Guide
For `ios` under version 12, it is compatible until `react-nativep-iap` version `2.4.8`. From `2.4.9`, it will support `ios` >= 12.

`2.0.0-alpha1` has released. Not much difference. There were some parameters supports and changes to distinguish the differences in platform at one sight. Please follow the readme what you get in returned variables when calling `getItems` and when purchasing through `buyProduct` or `buySubscription`.

Difference between `0.3.*` and `1.0.0` has only one method renaming `refreshItems` to `consumeAllItems`.

To migrate `0.2.*` to `0.3.*`, You can follow the below guide.

| 0.2.* | 0.3.* | 1.* ~ 2.* |
| --- | --- | --- |
| `prepareAndroid` | `prepare` | `prepare` => `initConnection` |
| `getItems` | `getProducts` | `getProducts` |
| `getSubscribeItems` | `getSubscriptions` | `getSubscriptions` |
| `getPurchasedItemsAndroid` | `getPurchaseHistory` | `getPurchaseHistory` |
| \`\` | `getAvailablePurchases` | `getAvailablePurchases` |
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

#### Methods
| Func  | Param  | Return | Description |
| :------------ |:---------------:| :---------------:| :-----|
| ~~prepare~~ |  | `Promise<void>` | Deprecated. Use `initConnection` instead. |
| initConnection |  | `Promise<boolean>` | Init IAP module. On Android this can be called to preload the connection to Play Services. In iOS, it will simply call `canMakePayments` method and return value.|
| getProducts | `string[]` Product IDs/skus | `Promise<Product[]>` | Get a list of products (consumable and non-consumable items, but not subscriptions). Note: On iOS versions earlier than 11.2 this method _will_ also return subscriptions if they are included in your list of SKUs. This is because we cannot differentiate between IAP products and subscriptions prior to 11.2. |
| getSubscriptions | `string[]` Subscription IDs/skus | `Promise<Subscription[]>` | Get a list of subscriptions. Note: On iOS versions earlier than 11.2 this method _will_ also return products if they are included in your list of SKUs. This is because we cannot differentiate between IAP products and subscriptions prior to 11.2. |
| getPurchaseHistory | | `Promise<Purchase[]>` | Gets an inventory of purchases made by the user regardless of consumption status (where possible) |
| getAvailablePurchases | | `Promise<Purchase[]>` | Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
| buySubscription | `string` Subscription ID/sku, `string` Old Subscription ID/sku (on Android), `int` Proration Mode (on Android) | `Promise<Purchase>` | Create (buy) a subscription to a sku. For upgrading/downgrading subscription on Android pass the second parameter with current subscription ID, on iOS this is handled automatically by store. You can also optionally pass in a proration mode integer for upgrading/downgrading subscriptions on Android |
| buyProduct | `string` Product ID/sku | `Promise<Purchase>` | Buy a product |
| buyProductWithQuantityIOS | `string` Product ID/sku, `number` Quantity | `Promise<Purchase>` | Buy a product with a specified quantity (iOS only) |
| ~~buyProductWithoutFinishTransaction~~ | `string` Product ID/sku | `Promise<Purchase>` | Buy a product without finish transaction call (iOS only) |
| ~~finishTransaction~~ | `void` | `void` | Send finishTransaction call to Apple IAP server. Call this function after receipt validation process |
| ~~clearTransaction~~ | `void` | `void` | Clear up the unfinished transanction which sometimes causes problem. Read more in below readme. |
| clearProducts | `void` | `void` | Clear all products, subscriptions in ios. Read more in below readme. |
| consumePurchase | `string` Purchase token | `Promise<void>` | Consume a product (on Android.) No-op on iOS. |
| endConnection | | `Promise<void>` | End billing connection (on Android.) No-op on iOS. |
| consumeAllItems | | `Promise<void>` | Consume all items in android so they are able to buy again (on Android.) No-op on iOS. |
| validateReceiptIos | `object` receiptBody, `boolean` isTest | `object or boolean` result | validate receipt for ios. |
| validateReceiptAndroid | `string` packageName, `string` productId, `string` productToken, `string` accessToken, `boolean` isSubscription | `object or boolean` result | validate receipt for android. |

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
When you are done with the billing, you should release it for android([READ](https://developer.android.com/reference/com/android/billingclient/api/BillingClient.html#endConnection())). It is not needed in ios. No need to check platform either since nothing will happen in ios. This can be used in `componentWillUnMount`.
```javascript
componentWillUnmount() {
  RNIap.endConnection();
}
```

## Purchase
Once you have called `getProducts()`, and you have a valid response, you can call `buyProduct()`. Subscribable products can be purchased just like consumable products and users can cancel subscriptions by using the iOS System Settings.

```javascript
  try {
    if(this.subscription) {
      this.subscription.remove();
    }
    // Will return a purchase object with a receipt which can be used to validate on your server.
    const purchase = await RNIap.buyProduct('com.example.coins100');
    this.setState({
      receipt: purchase.transactionReceipt, // save the receipt if you need it, whether locally, or to your server.
    });
  } catch(err) {
    // standardized err.code and err.message available
    console.warn(err.code, err.message);
    this.subscription = RNIap.addAdditionalSuccessPurchaseListenerIOS(async (purchase) => {
      this.setState({ receipt: purchase.transactionReceipt }, () => this.goToNext());
      this.subscription.remove();
    });
  }
```

Most likely, you'll want to handle the 'store kit flow' (detailed [here](https://forums.developer.apple.com/thread/6431#14831)), which happens when a user succesfully pays after solving a problem with his or her account - for example, when the credit card information has expired.
In this scenario, the initial call to `RNIap.buyProduct` would fail and you'd need to add `addAdditionalSuccessPurchaseListenerIOS` to handle the successful purchase. Otherwise, you'll be in a scenario where the user paid but your application is not aware of it
* This feature was provided because of issue in [#307](https://github.com/dooboolab/react-native-iap/issues/307).
* This feature is provided from `react-native-iap` version `2.4.0-beta1`. Currently this feature is in test.

In RNIapExample, upon receiving a purchase receipt, main page will navigate to Second.js.


## Consumption and Restoring Purchases
You can use `getAvailablePurchases()` to do what's commonly understood as "restoring" purchases. Once an item is consumed, it will no longer be available in `getAvailablePurchases()` and will only be available via `getPurchaseHistory()`. However, this method has some caveats on Android -- namely, that purchase history only exists for the single most recent purchase of each SKU -- so your best bet is to track consumption in your app yourself. By default, all items that are purchased will not be consumed unless they are automatically consumed by the store (for example, if you create a consumable item for iOS.) This means that you must manage consumption yourself.  Purchases can be consumed by calling `consumePurchase()`. If you want to consume all items, you have to iterate over the purchases returned by `getAvailablePurchases()`.

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

### iOS Purchasing process right way.

Purchasing consumable products in iOS consists of the following steps.

```sh
Step 1 : Purchasing via IAP (Apple server)
Step 2 : Check the validation of the receipt (either on device or server)
Step 3 : Apply the product to the Application
```

But, sometimes app doesn't make it to step 3, and user loose the product with successful payment.
Non-consumable products can be restored via getPurchaseHistory function, but consumable products can be lost.
In this case, use `buyProductWithoutFinishTransaction` to purchase action and use `finishTransaction` to finish payment after receipt validation and supply the products to user.

```javascript
const purchase = await RNIap.buyProductWithoutFinishTransaction(productId);
// to something in your server
const { transactionReceipt } = purchase;
sendToServer(transactionReceipt, {
  onSuccess: () => {
    RNIap.finishTransaction();
  },
});
```

However, sometimes apple internally causes problem itself before `finishTransaction` where queues are not resolved that may result in failure in next purchases ([related issue #256](https://github.com/dooboolab/react-native-iap/issues/257)). Therefore, we've made another method that may resolve this kind of issues in next purchases which is to finish up the queues at the start of each purchase. To resolve this, try the code like below.
```javascript
await RNIap.clearTransaction(); // add this method at the start of purchase.
const purchase = await RNIap.buyProductWithoutFinishTransaction(productId);
// to something in your server
const { transactionReceipt } = purchase;
sendToServer(transactionReceipt, {
  onSuccess: () => {
    RNIap.finishTransaction();
  },
});
```

Another issue regarding `valid products`. In iOS, generally you are fetching valid products at App launching process.
If you fetch again, or fetch valid subscription, the products are added to the array object in iOS side (objective-c NSMutableArray).
This makes unexpected behavior when you fetch with a part of product lists.
(For example, if you have products of [A, B, C], and you call fetch function with only [A], this module returns [A, B, C])
This is weird, but it works.
But, weird result is weird, so we made a new method which remove all valid products.
If you need to clear all products, subscriptions in that array, just call `clearProducts()`, and do the fetching job again, and you will receive what you expected.

We've like to update this solution as version changes in `react-native-iap`.

## Q & A

#### Can I buy product right away skipping fetching products if I already know productId?
- You can in `Android` but not in `ios`. In `ios` you should always `fetchProducts` first. You can see more info [here](https://medium.com/ios-development-tips-and-tricks/working-with-ios-in-app-purchases-e4b55491479b).
- Related issue in [#283](https://github.com/dooboolab/react-native-iap/issues/283).

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

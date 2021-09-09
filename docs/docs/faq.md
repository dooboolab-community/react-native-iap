# Frequently Asked Questions

### How can a user cancel a subscription in my app?
- For both iOS and Android your users cannot cancel subscriptions inside your app. You need to direct your users to iTunes/the App Store or Google Play.

- You can do this on iOS 12 or later (for earlier iOS versions, use [this URL](https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/manageSubscriptions)):
    ```javascript
    Linking.openURL('https://apps.apple.com/account/subscriptions')
    ```

- You can do this on Android:
    ```javascript
    Linking.openURL('https://play.google.com/store/account/subscriptions?package=YOUR_PACKAGE_NAME&sku=YOUR_PRODUCT_ID
    ```
    (change `YOUR_PACKAGE_NAME` and `YOUR_PRODUCT_ID`)

- More on `Linking` in React Native: https://facebook.github.io/react-native/docs/linking


### Can I buy product right away skipping fetching products if I already know productId?
- You could only in Android in `react-native-iap@^2.*`.

    However, now you should always `fetchProducts` first in both platforms.
    It is because Android `BillingClient` has been updated `billingFlowParams`
    to include [SkuDetails](https://developer.android.com/reference/com/android/billingclient/api/SkuDetails) instead `sku` string which is
    hard to share between `react-native` and `android`.

    It happened since `com.android.billingclient:billing:2.0.*`.

    Therefore we've planned to store items to be fetched in Android before
    requesting purchase from `react-native` side, and you should always fetch
    list of items to “purchase” before requesting purchase.

  - Related [blog](https://medium.com/p/e4b55491479b).
  - Related issue [#283](https://github.com/dooboolab/react-native-iap/issues/283).


### How do I validate receipt in iOS?
- Official doc is [here](https://developer.apple.com/library/content/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html).
- Resolved issues in [#203](https://github.com/dooboolab/react-native-iap/issues/203), [#237](https://github.com/dooboolab/react-native-iap/issues/237).


### How do I validate receipt in Android?
- Official doc is [here](https://developer.android.com/google/play/billing/billing_library_overview).
- I've developed this feature for other developers to contribute easily who are
    aware of these things. The doc says you can also get the `accessToken` via
    play console without any of your backend server.

    You can get this by following process:
  - Open [Google Play Console](https://play.google.com/apps/publish/)
      &gt; Select your app
      &gt; Development tools
      &gt; Services & APIs
      &gt; Find in “Your license key for this application”.
      [reference](https://stackoverflow.com/questions/27132443).


### How to make consumable product in Android developer mode?
- If you are facing `"You already own this item"` on developer(test) mode,
    you might check related issue [#126](https://github.com/dooboolab/react-native-iap/issues/126)


### How do I use `react-native-iap` in Expo?
- You should detach from `expo` and get `expokit` out of it.
- Releated issue in [#174](https://github.com/dooboolab/react-native-iap/issues/174).


### How do I handle promoted products in iOS?
- Official doc is [here](https://developer.apple.com/app-store/promoting-in-app-purchases/).
- No initial setup needed from `4.4.5`.

Somewhere early in your app's lifecycle,
call `initConnection` first (see above), then
add a listener for the `iap-promoted-product` event:

  ```javascript
  import { NativeModules, NativeEventEmitter } from 'react-native'
  const { RNIapIos } = NativeModules;
  const IAPEmitter = new NativeEventEmitter(RNIapIos);

  IAPEmitter.addListener('iap-promoted-product', async () => {
    // Check if there's a persisted promoted product
    const productId = await RNIap.getPromotedProductIOS();
    if (productId !== null) { // You may want to validate the product ID against your own SKUs
      try {
        await RNIap.buyPromotedProductIOS(); // This will trigger the App Store purchase process
      } catch(error) {
        console.warn(error);
      }
    }
  });
  ```


### Using Face ID & Touch to checkout on iOS
- After you have completed the setup and set your deployment target to `iOS 12`,
    FaceID and Touch to purchase will be activated by default in production.

    Please note that in development or TestFlight, it will **NOT** use FaceID/Touch
    to checkout because they are using the Sandbox environment.

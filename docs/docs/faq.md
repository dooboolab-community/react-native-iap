# Frequently Asked Questions

### How can a user cancel a subscription in my app?

- For both iOS and Android your users cannot cancel subscriptions inside your app. You need to direct your users to iTunes/the App Store or Google Play.

- You can do this on iOS 12 or later (for earlier iOS versions, use [this URL](https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/manageSubscriptions)):

  ```ts
  Linking.openURL('https://apps.apple.com/account/subscriptions');
  ```

- You can do this on Android:

  ```ts
  Linking.openURL(
    'https://play.google.com/store/account/subscriptions?package=YOUR_PACKAGE_NAME&sku=YOUR_PRODUCT_ID',
  );
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

> This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).

After installing this npm package, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": ["react-native-iap"]
  }
}
```

Next, rebuild your app as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.

## API

The plugin provides props for extra customization. Every time you change the props or plugins, you'll need to rebuild (and `prebuild`) the native app. If no extra properties are added, **Play Store** configuration will be added.

Optional prop:

- `paymentProvider` (_string_): payment provider to configure: `Play Store`, `Amazon AppStore`, `both`

#### Example

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-iap",
        {
          "paymentProvider": "both"
        }
      ]
    ]
  }
}
```

### How do I handle promoted products in iOS?

- Offical doc is [here](https://developer.apple.com/app-store/promoting-in-app-purchases/).

#### Native

This is (as of version 8.6.0) handled automatically in the native code. No additional native setup is needed

#### JavaScript

Somewhere early in your app's lifecycle, add a listener for the `iap-promoted-product` event:

```ts
import {NativeModules, NativeEventEmitter} from 'react-native';
const {RNIapIos} = NativeModules;
const RNIapEmitter = new NativeEventEmitter(RNIapIos);

RNIapEmitter.addListener('iap-promoted-product', async () => {
  // Check if there's a persisted promoted product
  const productId = await RNIap.getPromotedProductIOS();
  if (productId !== null) {
    // You may want to validate the product ID against your own SKUs
    try {
      await RNIap.buyPromotedProductIOS(); // This will trigger the App Store purchase process
    } catch (error) {
      console.warn(error);
    }
  }
});
```

Then call `initConnection` (see above)

### Using Face ID & Touch to checkout on iOS

- After you have completed the setup and set your deployment target to `iOS 12`,
  FaceID and Touch to purchase will be activated by default in production.

  Please note that in development or TestFlight, it will **NOT** use FaceID/Touch
  to checkout because they are using the Sandbox environment.

### Get products has empty list

Here are some resources you might get help out of.

- For `iOS`, check if you’ve agreed on taxes
  https://github.com/dooboolab/react-native-iap/issues/1272#issuecomment-800131501. Also, you may try to add storekit.

- For Android, hope you to check this one.
  https://github.com/dooboolab/react-native-iap/issues/124#issuecomment-386593185

### Update listener called many times on iOS (Storekit 1)

This is not what happens typically in production. This is a design flaw in the native API. Some developers opt to create a new account everytime. Some others filter out the duplicate transactions.

What you're seeing with multiple process purchase calls is actually normal in the case of auto-renewing subscriptions. When you test in the sandbox those subscriptions renew very quickly (how fast depends on sub period) and you can often see several of those appear in the queue after an app restart. Also, if a purchase hasn't been successfully completed (which is likely given those exceptions) then they can remain in the queue and result in multiple calls to your ProcessPurchase on every app restart until the problem is resolved. **_Note_**
This is not a problem caused by react-native-iap.

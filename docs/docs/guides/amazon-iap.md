---
sidebar_position: 7
---

# Amazon IAP

The guide assumes that `react-native-iap` is implemented in your app and works with the Play Store without issues. Here are the additional steps to configure Amazon IAP.

### Add In-App Items for your app

1. Create "In-App Items" using Amazon Developer portal for your app. Amazon put up detailed instructions at https://developer.amazon.com/docs/in-app-purchasing/iap-create-and-submit-iap-items.html

2. Add this a call to `RNIapActivityListener.registerActivity(this);` inside your `MainActivity`'s `onCreate` method. This is a necessary step only when using Amazon, but adding it will not affect negatively your Google Play Android builds. E.g.:

```java

import com.dooboolab.RNIap.RNIapActivityListener;
...
public class MainActivity extends ReactActivity {
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //Needed for Amazon IAP
        RNIapActivityListener.registerActivity(this);
    }
```
  

3. Add new `SKU` strings to your `Iap.getProducts` or `Iap.getSubscriptions` calls.

### App configuration

1. The current version of Amazon IAP SDK does not play well with R8 optimization. (https://developer.amazon.com/docs/in-app-purchasing/iap-obfuscate-the-code.html).

Add the code below in `android/app/proguard-rules.pro`:

```diff
+ -dontwarn com.amazon.**
+ -keep class com.amazon.** {*;}
+ -keepattributes *Annotation*
```

## Testing in development

To run the example app, with the amazon provider, run:

```bash npm2yarn
npm run android:amazon
```

Amazon offers the `App Tester` tool to make In-App purchases testing easier. More information can be found [here](https://developer.amazon.com/docs/in-app-purchasing/iap-app-tester-user-guide.html).

## Server Validation

Amazon IAP API supports validation of In-App purchases on a remote server side. More information can be found [here](https://developer.amazon.com/docs/in-app-purchasing/iap-rvs-for-android-apps.html).

## Subscriptions

When fetching subscriptions from Amazon, make sure to use children `SKUs` (so SKUs for specific period ex. monthly or annually), do not use parent subscription `SKUs`!

## Caveats

Amazon does not return decimal price & currency. Only localized price as a string (ex. 11.22$), see this [page](https://forums.developer.amazon.com/answers/234257/view.html).

The package will try its best to parse the string into decimal price. If the package cannot parse the price, it will be 0. Currency is detected based on users Amazon marketplace.

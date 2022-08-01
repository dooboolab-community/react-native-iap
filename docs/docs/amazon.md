# Amazon IAP Support

---

The guide assumes that `react-native-iap` is implemented in your app and it works with Google Play with no issues.
Here are the additional steps to add Amazon IAP support.

- Add In-App Items for your app:

  1. Create "In-App Items" using Amazon Developer portal for your app. Amazon put up detailed instructions at https://developer.amazon.com/docs/in-app-purchasing/iap-create-and-submit-iap-items.html
  2. Add new SKU strings to your `RNIap.getProducts` or `RNIap.getSubscriptions` calls

- App configuration
  1. The current version of Amazon IAP SDK does not play well with R8 optimization. (https://developer.amazon.com/docs/in-app-purchasing/iap-obfuscate-the-code.html).
     Add the code below in `android/app/proguard-rules.pro`
  ```
  -dontwarn com.amazon.**
  -keep class com.amazon.** {*;}
  -keepattributes *Annotation*
  ```

## Testing in development

The `react-native-iap` determines the the appstore depending on the "variant" of the app that you are running. For example to run the Amazon variant use the `variant` flag:

```
yarn android --variant=AmazonDebug
```

Amazon offers the `App Tester` tool to make in-app purchases testing easier. More information can be found at https://developer.amazon.com/docs/in-app-purchasing/iap-app-tester-user-guide.html

## Server Validation

Amazon IAP API supports validation of in-app purchases on a remote server side. More information is available at https://developer.amazon.com/docs/in-app-purchasing/iap-rvs-for-android-apps.html

## Subscriptions

When fetching subscriptions from Amazon, make sure to use children SKUs (so SKUs for specific period ex. monthly or annually), do not use parent subscription SKUs!

## Caveats

Amazon does not return decimal price & currency. Only localized price as a string (ex. 11.22$).
Please refer to https://forums.developer.amazon.com/answers/234257/view.html

The package will try its best to parse this string into decimal price.
If the package cannot parse the price, it will be 0.
Currency is detected based on users Amazon marketplace.

Amazon IAP Support
------------------
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

  2. Update AndroidManifest.xml to add the following:
  ```
  <application>
  ...
    <receiver android:name = "com.amazon.device.iap.ResponseReceiver"
        android:permission = "com.amazon.inapp.purchasing.Permission.NOTIFY" >
      <intent-filter>
        <action android:name = "com.amazon.inapp.purchasing.NOTIFY" />
      </intent-filter>
    </receiver>
  ...
  </application>
  ```

Testing in development
----------------------
The `react-native-iap` checks the install source of the app and determines the usage of Amazon IAP API based on that.
The development environment does not set the install source, the default is to use Google Play as a fallback in this case.
If the fallback needs to be changed to use Amazon Appstore while testing, the following code snippet needed just before calling `RNIap.initConnection` for the first time in the app:
```
if (__DEV__) {
  RNIap.setFallbackInstallSourceAndroid(RNIap.InstallSourceAndroid.AMAZON);
}
RNIap.initConnection(...)
```
Amazon offers the `App Tester` tool to make in-app purchases testing easier. More information can be found at https://developer.amazon.com/docs/in-app-purchasing/iap-app-tester-user-guide.html

Server Validation
-----------------
Amazon IAP API supports validation of in-app purchases on a remote server side. More information is available at https://developer.amazon.com/docs/in-app-purchasing/iap-rvs-for-android-apps.html

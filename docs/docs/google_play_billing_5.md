
# Google Play Billing V5 Support (Beta)
------------------
Native implementation guide: https://developer.android.com/google/play/billing/migrate-gpblv5
For compatibility mapping look here:
https://developer.android.com/google/play/billing/compatibility



Implementation 
---------------
If you are not using any of the new billing features such as subscription base plans or subscription offers, then no changes are required to continue to use the library. However, if you want to use the new API,
you'll need to make the following changes:

Before you call `initConnection`, call `setNativeAndroidModule` like this:

```
RNIap.setAndroidNativeModule(NativeModules.RNIapModule)
RNIap.initConnection()
...
```
From then on, most API calls are the same, except for `buyItemByType`. It now takes an additional optional paramenter: `selectedOfferIndex`. you can get that from the ProductDetails 
returned by `getProducts`

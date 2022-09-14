# Migrating to 11.0.0

Version 11.0.0 is centered around implementing iOS Storekit 2.

I've worked hard on keeping backward compatibility. However there are things that don't translate directly to previous versions.

## API changes

These are changes that you'd need to make even if you are not going to use Storekit 2:

- `requestPurchaseWithOfferIOS` and `requestPurchaseWithQuantityIOS` are now part of `requestPurchase` by simply passing the appropriate parameters

- Methods that are exclusive to a platform, have been moved to nested objects `IapAndroid`, `IapAmazon`, `IapIos`, `IapIosSk2`. So for example `validateReceiptAndroid` is now available as:

```ts
import {IapAndroid} from 'react-native-iap'
...
IapAndroid.validateReceiptAndroid(...)
```

In particular the following methods are avaiable only on Sk2 : `sync`,`isEligibleForIntroOffer`, `subscriptionStatus`, `currentEntitlement`,`latestTransaction` should be called as this:

```ts
import {IapIosSk2} from 'react-native-iap'
...
IapIosSk2.isEligibleForIntroOffer(...)
```

This allows for greater flexibility to use methods that are specific to a platform but the others don't offer. All the other common methods are still called in the same way as before

## Using Storekit 2

Storekit 2 requiers iOS 15 as a minimum. If your app supports older iOS versions, you'll have to consider the endgecases of jumping back and forth. The library will use the old implementation (Storekit 1) as a default on devices with older versions of iOS

### How do I know what's the minimum version of iOS my app supports?

Open `ios/Podfile` file
and look for the following line:

```
platform :ios, '15.0'
```

### How do I enable the use of Storekit 2

Call `enableStorekit2` before you initialize your connection as follows:

```ts
enableStorekit2()
await initConnection()
...
```

### Buying items for user

When calling `requestPurchase`:
The name of this parameter has changed to match the new API
`applicationUsername` -> `appAccountToken`

## No longer available in Sk2:

purchase promoted product. I haven't found the equivalent of promoted product purchase in the new SDK.

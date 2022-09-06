---
sidebar_position: 5
---

# Receipts

### With [IAPHUB](https://www.iaphub.com)

IAPHUB is a service that takes care of the ios/android receipt validation for you, you can set up [webhooks](https://dashboard.iaphub.com/documentation/webhook) in order to get notifications delivered automatically to your server on events such as a purchase, a subscription renewal...

You can use it by calling the API manually to [process your receipt](https://dashboard.iaphub.com/documentation/api/post-receipt) or use the [react-native-iaphub](https://github.com/iaphub/react-native-iaphub) module that is just a wrapper of react-native-iap with IAPHUB built-in.

### With Google Play

For Android, you need separate json file from the service account to get the
`access_token` from `google-apis`, therefore it is impossible to implement serverless.

You should have your own backend and get `access_token`.
With `access_token` you can simply call `validateReceiptAndroid()` we implemented.
Further reading is [here](https://stackoverflow.com/questions/35127086) or refer to [example repo](https://github.com/Bang9/android-get-access-token-example).

### With App Store

#### Local Validation

Local on-device cryptographic validation is not currently supported. More details are here: https://developer.apple.com/documentation/appstorereceipts/validating_receipts_on_the_device

#### Validating with the App Store

> WARNING: This method is not recommended for production usage, and Apple explicitly warn against it in their docs: https://developer.apple.com/documentation/storekit/original_api_for_in-app_purchase/validating_receipts_with_the_app_store

This can be used as a convenience method for developing and testing receipt validation through the development lifecycle.

Currently, validating receipts with the App Store is possible locally using `validateReceiptIos()`.

- The first parameter, you should pass `transactionReceipt` which returns after `buyProduct()`.
- The second parameter, you should pass whether this is `test` environment.
  If `true`, it will request to `sandbox` and `false` it will request to `production`.

```ts
const receiptBody = {
  'receipt-data': purchase.transactionReceipt,
  password: '******', // app shared secret, can be found in App Store Connect
};
const result = await RNIap.validateReceiptIos(receiptBody, false);
console.log(result);
```

For further information, please refer to [guide](https://developer.apple.com/library/content/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html).

Sometimes you will need to get the receipt at times other than after purchase.
For example, when a user needs to ask for permission to buy a product (`Ask to buy`
flow) or unstable internet connections.

For these cases we have a convenience method `getReceiptIOS()` which gets
the latest receipt for the app at any given time. The response is base64 encoded.

### iOS Purchasing process right way.

Issue regarding `valid products`

- In iOS, generally you are fetching valid products at App launching process.

  If you fetch again, or fetch valid subscription, the products are added to
  the array object in iOS side (Objective-C `NSMutableArray`).

  This makes unexpected behavior when you fetch with a part of product lists.

  For example, if you have products of `[A, B, C]`, and you call fetch function
  with only `[A]`, this module returns `[A, B, C]`).

  This is weird, but it works.

- But, weird result is weird, so we made a new method which remove all valid products.

  If you need to clear all products, subscriptions in that array, just call
  `clearProductsIOS()`, and do the fetching job again, and you will receive what
  you expected.

### Example backend (Node.js)

[Here](https://github.com/mifi/in-app-subscription-example) you can find an example backend for idempotent validating of receipts on both iOS/Android and storing and serving subscription state to the client.

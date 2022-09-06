---
sidebar_position: 8
---

# Troubleshooting

## Common issues

Most of the issues encountered by users are caused by:

- A device simulator. Use a real device for testing!
- The sandbox environment of the project not being configured properly ([Android Sandbox configuration](https://www.iaphub.com/docs/set-up-android/configure-sandbox-testing), [iOS sandbox configuration](https://www.iaphub.com/docs/set-up-ios/configure-sandbox-testing/))
- An incorrect usage of the library. Read the [documentation](https://react-native-iap.dooboolab.com).

## `getProducts` returns an empty array

- Please double check if you've called `initConnection`.
- Please wait for max. 24 hours to fetch your IAP products if you've just uploaded them. [Related to issue](https://github.com/dooboolab/react-native-iap/issues/1065).
- For `iOS`, from iOS version `>=13`, we seem to use `StoreKit` to fix this issue as [mentioned in stackoverflow](https://stackoverflow.com/questions/58020258/requesting-an-in-app-purchase-in-ios-13-fails/58065711#58065711).
- For `android`, please double check [issue comment here](https://github.com/dooboolab/react-native-iap/issues/124#issuecomment-386593185) and see if you've missed something.

## `getAvailablePurchases()` returns an empty array

- `getAvailablePurchases()` is used only when you purchase a non-consumable product. This can be restored only.
- If you want to find out if a user subscribes the product, you should check the receipt which you should store in your own database.
- Apple suggests you handle this in your own backend to do things like what you are trying to achieve.

## Invalid `productId` in iOS.

Please try below and make sure you've done all the steps:

1. Completed an effective "Agreements, Tax, and Banking."
2. Setup sandbox testing account in "Users and Roles."
3. Signed into iOS device with sandbox account in "Settings / iTunes & App Stores".

4. Set up three In-App Purchases with the following status:

   - Ready to Submit
   - Missing Metadata
   - Waiting for Review

5. Enable "In-App Purchase" in Xcode "Capabilities" and in Apple Developer -> "App ID" setting.

6. Clean up builds:
   - Delete the app on device
   - Restart device
   - Quit “store” related processes in Activity Monitor
   - Development Provisioning Profile -> Clean -> Build.

- Related issues [#256](https://github.com/dooboolab/react-native-iap/issues/256), [#263](https://github.com/dooboolab/react-native-iap/issues/263).

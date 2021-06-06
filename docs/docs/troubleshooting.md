# Troubleshooting

⚠️ Most of users experiencing issues are caused by:
  - A device simulator, use a real device for testing!
  - The sandbox environment of the project not being configured properly ([Configure android sandbox](https://www.iaphub.com/docs/set-up-android/configure-sandbox-testing), [Configure ios sandbox](https://www.iaphub.com/docs/set-up-ios/configure-sandbox-testing/))
  - An incorrect usage of the library

## Common issues

### getProducts returns empty array
- Please double check if you've called `initConnection`.
- Please wait for max 24 hours to fetch your iap products if you've just uploaded them. [Related to issue](https://github.com/dooboolab/react-native-iap/issues/1065).
- For `iOS`, from ios version `>=13`, we seem to use `StoreKit` to fix this issue as [mentioned in stackoverflow](https://stackoverflow.com/questions/58020258/requesting-an-in-app-purchase-in-ios-13-fails/58065711#58065711).
- For `android`, please double check [issue comment here](https://github.com/dooboolab/react-native-iap/issues/124#issuecomment-386593185) and see if you've missed something.


### `getAvailablePurchases()` returns empty array
`getAvailablePurchases()` is used only when you purchase a non-consumable product. This can be restored only.

If you want to find out if a user subscribes the product, you should check the receipt which you should store in your own database.

Apple suggests you handle this in your own backend to do things like what you are trying to achieve.


### I'm usind `react-native<0.60` and the module is not working as expected (throws error)
The `react-native link` script isn't perfect and sometimes breaks.
Please try `unlink` and `link` again, or try manual install.


### Invalid productId in iOS.
- Please try below and make sure you've done all the steps:

    1. Completed an effective "Agreements, Tax, and Banking."
    2. Setup sandbox testing account in "Users and Roles."
    3. Signed into iOS device with sandbox account in "Settings / iTunes & App Stores".
    3. Set up three In-App Purchases with the following status:
        - Ready to Submit
        - Missing Metadata
        - Waiting for Review
    4. Enable "In-App Purchase" in Xcode "Capabilities" and in Apple Developer -> "App ID" setting.
    5. Clean up builds:
        - Delete the app on device
        - Restart device
        - Quit “store” related processes in Activity Monitor
        - Development Provisioning Profile -> Clean -> Build.

- Related issues [#256][issue-256] , [#263][issue-263].
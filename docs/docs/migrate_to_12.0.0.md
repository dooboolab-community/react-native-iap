# Migrating to 12.0.0

This migration will focus on integrating the latest store sdk for Amazon

# AndroidManifest

add `android:exported="true"` to `ResponseReceiver`

## The new Amazon IAP SDK needs you to include your public key.

Instructions: https://developer.amazon.com/docs/in-app-purchasing/integrate-appstore-sdk.html#configure_key

# Added verifyLicense method

It will return a status of the app see: AmazonLicensingStatus for values returned

```ts
import IapAmazon from "react-native-iap"
...

const status = await IapAmazon.verifyLicense()

if(status === 'LICENSED'){
    ...
}

```

# Migrating to 12.0.0

This migration will focus on integrating the latest store sdk for Amazon

# AndroidManifest

add `android:exported="true"` to `ResponseReceiver`

## The new SDK needs you to include your public key.

Instructions: https://github.dm.nfl.com/NFL/nfl-rn/pull/12436

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

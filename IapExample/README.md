# Example app

## Installation

```sh
yarn
```

For iOS, do the following:

```sh
cd ios
pod install
cd -
```

## Running

First start the metro server:

```sh
yarn start
```

You can then either build for iOS:

```sh
yarn ios
```

or for Android with 2 variants: `play` or `amazon`.

```sh
yarn android:play
yarn android:amazon
```

To be able to get products/subscriptions from the App Store or Play Store you will need to follow a few steps:

### Go to [developer.apple.com](https://developer.apple.com)

1. Open "Certificates, Identifiers & Profiles" > "Identifiers"
2. Click the "Plus" button
3. Select "App IDs", continue, select "App"
4. Complete the form and submit:
   - Description: React Native IAP Example
   - Bundle ID (explicit): org.reactjs.native.example.IapExample
5. Click "Register"

### Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com/)

6. Create a new app:
   - Platforms: iOS
   - Name: React Native IAP Example <SOME_STRING>
   - Sku: reactnativeiapexample
7. Go to "In-App Purchases", click "Create"
8. Select "Consumable" and submit:
   - Reference Name: com.cooni.point1000
   - Product ID: com.cooni.point1000 (can be the value defined in utils/constants.ts)
9. Go back to the app, login with your account when the AppStore shows you the prompt
10. Voilà!

## Advanced usage

If you want more advanced one please refer to [dooboolab.com/sponsor.tsx](https://github.com/hyochan/dooboolab.com/blob/main/src/components/pages/Sponsor.tsx)

In order to get products and subscriptions.

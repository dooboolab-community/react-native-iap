# ![image](https://user-images.githubusercontent.com/27461460/75094417-20321b00-55ce-11ea-8de7-a1df42a4b7df.png)

[![Version](http://img.shields.io/npm/v/react-native-iap.svg?style=flat-square)](https://npmjs.org/package/react-native-iap)
[![Next](https://img.shields.io/npm/v/react-native-iap/next.svg?style=flat-square)](https://npmjs.org/package/react-native-iap)
[![Download](http://img.shields.io/npm/dm/react-native-iap.svg?style=flat-square)](https://npmjs.org/package/react-native-iap)
[![Build Status](https://travis-ci.com/dooboolab/react-native-iap.svg?branch=master)](https://travis-ci.com/dooboolab/react-native-iap)
[![CI](https://github.com/dooboolab/react-native-iap/actions/workflows/ci.yml/badge.svg)](https://github.com/dooboolab/react-native-iap/actions/workflows/ci.yml)
[![document](https://github.com/dooboolab/react-native-iap/actions/workflows/deploy-document.yml/badge.svg)](https://github.com/dooboolab/react-native-iap/actions/workflows/deploy-document.yml)
[![License](https://img.shields.io/npm/l/react-native-iap.svg)](https://npmjs.org/package/react-native-iap)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/dooboolab/react-native-iap.svg)](https://github.com/dooboolab/react-native-iap)
[![Issue Opened](https://img.shields.io/opencollective/all/react-native-iap.svg)](https://opencollective.com/react-native-iap#backers)
[![Issue Opened](https://img.shields.io/github/issues/dooboolab/react-native-iap.svg)](https://github.com/dooboolab/react-native-iap/issues)
[![Issue Closed](https://img.shields.io/github/issues-closed/dooboolab/react-native-iap.svg)](https://github.com/dooboolab/react-native-iap/issues?q=is%3Aissue+is%3Aclosed)
[![PR Opened](https://img.shields.io/github/issues-pr/dooboolab/react-native-iap.svg)](https://github.com/dooboolab/react-native-iap/pulls)
[![PR Closed](https://img.shields.io/github/issues-pr-closed/dooboolab/react-native-iap.svg)](https://github.com/dooboolab/react-native-iap/pulls?q=is%3Apr+is%3Aclosed) [![Greenkeeper badge](https://badges.greenkeeper.io/dooboolab/react-native-iap.svg)](https://greenkeeper.io/)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdooboolab%2Freact-native-iap.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdooboolab%2Freact-native-iap?ref=badge_shield)

## Documentation

Published in [website](https://react-native-iap.dooboolab.com).

## Announcement

- Version `8.0.0` is currently in release candidate. The module is completely rewritten with `Kotlin` and `Swift` for maintenenance issue by [andresesfm](https://github.com/andresesfm) 🔆. You may install this for early preview.

  ```
  yarn add react-native-iap@next
  ```

- React Native IAP hook is out. You can see [medium post](https://medium.com/dooboolab/announcing-react-native-iap-hooks-96c7ffd3f19a) on how to use it.

- The `react-native-iap` module hasn't been maintained well recently. We are thinking of participating again and make the module healthier. Please refer to [2021 Maintenance plan](https://github.com/dooboolab/react-native-iap/issues/1241) and share with us how you or your organization is using it. Happy new year 🎉

  - The sample code is out in [Sponsor page](https://github.com/hyochan/dooboolab.com/blob/master/src/components/pages/Sponsor.tsx) in [dooboolab.com](https://github.com/hyochan/dooboolab.com) repository which sadly is rejected by Apple because of lacking product features. I will work on another example project to support this module. More information in [#1241 commment](https://github.com/dooboolab/react-native-iap/issues/1241#issuecomment-798540785).

## Introduction

This react-native module will help you access the In-app purchases capabilities of your phone on the `Android`, `iOS` platforms and the `Amazon` platform (Beta).

**Keep in mind** `react-native-iap` will provide the basic features you need but is not a turnkey solution, implementing In-app purchases in your app will still require quite some work.<br/>
Also, implementing the client side is only one side of the coin, you'll have to implement the server side to validate your receipts (which is probably the most time consuming part to do it correctly).

If you're looking for a module going further than react-native-iap, we recommend using [react-native-iaphub](https://github.com/iaphub/react-native-iaphub) which is taking care of everything from the client side to the server side.

⚠️ Most of users experiencing issues are caused by:

- A device simulator, use a real device for testing!
- The sandbox environment of the project not being configured properly ([Configure android sandbox](https://www.iaphub.com/docs/set-up-android/configure-sandbox-testing), [Configure ios sandbox](https://www.iaphub.com/docs/set-up-ios/configure-sandbox-testing/))
- An incorrect usage of the library

## Demo

> ![demo.gif](https://user-images.githubusercontent.com/27461460/52619625-87aa8a80-2ee5-11e9-9aee-6691c34408f3.gif)

<!-- Inline anchors -->

[a-acknowledge-purchase-android]: #finishing-a-purchase
[a-migration-guide]: #migration-guide
[a-purchase-flow]: #new-purchase-flow

<!-- Official Blog -->

[blog-config-steps]: https://medium.com/p/121622d26b67
[blog-v3-note]: https://medium.com/p/1259e0b0c017

<!-- Internals -->

[contribute]: https://github.com/dooboolab/react-native-iap/blob/master/CONTRIBUTING.md
[example]: https://github.com/dooboolab/react-native-iap/tree/master/IapExample
[issue-126-c1]: https://github.com/dooboolab/react-native-iap/issues/126#issuecomment-439084872
[issue-174]: https://github.com/dooboolab/react-native-iap/issues/174
[issue-203]: https://github.com/dooboolab/react-native-iap/issues/203
[issue-237]: https://github.com/dooboolab/react-native-iap/issues/237
[issue-256]: https://github.com/dooboolab/react-native-iap/issues/256
[issue-263]: https://github.com/dooboolab/react-native-iap/issues/263
[issue-283]: https://github.com/dooboolab/react-native-iap/issues/283
[issue-307-c1]: https://github.com/dooboolab/react-native-iap/issues/307#issuecomment-447745027
[issue-307]: https://github.com/dooboolab/react-native-iap/issues/307
[open-collective-backer]: https://opencollective.com/react-native-iap#backer
[open-collective-sponsor]: https://opencollective.com/react-native-iap#sponsor
[open-collective]: https://opencollective.com/react-native-iap
[readme-deprecated]: https://github.com/dooboolab/react-native-iap/blob/master/README_DEPRECATED.md

<!-- Externals -->

[android-acknowledge-purchase]: https://developer.android.com/reference/com/android/billingclient/api/BillingClient.html#acknowledgePurchase(com.android.billingclient.api.AcknowledgePurchaseParams,%20com.android.billingclient.api.AcknowledgePurchaseResponseListener) 'BillingClient#acknowledgePurchase()'
[android-end-connection]: https://developer.android.com/reference/com/android/billingclient/api/BillingClient.html#endConnection() 'BillingClient#endConnection()'
[android-iap-validation-guide]: https://developer.android.com/google/play/billing/billing_library_overview
[android-migrate-androidx]: https://developer.android.com/jetpack/androidx/migrate
[android-sku-details]: https://developer.android.com/reference/com/android/billingclient/api/SkuDetails
[apple-iap-promoting]: https://developer.apple.com/app-store/promoting-in-app-purchases/
[apple-iap-validation-guide]: https://developer.apple.com/library/content/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html
[apple-store-kit-flow]: https://forums.developer.apple.com/thread/6431#14831
[google-api-nodejs-client]: https://github.com/googleapis/google-api-nodejs-client/
[google-play-console]: https://play.google.com/apps/publish/
[stackoverflow-android-iap-validation]: https://stackoverflow.com/questions/35127086
[android-access-token-example-repo]: https://github.com/Bang9/android-get-access-token-example

## Quick News

- We had hard time supporting `react-native-iap` issues that did not provide working codes or any other examples. Therefore, we've decided to make an `example` app called [DoobooIAP](https://github.com/hyochan/DoobooIAP), which will contain all the features of `IAP`'s and willing to continuously improve to support real-life examples. [@Bang9](http://github.com/bang9) who had been helping many others for `react-native-iap`, is willing to support this repo so he will grant $300 of our income in `opencollective` as described in [#855](https://github.com/dooboolab/react-native-iap/issues/855) :tada:.
- `react-native-iap@4.0.8` ~ `react-native-iap@4.1.0` is incompatible with `react-native <0.61`. This is fixed in `react-native-iap@4.1.1` and above.
- `react-native-iap@4.0.0` has been released. You can see [#716](https://github.com/dooboolab/react-native-iap/pull/716) for updates.
- In the past, `react-native-iap@^3.*` has been updated very promptly for migration issues.
  Don't get surprised too much on why it is bumping up version so quickly these days.
  1. Migrated to new `AndroidX` APIs.
  2. Migrated to new `Android` billing client which is `> 2.0.0`.
     - [`acknowledgePurchase()`][android-acknowledge-purchase] has been added since `3.2.0` which is very important.
  3. New [Purchase Flow][a-purchase-flow]
  4. More is coming in `iOS 13`.

## Breaking Changes

[7.4.0]

- Now using React's Context to manage IAP state
- Introduce `withIAPContext` HOC ([how to use](docs/docs/usage_instructions/using_hooks.md))

[7.1.0]

- `androidOldSku` is no longer required [#1438](https://github.com/dooboolab/react-native-iap/pull/1438).

[6.1.0]

- Creates two variants: `play` and `amazon` and only uses the required code.
  ```
  NOTE: This would be a breaking change with a very simple fix described in the documentation. To add: `missingDimensionStrategy 'store', 'play'` `in build.gradle`
  ```
  [3.0.0+]
  [react-native-iap V3 note][blog-v3-note]

## Configuration of Google Play & iTunes Connect

- Please refer to [Blog][blog-config-steps].

## [Deprecated README][readme-deprecated]

- If you are using `react-native-iap@^2.*`, please follow the above README.

## Usage

You can look in the [`RNIapExample/`][example] folder to try the example.

NOTE: To run `RNIapExample` on Android use the variant flag as follows:

```
yarn android --variant=MY_VARIANT
```

where `MY_VARIANT` is `PlayDebug` or `AmazonDebug`

Below is basic implementation which is also provided in `RNIapExample` project.

If you want more advanced one please refer to [dooboolab.com/sponsor.tsx](https://github.com/hyochan/dooboolab.com/blob/master/src/components/pages/Sponsor.tsx)

## Sponsoring

Since `IAP` itself is not perfect on each platform, we desperately need
this project to be maintained. If you'd like to help us, please consider being
with us in [Open Collective](https://opencollective.com/react-native-iap).

### Sponsors

Support this project by becoming a sponsor. Your logo will show up here with
a link to your website. [Become a sponsor][open-collective-sponsor].
<a href="https://opencollective.com/react-native-iap#sponsors" target="_blank"><img src="https://opencollective.com/react-native-iap/sponsors.svg?width=890"></a>

### Backers

Please be our [Backers][open-collective-backer].
<a href="https://opencollective.com/react-native-iap#backers" target="_blank"><img src="https://opencollective.com/react-native-iap/backers.svg?width=890"></a>

### Contributing

Please make sure to read the [Contributing Guide][contribute] before making a pull request.
Thank you to all the people who helped to maintain and upgrade this project!

<a href="graphs/contributors"><img src="https://opencollective.com/react-native-iap/contributors.svg?width=890" /></a>

<hr>

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdooboolab%2Freact-native-iap.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdooboolab%2Freact-native-iap?ref=badge_large)

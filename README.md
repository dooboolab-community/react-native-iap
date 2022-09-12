![image](https://user-images.githubusercontent.com/27461460/75094417-20321b00-55ce-11ea-8de7-a1df42a4b7df.png)

---

[![Version](http://img.shields.io/npm/v/react-native-iap.svg?style=flat-square)](https://npmjs.org/package/react-native-iap)
[![Next Version](https://img.shields.io/npm/v/react-native-iap/next)](https://npmjs.org/package/react-native-iap)
[![Download](http://img.shields.io/npm/dm/react-native-iap.svg?style=flat-square)](https://npmjs.org/package/react-native-iap)
[![Backers and Sponsors](https://img.shields.io/opencollective/all/react-native-iap.svg)](https://opencollective.com/react-native-iap)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdooboolab%2Freact-native-iap.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdooboolab%2Freact-native-iap?ref=badge_shield)

---

## Documentation

Read the [documentation](https://react-native-iap.dooboolab.com). See the [troubleshooting](https://react-native-iap.dooboolab.com/docs/guides/troubleshooting#common-issues) for the common issues to avoid.

## Our maintainers

Please [fund the project](https://opencollective.com/react-native-iap) if you are willing the maintainers to make the repository sustainable.

- [andresesfm](https://github.com/andresesfm)

> The fund goes to maintainers.

### Supporter

- [hyochan](https://github.com/hyochan)

## Announcement

- Version `11.0.0` is currently in alpha candidate. The module migrates OS sdk to [storekit2](https://developer.apple.com/videos/play/wwdc2021/10114). [andresesfm](https://github.com/andresesfm) is working hard on this.

  ```
  yarn add react-native-iap@next
  ```

- Version `10.0.0` is a maitenance build. Many internal refactorings and clean up of the code. Special thanks to [jeremybarbet](https://github.com/jeremybarbet) for his contributions. Most notably all methods now take an object parameter instead of separate parameters. Please help us test

- Version `9.0.0` The module migrates android sdk to [play billing library v5](https://qonversion.io/blog/google-play-billing-library-5-0). Our core maintainers [andresesfm](https://github.com/andresesfm) and [jeremybarbet](https://github.com/jeremybarbet) worked hard on this.

- Version `8.0.0` has finally landed in Jan 28th. Since this is early release, please use it with caution 🚧. We recommend user to use `>=8.0.0` with react-native `>=0.65.1`. The `next` package is no longer updated until we organize the roadmap for `9.0.0`.

- Version `8.0.0` is currently in release candidate. The module is completely rewritten with `Kotlin` and `Swift` for maintenenance issue by [andresesfm](https://github.com/andresesfm) 🔆. You may install this for early preview.

- React Native IAP hook is out. You can see [medium post](https://medium.com/dooboolab/announcing-react-native-iap-hooks-96c7ffd3f19a) on how to use it.

- The `react-native-iap` module hasn't been maintained well recently. We are thinking of participating again and make the module healthier. Please refer to [2021 Maintenance plan](https://github.com/dooboolab/react-native-iap/issues/1241) and share with us how you or your organization is using it. Happy new year 🎉

  - The sample code is out in [Sponsor page](https://github.com/hyochan/dooboolab.com/blob/main/src/components/pages/Sponsor.tsx) in [dooboolab.com](https://github.com/hyochan/dooboolab.com) repository which sadly is rejected by Apple because of lacking product features. I will work on another example project to support this module. More information in [#1241 commment](https://github.com/dooboolab/react-native-iap/issues/1241#issuecomment-798540785).

## Configuration of Play Store & App Store Connect

- Please refer to this [Blog post](https://medium.com/p/121622d26b67).

## Example

Follow [this guide](./IapExample/README.md) to get the example running.

## Our maintainers

Please [fund the project](https://opencollective.com/react-native-iap) if you are willing the maintainers to make the repository sustainable.

- [andresesfm](https://github.com/andresesfm)
- [jeremybarbet](https://github.com/jeremybarbet)

> The fund goes to maintainers.

## Acknowledgements

If you're looking for a module going further than `react-native-iap`, we recommend using [react-native-iaphub](https://github.com/iaphub/react-native-iaphub) which is taking care of everything from the client-side to the server-side.

## Sponsoring

Since `IAP` itself is not perfect on each platform, we desperately need
this project to be maintained. If you'd like to help us, please consider being
with us in [Open Collective](https://opencollective.com/react-native-iap).

### Supporter

- [hyochan](https://github.com/hyochan)

### Sponsors

Support this project by becoming a sponsor. Your logo will show up here with
a link to your website. [Become a sponsor](https://opencollective.com/react-native-iap#sponsor).
<a href="https://opencollective.com/react-native-iap#sponsors" target="_blank"><img src="https://opencollective.com/react-native-iap/sponsors.svg?width=890" /></a>

### Backers

Please be our [Backers](https://opencollective.com/react-native-iap#backer).
<a href="https://opencollective.com/react-native-iap#backers" target="_blank"><img src="https://opencollective.com/react-native-iap/backers.svg?width=890" /></a>

### Contributing

Please make sure to read the [Contributing Guide](https://github.com/dooboolab/react-native-iap/blob/main/CONTRIBUTING.md) before making a pull request.
Thank you to all the people who helped to maintain and upgrade this project!

<a href="graphs/contributors"><img src="https://opencollective.com/react-native-iap/contributors.svg?width=890" /></a>

---

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdooboolab%2Freact-native-iap.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdooboolab%2Freact-native-iap?ref=badge_large)

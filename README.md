![image](https://user-images.githubusercontent.com/27461460/75094417-20321b00-55ce-11ea-8de7-a1df42a4b7df.png)

---

[![Version](http://img.shields.io/npm/v/react-native-iap.svg?style=flat-square)](https://npmjs.org/package/react-native-iap)
[![Next Version](https://img.shields.io/npm/v/react-native-iap/next)](https://npmjs.org/package/react-native-iap)
[![Download](http://img.shields.io/npm/dm/react-native-iap.svg?style=flat-square)](https://npmjs.org/package/react-native-iap)
[![Backers and Sponsors](https://img.shields.io/opencollective/all/react-native-iap.svg)](https://opencollective.com/react-native-iap)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdooboolab%2Freact-native-iap.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdooboolab%2Freact-native-iap?ref=badge_shield)

---

## Introduction

`react-native-iap` will help you access the In-App purchases capabilities of your device on `iOS`, and `Android` (Play Store and Amazon).

**Keep in mind** This library will provide the basic features to consume In-App purchases on the client-side, however you'll have to implement the server-side to validate your receipts (which is probably the most time consuming part to do it correctly).

## Installation

```bash
yarn add react-native-iap
```

For iOS:

```bash
cd ios; pod install; cd -
```

For manual instructions, see the [installation documentation](https://react-native-iap.dooboolab.com/docs/installation).

## Usage

```bash
import React from 'react';
import {View,Text,Button} from 'react-native';
import {useIAP} from 'react-native-iap';

export const App = () => {
  const {products,getProducts,requestPurchase} = useIAP();

  useEffect(() => {
    await getProducts(['com.super.app.consumable'])
  }, []);

  return (
    <>
      {products.map((product) => (
        <View key={product.productId}>
          <Text>{product.productId}</Text>

          <Button
            key={product.id}
            title={product.title}
            onPress={() => requestPurchase(product.id)}
          />
        </View>
      ))}
    </>
  );
}
```

## Documentation

Read the [documentation](https://react-native-iap.dooboolab.com). See the [troubleshooting](https://react-native-iap.dooboolab.com/docs/guides/troubleshooting#common-issues) for the common issues to avoid.

## Announcement

- Version `9.0.0` is currently in release candidate. The module migrates android sdk to [play billing library v5](https://qonversion.io/blog/google-play-billing-library-5-0) and iOS sdk to [storekit2](https://developer.apple.com/videos/play/wwdc2021/10114). Our core maintainers [andresesfm](https://github.com/andresesfm) and [jeremybarbet](https://github.com/jeremybarbet) are working hard on this.

```
yarn add react-native-iap@next
```

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

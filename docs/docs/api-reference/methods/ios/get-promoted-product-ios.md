# `getPromotedProductIOS`

Should get products promoted on the App Store.

Indicates the the App Store purchase should continue from the app instead of the App Store.

## Signature

```ts
getPromotedProductIOS(): Promise<ProductProduct | null>;
```

## Usage

```tsx
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {getPromotedProductIOS} from 'react-native-iap';

const App = () => {
  const promotedProduct = useCallback(async () => await getPromotedProductIOS());

  return <View />;
}
```

TODO: works with listener to get the products

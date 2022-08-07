# `getPromotedProductIOS`

Returns the productId of the promoted product. Indicates the the App Store purchase should continue from the app instead of the App Store.

## Signature

```ts
getPromotedProductIOS(): Promise<string>;
```

## Usage

```tsx
import {useCallback} from 'react';
import {getPromotedProductIOS} from 'react-native-iap';

const promotedProduct = useCallback(async () => await getPromotedProductIOS());
```

TODO: works with listener to get the products

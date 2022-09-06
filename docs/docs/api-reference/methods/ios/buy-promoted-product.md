# `buyPromotedProductIOS`

Buy the currently selected promoted product.

Initiates the payment process for a promoted product.

:::note
Should only be called in response to the `iap-promoted-product` event.
:::

## Signature

```ts
buyPromotedProductIOS(): Promise<void>
```

## Usage

```tsx
import React from 'react';
import {Button} from 'react-native';
import {buyPromotedProductIOS} from 'react-native-iap';

const App = () => {
  const handleBuy = async () => await buyPromotedProductIOS();

  return (
    <Button title="Buy" onPress={handleBuy} />
  );
}
```

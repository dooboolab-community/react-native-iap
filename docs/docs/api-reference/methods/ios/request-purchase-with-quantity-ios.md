# `requestPurchaseWithQuantityIOS`

Request a purchase with a quantity for a product.

The response will be received through the `PurchaseUpdatedListener`.

## Signature

```ts
requestPurchaseWithQuantityIOS(
  /** The product's sku/ID */
  sku: Sku,

  /** The quantity to request to buy */
  quantity: number,
): Promise<ProductPurchase>
```

## Usage

```tsx
import React from 'react';
import {Button} from 'react-native';
import {requestPurchaseWithQuantityIOS} from 'react-native-iap';

const App = () => {
  const handlePurchase = async () => {
    await requestPurchaseWithQuantityIOS('productId', 2);
  }

  return (
    <Button title="Purchase" onPress={handlePurchase} />
  );
}
```

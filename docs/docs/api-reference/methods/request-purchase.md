---
sidebar_position: 7
---

# `requestPurchase`

Request a purchase for a product. `purchaseUpdatedListener` will receive the result.

## Signature

```ts
requestPurchase(
  /** The product's sku/ID */
  sku,

  /**
   * You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user.
   * @default false
   **/
  andDangerouslyFinishTransactionAutomaticallyIOS = false,

  /** Specifies an optional obfuscated string that is uniquely associated with the user's account in your app. */
  obfuscatedAccountIdAndroid,

  /** Specifies an optional obfuscated string that is uniquely associated with the user's profile in your app. */
  obfuscatedProfileIdAndroid,

  /** The purchaser's user ID */
  applicationUsername,
): Promise<ProductPurchase>;
```

## Usage

```tsx
import React, {useCallback} from 'react';
import {Button} from 'react-native';
import {requestPurchase, Product, Sku, getProducts} from 'react-native-iap';

const App = () => {
  const products = useCallback(
    async () => getProducts(['com.example.product']),
    [],
  );

  const handlePurchase = async (sku: Sku) => {
    await requestPurchase({sku});
  };

  return (
    <>
      {products.map((product) => (
        <Button
          key={product.productId}
          title="Buy product"
          onPress={() => handlePurchase(product.productId)}
        />
      ))}
    </>
  );
};
```

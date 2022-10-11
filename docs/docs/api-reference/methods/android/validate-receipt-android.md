# `validateReceiptAndroid`

Validate receipt.

:::note
This method is here for debugging purposes only. Including your
access token in the binary you ship to users is potentially dangerous.
Use server side validation instead for your production builds.
:::

## Signature

```ts
validateReceiptAndroid(
  /** package name of your app. */
  packageName: string,

  /** product id for your in app product. */
  productId: string,

  /** token for your purchase. */
  productToken: string,

  /** accessToken from googleApis. */
  accessToken: string,

  /** whether this is a subscription or in-app product. `true` for subscription. */
  isSub?: boolean,
): Promise<ProductPurchase | SubscriptionPurchase>;
```

## Usage

```tsx
import React from 'react';
import {Button} from 'react-native';
import {validateReceiptAndroid} from 'react-native-iap';

const App = () => {
  const handlePurchase = async () => {
    const response = await validateReceiptAndroid({
      packageName: purchase.packageNameAndroid, 
      productId: purchase.productId, 
      productToken: purchase.purchaseToken, 
      accessToken: 'your-access-token', 
      isSub: true
  });
  };

  return <Button title="Purchase" onPress={handlePurchase} />;
}
```

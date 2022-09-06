# `acknowledgePurchaseAndroid`

Acknowledge a product.

## Signature

```ts
acknowledgePurchaseAndroid(
  /** The product's token */
  token: string,

  /** Android developerPayload */
  developerPayload?: string,
): Promise<PurchaseResult | void>;
```

## Usage

```tsx
import React from 'react';
import {Button} from 'react-native';
import {acknowledgePurchaseAndroid} from 'react-native-iap';

const App = () => {
  const handlePurchase = async () => {
    await acknowledgePurchaseAndroid({
      token: 'token',
      developerPayload: 'developer-payload',
    });
  };

  return <Button title="Acknowledge purchase" onPress={handlePurchase} />;
}
```

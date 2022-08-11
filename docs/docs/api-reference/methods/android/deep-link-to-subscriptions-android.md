# `deepLinkToSubscriptionsAndroid`

Deep link to subscriptions screen.

## Signature

```ts
deepLinkToSubscriptionsAndroid(
  /** The product's SKU */
  sku: Sku,
): Promise<void>;
```

## Usage

```tsx
import React from 'react';
import {Button} from 'react-native';
import {deepLinkToSubscriptionsAndroid} from 'react-native-iap';

const App = () => {
  const handleSubscriptions = async () => {
    await deepLinkToSubscriptionsAndroid({sku: 'sku-id'});
  };

  return <Button title="Manage subscriptions" onPress={handleSubscriptions} />;
};
```

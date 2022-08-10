---
sidebar_position: 4
---

# `getSubscriptions`

Get a list of subscriptions.

## Signature

```ts
getSubscriptions(
  /** The item skus */
  skus: Sku[]
): Promise<Subscription[]>
```

## Usage

```tsx
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {getSubscriptions} from 'react-native-iap';

const App = () => {
  const subscriptions = useCallback(
    async () =>
      await getSubscriptions(['com.example.product1', 'com.example.product2']),
    [],
  );

  return <View />;
};
```

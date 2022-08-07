---
sidebar_position: 4
---

# `getSubscriptions`

Get a list of subscriptions.

:::note
With before `iOS 11.2`, this method _will_ also return products if they are included in your list of SKUs. This is because we cannot differentiate between IAP products and subscriptions prior to `iOS 11.2`.
:::

## Signature

```ts
getSubscriptions(
  /** The item skus */
  skus: Sku[]
): Promise<Subscription[]>
```

## Usage

```tsx
import {useCallback} from 'react';
import {getSubscriptions} from 'react-native-iap';

const subscriptions = useCallback(
  async () =>
    await getSubscriptions(['com.example.product1', 'com.example.product2']),
  [],
);
```

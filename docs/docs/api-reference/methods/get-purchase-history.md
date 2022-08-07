---
sidebar_position: 6
---

# `getPurchaseHistory`

Gets an inventory of purchases made by the user regardless of consumption status (where possible).

## Signature

```ts
getPurchaseHistory(
  /** The item skus */
  skus: Sku[],
): Promise<Purchase[]>;
```

## Usage

```tsx
import {useCallback} from 'react';
import {getPurchaseHistory} from 'react-native-iap';

const history = useCallback(
  async () =>
    await getPurchaseHistory(['com.example.product1', 'com.example.product2']),
  [],
);
```

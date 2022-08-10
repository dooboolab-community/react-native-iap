---
sidebar_position: 6
---

# `getPurchaseHistory`

Get a list of purchases made by the user regardless of consumption states.

## Signature

```ts
getPurchaseHistory(): Promise<Purchase[]>;
```

## Usage

```tsx
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {getPurchaseHistory} from 'react-native-iap';

const App = () => {
  const history = useCallback(
    async () =>
      await getPurchaseHistory([
        'com.example.product1',
        'com.example.product2',
      ]),
    [],
  );

  return <View />;
};
```

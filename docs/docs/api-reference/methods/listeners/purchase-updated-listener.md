---
sidebar_position: 11
---

# `purchaseUpdatedListener`

Register a callback that gets called when the store has any updates to purchases that have not yet been finished, consumed or acknowledged. Returns a React Native `EmitterSubscription` on which you can call `.remove()` to stop receiving updates. Register you listener as soon as possible and react to updates at all times.

## Signature

```ts
purchaseUpdatedListener((purchase: Purchase) => {});
```

## Usage

```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {purchaseUpdatedListener} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    const subscription = purchaseUpdatedListener((purchase: Purchase) => {
      console.log(purchase);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return <View />;
};
```

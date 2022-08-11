---
sidebar_position: 10
---

# `purchaseErrorListener`

Register a callback that gets called when there has been an error with a purchase. Returns a React Native `EmitterSubscription` on which you can call `.remove()` to stop receiving updates.

## Signature

```ts
purchaseErrorListener((error: PurchaseError) => {});
```

## Usage

```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {purchaseErrorListener} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    const subscription = purchaseErrorListener((error: PurchaseError) => {
      console.log(error);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return <View />;
};
```

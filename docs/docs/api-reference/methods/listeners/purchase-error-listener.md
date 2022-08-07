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
import {useEffect} from 'react';
import {purchaseErrorListener} from 'react-native-iap';

useEffect(() => {
  const subscription = purchaseErrorListener((error: PurchaseError) => {
    console.log(error);
  });

  return () => {
    subscription.remove();
  };
}, []);
```

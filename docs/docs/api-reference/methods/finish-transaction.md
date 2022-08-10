---
sidebar_position: 9
---

# `finishTransaction`

Finish a payment transaction.

**iOS:**
Tells StoreKit that you have delivered the purchase to the user and StoreKit can now
let go of the transaction. Call this after you have persisted the purchased state to
your server or local data in your app. `react-native-iap` will continue to deliver
the purchase updated events with the successful purchase until you finish the
transaction. **Even after the app has relaunched.**

**Android:**
It will consume purchase for consumables and acknowledge purchase for non-consumables.

## Signature

```ts
finishTransaction(
  /** The purchase that you would like to finish. */
  purchase: ProductPurchase,

  /** Checks if purchase is consumable. Has effect on `Android`. */
  isConsumable?: boolean,

  /** Android developerPayload. */
  developerPayloadAndroid?: string,
): Promise<void>;
```

## Usage

```tsx
import React from 'react';
import {Button} from 'react-native';
import {finishTransaction} from 'react-native-iap';

const App = () => {
  const handlePurchase = async () => {
    // ... handle the purchase request

    const result = finishTransaction(purchase);
  };

  return <Button title="Buy product" onPress={handlePurchase} />;
};
```

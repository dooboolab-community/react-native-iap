# `getPendingPurchasesIOS`

Gets all the transactions which are pending to be finished.

## Signature

```ts
getPendingPurchasesIOS(): Promise<Purchase[]>;
```

## Usage

```tsx
import React from 'react';
import {Button} from 'react-native';
import {getPendingPurchasesIOS} from 'react-native-iap';

const App = () => {
  const handlePendingPurchases = async () => await getPendingPurchasesIOS();

  return (
    <Button title="Pending purchases" onPress={handlePendingPurchases} />
  )
}
```


# `getPendingPurchasesIOS`

Gets all the transactions which are pending to be finished.

## Signature

```ts
getPendingPurchasesIOS(): Promise<Purchase[]>;
```

## Usage

```tsx
import {useCallback} from 'react';
import {getPendingPurchasesIOS} from 'react-native-iap';

const pendingPurchases = useCallback(async () => await getPendingPurchasesIOS());
```


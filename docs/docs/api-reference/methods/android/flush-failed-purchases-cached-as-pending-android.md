# `flushFailedPurchasesCachedAsPendingAndroid`

Consume all "ghost" purchases (that is, pending payment that already failed but is still marked as pending in Play Store cache).

## Signature

```ts
flushFailedPurchasesCachedAsPendingAndroid(): Promise<void>;
```

## Usage

```tsx
import React, {useCallback} from 'react';
import {Button} from 'react-native';
import {flushFailedPurchasesCachedAsPendingAndroid} from 'react-native-iap';

const App = () => {
  const handleFlush = async () => {
    await flushFailedPurchasesCachedAsPendingAndroid();
  };

  return (
    <Button title="Flush" onPress={handleFlush} />
  );
}
```

# `clearTransactionIOS`

Clear the remaining transactions.

See https://github.com/dooboolab-community/react-native-iap/issues/257
See https://github.com/dooboolab-community/react-native-iap/issues/801

## Signature

```ts
clearTransactionIOS(): Promise<void>
```

## Usage

```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {clearTransactionIOS} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    void clearTransactionIOS();
  }, [])

  return <View />;
}
```

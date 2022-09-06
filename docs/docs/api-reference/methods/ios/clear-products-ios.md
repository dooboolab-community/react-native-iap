# `clearProductsIOS`

Clear valid products.

Remove all products which are validated by Apple server.

## Signature

```ts
clearProductsIOS(): Promise<void>
```

## Usage

```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {clearProductsIOS} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    void clearProductsIOS();
  }, []);

  return <View />;
}
```

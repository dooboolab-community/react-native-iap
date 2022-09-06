# `promotedProductListener`

Add IAP promoted subscription event.

## Signature

```ts
promotedProductListener((productId?: string) => {});
```

## Usage

```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {promotedProductListener} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    const subscription = promotedProductListener((productId) => {
      console.log(productId);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return <View />;
};
```

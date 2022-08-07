# `clearProductsIOS`

Clear all products and subscriptions.

## Signature

```ts
clearProductsIOS(): Promise<void>
```

## Usage

```tsx
import {useEffect} from 'react';
import {clearProductsIOS} from 'react-native-iap';

useEffect(() => {
  void clearProductsIOS();
}, []);
```

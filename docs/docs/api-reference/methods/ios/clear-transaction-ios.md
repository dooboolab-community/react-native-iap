# `clearTransactionIOS`

Clear up unfinished transactions which sometimes cause problems.

More context:
- [#257](https://github.com/dooboolab/react-native-iap/issues/257)
- [#801](https://github.com/dooboolab/react-native-iap/issues/801)

## Signature

```ts
clearTransactionIOS(): Promise<void>
```

## Usage

```tsx
import {useEffect} from 'react';
import {clearTransactionIOS} from 'react-native-iap';

useEffect(() => {
  void clearTransactionIOS();
}, [])
```

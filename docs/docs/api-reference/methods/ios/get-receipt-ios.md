# `getReceiptIOS`

Get the current receipt.

## Signature

```ts
getReceiptIOS(): Promise<string>;
```

## Usage

```tsx
import {useCallback} from 'react';
import {getReceiptIOS} from 'react-native-iap';

const receipt = useCallback(async () => await getReceiptIOS());
```

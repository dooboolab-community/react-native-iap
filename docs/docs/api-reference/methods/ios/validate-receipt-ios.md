# `validateReceiptIOS`

Validate receipt.

## Signature

```ts
validateReceiptIOS(
  /** The receipt body to send to apple server. */
  receiptBody: Record<string, unknown>,

  /** Whether this is in test environment which is sandbox. */
  isTest?: boolean,
): Promise<ResponseBody>
```

## Usage

```tsx
import React from 'react';
import {Button} from 'react-native';
import {validateReceiptIOS} from 'react-native-iap';

const App = () => {
  const handleValidate = async () => {
    await validateReceiptIOS({
      'receipt-data': '...',
    });
  }

  return (
    <Button title="Validate" onPress={handleValidate} />
  );
}
```

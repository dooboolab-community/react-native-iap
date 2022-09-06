# `validateReceiptAmazon`

Validate receipt.

:::note
This method is here for debugging purposes only. Including your
developer secret in the binary you ship to users is potentially dangerous.
Use server-side validation instead for your production builds.
:::

## Signature

```ts
validateReceiptAmazon(
  /** From the Amazon developer console */
  developerSecret: string,

  /** Who purchased the item. */
  userId: string,

  /** Long obfuscated string returned when purchasing the item */
  receiptId: string,

  /** Defaults to true, use sandbox environment or production. */
  useSandbox: boolean = true,
): Promise<AmazonReceiptType>;
```

## Usage

```tsx
import React from 'react';
import {Button} from 'react-native';
import {validateReceiptAmazon} from 'react-native-iap';

const App = () => {
  const handlePurchase = async () => {
    const response = await validateReceiptAmazon(
      'your-developer-secret',
      'user-id',
      'receipt-id',
    );
  };

  return <Button title="Purchase" onPress={handlePurchase} />;
};
```

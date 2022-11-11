# `requestPurchaseWithOfferIOS`

Buy products or subscriptions with offers.

Runs the payment process with some info you must fetch from your server.

## Signature

```ts
requestPurchaseWithOfferIOS(
  /** The product identifier */
  sku: Sku,

  /** An user identifier on you system */
  forUser: string,

  /** The offer information */
  withOffer: PaymentDiscount,
): Promise<void>
```

## Usage

```tsx
import React from 'react';
import {Button} from 'react-native';
import {requestPurchaseWithOfferIOS} from 'react-native-iap';

const App = () => {
  const handlePurchase = async () => {
    await requestPurchaseWithOfferIOS({sku: 'productId', forUser: 'user-id', withOffer: {
      identifier: 'string',
      keyIdentifier: 'string',
      nonce: 'string',
      signature: 'string',
      timestamp: Date.now(),
    }});
  }

  return (
    <Button title="Buy" onPress={handlePurchase} />
  );
}
```

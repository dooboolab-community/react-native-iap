---
sidebar_position: 8
---

# `requestSubscription`

Request a purchase for a subscription.

The response will be received through the `PurchaseUpdatedListener`.

:::note
`andDangerouslyFinishTransactionAutomatically` defaults to false. We recommend
always keeping at false, and verifying the transaction receipts on the server-side.
:::

## Signature

```ts
requestSubscription(
  /** The product's sku/ID */
  sku,

  /**
   * You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user.
   * @default false
   **/
  andDangerouslyFinishTransactionAutomaticallyIOS = false,

  /** purchaseToken that the user is upgrading or downgrading from (Android). */
  purchaseTokenAndroid,

  /** UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY, IMMEDIATE_WITH_TIME_PRORATION, IMMEDIATE_AND_CHARGE_PRORATED_PRICE, IMMEDIATE_WITHOUT_PRORATION, DEFERRED */
  prorationModeAndroid = -1,

  /** Specifies an optional obfuscated string that is uniquely associated with the user's account in your app. */
  obfuscatedAccountIdAndroid,

  /** Specifies an optional obfuscated string that is uniquely associated with the user's profile in your app. */
  obfuscatedProfileIdAndroid,

  /** The purchaser's user ID */
  applicationUsername,
): Promise<SubscriptionPurchase>
```

## Usage

```tsx
import React, {useCallback} from 'react';
import {Button} from 'react-native';
import {
  requestSubscription,
  Product,
  Sku,
  getSubscriptions,
} from 'react-native-iap';

const App = () => {
  const subscriptions = useCallback(
    async () => getSubscriptions(['com.example.subscription']),
    [],
  );

  const handlePurchase = async (sku: Sku) => {
    await requestSubscription({sku});
  };

  return (
    <>
      {subscriptions.map((subscription) => (
        <Button
          key={subscription.productId}
          title="Buy subscription"
          onPress={() => handlePurchase(subscription.productId)}
        />
      ))}
    </>
  );
};
```

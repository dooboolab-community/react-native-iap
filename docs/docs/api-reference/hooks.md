---
sidebar_position: 6
---

# Hooks

## Installation

You first have to wrap your app with the `withIAPContext` HOC.

```tsx
import React from 'react';
import {withIAPContext} from 'react-native-iap';

const App = () => <View />;

export default withIAPContext(App);
```

## Usage

### Fetch products

If you’ve completed creating products in your app's AppStore and Play Store, you can then fetch them.

```tsx
import React, {useEffect} from 'react';
import {useIAP} from 'react-native-iap';

const consumableSkus = [
  'com.dooboolab.bean',
  'com.dooboolab.coffee1',
  'com.dooboolab.coffee3',
  'com.dooboolab.coffee5',
  'com.dooboolab.coffee10',
  'com.dooboolab.coffee20',
  'com.dooboolab.coffee50',
];

const subscriptionSkus = [
  'com.dooboolab.skeleton',
  'com.dooboolab.iron',
  'com.dooboolab.bronze',
  'com.dooboolab.silver',
  'com.dooboolab.gold',
  'com.dooboolab.platinum',
  'com.dooboolab.diamond',
];

const Component = () => {
  const {connected, getProducts, getSubscriptions} = useIAP();

  useEffect(() => {
    if (connected) {
      getProducts(consumableSkus);
      getSubscriptions(subscriptionSkus);
    }
  }, [getProducts, getSubscriptions]);

  return <View />;
};
```

Somewhere within your app, you can then import the `useIAP` hook and use it to get the current state of the IAP context

```tsx
import React from 'react';
import {useIAP} from 'react-native-iap';

const Component = () => {
  const {
    connected,
    products,
    promotedProductsIOS,
    subscriptions,
    purchaseHistories,
    availablePurchases,
    currentPurchase,
    currentPurchaseError,
    initConnectionError,
    finishTransaction,
    getProducts,
    getSubscriptions,
    getAvailablePurchases,
    getPurchaseHistories,
  } = useIAP();

  return <View />;
};
```

You need to call getProducts in useEffect imperatively and should add listeners when initConnection is successful. With useIAP hook, these are handled automatically. You do not have to call initConnection imperatively and calling useIAP() is enough for that.

The connected variable tells you whether native IAP module is able to interact with.

When you call getProducts or getSubscriptions, the products or the subscriptions will be fetched and it will update products and subscriptions variables.

### Purchase products

Now we are ready to purchase a product.

```tsx
import React from 'react';
import {
  requestPurchase,
  requestSubscription,
  ProductType,
} from 'react-native-iap';

const Component = () => {
  const handlePurchase = (item: Purchase) => {
    if (item.type === ProductType.IAP) {
      requestPurchase(item.productId);
    } else {
      requestSubscription(item.productId);
    }
  };

  return (
    <>
      {products.map((product) => (
        <Button
          key={product.productId}
          title={product.title}
          onPress={() => handlePurchase(product)}
        />
      ))}
    </>
  );
};
```

It is now time to look at the `currentPurchase` and `currentPurchaseError` listeners from the `useIAP` hook.

```tsx
import React, {useEffect} from 'react';
import {useIAP, Purchase} from 'react-native-iap';

const Component = () => {
  const {getProducts, finishTransaction, getSubscriptions} = useIAP();

  useEffect(() => {
    getProducts(consumableSkus);
    getSubscriptions(subscriptionSkus);
  }, [getProducts, getSubscriptions]);

  useEffect(() => {
    const checkCurrentPurchase = async (purchase?: Purchase) => {
      if (purchase) {
        const receipt = purchase.transactionReceipt;

        if (receipt)
          try {
            const result = await finishTransaction(purchase);
            console.log('result', result);
          } catch (error) {
            console.warn('error', error);
          }
      }
    };
    checkCurrentPurchase(currentPurchase);
  }, [currentPurchase, finishTransaction]);
};
```

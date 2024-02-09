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

The `useIAP()` hook is an easy way to access `react-native-iap` methods simplified for you. It already does some work through the context to help you get your products, purchases, subscriptions, callback and error handlers faster.

Below are all the methods available through the hook. All the rest of the methods e.g. `requestPurchase` are available through the usual import `import {requestPurchase} from 'react-native-iap';`

```tsx
import React from 'react';
import {View, Text} from 'react-native';
import {requestPurchase, useIAP} from 'react-native-iap';

const App = () => {
  const {
    connected,
    products,
    promotedProductsIOS,
    subscriptions,
    purchaseHistory,
    availablePurchases,
    currentPurchase,
    currentPurchaseError,
    initConnectionError,
    finishTransaction,
    getProducts,
    getSubscriptions,
    getAvailablePurchases,
    getPurchaseHistory,
  } = useIAP();

  const handlePurchase = async (sku: string) => {
    await requestPurchase({sku});
  };

  useEffect(() => {
    // ... listen to currentPurchaseError, to check if any error happened
  }, [currentPurchaseError]);

  useEffect(() => {
    // ... listen to currentPurchase, to check if the purchase went through
  }, [currentPurchase]);

  return (
    <>
      <Button
        title="Get the products"
        onPress={getProducts(['com.example.consumable'])}
      />

      {products.map((product) => (
        <View key={product.productId}>
          <Text>{product.productId}</Text>

          <Button
            title="Buy"
            onPress={() => handlePurchase(product.productId)}
          />
        </View>
      ))}
    </>
  );
};
```

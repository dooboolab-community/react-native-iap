---
sidebar_position: 6
---

# Using hooks

## How to use hooks
1. You have to wrap your app with the `withIAPContext` HOC

```jsx
import {withIAPContext} from 'react-native-iap';

const App = () => <View />;

export default withIAPContext(App);
```

2. Later then, somewhere in your components

```jsx
import {useIAP} from 'react-native-iap';

const YourComponent = () => {
  const {
    connected,
    products,
    promotedProductsIOS,
    subscriptions,
    purchaseHistories,
    availablePurchases,
    currentPurchase,
    currentPurchaseError,
    finishTransaction,
    getProducts,
    getSubscriptions,
    getAvailablePurchases,
    getPurchaseHistories,
  } = useIAP();

  return <View />;
};
```

## Reference

From `react-native-iap@6.0.0+` we support the useIAP hook that handles purchases better.

Check this [Medium post](https://medium.com/dooboolab/announcing-react-native-iap-hooks-96c7ffd3f19a) for usage instructions.

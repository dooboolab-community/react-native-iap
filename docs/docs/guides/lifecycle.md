---
sidebar_position: 1
---

# Lifecycle

## Initializing

In order to initialize the native modules, call `initConnection()` early in the lifecycle of your application. This should be done at a top-level component as the library caches the native connection. Initializing just before you needed is discouraged as it incurs on a performance hit. Calling this method multiple times without ending the previous connection will result in an error. Not calling this method will cause other method calls to be rejected as connection needs to be established ahead of time.

```ts
import {initConnection} from 'react-native-iap';

componentDidMount() {
  initConnection();
  // ...
}
```

## Ending Connection

In order to release the resources, call `endConnection()` when you no longer need any interaction with the library.

```ts
import {endConnection} from 'react-native-iap';

componentWillUnmount() {
  // ...
  endConnection();
}
```

## Dos and Don'ts

You should not call `initConnection` and `endConnection` every time you need to interact with the library. This is considered an anti-pattern as it consumes more time, resources and could lead to undesired side effects such as many callbacks.

### :white_check_mark: DO:

```ts
import {initConnection,getProducts,endConnection} from 'react-native-iap';

componentDidMount() {
  await initConnection();
  await getProducts(productIds)
  // ...
}

buyProductButtonClick() {
  // start purchase code...
}

subscribeButtonClick() {
  // start purchase code...
}

componentWillUnmount() {
  // ...
  endConnection();
}
```

### :x: DON'T :

```ts
import {initConnection,getProducts,endConnection,initConnection,getProducts,endConnection} from 'react-native-iap';

componentDidMount() {
  // ...
}

const buyProductButtonClick = async() => {
  await initConnection();
  await getProducts(productIds)
  // Purchase IAP Code...
  await endConnection();
}

const subscribeButtonClick = async() => {
  await initConnection();
  await getProducts(productIds)
  // Purchase Subscription Code...
  await endConnection();
}

componentWillUnmount() {
  // ...
}
```

---
sidebar_position: 1
---

# Lifecycle

## Initializing

In order to initialize the native modules, call `initConnection()` early in the lifecycle of your application. This should be done at a top-level component as the library caches the native connection. Initializing just before you needed is discouraged as it incurrs on a performance hit. Calling this method multiple times without ending the previous connection will result in an error. Not calling this method will cause other method calls to be rejected as connection needs to be established ahead of time.

```tsx
import React, {Component} from 'react';
import {initConnection} from 'react-native-iap';

class App extends Component {
  async componentDidMount() {
    await initConnection();
  }
}
```

## Ending Connection

In order to release the resources, call `endConnection()` when you no longer need any interaction with the library.

```tsx
import React, {Component} from 'react';
import {endConnection} from 'react-native-iap';

class App extends Component {
  componentWillUnmount() {
    // ...
    endConnection();
  }
}
```

## Dos and Don'ts

You shoud not call `initConnection` and `endConnection` every time you need to interact with the library. This is considered an anti-pattern as it consumes more time, resources and could lead to undesired side effects such as many callbacks.

### :white_check_mark: DO:

```tsx
import React, {Component} from 'react';
import {initConnection, getProducts, endConnection} from 'react-native-iap';

class App extends Component {
  async componentDidMount() {
    await initConnection();
    await getProducts(productIds);
    // ...
  }

  buyProductButtonClick() {
    // startPurchaseCode
  }

  subscribeButtonClick() {
    // startPurchaseCode
  }

  componentWillUnmount() {
    // ...
    endConnection();
  }
}
```

### :x: DON'T :

```tsx
import React, {Component} from 'react';
import {initConnection, getProducts, endConnection} from 'react-native-iap';

class App extends Component {
  componentDidMount() {
    // ...
  }

  buyProductButtonClick = async () => {
    await initConnection();
    await getProducts(productIds);
    // Purchase IAP Code
    // ...
    await endConnection();
  };

  subscribeButtonClick = async () => {
    await initConnection();
    await getProducts(productIds);
    // Purchase Subscription Code
    // ...
    await endConnection();
  };

  componentWillUnmount() {
    // ...
  }
}
```

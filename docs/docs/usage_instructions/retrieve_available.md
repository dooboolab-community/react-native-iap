---
sidebar_position: 2
---

# Retrieving available items

First thing you should do is to define your product IDs for iOS and Android separately like defined below.

```ts
const productIds = Platform.select({
  ios: ['com.example.coins100'],
  android: ['com.example.coins100'],
});
```

To get a list of valid items, call `getProducts()`.

You can do it in `componentDidMount()`, or another area as appropriate for your app.

Since a user may first start your app with a bad internet connection, then later have an internet connection, making preparing/getting items more than once may be a good idea.

Like if the user has no IAPs available when the app first starts, you may want to check again when the user enters your IAP store.

```ts
import { getProducts } from 'react-native-iap';

  async componentDidMount() {
    try {
      const products: Product[] = await getProducts(productIds);
      this.setState({ products });
    } catch(err) {
      console.warn(err); // standardized err.code and err.message available
    }
  }
```

Each `product` returns from `getProducts()` contains a [Product object](../api_reference/product).

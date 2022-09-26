# Migrating to 10.0.0

Starting with 10.0.0, the parameters to some of the methods are now objects instead of positional parameters.

## Before

```ts
getProducts(['my_sku']);
```

## After

```ts
getProducts({skus: ['my_sku']});
```

Methods are now exported outside of the main module:

## Before

```ts
import IAP from 'react-native-iap'
...

IAP.requestPurchase(...)
```

## After

```ts
import {requestPurchase} from 'react-native-iap';
...
requestPurchase(...)
```

If you want to import keeping the namespace, use:

```ts
import * as IAP from 'react-native-iap'
...

IAP.requestPurchase(...)
```

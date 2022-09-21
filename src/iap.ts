import {NativeModules, Platform} from 'react-native';

import * as IapAmazon from './modules/amazon';
import * as IapAndroid from './modules/android';
import * as IapIos from './modules/ios';
import * as IapIosSk2 from './modules/iosSk2';
import {offerToRecord} from './types/apple';
import {
  offerSk2Map,
  ProductSk2,
  productSk2Map,
  subscriptionSk2Map,
} from './types/appleSk2';
import {
  fillProductsWithAdditionalData,
  getAndroidModule,
  getIosModule,
  getNativeModule,
  isAmazon,
  isIosStorekit2,
  storekit1Mode,
  storekit2Mode,
  storekitHybridMode,
} from './internal';
import {
  Product,
  ProductPurchase,
  ProductType,
  PurchaseResult,
  RequestPurchase,
  RequestSubscription,
  Subscription,
  SubscriptionPurchase,
} from './types';
import {PurchaseStateAndroid} from './types';

export {IapAndroid, IapAmazon, IapIos, IapIosSk2, isIosStorekit2};

const {RNIapIos, RNIapIosSk2, RNIapModule, RNIapAmazonModule} = NativeModules;
const ANDROID_ITEM_TYPE_SUBSCRIPTION = ProductType.subs;
const ANDROID_ITEM_TYPE_IAP = ProductType.inapp;

/**
 * STOREKIT1_MODE: Will not enable Storekit 2 even if the device supports it. Thigs will work as before,
 * minimum changes required in the migration guide (default)
 * HYBRID_MODE: Will enable Storekit 2 for iOS devices > 15.0 but will fallback to Sk1 on older devices
 * There are some edge cases that you need to handle in this case (described in migration guide). This mode
 * is for developers that are migrating to Storekit 2 but want to keep supporting older versions.
 * STOREKIT2_MODE: Will *only* enable Storekit 2. This disables Storekit 1. This is for apps that
 * have already targeted a min version of 15 for their app.
 */
export type STOREKIT_OPTIONS =
  | 'STOREKIT1_MODE'
  | 'STOREKIT_HYBRID_MODE'
  | 'STOREKIT2_MODE';

export const setup = ({
  storekitMode = 'STOREKIT1_MODE',
}: {
  storekitMode?: STOREKIT_OPTIONS;
} = {}) => {
  switch (storekitMode) {
    case 'STOREKIT1_MODE':
      storekit1Mode();
      break;
    case 'STOREKIT2_MODE':
      storekit2Mode();
      break;
    case 'STOREKIT_HYBRID_MODE':
      storekitHybridMode();
      break;
    default:
      break;
  }
};

/**
 * Init module for purchase flow. Required on Android. In ios it will check whether user canMakePayment.
 * ## Usage

```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {initConnection} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    void initConnection();
  }, []);

  return <View />;
};
```
 */
export const initConnection = (): Promise<boolean> =>
  getNativeModule().initConnection();

/**
 * Disconnects from native SDK
 * Usage
 * ```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {endConnection} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    return () => {
      void endConnection();
    };
  }, []);

  return <View />;
};
```
 * @returns {Promise<void>}
 */
export const endConnection = (): Promise<boolean> =>
  getNativeModule().endConnection();

/**
 * Consume all 'ghost' purchases (that is, pending payment that already failed but is still marked as pending in Play Store cache). Android only.
 * @returns {Promise<boolean>}
 */
export const flushFailedPurchasesCachedAsPendingAndroid =
  (): Promise<boolean> =>
    getAndroidModule().flushFailedPurchasesCachedAsPending();

/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 ## Usage

```ts
import React, {useState} from 'react';
import {Platform} from 'react-native';
import {getProducts, Product} from 'react-native-iap';

const skus = Platform.select({
  ios: ['com.example.consumableIos'],
  android: ['com.example.consumableAndroid'],
});

const App = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const handleProducts = async () => {
    const items = await getProducts({skus});

    setProducts(items);
  };

  useEffect(() => {
    void handleProducts();
  }, []);

  return (
    <>
      {products.map((product) => (
        <Text key={product.productId}>{product.productId}</Text>
      ))}
    </>
  );
};
```

Just a few things to keep in mind:

- You can get your products in `componentDidMount`, `useEffect` or another appropriate area of your app.
- Since a user may start your app with a bad or no internet connection, preparing/getting the items more than once may be a good idea.
- If the user has no IAPs available when the app starts first, you may want to check again when the user enters your IAP store.

 */
export const getProducts = ({
  skus,
}: {
  skus: string[];
}): Promise<Array<Product>> =>
  (
    Platform.select({
      ios: async () => {
        let items: Product[];
        if (isIosStorekit2()) {
          items = ((await RNIapIosSk2.getItems(skus)) as ProductSk2[]).map(
            productSk2Map,
          );
        } else {
          items = (await RNIapIos.getItems(skus)) as Product[];
        }
        return items.filter(
          (item: Product) =>
            skus.includes(item.productId) && item.type === 'iap',
        );
      },
      android: async () => {
        const products = await getAndroidModule().getItemsByType(
          ANDROID_ITEM_TYPE_IAP,
          skus,
        );

        return fillProductsWithAdditionalData(products);
      },
    }) || (() => Promise.reject(new Error('Unsupported Platform')))
  )();

/**
 * Get a list of subscriptions
 * ## Usage

```tsx
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {getSubscriptions} from 'react-native-iap';

const App = () => {
  const subscriptions = useCallback(
    async () =>
      await getSubscriptions(['com.example.product1', 'com.example.product2']),
    [],
  );

  return <View />;
};
```

 */
export const getSubscriptions = ({
  skus,
}: {
  skus: string[];
}): Promise<Subscription[]> =>
  (
    Platform.select({
      ios: async () => {
        let items: Subscription[];
        if (isIosStorekit2()) {
          items = ((await RNIapIosSk2.getItems(skus)) as ProductSk2[]).map(
            subscriptionSk2Map,
          );
        } else {
          items = (await RNIapIos.getItems(skus)) as Subscription[];
        }

        return items.filter(
          (item: Subscription) =>
            skus.includes(item.productId) && item.type === 'subs',
        );
      },
      android: async () => {
        const subscriptions = (await getAndroidModule().getItemsByType(
          ANDROID_ITEM_TYPE_SUBSCRIPTION,
          skus,
        )) as Subscription[];

        return fillProductsWithAdditionalData(subscriptions);
      },
    }) || (() => Promise.reject(new Error('Unsupported Platform')))
  )();

/**
 * Gets an inventory of purchases made by the user regardless of consumption status
 * ## Usage

```tsx
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {getPurchaseHistory} from 'react-native-iap';

const App = () => {
  const history = useCallback(
    async () =>
      await getPurchaseHistory([
        'com.example.product1',
        'com.example.product2',
      ]),
    [],
  );

  return <View />;
};
```
@param {alsoPublishToEventListener}:boolean When `true`, every element will also be pushed to the purchaseUpdated listener.
Note that this is only for backaward compatiblity. It won't publish to transactionUpdated (Storekit2) Defaults to `false`
 */
export const getPurchaseHistory = ({
  alsoPublishToEventListener = false,
}: {
  alsoPublishToEventListener?: boolean;
} = {}): Promise<(ProductPurchase | SubscriptionPurchase)[]> =>
  (
    Platform.select({
      ios: async () => {
        return getIosModule().getAvailableItems(alsoPublishToEventListener);
      },
      android: async () => {
        if (RNIapAmazonModule) {
          return await RNIapAmazonModule.getAvailableItems();
        }

        const products = await RNIapModule.getPurchaseHistoryByType(
          ANDROID_ITEM_TYPE_IAP,
        );

        const subscriptions = await RNIapModule.getPurchaseHistoryByType(
          ANDROID_ITEM_TYPE_SUBSCRIPTION,
        );

        return products.concat(subscriptions);
      },
    }) || (() => Promise.resolve([]))
  )();

/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * ## Usage

```tsx
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {getAvailablePurchases} from 'react-native-iap';

const App = () => {
  const availablePurchases = useCallback(
    async () => await getAvailablePurchases(),
    [],
  );

  return <View />;
};
```

## Restoring purchases

You can use `getAvailablePurchases()` to do what's commonly understood as "restoring" purchases.

:::note
For debugging you may want to consume all items, you have then to iterate over the purchases returned by `getAvailablePurchases()`.
:::

:::warning
Beware that if you consume an item without having recorded the purchase in your database the user may have paid for something without getting it delivered and you will have no way to recover the receipt to validate and restore their purchase.
:::

```tsx
import React from 'react';
import {Button} from 'react-native';
import {getAvailablePurchases,finishTransaction} from 'react-native-iap';

const App = () => {
  handleRestore = async () => {
    try {
      const purchases = await getAvailablePurchases();
      const newState = {premium: false, ads: true};
      let titles = [];

      await Promise.all(purchases.map(async purchase => {
        switch (purchase.productId) {
          case 'com.example.premium':
            newState.premium = true;
            titles.push('Premium Version');
            break;

          case 'com.example.no_ads':
            newState.ads = false;
            titles.push('No Ads');
            break;

          case 'com.example.coins100':
            await finishTransaction(purchase.purchaseToken);
            CoinStore.addCoins(100);
        }
      })

      Alert.alert(
        'Restore Successful',
        `You successfully restored the following purchases: ${titles.join(', ')}`,
      );
    } catch (error) {
      console.warn(error);
      Alert.alert(error.message);
    }
  };

  return (
    <Button title="Restore purchases" onPress={handleRestore} />
  )
};
```
@param {alsoPublishToEventListener}:boolean When `true`, every element will also be pushed to the purchaseUpdated listener.
Note that this is only for backaward compatiblity. It won't publish to transactionUpdated (Storekit2) Defaults to `false`
 * 
 */
export const getAvailablePurchases = ({
  alsoPublishToEventListener = false,
}: {alsoPublishToEventListener?: boolean} = {}): Promise<
  (ProductPurchase | SubscriptionPurchase)[]
> =>
  (
    Platform.select({
      ios: async () => {
        return getIosModule().getAvailableItems(alsoPublishToEventListener);
      },
      android: async () => {
        if (RNIapAmazonModule) {
          return await RNIapAmazonModule.getAvailableItems();
        }

        const products = await RNIapModule.getAvailableItemsByType(
          ANDROID_ITEM_TYPE_IAP,
        );

        const subscriptions = await RNIapModule.getAvailableItemsByType(
          ANDROID_ITEM_TYPE_SUBSCRIPTION,
        );

        return products.concat(subscriptions);
      },
    }) || (() => Promise.resolve([]))
  )();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * Request a purchase for a product (consumables or non-consumables).

The response will be received through the `PurchaseUpdatedListener`.

:::note
`andDangerouslyFinishTransactionAutomatically` defaults to false. We recommend
always keeping at false, and verifying the transaction receipts on the server-side.
:::

## Signature

```ts
requestPurchase(
 The product's sku/ID 
  sku,

  
   * You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user.
   * @default false
   
  andDangerouslyFinishTransactionAutomaticallyIOS = false,

  /** Specifies an optional obfuscated string that is uniquely associated with the user's account in your app. 
  obfuscatedAccountIdAndroid,

  Specifies an optional obfuscated string that is uniquely associated with the user's profile in your app. 
  obfuscatedProfileIdAndroid,

   The purchaser's user ID 
  applicationUsername,
): Promise<ProductPurchase>;
```

## Usage

```tsx
import React, {useCallback} from 'react';
import {Button} from 'react-native';
import {requestPurchase, Product, Sku, getProducts} from 'react-native-iap';

const App = () => {
  const products = useCallback(
    async () => getProducts(['com.example.product']),
    [],
  );

  const handlePurchase = async (sku: Sku) => {
    await requestPurchase({sku});
  };

  return (
    <>
      {products.map((product) => (
        <Button
          key={product.productId}
          title="Buy product"
          onPress={() => handlePurchase(product.productId)}
        />
      ))}
    </>
  );
};
```

 */

export const requestPurchase = ({
  sku,
  andDangerouslyFinishTransactionAutomaticallyIOS = false,
  obfuscatedAccountIdAndroid,
  obfuscatedProfileIdAndroid,
  appAccountToken,
  skus, // Android Billing V5
  isOfferPersonalized = undefined, // Android Billing V5
  quantity,
  withOffer,
}: RequestPurchase): Promise<ProductPurchase | void> =>
  (
    Platform.select({
      ios: async () => {
        if (!sku) {
          return Promise.reject(new Error('sku is required for iOS purchase'));
        }
        if (andDangerouslyFinishTransactionAutomaticallyIOS) {
          console.warn(
            'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
          );
        }
        if (isIosStorekit2()) {
          const offer = offerSk2Map(withOffer);

          return RNIapIosSk2.buyProduct(
            sku,
            andDangerouslyFinishTransactionAutomaticallyIOS,
            appAccountToken,
            quantity ?? -1,
            offer,
          );
        } else {
          return RNIapIos.buyProduct(
            sku,
            andDangerouslyFinishTransactionAutomaticallyIOS,
            appAccountToken,
            quantity ?? -1,
            offerToRecord(withOffer),
          );
        }
      },
      android: async () => {
        if (isAmazon) {
          if (!sku) {
            return Promise.reject(
              new Error('sku is required for Amazon purchase'),
            );
          }
          return RNIapAmazonModule.buyItemByType(sku);
        } else {
          if (!sku?.length && !sku) {
            return Promise.reject(
              new Error('skus is required for Android purchase'),
            );
          }
          return getAndroidModule().buyItemByType(
            ANDROID_ITEM_TYPE_IAP,
            skus?.length ? skus : [sku],
            undefined,
            -1,
            obfuscatedAccountIdAndroid,
            obfuscatedProfileIdAndroid,
            [],
            isOfferPersonalized ?? false,
          );
        }
      },
    }) || Promise.resolve
  )();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * Request a purchase for a subscription.

The response will be received through the `PurchaseUpdatedListener`.

:::note
`andDangerouslyFinishTransactionAutomatically` defaults to false. We recommend
always keeping at false, and verifying the transaction receipts on the server-side.
:::

## Signature

```ts
requestSubscription(
  The product's sku/ID 
  sku,


   * You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user.
   * @default false

  andDangerouslyFinishTransactionAutomaticallyIOS = false,

   purchaseToken that the user is upgrading or downgrading from (Android). 
  purchaseTokenAndroid,

  UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY, IMMEDIATE_WITH_TIME_PRORATION, IMMEDIATE_AND_CHARGE_PRORATED_PRICE, IMMEDIATE_WITHOUT_PRORATION, DEFERRED 
  prorationModeAndroid = -1,

  /** Specifies an optional obfuscated string that is uniquely associated with the user's account in your app. 
  obfuscatedAccountIdAndroid,

  Specifies an optional obfuscated string that is uniquely associated with the user's profile in your app. 
  obfuscatedProfileIdAndroid,

  The purchaser's user ID 
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
 */
export const requestSubscription = ({
  sku,
  andDangerouslyFinishTransactionAutomaticallyIOS = false,
  purchaseTokenAndroid,
  prorationModeAndroid = -1,
  obfuscatedAccountIdAndroid,
  obfuscatedProfileIdAndroid,
  subscriptionOffers = undefined, // Android Billing V5
  isOfferPersonalized = undefined, // Android Billing V5
  appAccountToken,
  quantity,
  withOffer,
}: RequestSubscription): Promise<SubscriptionPurchase | null | void> =>
  (
    Platform.select({
      ios: async () => {
        if (!sku) {
          return Promise.reject(
            new Error('sku is required for iOS subscription'),
          );
        }
        if (andDangerouslyFinishTransactionAutomaticallyIOS) {
          console.warn(
            'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
          );
        }

        if (isIosStorekit2()) {
          const offer = offerSk2Map(withOffer);

          return RNIapIosSk2.buyProduct(
            sku,
            andDangerouslyFinishTransactionAutomaticallyIOS,
            appAccountToken,
            quantity ?? -1,
            offer,
          );
        } else {
          return RNIapIos.buyProduct(
            sku,
            andDangerouslyFinishTransactionAutomaticallyIOS,
            appAccountToken,
            quantity ?? -1,
            offerToRecord(withOffer),
          );
        }
      },
      android: async () => {
        if (isAmazon) {
          if (!sku) {
            return Promise.reject(
              new Error('sku is required for Amazon purchase'),
            );
          }
          return RNIapAmazonModule.buyItemByType(sku);
        } else {
          if (!subscriptionOffers?.length) {
            return Promise.reject(
              'subscriptionOffers are required for Google Play Subscriptions',
            );
          }
          return RNIapModule.buyItemByType(
            ANDROID_ITEM_TYPE_SUBSCRIPTION,
            subscriptionOffers?.map((so) => so.sku),
            purchaseTokenAndroid,
            prorationModeAndroid,
            obfuscatedAccountIdAndroid,
            obfuscatedProfileIdAndroid,
            subscriptionOffers?.map((so) => so.offerToken),
            isOfferPersonalized ?? false,
          );
        }
      },
    }) || (() => Promise.resolve(null))
  )();

/**
 * Finish Transaction (both platforms)
 *   Abstracts  Finish Transaction
 *   iOS: Tells StoreKit that you have delivered the purchase to the user and StoreKit can now let go of the transaction.
 *   Call this after you have persisted the purchased state to your server or local data in your app.
 *   `react-native-iap` will continue to deliver the purchase updated events with the successful purchase until you finish the transaction. **Even after the app has relaunched.**
 *   Android: it will consume purchase for consumables and acknowledge purchase for non-consumables.
 *   
```tsx
import React from 'react';
import {Button} from 'react-native';
import {finishTransaction} from 'react-native-iap';

const App = () => {
  const handlePurchase = async () => {
    // ... handle the purchase request

    const result = finishTransaction(purchase);
  };

  return <Button title="Buy product" onPress={handlePurchase} />;
};
``` 
 */
export const finishTransaction = ({
  purchase,
  isConsumable,
  developerPayloadAndroid,
}: {
  purchase: ProductPurchase | SubscriptionPurchase;
  isConsumable?: boolean;
  developerPayloadAndroid?: string;
}): Promise<PurchaseResult | boolean> => {
  return (
    Platform.select({
      ios: async () => {
        const transactionId = purchase.transactionId;

        if (!transactionId) {
          return Promise.reject(
            new Error('transactionId required to finish iOS transaction'),
          );
        }
        return getIosModule().finishTransaction(transactionId);
      },
      android: async () => {
        if (purchase?.purchaseToken) {
          if (isConsumable) {
            return getAndroidModule().consumeProduct(
              purchase.purchaseToken,
              developerPayloadAndroid,
            );
          } else if (
            purchase.userIdAmazon ||
            (!purchase.isAcknowledgedAndroid &&
              purchase.purchaseStateAndroid === PurchaseStateAndroid.PURCHASED)
          ) {
            return getAndroidModule().acknowledgePurchase(
              purchase.purchaseToken,
              developerPayloadAndroid,
            );
          } else {
            return Promise.reject(
              new Error('purchase is not suitable to be purchased'),
            );
          }
        }
        return Promise.reject(
          new Error('purchase is not suitable to be purchased'),
        );
      },
    }) || (() => Promise.reject(new Error('Unsupported Platform')))
  )();
};

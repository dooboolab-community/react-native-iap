import {Linking, NativeModules, Platform} from 'react-native';
import type {ResponseBody as ReceiptValidationResponse} from '@jeremybarbet/apple-api-types';

import type * as Amazon from './types/amazon';
import type * as Android from './types/android';
import type * as Apple from './types/apple';
import {
  offerSk2Map,
  ProductSk2,
  productSk2Map,
  subscriptionSk2Map,
} from './types/appleSk2';
import {
  enhancedFetch,
  fillProductsWithAdditionalData,
  isAmazon,
  isAndroid,
} from './internal';
import {
  Product,
  ProductPurchase,
  ProductType,
  Purchase,
  PurchaseResult,
  RequestPurchase,
  RequestSubscription,
  Sku,
  Subscription,
  SubscriptionPurchase,
} from './types';
import {InstallSourceAndroid, PurchaseStateAndroid} from './types';

const {RNIapIos, RNIapIosSk2, RNIapModule, RNIapAmazonModule} = NativeModules;
const ANDROID_ITEM_TYPE_SUBSCRIPTION = ProductType.subs;
const ANDROID_ITEM_TYPE_IAP = ProductType.inapp;

export const getInstallSourceAndroid = (): InstallSourceAndroid => {
  return RNIapModule
    ? InstallSourceAndroid.GOOGLE_PLAY
    : InstallSourceAndroid.AMAZON;
};

let androidNativeModule = RNIapModule;

let iosNativeModule: typeof RNIapIos | typeof RNIapIosSk2 = RNIapIos;

const isIosStorekit2 = () => iosNativeModule === RNIapIosSk2;

export const isStorekit2Avaiable = (): boolean => !!RNIapIosSk2;

export const enableStorekit2 = () => {
  if (RNIapIosSk2) {
    iosNativeModule = RNIapIosSk2;
    return true;
  }
  console.warn('Storekit 2 is not available on this device');

  return false;
};

export const setAndroidNativeModule = (
  nativeModule: typeof RNIapModule,
): void => {
  androidNativeModule = nativeModule;
};

export const setIosNativeModule = (
  nativeModule: typeof RNIapIos | typeof RNIapIosSk2,
): void => {
  iosNativeModule = nativeModule;
};

const checkNativeAndroidAvailable = (): void => {
  if (!RNIapModule && !RNIapAmazonModule) {
    throw new Error('IAP_NOT_AVAILABLE');
  }
};

export const getAndroidModule = ():
  | typeof RNIapModule
  | typeof RNIapAmazonModule => {
  checkNativeAndroidAvailable();

  return androidNativeModule
    ? androidNativeModule
    : RNIapModule
    ? RNIapModule
    : RNIapAmazonModule;
};

const checkNativeIOSAvailable = (): void => {
  if (!RNIapIos && !RNIapIosSk2) {
    throw new Error('IAP_NOT_AVAILABLE');
  }
};

export const getIosModule = (): typeof RNIapIos | typeof RNIapIosSk2 => {
  checkNativeIOSAvailable();

  return iosNativeModule
    ? iosNativeModule
    : RNIapIosSk2
    ? RNIapIosSk2
    : RNIapIos;
};

export const getNativeModule = ():
  | typeof RNIapModule
  | typeof RNIapAmazonModule
  | typeof RNIapIos
  | typeof RNIapIosSk2 => {
  return isAndroid ? getAndroidModule() : getIosModule();
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
 */
export const getPurchaseHistory = (): Promise<
  (ProductPurchase | SubscriptionPurchase)[]
> =>
  (
    Platform.select({
      ios: async () => {
        return getIosModule().getAvailableItems();
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
 * 
 */
export const getAvailablePurchases = (): Promise<
  (ProductPurchase | SubscriptionPurchase)[]
> =>
  (
    Platform.select({
      ios: async () => {
        return getIosModule().getAvailableItems();
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
            withOffer,
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
            withOffer,
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

/**
 * Clear Transaction (iOS only)
 *   Finish remaining transactions. Related to issue #257 and #801
 *     link : https://github.com/dooboolab/react-native-iap/issues/257
 *            https://github.com/dooboolab/react-native-iap/issues/801
 * @returns {Promise<void>}
 */
export const clearTransactionIOS = (): Promise<void> =>
  getIosModule().clearTransaction();

/**
 * Clear valid Products (iOS only)
 *   Remove all products which are validated by Apple server.
 * @returns {void}
 */
export const clearProductsIOS = (): Promise<void> =>
  getIosModule().clearProducts();

/**
 * Acknowledge a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise<PurchaseResult | void>}
 */
export const acknowledgePurchaseAndroid = ({
  token,
  developerPayload,
}: {
  token: string;
  developerPayload?: string;
}): Promise<PurchaseResult | boolean | void> => {
  return getAndroidModule().acknowledgePurchase(token, developerPayload);
};

/**
 * Deep link to subscriptions screen on Android. No-op on iOS.
 * @param {string} sku The product's SKU (on Android)
 * @returns {Promise<void>}
 */
export const deepLinkToSubscriptionsAndroid = async ({
  sku,
}: {
  sku: Sku;
}): Promise<void> => {
  checkNativeAndroidAvailable();

  return Linking.openURL(
    `https://play.google.com/store/account/subscriptions?package=${await RNIapModule.getPackageName()}&sku=${sku}`,
  );
};

/**
 * Should Add Store Payment (iOS only)
 *   Indicates the the App Store purchase should continue from the app instead of the App Store.
 * @returns {Promise<Product | null>} promoted product
 */
export const getPromotedProductIOS = (): Promise<Product | null> => {
  if (!isIosStorekit2) {
    return getIosModule().promotedProduct();
  } else {
    return Promise.reject('Only available on SK1');
  }
};

/**
 * Buy the currently selected promoted product (iOS only)
 *   Initiates the payment process for a promoted product. Should only be called in response to the `iap-promoted-product` event.
 * @returns {Promise<void>}
 */
export const buyPromotedProductIOS = (): Promise<void> =>
  getIosModule().buyPromotedProduct();

const TEST_RECEIPT = 21007;
const requestAgnosticReceiptValidationIos = async (
  receiptBody: Record<string, unknown>,
): Promise<ReceiptValidationResponse | false> => {
  const response = await enhancedFetch<ReceiptValidationResponse>(
    'https://buy.itunes.apple.com/verifyReceipt',
    {
      method: 'POST',
      body: receiptBody,
    },
  );

  // Best practice is to check for test receipt and check sandbox instead
  // https://developer.apple.com/documentation/appstorereceipts/verifyreceipt
  if (response && response.status === TEST_RECEIPT) {
    const testResponse = await enhancedFetch<ReceiptValidationResponse>(
      'https://sandbox.itunes.apple.com/verifyReceipt',
      {
        method: 'POST',
        body: receiptBody,
      },
    );

    return testResponse;
  }

  return response;
};

/**
 * Validate receipt for iOS.
 * @param {object} receiptBody the receipt body to send to apple server.
 * @param {boolean} isTest whether this is in test environment which is sandbox.
 * @returns {Promise<Apple.ReceiptValidationResponse | false>}
 */
export const validateReceiptIos = async ({
  receiptBody,
  isTest,
}: {
  receiptBody: Record<string, unknown>;
  isTest?: boolean;
}): Promise<ReceiptValidationResponse | false> => {
  if (isTest == null) {
    return await requestAgnosticReceiptValidationIos(receiptBody);
  }

  const url = isTest
    ? 'https://sandbox.itunes.apple.com/verifyReceipt'
    : 'https://buy.itunes.apple.com/verifyReceipt';

  return await enhancedFetch<ReceiptValidationResponse>(url);
};

/**
 * Validate receipt for Android. NOTE: This method is here for debugging purposes only. Including
 * your access token in the binary you ship to users is potentially dangerous.
 * Use server side validation instead for your production builds
 * @param {string} packageName package name of your app.
 * @param {string} productId product id for your in app product.
 * @param {string} productToken token for your purchase.
 * @param {string} accessToken accessToken from googleApis.
 * @param {boolean} isSub whether this is subscription or inapp. `true` for subscription.
 * @returns {Promise<object>}
 */
export const validateReceiptAndroid = async ({
  packageName,
  productId,
  productToken,
  accessToken,
  isSub,
}: {
  packageName: string;
  productId: string;
  productToken: string;
  accessToken: string;
  isSub?: boolean;
}): Promise<Android.ReceiptType> => {
  const type = isSub ? 'subscriptions' : 'products';

  const url =
    'https://androidpublisher.googleapis.com/androidpublisher/v3/applications' +
    `/${packageName}/purchases/${type}/${productId}` +
    `/tokens/${productToken}?access_token=${accessToken}`;

  return await enhancedFetch<Android.ReceiptType>(url);
};

/**
 * Validate receipt for Amazon. NOTE: This method is here for debugging purposes only. Including
 * your developer secret in the binary you ship to users is potentially dangerous.
 * Use server side validation instead for your production builds
 * @param {string} developerSecret: from the Amazon developer console.
 * @param {string} userId who purchased the item.
 * @param {string} receiptId long obfuscated string returned when purchasing the item
 * @param {boolean} useSandbox Defaults to true, use sandbox environment or production.
 * @returns {Promise<object>}
 */
export const validateReceiptAmazon = async ({
  developerSecret,
  userId,
  receiptId,
  useSandbox = true,
}: {
  developerSecret: string;
  userId: string;
  receiptId: string;
  useSandbox: boolean;
}): Promise<Amazon.ReceiptType> => {
  const sandBoxUrl = useSandbox ? 'sandbox/' : '';
  const url = `https://appstore-sdk.amazon.com/${sandBoxUrl}version/1.0/verifyReceiptId/developer/${developerSecret}/user/${userId}/receiptId/${receiptId}`;

  return await enhancedFetch<Amazon.ReceiptType>(url);
};

/**
 * Get the current receipt base64 encoded in IOS.
 * @param {forceRefresh?:boolean}
 * @returns {Promise<ProductPurchase[]>}
 */
export const getPendingPurchasesIOS = async (): Promise<ProductPurchase[]> =>
  getIosModule().getPendingTransactions();

/**
 * Get the current receipt base64 encoded in IOS.
 * @param {forceRefresh?:boolean}
 * @returns {Promise<string>}
 */
export const getReceiptIOS = async ({
  forceRefresh,
}: {
  forceRefresh?: boolean;
}): Promise<string> => getIosModule().requestReceipt(forceRefresh ?? false);

/**
 * Launches a modal to register the redeem offer code in IOS.
 * @returns {Promise<null>}
 */
export const presentCodeRedemptionSheetIOS = async (): Promise<null> =>
  getIosModule().presentCodeRedemptionSheet();

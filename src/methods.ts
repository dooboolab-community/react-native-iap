import {Linking, Platform} from 'react-native';
import type {ResponseBody as AppleResponseBody} from '@jeremybarbet/apple-api-types';
import type {
  ProductPurchase as GoogleProductPurchase,
  SubscriptionPurchase as GoogleSubscriptionPurchase,
} from '@jeremybarbet/google-api-types';

import type {ReceiptType as AmazonReceiptType} from './types/amazon';
import type * as Apple from './types/apple';
import {AmazonModule, AndroidModule, IosModule, NativeModule} from './modules';
import {
  ProductCommon,
  ProductProduct,
  ProductPurchase,
  ProductType,
  RequestPurchase,
  RequestSubscription,
  Sku,
  SubscriptionProduct,
  SubscriptionPurchase,
} from './types';
import {PurchaseStateAndroid} from './types';

const TEST_RECEIPT = 21007;

/**
 * Init module for purchase flow. Required on Android. In ios it will check whether user canMakePayment.
 */
export const initConnection = () => NativeModule.initConnection();

/**
 * End module for purchase flow.
 */
export const endConnection = () => NativeModule.endConnection();

/**
 * Consume all 'ghost' purchases **(Android only)**
 * That is, pending payment that already failed but is still marked as pending in Play Store cache
 */
export const flushFailedPurchasesCachedAsPendingAndroid = () =>
  AndroidModule.flushFailedPurchasesCachedAsPending();

/**
 * Fill products with additional data
 */
const fillProductsWithAdditionalData = async <T = ProductCommon>(
  items: T[],
) => {
  if (AmazonModule) {
    // On amazon we must get the user marketplace to detect the currency
    const user = await AmazonModule.getUser();

    const currencies = {
      CA: 'CAD',
      ES: 'EUR',
      AU: 'AUD',
      DE: 'EUR',
      IN: 'INR',
      US: 'USD',
      JP: 'JPY',
      GB: 'GBP',
      IT: 'EUR',
      BR: 'BRL',
      FR: 'EUR',
    };

    const currency =
      currencies[user.userMarketplaceAmazon as keyof typeof currencies];

    // Add currency to items
    items.forEach((item) => {
      if (currency) {
        (item as unknown as ProductCommon).currency = currency;
      }
    });
  }

  return items;
};

/**
 * Get a list of products (consumable and non-consumable items)
 */
export const getProducts = (
  /** The item skus */
  skus: Sku[],
) =>
  Platform.select({
    ios: async () => {
      const items = await IosModule.getItems(skus);

      return items.filter(
        (item): item is ProductProduct =>
          skus.includes(item.productId) && item.type === 'iap',
      );
    },
    android: async () => {
      const products = (await AndroidModule.getItemsByType(
        ProductType.inapp,
        skus,
      )) as ProductProduct[];

      return fillProductsWithAdditionalData(products);
    },
    default: () => Promise.resolve([]),
  })();

/**
 * Get a list of subscriptions
 */
export const getSubscriptions = (
  /** The item skus */
  skus: Sku[],
) =>
  Platform.select({
    ios: async () => {
      const items = await IosModule.getItems(skus);

      return items.filter(
        (item): item is SubscriptionProduct =>
          skus.includes(item.productId) && item.type === 'subs',
      );
    },
    android: async () => {
      const subscriptions =
        await AndroidModule.getItemsByType<SubscriptionProduct>(
          ProductType.subs,
          skus,
        );

      return fillProductsWithAdditionalData(subscriptions);
    },
    default: () => Promise.resolve([]),
  })();

/**
 * Gets an inventory of purchases made by the user regardless of consumption status
 */
export const getPurchaseHistory = () =>
  Platform.select({
    ios: async () => await IosModule.getAvailableItems(),
    android: async () => {
      if (AmazonModule) {
        return await AmazonModule.getAvailableItems();
      }

      const products =
        await AndroidModule.getPurchaseHistoryByType<ProductPurchase>(
          ProductType.inapp,
        );

      const subscriptions =
        await AndroidModule.getPurchaseHistoryByType<SubscriptionPurchase>(
          ProductType.subs,
        );

      return products.concat(subscriptions);
    },
    default: () => Promise.resolve([]),
  })();

/**
 * Get all purchases made by the user (either non-consumable, haven't been consumed yet or subscriptions)
 */
export const getAvailablePurchases = () =>
  Platform.select({
    ios: async () => await IosModule.getAvailableItems(),
    android: async () => {
      if (AmazonModule) {
        return await AmazonModule.getAvailableItems();
      }

      const products =
        await AndroidModule.getAvailableItemsByType<ProductPurchase>(
          ProductType.inapp,
        );

      const subscriptions =
        await AndroidModule.getAvailableItemsByType<SubscriptionPurchase>(
          ProductType.subs,
        );

      return products.concat(subscriptions);
    },
    default: () => Promise.resolve([]),
  })();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 */
export const requestPurchase = ({
  /** The product's sku/ID */
  sku,

  /**
   * You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user.
   * @default false
   **/
  andDangerouslyFinishTransactionAutomaticallyIOS = false,

  /** Specifies an optional obfuscated string that is uniquely associated with the user's account in your app. */
  obfuscatedAccountIdAndroid,

  /** Specifies an optional obfuscated string that is uniquely associated with the user's profile in your app. */
  obfuscatedProfileIdAndroid,

  /** The purchaser's user ID */
  applicationUsername,
}: RequestPurchase) =>
  Platform.select({
    ios: async () => {
      if (andDangerouslyFinishTransactionAutomaticallyIOS) {
        console.warn(
          'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomaticallyIOS to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
        );
      }

      return IosModule.buyProduct(
        sku,
        andDangerouslyFinishTransactionAutomaticallyIOS,
        applicationUsername,
      );
    },
    android: async () =>
      await AndroidModule.buyItemByType(
        ProductType.inapp,
        sku,
        null,
        0,
        obfuscatedAccountIdAndroid,
        obfuscatedProfileIdAndroid,
      ),
    default: () => Promise.resolve(null),
  })();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 */
export const requestSubscription = ({
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
}: RequestSubscription) =>
  Platform.select({
    ios: async () => {
      if (andDangerouslyFinishTransactionAutomaticallyIOS) {
        console.warn(
          'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomaticallyIOS to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.',
        );
      }

      return await IosModule.buyProduct(
        sku,
        andDangerouslyFinishTransactionAutomaticallyIOS,
        applicationUsername,
      );
    },
    android: async () =>
      await AndroidModule.buyItemByType(
        ProductType.subs,
        sku,
        purchaseTokenAndroid,
        prorationModeAndroid,
        obfuscatedAccountIdAndroid,
        obfuscatedProfileIdAndroid,
      ),
    default: () => Promise.resolve(null),
  })();

/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 */
export const requestPurchaseWithQuantityIOS = (
  /** The product's sku/ID */
  sku: Sku,

  /** The quantity to request to buy */
  quantity: number,
) => IosModule.buyProductWithQuantity(sku, quantity);

/**
 * Finish Transaction (both platforms)
 *
 * iOS:
 * Tells StoreKit that you have delivered the purchase to the user and StoreKit can now let go of the transaction.
 * Call this after you have persisted the purchased state to your server or local data in your app.
 * `react-native-iap` will continue to deliver the purchase updated events with the successful purchase until you finish the transaction. **Even after the app has relaunched.**
 *
 * Android:
 * It will consume purchase for consumables and acknowledge purchase for non-consumables.
 */
export const finishTransaction = (
  /** The purchase that you would like to finish. */
  purchase: ProductPurchase,

  /** Checks if purchase is consumable. Has effect on `Android`. */
  isConsumable?: boolean,

  /** Android developerPayload. */
  developerPayloadAndroid?: string,
) =>
  Platform.select({
    ios: async () => {
      if (!purchase.transactionId) {
        throw new Error('The transactionId is missing.');
      }

      return await IosModule.finishTransaction(purchase.transactionId);
    },
    android: async () => {
      if (purchase) {
        if (isConsumable) {
          return await AndroidModule.consumeProduct(
            purchase.purchaseToken,
            developerPayloadAndroid,
          );
        } else if (
          purchase.userIdAmazon ||
          (!purchase.isAcknowledgedAndroid &&
            purchase.purchaseStateAndroid === PurchaseStateAndroid.PURCHASED)
        ) {
          return await AndroidModule.acknowledgePurchase(
            purchase.purchaseToken,
            developerPayloadAndroid,
          );
        }

        throw new Error('Purchase is not suitable to be purchased.');
      } else {
        throw new Error('Purchase is not assigned.');
      }
    },
    default: Promise.resolve,
  })();

/**
 * Clear Transaction **(iOS only)**
 *
 * Finish remaining transactions. Related to issue #257 and #801
 * @link https://github.com/dooboolab/react-native-iap/issues/257
 * @link https://github.com/dooboolab/react-native-iap/issues/801
 */
export const clearTransactionIOS = () => IosModule.clearTransaction();

/**
 * Clear valid Products **(iOS only)**
 *
 * Remove all products which are validated by Apple server.
 */
export const clearProductsIOS = () => IosModule.clearProducts();

/**
 * Acknowledge a product **(Android only)**
 */
export const acknowledgePurchaseAndroid = (
  /** The product's token */
  token: string,

  /** Android developerPayload */
  developerPayload?: string,
) => {
  return AndroidModule.acknowledgePurchase(token, developerPayload);
};

/**
 * Deep link to subscriptions screen. **(Android only)**
 */
export const deepLinkToSubscriptionsAndroid = async (
  /** The product's SKU */
  sku: Sku,
) =>
  Linking.openURL(
    `https://play.google.com/store/account/subscriptions?package=${await AndroidModule.getPackageName()}&sku=${sku}`,
  );

/**
 * Should Add Store Payment **(iOS only)**
 * Indicates the the App Store purchase should continue from the app instead of the App Store.
 */
export const getPromotedProductIOS = () => IosModule.promotedProduct();

/**
 * Buy the currently selected promoted product **(iOS only)**
 * Initiates the payment process for a promoted product. Should only be called in response to the `iap-promoted-product` event.
 */
export const buyPromotedProductIOS = () => IosModule.buyPromotedProduct();

const fetchJsonOrThrow = async (
  url: string,
  receiptBody: Record<string, unknown>,
) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(receiptBody),
  });

  if (!response.ok) {
    throw Object.assign(new Error(response.statusText), {
      statusCode: response.status,
    });
  }

  return response.json() as Promise<AppleResponseBody>;
};

const requestAgnosticReceiptValidationIOS = async (
  receiptBody: Record<string, unknown>,
) => {
  const response = await fetchJsonOrThrow(
    'https://buy.itunes.apple.com/verifyReceipt',
    receiptBody,
  );

  /**
   * Best practice is to check for test receipt and check sandbox instead
   * @link https://developer.apple.com/documentation/appstorereceipts/verifyreceipt
   */
  if (response && response.status === TEST_RECEIPT) {
    const testResponse = await fetchJsonOrThrow(
      'https://sandbox.itunes.apple.com/verifyReceipt',
      receiptBody,
    );

    return testResponse;
  }

  return response;
};

/**
 * Buy products or subscriptions with offers **(iOS only)**
 *
 * Runs the payment process with some info you must fetch
 * from your server.
 */
export const requestPurchaseWithOfferIOS = (
  /** The product identifier */
  sku: Sku,

  /** An user identifier on you system */
  forUser: string,

  /** The offer information */
  withOffer: Apple.PaymentDiscount,
) => IosModule.buyProductWithOffer(sku, forUser, withOffer);

/**
 * Validate receipt **(iOS only)**
 */
export const validateReceiptIOS = async (
  /** The receipt body to send to apple server. */
  receiptBody: Record<string, unknown>,

  /** Whether this is in test environment which is sandbox. */
  isTest?: boolean,
) => {
  if (isTest == null) {
    return await requestAgnosticReceiptValidationIOS(receiptBody);
  }

  const url = isTest
    ? 'https://sandbox.itunes.apple.com/verifyReceipt'
    : 'https://buy.itunes.apple.com/verifyReceipt';

  return await fetchJsonOrThrow(url, receiptBody);
};

/**
 * Validate receipt **(Android only)**
 *
 * NOTE: This method is here for debugging purposes only. Including your
 * access token in the binary you ship to users is potentially dangerous.
 * Use server side validation instead for your production builds
 */
export const validateReceiptAndroid = async (
  /** package name of your app. */
  packageName: string,

  /** product id for your in app product. */
  productId: string,

  /** token for your purchase. */
  productToken: string,

  /** accessToken from googleApis. */
  accessToken: string,

  /** whether this is subscription or inapp. `true` for subscription. */
  isSub?: boolean,
) => {
  const type = isSub ? 'subscriptions' : 'products';

  const url =
    'https://androidpublisher.googleapis.com/androidpublisher/v3/applications' +
    `/${packageName}/purchases/${type}/${productId}` +
    `/tokens/${productToken}?access_token=${accessToken}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw Object.assign(new Error(response.statusText), {
      statusCode: response.status,
    });
  }

  return response.json() as Promise<
    GoogleProductPurchase | GoogleSubscriptionPurchase
  >;
};

/**
 * Validate receipt **(Amazon only)**
 *
 * NOTE: This method is here for debugging purposes only. Including your
 * developer secret in the binary you ship to users is potentially dangerous.
 * Use server side validation instead for your production builds
 */
export const validateReceiptAmazon = async (
  /** From the Amazon developer console */
  developerSecret: string,

  /** Who purchased the item. */
  userId: string,

  /** Long obfuscated string returned when purchasing the item */
  receiptId: string,

  /** Defaults to true, use sandbox environment or production. */
  useSandbox: boolean = true,
) => {
  const sandBoxUrl = useSandbox ? 'sandbox/' : '';
  const url = `https://appstore-sdk.amazon.com/${sandBoxUrl}version/1.0/verifyReceiptId/developer/${developerSecret}/user/${userId}/receiptId/${receiptId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw Object.assign(new Error(response.statusText), {
      statusCode: response.status,
    });
  }

  return response.json() as Promise<AmazonReceiptType>;
};

/**
 * Get the current receipt base64 encoded. **(iOS only)**
 */
export const getPendingPurchasesIOS = async () =>
  IosModule.getPendingTransactions();

/**
 * Launches a modal to register the redeem offer code. **(iOS only)**
 */
export const presentCodeRedemptionSheetIOS = async () =>
  IosModule.presentCodeRedemptionSheet();

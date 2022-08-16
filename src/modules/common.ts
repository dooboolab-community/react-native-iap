import {Platform} from 'react-native';

import {fillProductsWithAdditionalData, isAndroid} from '../internal';
import {
  ProductProduct,
  ProductPurchase,
  ProductType,
  RequestPurchase,
  RequestSubscription,
  Sku,
  SubscriptionProduct,
  SubscriptionPurchase,
} from '../types';

import {AmazonModule} from './amazon';
import {AndroidModule, PurchaseStateAndroid} from './android';
import {IosModule} from './ios';

export const NativeModule = isAndroid ? AndroidModule : IosModule;

/**
 * Initialize the module connection for In-App Purchases.
 */
export const initConnection = () => NativeModule.initConnection();

/**
 * End the In-App Purchases module connection.
 */
export const endConnection = () => NativeModule.endConnection();

/**
 * Get a list of products (consumable and non-consumable items).
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
 * Get a list of subscriptions.
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
 * Get a list of purchases made by the user regardless of consumption states.
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
 * Get all purchases made by the user (either non-consumable, consumable and haven't been consumed yet or subscriptions).
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
 * Request a purchase for a product (consumables or non-consumables).
 *
 * The response will be received through the `PurchaseUpdatedListener`.
 *
 * @note
 * `andDangerouslyFinishTransactionAutomatically` defaults to false. We recommend
 * always keeping at false, and verifying the transaction receipts on the server-side.
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

  /**
   * Android Billing V5
   */
  skus,

  /**
   * Android Billing V5
   */
  isOfferPersonalized,
}: RequestPurchase) =>
  Platform.select({
    ios: async () => {
      if (andDangerouslyFinishTransactionAutomaticallyIOS) {
        console.warn(
          'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set `andDangerouslyFinishTransactionAutomaticallyIOS` to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user.',
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
        skus?.length ? skus : [sku],
        null,
        -1,
        obfuscatedAccountIdAndroid,
        obfuscatedProfileIdAndroid,
        undefined,
        isOfferPersonalized ?? false,
      ),
    default: Promise.resolve,
  })();

/**
 * Request a purchase for a subscription.
 *
 * The response will be received through the `PurchaseUpdatedListener`.
 *
 * @note
 * `andDangerouslyFinishTransactionAutomatically` defaults to false. We recommend
 * always keeping at false, and verifying the transaction receipts on the server-side.
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

  /**
   * Android Billing V5
   */
  subscriptionOffers,

  /**
   * Android Billing V5
   */
  isOfferPersonalized,
}: RequestSubscription) =>
  Platform.select({
    ios: async () => {
      if (andDangerouslyFinishTransactionAutomaticallyIOS) {
        console.warn(
          'You are dangerously allowing react-native-iap to finish your transaction automatically. You should set `andDangerouslyFinishTransactionAutomaticallyIOS` to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user.',
        );
      }

      return await IosModule.buyProduct(
        sku,
        andDangerouslyFinishTransactionAutomaticallyIOS,
        applicationUsername,
      );
    },
    android: async () => {
      if (AmazonModule) {
        return await AmazonModule.buyItemByType(sku);
      }

      if (!subscriptionOffers?.length) {
        return Promise.reject(
          'subscriptionOffers are required for Google Play Subscriptions',
        );
      }

      return await AndroidModule.buyItemByType(
        ProductType.subs,
        subscriptionOffers?.map((so) => so.sku),
        purchaseTokenAndroid,
        prorationModeAndroid,
        obfuscatedAccountIdAndroid,
        obfuscatedProfileIdAndroid,
        subscriptionOffers?.map((so) => so.offerToken),
        isOfferPersonalized ?? false,
      );
    },
    default: Promise.resolve,
  })();

/**
 * Finish a payment transaction.
 *
 * iOS:
 * Tells StoreKit that you have delivered the purchase to the user and StoreKit can now
 * let go of the transaction. Call this after you have persisted the purchased state to
 * your server or local data in your app. `react-native-iap` will continue to deliver
 * the purchase updated events with the successful purchase until you finish the
 * transaction. **Even after the app has relaunched.**
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

import type {
  AmazonModuleProps,
  AndroidModuleProps,
  IosModuleProps,
  ProductPurchaseAmazon,
  ProductPurchaseAndroid,
  ProductPurchaseIos,
  RequestPurchaseAndroid,
  RequestPurchaseIOS,
  RequestSubscriptionAndroid,
  SubscriptionAndroid,
  SubscriptionIOS,
} from './modules';

/** Sku is a string that uniquely identifies a product/subscription */
export type Sku = string;

/** Token for Android purchases (Play Store and Amazon) */
export type PurchaseToken = string | null | undefined;

export enum ProductType {
  /** Subscription */
  subs = 'subs',

  /** Subscription */
  sub = 'sub',

  /** Consumable */
  inapp = 'inapp',

  /** Consumable */
  iap = 'iap',
}

/**
 * Common interface for all native modules (iOS — AppStore, Android — PlayStore and Amazon).
 */
export interface NativeModuleProps {
  /** Required method to start a payment provider connection */
  initConnection(): Promise<boolean>;

  /** Required method to end the payment provider connection */
  endConnection(): Promise<boolean>;

  /** addListener for NativeEventEmitter */
  addListener(eventType: string): void;

  /** removeListeners for NativeEventEmitter */
  removeListeners(count: number): void;
}

/**
 * Product or subscription item payload.
 */
export interface ProductCommon {
  type: ProductType;
  productId: string;
  productIds?: string[];
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
  countryCode?: string;
}

/**
 * Android V5
 */

export interface ProductProduct extends ProductCommon {
  type: ProductType.inapp | ProductType.iap;
}

/** Union type for products (consumable, non-consumable) and subscriptions */
export type Product = ProductProduct | SubscriptionProduct;

/** Union type for subscriptions */
export type SubscriptionProduct = SubscriptionAndroid & SubscriptionIOS;

/** Interface when purchasing a product */
export interface RequestPurchaseCommon {
  sku: Sku;
}

export type RequestPurchase = RequestPurchaseCommon &
  RequestPurchaseAndroid &
  RequestPurchaseIOS;

/** Interface when purchasing a subscription */
export type RequestSubscription = RequestPurchase & RequestSubscriptionAndroid;

/**
 * Product or subscription purchase response payload.
 */

export interface ProductPurchaseCommon {
  productId: string;
  transactionId?: string;
  transactionDate: number;
  transactionReceipt: string;
  purchaseToken?: string;
}

export type ProductPurchase = ProductPurchaseCommon &
  ProductPurchaseIos &
  ProductPurchaseAndroid &
  ProductPurchaseAmazon;

export interface SubscriptionPurchase extends ProductPurchase {
  autoRenewingAndroid?: boolean;
  originalTransactionDateIOS?: string;
  originalTransactionIdentifierIOS?: string;
}

/** Union type for products (consumable, non-consumable) and subscriptions purchases responses */
export type Purchase = ProductPurchase | SubscriptionPurchase;

declare module 'react-native' {
  interface NativeModulesStatic {
    RNIapIos: IosModuleProps;
    RNIapModule: AndroidModuleProps;
    RNIapAmazonModule: AmazonModuleProps;
  }
}

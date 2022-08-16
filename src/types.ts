import type {
  AmazonModuleProps,
  AndroidModuleProps,
  IosModuleProps,
  ProductAndroid,
  ProductAndroidResponse,
  ProductPurchaseAmazon,
  ProductPurchaseAndroid,
  ProductPurchaseIOS,
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

/* Common properties shared between native modules when getting a product or a subscription response. */

interface ProductCommon {
  productId: string;
  productIds?: string[];
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
  countryCode?: string;
}

type ProductCommonResponse = ProductCommon & {
  type: ProductType.inapp | ProductType.iap;
};

/**
 * Union of common types for a product response and specific props
 * for each native platforms defined in their respective modules.
 */
export type ProductResponse = ProductCommonResponse & ProductAndroidResponse;

type SubscriptionCommonResponse = ProductCommon & {
  type: ProductType.sub | ProductType.subs;
};

/**
 * Union of common types for a subscription response and specific props for each native platforms
 */
export type SubscriptionResponse = SubscriptionCommonResponse &
  SubscriptionAndroid &
  SubscriptionIOS;

/** Union type for products (consumable, non-consumable) and subscriptions */
export type ProductOrSubscriptionResponse =
  | ProductResponse
  | SubscriptionResponse;

// TODO
export interface RequestPurchaseCommon {
  sku: Sku;
}

// export type RequestPurchase = RequestPurchaseCommon &
//   RequestPurchaseAndroid &
//   RequestPurchaseIOS;

export type RequestPurchase = RequestPurchaseAndroid & RequestPurchaseIOS;

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

export type ProductPurchaseResponse = ProductPurchaseCommon &
  ProductPurchaseAndroid &
  ProductPurchaseAmazon &
  ProductPurchaseIOS;

type SubscriptionPurchase = ProductPurchaseCommon;

export interface SubscriptionPurchaseAndroid {
  autoRenewingAndroid?: boolean;
}

export interface SubscriptionPurchaseIOS {
  originalTransactionDateIOS?: string;
  originalTransactionIdentifierIOS?: string;
}

export type SubscriptionPurchaseResponse = SubscriptionPurchase &
  SubscriptionPurchaseAndroid &
  SubscriptionPurchaseIOS;

/** Union type for products (consumable, non-consumable) and subscriptions purchases responses */
export type ProductOrSubscriptionPurchaseResponse =
  | ProductPurchaseResponse
  | SubscriptionPurchaseResponse;

declare module 'react-native' {
  interface NativeModulesStatic {
    RNIapIos: IosModuleProps;
    RNIapModule: AndroidModuleProps;
    RNIapAmazonModule: AmazonModuleProps;
  }
}

import type {
  IosModuleProps,
  AndroidModuleProps,
  AmazonModuleProps,
  BuyItemByType,
  BuyProduct,
  UserDataAmazon,
} from '../modules';

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

enum PaymentMethodIOS {
  'FREETRIAL' = 'FREETRIAL',
  'PAYASYOUGO' = 'PAYASYOUGO',
  'PAYUPFRONT' = 'PAYUPFRONT',
}

enum PeriodUnitIOS {
  'DAY' = 'DAY',
  'WEEK' = 'WEEK',
  'MONTH' = 'MONTH',
  'YEAR' = 'YEAR',
}

export enum PurchaseStateAndroid {
  UNSPECIFIED_STATE = 0,
  PURCHASED = 1,
  PENDING = 2,
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
export interface Discount {
  identifier: string;
  type: string;
  numberOfPeriods: string;
  price: string;
  localizedPrice: string;
  paymentMode: PaymentMethodIOS | '';
  subscriptionPeriod: string;
}

export interface ProductCommon {
  type: ProductType;
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
  countryCode?: string;
}

export interface ProductProduct extends ProductCommon {
  type: ProductType.inapp | ProductType.iap;
}

export interface SubscriptionProduct extends ProductCommon {
  type: ProductType.subs | ProductType.sub;
  discounts?: Discount[];
  introductoryPrice?: string;
  introductoryPriceAsAmountIOS?: string;
  introductoryPricePaymentModeIOS?: PaymentMethodIOS | '';
  introductoryPriceNumberOfPeriodsIOS?: string;
  introductoryPriceSubscriptionPeriodIOS?: PeriodUnitIOS | '';
  subscriptionPeriodNumberIOS?: string;
  subscriptionPeriodUnitIOS?: PeriodUnitIOS | '';
  introductoryPriceAsAmountAndroid: string;
  introductoryPriceCyclesAndroid?: string;
  introductoryPricePeriodAndroid?: string;
  subscriptionPeriodAndroid?: string;
  freeTrialPeriodAndroid?: string;
}

/** Union type for products (consumable, non-consumable) and subscriptions */
export type Product = ProductProduct | SubscriptionProduct;

/** Interface when purchasing a product */
export interface RequestPurchase {
  sku: Sku;
  andDangerouslyFinishTransactionAutomaticallyIOS?: Parameters<BuyProduct>[1];
  applicationUsername?: Parameters<BuyProduct>[2];
  obfuscatedAccountIdAndroid?: Parameters<BuyItemByType>[4];
  obfuscatedProfileIdAndroid?: Parameters<BuyItemByType>[5];
}

/** Interface when purchasing a subscription */
export interface RequestSubscription extends RequestPurchase {
  purchaseTokenAndroid?: Parameters<BuyItemByType>[2];
  prorationModeAndroid?: Parameters<BuyItemByType>[3];
}

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

interface ProductPurchaseIos {
  quantityIOS?: number;
  originalTransactionDateIOS?: string;
  originalTransactionIdentifierIOS?: string;
}

interface ProductPurchaseAndroid {
  dataAndroid?: string;
  signatureAndroid?: string;
  autoRenewingAndroid?: boolean;
  purchaseStateAndroid?: PurchaseStateAndroid;
  isAcknowledgedAndroid?: boolean;
  packageNameAndroid?: string;
  developerPayloadAndroid?: string;
  obfuscatedAccountIdAndroid?: string;
  obfuscatedProfileIdAndroid?: string;
}

interface ProductPurchaseAmazon extends UserDataAmazon {
  isCanceledAmazon?: boolean;
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

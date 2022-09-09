import type {
  AmazonModuleProps,
  AndroidModuleProps,
  IosModuleProps,
} from '../modules';

export type Sku = string;

export enum ProrationModesAndroid {
  IMMEDIATE_WITH_TIME_PRORATION = 1,
  IMMEDIATE_AND_CHARGE_PRORATED_PRICE = 2,
  IMMEDIATE_WITHOUT_PRORATION = 3,
  DEFERRED = 4,
  IMMEDIATE_AND_CHARGE_FULL_PRICE = 5,
  UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY = 0,
}

export enum PurchaseStateAndroid {
  UNSPECIFIED_STATE = 0,
  PURCHASED = 1,
  PENDING = 2,
}

export const PROMOTED_PRODUCT = 'iap-promoted-product';

export enum InstallSourceAndroid {
  NOT_SET = 0,
  GOOGLE_PLAY = 1,
  AMAZON = 2,
}

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

export interface ProductCommon {
  type: 'subs' | 'sub' | 'inapp' | 'iap';
  productId: string;
  productIds?: string[];
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
  countryCode?: string;
}

export interface ProductPurchase {
  productId: string;
  transactionId?: string;
  transactionDate: number;
  transactionReceipt: string;
  purchaseToken?: string;
  //iOS
  quantityIOS?: number;
  originalTransactionDateIOS?: string;
  originalTransactionIdentifierIOS?: string;
  //Android
  productIds?: string[];
  dataAndroid?: string;
  signatureAndroid?: string;
  autoRenewingAndroid?: boolean;
  purchaseStateAndroid?: PurchaseStateAndroid;
  isAcknowledgedAndroid?: boolean;
  packageNameAndroid?: string;
  developerPayloadAndroid?: string;
  obfuscatedAccountIdAndroid?: string;
  obfuscatedProfileIdAndroid?: string;
  //Amazon
  userIdAmazon?: string;
  userMarketplaceAmazon?: string;
  userJsonAmazon?: string;
  isCanceledAmazon?: boolean;
}

export interface PurchaseResult {
  responseCode?: number;
  debugMessage?: string;
  code?: string;
  message?: string;
  purchaseToken?: string;
}

export interface SubscriptionPurchase extends ProductPurchase {
  autoRenewingAndroid?: boolean;
  originalTransactionDateIOS?: string;
  originalTransactionIdentifierIOS?: string;
}

export type Purchase = ProductPurchase | SubscriptionPurchase;

export interface Discount {
  identifier: string;
  type: string;
  numberOfPeriods: string;
  price: string;
  localizedPrice: string;
  paymentMode: '' | 'FREETRIAL' | 'PAYASYOUGO' | 'PAYUPFRONT';
  subscriptionPeriod: string;
}
/**
 * A product can either be a consumable or a non-consumable product.
 */
export interface Product extends ProductCommon {
  type: 'inapp' | 'iap';
  // Android V5
  oneTimePurchaseOfferDetails?: {
    priceCurrencyCode: string;
    formattedPrice: string;
    priceAmountMicros: string;
  };
}

// Android V5
export interface SubscriptionAndroid extends ProductCommon {
  type: 'subs';

  productType?: string;
  name?: string;
  subscriptionOfferDetails?: {
    offerToken: string;
    pricingPhases: {
      pricingPhaseList: {
        formattedPrice: string;
        priceCurrencyCode: string;
        /**
         * P1W, P1M, P1Y
         */
        billingPeriod: string;
        billingCycleCount: number;
        priceAmountMicros: string;
        recurrenceMode: number;
      }[];
    };
  }[];
}

export interface SubscriptionIOS extends ProductCommon {
  type: 'subs';

  discounts?: Discount[];
  introductoryPrice?: string;
  introductoryPriceAsAmountIOS?: string;
  introductoryPricePaymentModeIOS?:
    | ''
    | 'FREETRIAL'
    | 'PAYASYOUGO'
    | 'PAYUPFRONT';
  introductoryPriceNumberOfPeriodsIOS?: string;
  introductoryPriceSubscriptionPeriodIOS?:
    | 'DAY'
    | 'WEEK'
    | 'MONTH'
    | 'YEAR'
    | '';

  subscriptionPeriodNumberIOS?: string;
  subscriptionPeriodUnitIOS?: '' | 'YEAR' | 'MONTH' | 'WEEK' | 'DAY';
}

/**
 * A subscription is a product that can be renewed multiple times.
 */
export type Subscription = SubscriptionAndroid & SubscriptionIOS;

/**
 * In order to purchase a new subscription, every sku must have a selected offerToken
 * @see SubscriptionAndroid.subscriptionOfferDetails.offerToken
 */
export interface SubscriptionOffer {
  sku: Sku;
  offerToken: string;
}

declare module 'react-native' {
  interface NativeModulesStatic {
    RNIapIos: IosModuleProps;
    RNIapModule: AndroidModuleProps;
    RNIapAmazonModule: AmazonModuleProps;
  }
}

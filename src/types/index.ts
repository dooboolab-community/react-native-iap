export enum IAPErrorCode {
  E_IAP_NOT_AVAILABLE = 'E_IAP_NOT_AVAILABLE',
  E_UNKNOWN = 'E_UNKNOWN',
  E_USER_CANCELLED = 'E_USER_CANCELLED',
  E_USER_ERROR = 'E_USER_ERROR',
  E_ITEM_UNAVAILABLE = 'E_ITEM_UNAVAILABLE',
  E_REMOTE_ERROR = 'E_REMOTE_ERROR',
  E_NETWORK_ERROR = 'E_NETWORK_ERROR',
  E_SERVICE_ERROR = 'E_SERVICE_ERROR',
  E_RECEIPT_FAILED = 'E_RECEIPT_FAILED',
  E_RECEIPT_FINISHED_FAILED = 'E_RECEIPT_FINISHED_FAILED',
  E_NOT_PREPARED = 'E_NOT_PREPARED',
  E_NOT_ENDED = 'E_NOT_ENDED',
  E_ALREADY_OWNED = 'E_ALREADY_OWNED',
  E_DEVELOPER_ERROR = 'E_DEVELOPER_ERROR',
  E_BILLING_RESPONSE_JSON_PARSE_ERROR = 'E_BILLING_RESPONSE_JSON_PARSE_ERROR',
  E_DEFERRED_PAYMENT = 'E_DEFERRED_PAYMENT',
}

export enum ProrationModesAndroid {
  IMMEDIATE_WITH_TIME_PRORATION = 1,
  IMMEDIATE_AND_CHARGE_PRORATED_PRICE = 2,
  IMMEDIATE_WITHOUT_PRORATION = 3,
  DEFERRED = 4,
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

export interface ProductCommon {
  type: 'subs' | 'sub' | 'inapp' | 'iap';
  productId: string;
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
}

export interface PurchaseError {
  responseCode?: number;
  debugMessage?: string;
  code?: string;
  message?: string;
  productId?: string;
}

export type InAppPurchase = ProductPurchase;

export interface SubscriptionPurchase extends ProductPurchase {
  autoRenewingAndroid?: boolean;
  originalTransactionDateIOS?: string;
  originalTransactionIdentifierIOS?: string;
}

export type Purchase = InAppPurchase | SubscriptionPurchase;

export interface Discount {
  identifier: string;
  type: string;
  numberOfPeriods: string;
  price: string;
  localizedPrice: string;
  paymentMode: '' | 'FREETRIAL' | 'PAYASYOUGO' | 'PAYUPFRONT';
  subscriptionPeriod: string;
}

export interface Product extends ProductCommon {
  type: 'inapp' | 'iap';
}

export interface Subscription extends ProductCommon {
  type: 'subs' | 'sub';

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

  introductoryPriceAsAmountAndroid: string;
  introductoryPriceCyclesAndroid?: string;
  introductoryPricePeriodAndroid?: string;
  subscriptionPeriodAndroid?: string;
  freeTrialPeriodAndroid?: string;
}

export interface RequestPurchase {
  sku: string;
  andDangerouslyFinishTransactionAutomaticallyIOS: boolean;
  applicationUsername?: string;
  obfuscatedAccountIdAndroid: string | undefined;
  obfuscatedProfileIdAndroid: string | undefined;
  selectedOfferIndex: number;
}

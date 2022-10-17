import type {PurchaseError} from '../purchaseError';

import type {
  ProductIOS,
  Purchase,
  SubscriptionIOS,
  SubscriptionIosPeriod,
} from '.';
import type * as Apple from './apple';
import {SubscriptionPlatform} from '.';

export type SubscriptionPeriod = {
  unit: 'day' | 'week' | 'month' | 'year';
  value: number;
};

export type PaymentMode = 'freeTrial' | 'payAsYouGo' | 'payUpFront';

export type SubscriptionOffer = {
  displayPrice: string;
  id: string;
  paymentMode: PaymentMode;
  period: SubscriptionPeriod;
  periodCount: number;
  price: number;
  type: 'introductory' | 'promotional';
};

export type SubscriptionInfo = {
  introductoryOffer?: SubscriptionOffer;
  promotionalOffers?: SubscriptionOffer[];
  subscriptionGroupID: string;
  subscriptionPeriod: SubscriptionPeriod;
};

export type RefundRequestStatus = 'success' | 'userCancelled';

export type ProductSk2 = {
  description: string;
  displayName: string;
  displayPrice: string;
  id: number;
  isFamilyShareable: boolean;
  jsonRepresentation: string;
  price: number;
  subscription: SubscriptionInfo;
  type: 'autoRenewable' | 'consumable' | 'nonConsumable' | 'nonRenewable';
};
export const productSk2Map = ({
  id,
  description,
  displayName,
  price,
  displayPrice,
}: ProductSk2): ProductIOS => {
  const prod: ProductIOS = {
    title: displayName,
    productId: String(id),
    description,
    type: 'iap',
    price: String(price),
    localizedPrice: displayPrice,
    currency: '', // Not avaiable on new API, use localizedPrice instead
  };
  return prod;
};

export const subscriptionSk2Map = ({
  id,
  description,
  displayName,
  price,
  displayPrice,
  subscription,
}: ProductSk2): SubscriptionIOS => {
  const prod: SubscriptionIOS = {
    platform: SubscriptionPlatform.ios,
    title: displayName,
    productId: String(id),
    description,
    type: 'subs',
    price: String(price),
    localizedPrice: displayPrice,
    currency: '', // Not avaiable on new API, use localizedPrice instead
    subscriptionPeriodNumberIOS: `${subscription?.subscriptionPeriod?.value}`,
    subscriptionPeriodUnitIOS:
      subscription?.subscriptionPeriod?.unit.toUpperCase() as SubscriptionIosPeriod,
  };
  return prod;
};

export type TransactionSk2 = {
  appAccountToken: string;
  appBundleID: string;
  debugDescription: string;
  deviceVerification: string;
  deviceVerificationNonce: string;
  expirationDate: number;
  id: number;
  isUpgraded: boolean;
  jsonRepresentation: string;
  offerID: string;
  offerType: string;
  originalID: string;
  originalPurchaseDate: number;
  ownershipType: string;
  productID: string;
  productType: string;
  purchaseDate: number;
  purchasedQuantity: number;
  revocationDate: number;
  revocationReason: string;
  signedDate: number;
  subscriptionGroupID: number;
  webOrderLineItemID: number;
};

export type TransactionError = PurchaseError;

/**
 * Only one of `transaction` and `error` is not undefined at the time
 */
export type TransactionEvent = {
  transaction?: TransactionSk2;
  error?: TransactionError;
};

export type SubscriptionStatus =
  | 'expired'
  | 'inBillingRetryPeriod'
  | 'inGracePeriod'
  | 'revoked'
  | 'subscribed';

export type ProductStatus = {
  state: SubscriptionStatus;
};

export const transactionSk2Map = ({
  id,
  originalPurchaseDate,
  productID,
  purchaseDate,
  purchasedQuantity,
}: TransactionSk2): Purchase => {
  const purchase: Purchase = {
    productId: productID,
    transactionId: String(id),
    transactionDate: purchaseDate, //??
    transactionReceipt: '', // Not available
    purchaseToken: '', //Not avaiable
    quantityIOS: purchasedQuantity,
    originalTransactionDateIOS: String(originalPurchaseDate),
    originalTransactionIdentifierIOS: String(id), // ??
  };
  return purchase;
};

/**
 * Payment discount interface @see https://developer.apple.com/documentation/storekit/skpaymentdiscount?language=objc
 */
export interface PaymentDiscountSk2 {
  /**
   * A string used to uniquely identify a discount offer for a product.
   */
  offerID: string;

  /**
   * A string that identifies the key used to generate the signature.
   */
  keyID: string;

  /**
   * A universally unique ID (UUID) value that you define.
   */
  nonce: string;

  /**
   * A UTF-8 string representing the properties of a specific discount offer, cryptographically signed.
   */
  signature: string;

  /**
   * The date and time of the signature's creation in milliseconds, formatted in Unix epoch time.
   */
  timestamp: number;
}

export const offerSk2Map = (
  offer: Apple.PaymentDiscount | undefined,
): Record<keyof PaymentDiscountSk2, string> | undefined => {
  if (!offer) {
    return undefined;
  }
  return {
    offerID: offer.identifier,
    keyID: offer.keyIdentifier,
    nonce: offer.nonce,
    signature: offer.signature,
    timestamp: offer.timestamp.toString(),
  };
};

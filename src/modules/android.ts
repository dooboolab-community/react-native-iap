import {Linking, NativeModules} from 'react-native';
import type {
  ProductPurchase,
  SubscriptionPurchase,
} from '@jeremybarbet/google-api-types';

import {enhancedFetch, errorProxy, isAndroid, linkingError} from '../internal';
import type {
  NativeModuleProps,
  ProductType,
  PurchaseToken,
  Sku,
} from '../types';

export enum ProrationModesAndroid {
  UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY = 0,
  IMMEDIATE_WITH_TIME_PRORATION = 1,
  IMMEDIATE_AND_CHARGE_PRORATED_PRICE = 2,
  IMMEDIATE_WITHOUT_PRORATION = 3,
  DEFERRED = 4,
}

export enum PurchaseStateAndroid {
  UNSPECIFIED_STATE = 0,
  PURCHASED = 1,
  PENDING = 2,
}

/* Product response, specific props for Android */

interface OneTimePurchaseOfferDetails {
  priceCurrencyCode: string;
  formattedPrice: string;
  priceAmountMicros: string;
}

export interface ProductAndroidResponse {
  oneTimePurchaseOfferDetails?: OneTimePurchaseOfferDetails;
}

/* Subscription response, specific props for Android */

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

export interface PurchaseResult {
  responseCode?: number;
  debugMessage?: string;
  code?: string;
  message?: string;
}

interface PricingPhaseList {
  formattedPrice: string;
  priceCurrencyCode: string;
  /** P1W, P1M, P1Y */
  billingPeriod: string;
  billingCycleCount: number;
  priceAmountMicros: string;
  recurrenceMode: number;
}

interface SubscriptionOfferDetails {
  offerToken: string;
  pricingPhases: {
    pricingPhaseList: PricingPhaseList[];
  };
}

export interface SubscriptionAndroid {
  productType?: string;
  name?: string;
  subscriptionOfferDetails?: SubscriptionOfferDetails[];
}

/**
 * Google Play Billing Library 5
 * In order to purchase a new subscription, every sku must have a selected offerToken
 * See {@link SubscriptionAndroid.subscriptionOfferDetails.offerToken}
 */
export interface SubscriptionOffer {
  sku: Sku;
  offerToken: string;
}

export interface ProductPurchaseAndroid {
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
}

export interface RequestPurchaseBaseAndroid {
  obfuscatedAccountIdAndroid?: string;
  obfuscatedProfileIdAndroid?: string;

  /** For Google Play Billing Library 5 @see {@link https://developer.android.com/google/play/billing/integrate#personalized-price} */
  isOfferPersonalized?: boolean;
}

/** Interface for the Android arguments for the `requestPurchase` method (defined in `./common.ts`) */
export interface RequestPurchaseAndroid extends RequestPurchaseBaseAndroid {
  skus?: Sku[];
}

export interface RequestSubscriptionAndroid {
  purchaseTokenAndroid?: PurchaseToken;
  prorationModeAndroid?: ProrationModesAndroid;
  subscriptionOffers?: SubscriptionOffer[];
}

// Below describes the native methods arguments and responses interfaces and types

type FlushFailedPurchasesCachedAsPending = () => Promise<void>;

type GetItemsByType = <T = Product>(
  type: ProductType,
  skus: Sku[],
) => Promise<T[]>;

type GetAvailableItemsByType = <T = Purchase>(
  type: ProductType,
) => Promise<T[]>;

type GetPurchaseHistoryByType = <T = Purchase>(
  type: ProductType,
) => Promise<T[]>;

interface BuyItemByTypeOptionsAndroid {
  type: string;
  sku: Sku;
  purchaseToken: PurchaseToken;
  prorationMode: ProrationModesAndroid;
  obfuscatedAccountId?: string;
  obfuscatedProfileId?: string;
}

export type BuyItemByType = ({
  type,
  sku,
}: BuyItemByTypeOptionsAndroid) => Promise<void>;

type AcknowledgePurchase = (
  purchaseToken: PurchaseToken,
  developerPayloadAndroid?: string,
) => Promise<PurchaseResult | void>;

type ConsumeProduct = (
  purchaseToken: PurchaseToken,
  developerPayloadAndroid?: string,
) => Promise<string | void>;

type StartListening = () => Promise<void>;
type GetPackageName = () => Promise<string>;

export interface AndroidModuleProps extends NativeModuleProps {
  flushFailedPurchasesCachedAsPending: FlushFailedPurchasesCachedAsPending;
  getItemsByType: GetItemsByType;
  getAvailableItemsByType: GetAvailableItemsByType;
  getPurchaseHistoryByType: GetPurchaseHistoryByType;
  buyItemByType: BuyItemByType;
  acknowledgePurchase: AcknowledgePurchase;
  consumeProduct: ConsumeProduct;
  startListening: StartListening;
  getPackageName: GetPackageName;
}

export const AndroidModule = (
  !isAndroid
    ? {}
    : !NativeModules.RNIapModule && !NativeModules.RNIapAmazonModule
    ? errorProxy(linkingError)
    : NativeModules.RNIapAmazonModule ?? NativeModules.RNIapModule
) as AndroidModuleProps;

/**
 * Consume all 'ghost' purchases.
 *
 * That is, pending payment that already failed but is still marked as pending in Play Store cache
 *
 * @platform Android
 */
export const flushFailedPurchasesCachedAsPendingAndroid = () =>
  AndroidModule.flushFailedPurchasesCachedAsPending();

export interface AcknowledgePurchaseAndroidParams {
  /** The product's token */
  token: string;

  /** Android developerPayload */
  developerPayload?: string;
}

/**
 * Acknowledge a product.
 *
 * @platform Android
 */
export const acknowledgePurchaseAndroid = ({
  token,
  developerPayload,
}: AcknowledgePurchaseAndroidParams) => {
  return AndroidModule.acknowledgePurchase(token, developerPayload);
};

export interface DeepLinkToSubscriptionsAndroidParams {
  /** The product's SKU */
  sku: Sku;
}

/**
 * Deep link to subscriptions screen.
 *
 * @platform Android
 */
export const deepLinkToSubscriptionsAndroid = async ({
  sku,
}: DeepLinkToSubscriptionsAndroidParams) =>
  Linking.openURL(
    `https://play.google.com/store/account/subscriptions?package=${await AndroidModule.getPackageName()}&sku=${sku}`,
  );

interface ValidateReceiptAndroidParams {
  /** package name of your app. */
  packageName: string;

  /** product id for your in app product. */
  productId: string;

  /** token for your purchase. */
  productToken: string;

  /** accessToken from googleApis. */
  accessToken: string;

  /** whether this is a subscription or in-app product. `true` for subscription. */
  isSub?: boolean;
}

/**
 * Validate receipt.
 *
 * @note
 * This method is here for debugging purposes only. Including your
 * access token in the binary you ship to users is potentially dangerous.
 * Use server side validation instead for your production builds.
 *
 * @platform Android
 */
export const validateReceiptAndroid = async ({
  packageName,
  productId,
  productToken,
  accessToken,
  isSub,
}: ValidateReceiptAndroidParams) => {
  const type = isSub ? 'subscriptions' : 'products';

  const url =
    'https://androidpublisher.googleapis.com/androidpublisher/v3/applications' +
    `/${packageName}/purchases/${type}/${productId}` +
    `/tokens/${productToken}?access_token=${accessToken}`;

  return await enhancedFetch<ProductPurchase | SubscriptionPurchase>(url);
};

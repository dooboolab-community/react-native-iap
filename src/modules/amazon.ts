import {NativeModules} from 'react-native';

import {enhancedFetch, errorProxy, isAndroid, linkingError} from '../internal';
import type {
  NativeModuleProps,
  Product,
  Purchase,
  PurchaseToken,
  Sku,
} from '../types';

/**
 * @see {@link https://developer.amazon.com/es/docs/in-app-purchasing/iap-rvs-examples.html}
 **/
interface ReceiptTypeAmazon {
  autoRenewing: boolean;
  betaProduct: boolean;
  cancelDate: number | null;
  cancelReason: string;
  deferredDate: number | null;
  deferredSku: number | null;
  freeTrialEndDate: number;
  gracePeriodEndDate: number;
  parentProductId: string;
  productId: string;
  productType: string;
  purchaseDate: number;
  quantity: number;
  receiptId: string;
  renewalDate: number;
  term: string;
  termSku: Sku;
  testTransaction: boolean;
}

export interface UserDataAmazon {
  userIdAmazon?: string;
  userMarketplaceAmazon?: string;
  userJsonAmazon?: string;
}

export interface ProductPurchaseAmazon extends UserDataAmazon {
  isCanceledAmazon?: boolean;
}

// ----------

type GetUser = () => Promise<UserDataAmazon>;
type FlushFailedPurchasesCachedAsPending = () => Promise<void>;
type GetItemsByType = (type: string, skus: Sku[]) => Promise<Product[]>;
type GetAvailableItems = () => Promise<Purchase[]>;
type BuyItemByType = (sku: Sku) => Promise<void>;

type AcknowledgePurchase = (
  purchaseToken: PurchaseToken,
  developerPayloadAndroid?: string,
) => Promise<void>;

type ConsumeProduct = (
  purchaseToken: PurchaseToken,
  developerPayloadAndroid?: string,
) => Promise<void>;

type StartListening = () => Promise<void>;

export interface AmazonModuleProps extends NativeModuleProps {
  getUser: GetUser;
  flushFailedPurchasesCachedAsPending: FlushFailedPurchasesCachedAsPending;
  getItemsByType: GetItemsByType;
  getAvailableItems: GetAvailableItems;
  buyItemByType: BuyItemByType;
  acknowledgePurchase: AcknowledgePurchase;
  consumeProduct: ConsumeProduct;
  startListening: StartListening;
}

export const AmazonModule = (
  !isAndroid
    ? {}
    : !NativeModules.RNIapModule && !NativeModules.RNIapAmazonModule
    ? errorProxy(linkingError)
    : NativeModules.RNIapAmazonModule
) as AmazonModuleProps;

export interface ValidateReceiptAmazonParams {
  /** From the Amazon developer console */
  developerSecret: string;

  /** Who purchased the item. */
  userId: string;

  /** Long obfuscated string returned when purchasing the item */
  receiptId: string;

  /** Defaults to true, use sandbox environment or production. */
  useSandbox: boolean;
}

/**
 * Validate receipt.
 *
 * @note
 * This method is here for debugging purposes only. Including your
 * developer secret in the binary you ship to users is potentially dangerous.
 * Use server-side validation instead for your production builds.
 *
 * @platform Amazon
 */
export const validateReceiptAmazon = async ({
  developerSecret,
  userId,
  receiptId,
  useSandbox = true,
}: ValidateReceiptAmazonParams) => {
  const sandBoxUrl = useSandbox ? 'sandbox/' : '';
  const url = `https://appstore-sdk.amazon.com/${sandBoxUrl}version/1.0/verifyReceiptId/developer/${developerSecret}/user/${userId}/receiptId/${receiptId}`;

  return await enhancedFetch<ReceiptTypeAmazon>(url);
};

import {NativeModules} from 'react-native';

import {enhancedFetch, errorProxy, isAndroid, linkingError} from '../internal';
import type {
  NativeModuleProps,
  Product,
  Purchase,
  PurchaseToken,
  ReceiptType,
  Sku,
} from '../types';

export interface UserDataAmazon {
  userIdAmazon?: string;
  userMarketplaceAmazon?: string;
  userJsonAmazon?: string;
}

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

  return await enhancedFetch<ReceiptType>(url);
};

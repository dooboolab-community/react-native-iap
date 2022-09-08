import {NativeModules} from 'react-native';

import type {
  Product,
  ProductType,
  ProrationModesAndroid,
  Purchase,
  PurchaseResult,
  Sku,
} from '../types';

import type {NativeModuleProps} from './common';

type FlushFailedPurchasesCachedAsPending = () => Promise<boolean>;

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

export type BuyItemByType = (
  type: string,
  skus: Sku[],
  purchaseToken: string | undefined,
  prorationMode: ProrationModesAndroid,
  obfuscatedAccountId: string | undefined,
  obfuscatedProfileId: string | undefined,
  subscriptionOffers: string[],
  isOfferPersonalized: boolean,
) => Promise<Purchase>;

type AcknowledgePurchase = (
  purchaseToken: string,
  developerPayloadAndroid?: string,
) => Promise<PurchaseResult | boolean>;

type ConsumeProduct = (
  purchaseToken: string,
  developerPayloadAndroid?: string,
) => Promise<PurchaseResult | boolean>;

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

export const AndroidModule = NativeModules.RNIapModule as AndroidModuleProps;

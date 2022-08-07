import {NativeModules} from 'react-native';

import type {
  NativeModuleProps,
  Product,
  ProductType,
  Purchase,
  RequestPurchase,
  Sku,
} from '../types';
import {linkingError} from '../utils/linking-error';

import {AmazonModule} from './amazon';

type PurchaseToken = string | null | undefined;

export enum ProrationModesAndroid {
  UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY = 0,
  IMMEDIATE_WITH_TIME_PRORATION = 1,
  IMMEDIATE_AND_CHARGE_PRORATED_PRICE = 2,
  IMMEDIATE_WITHOUT_PRORATION = 3,
  DEFERRED = 4,
}

export interface PurchaseResult {
  responseCode?: number;
  debugMessage?: string;
  code?: string;
  message?: string;
}

/**
 * Native methods
 */

type FlushFailedPurchasesCachedAsPendingAndroid = () => Promise<void>;

type GetItemsByTypeAndroid = <T = Product>(
  type: ProductType,
  skus: Sku[],
) => Promise<T[]>;

type GetAvailableItemsByTypeAndroid = <T = Purchase>(
  type: ProductType,
) => Promise<T[]>;

type GetPurchaseHistoryByTypeAndroid = <T = Purchase>(
  type: ProductType,
) => Promise<T[]>;

export type BuyItemByTypeAndroid = (
  type: string,
  sku: Sku,
  purchaseToken: PurchaseToken,
  prorationMode: ProrationModesAndroid,
  obfuscatedAccountId?: string,
  obfuscatedProfileId?: string,
) => Promise<RequestPurchase>;

type AcknowledgePurchaseAndroid = (
  purchaseToken: PurchaseToken,
  developerPayloadAndroid?: string,
) => Promise<PurchaseResult | void>;

type ConsumeProductAndroid = (
  purchaseToken: PurchaseToken,
  developerPayloadAndroid?: string,
) => Promise<string | void>;

type StartListeningAndroid = () => Promise<void>;
type GetPackageNameAndroid = () => Promise<string>;

export interface AndroidModuleProps extends NativeModuleProps {
  flushFailedPurchasesCachedAsPending: FlushFailedPurchasesCachedAsPendingAndroid;
  getItemsByType: GetItemsByTypeAndroid;
  getAvailableItemsByType: GetAvailableItemsByTypeAndroid;
  getPurchaseHistoryByType: GetPurchaseHistoryByTypeAndroid;
  buyItemByType: BuyItemByTypeAndroid;
  acknowledgePurchase: AcknowledgePurchaseAndroid;
  consumeProduct: ConsumeProductAndroid;
  startListening: StartListeningAndroid;
  getPackageName: GetPackageNameAndroid;
}

const {RNIapModule} = NativeModules;

export const AndroidModule = (
  RNIapModule ? RNIapModule : AmazonModule ? AmazonModule : linkingError
) as AndroidModuleProps;

import {NativeModules} from 'react-native';

import type {Product, Purchase, Sku} from '../types';
import type {UserDataAmazon} from '../types/amazon';

import type {NativeModuleProps} from './common';

// ----------

type GetUser = () => Promise<UserDataAmazon>;
type FlushFailedPurchasesCachedAsPending = () => Promise<boolean>;
type GetItemsByType = (type: string, skus: Sku[]) => Promise<Product[]>;
type GetAvailableItems = () => Promise<Purchase[]>;
type BuyItemByType = (sku: Sku) => Promise<Purchase>;

type AcknowledgePurchase = (
  purchaseToken: string,
  developerPayloadAndroid?: string,
) => Promise<boolean>;

type ConsumeProduct = (
  purchaseToken: string,
  developerPayloadAndroid?: string,
) => Promise<boolean>;

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

export const AmazonModule =
  NativeModules.RNIapAmazonModule as AmazonModuleProps;

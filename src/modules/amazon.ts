import {NativeModules} from 'react-native';

import type {NativeModuleProps, Product, Purchase, Sku} from '../types';
import {linkingError} from '../utils/linking-error';

export interface UserDataAmazon {
  userIdAmazon?: string;
  userMarketplaceAmazon?: string;
  userJsonAmazon?: string;
}

type GetUserAmazon = () => Promise<UserDataAmazon>;
type FlushFailedPurchasesCachedAsPendingAmazon = () => Promise<void>;
type GetItemsByTypeAmazon = (type: string, skus: Sku[]) => Promise<Product[]>;
type GetAvailableItemsAmazon = () => Promise<Purchase[]>;
type BuyItemByTypeAmazon = () => Promise<void>;
type AcknowledgePurchaseAmazon = () => Promise<void>;
type ConsumeProductAmazon = () => Promise<void>;
type StartListeningAmazon = () => Promise<void>;

export interface AmazonModuleProps extends NativeModuleProps {
  getUser: GetUserAmazon;
  flushFailedPurchasesCachedAsPending: FlushFailedPurchasesCachedAsPendingAmazon;
  getItemsByType: GetItemsByTypeAmazon;
  getAvailableItems: GetAvailableItemsAmazon;
  buyItemByType: BuyItemByTypeAmazon;
  acknowledgePurchase: AcknowledgePurchaseAmazon;
  consumeProduct: ConsumeProductAmazon;
  startListening: StartListeningAmazon;
}

const {RNIapAmazonModule} = NativeModules;

export const AmazonModule = (RNIapAmazonModule ??
  linkingError) as AmazonModuleProps;

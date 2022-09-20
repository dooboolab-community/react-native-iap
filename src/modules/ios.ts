import type {
  Product,
  ProductPurchase,
  Purchase,
  Sku,
  Subscription,
} from '../types';
import type {PaymentDiscount} from '../types/apple';

import type {NativeModuleProps} from './common';

type getItems = (skus: Sku[]) => Promise<Product[] | Subscription[]>;

type getAvailableItems = () => Promise<Purchase[]>;

export type BuyProduct = (
  sku: Sku,
  andDangerouslyFinishTransactionAutomaticallyIOS: boolean,
  applicationUsername?: string,
) => Promise<Purchase>;

type buyProductWithOffer = (
  sku: Sku,
  forUser: string,
  withOffer: Record<keyof PaymentDiscount, string>,
) => Promise<Purchase>;

type buyProductWithQuantity = (
  sku: Sku,
  quantity: number,
) => Promise<ProductPurchase>;
type clearTransaction = () => Promise<void>;
type clearProducts = () => Promise<void>;
type promotedProduct = () => Promise<Product | null>;
type buyPromotedProduct = () => Promise<void>;
type requestReceipt = (refresh: boolean) => Promise<string>;

type finishTransaction = (transactionIdentifier: string) => Promise<boolean>;

type getPendingTransactions = () => Promise<ProductPurchase[]>;
type presentCodeRedemptionSheet = () => Promise<null>;

export interface IosModuleProps extends NativeModuleProps {
  getItems: getItems;
  getAvailableItems: getAvailableItems;
  buyProduct: BuyProduct;
  buyProductWithOffer: buyProductWithOffer;
  buyProductWithQuantityIOS: buyProductWithQuantity;
  clearTransaction: clearTransaction;
  clearProducts: clearProducts;
  promotedProduct: promotedProduct;
  buyPromotedProduct: buyPromotedProduct;
  requestReceipt: requestReceipt;
  finishTransaction: finishTransaction;
  getPendingTransactions: getPendingTransactions;
  presentCodeRedemptionSheet: presentCodeRedemptionSheet;
}

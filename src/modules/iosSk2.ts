import type {Product, ProductPurchase, Purchase, Sku} from '../types';
import type {PaymentDiscountSk2, ProductSk2} from '../types/appleSk2';

import type {NativeModuleProps} from './common';

type getItems = (skus: Sku[]) => Promise<ProductSk2[]>;

type getAvailableItems = () => Promise<Purchase[]>;

export type BuyProduct = (
  sku: Sku,
  andDangerouslyFinishTransactionAutomaticallyIOS: boolean,
  applicationUsername: string | undefined,
  quantity: number,
  withOffer: PaymentDiscountSk2 | undefined,
) => Promise<Purchase>;

type clearTransaction = () => Promise<void>;
type clearProducts = () => Promise<void>;
type promotedProduct = () => Promise<Product | null>;
type buyPromotedProduct = () => Promise<void>;
type requestReceipt = (refresh: boolean) => Promise<string>;

type finishTransaction = (transactionIdentifier: string) => Promise<boolean>;

type getPendingTransactions = () => Promise<ProductPurchase[]>;
type presentCodeRedemptionSheet = () => Promise<null>;

export interface IosModulePropsSk2 extends NativeModuleProps {
  getItems: getItems;
  getAvailableItems: getAvailableItems;
  buyProduct: BuyProduct;
  clearTransaction: clearTransaction;
  clearProducts: clearProducts;
  promotedProduct: promotedProduct;
  buyPromotedProduct: buyPromotedProduct;
  requestReceipt: requestReceipt;
  finishTransaction: finishTransaction;
  getPendingTransactions: getPendingTransactions;
  presentCodeRedemptionSheet: presentCodeRedemptionSheet;
}

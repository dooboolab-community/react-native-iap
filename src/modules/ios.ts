import {NativeModules} from 'react-native';

import type {
  NativeModuleProps,
  Product,
  ProductProduct,
  ProductPurchase,
  Purchase,
  RequestPurchase,
  Sku,
} from '../types';
import type {PaymentDiscount} from '../types/apple';
import {linkingError} from '../utils/linking-error';

type getItemsIos = (skus: Sku[]) => Promise<Product[]>;
type getAvailableItemsIos = () => Promise<Purchase[]>;

export type BuyProductIos = (
  sku: Sku,
  /**
   * You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user.
   * @default false
   **/
  andDangerouslyFinishTransactionAutomaticallyIOS: boolean,
  /** The purchaser's user ID */
  applicationUsername?: string,
) => Promise<RequestPurchase | null>;

type buyProductWithOfferIos = (
  sku: Sku,
  forUser: string,
  withOffer: PaymentDiscount,
) => Promise<void>;

type buyProductWithQuantityIos = (
  sku: Sku,
  quantity: number,
) => Promise<ProductPurchase>;

type clearTransactionIos = () => Promise<void>;
type clearProductsIos = () => Promise<void>;
type promotedProductIos = () => Promise<ProductProduct | null>;
type buyPromotedProductIos = () => Promise<void>;
type requestReceiptIos = (refresh: boolean) => Promise<string>;

type finishTransactionIos = (
  transactionIdentifier: string,
) => Promise<string | void>;

type getPendingTransactionsIos = () => Promise<ProductPurchase[]>;
type presentCodeRedemptionSheetIos = () => Promise<null>;

export interface IosModuleProps extends NativeModuleProps {
  getItems: getItemsIos;
  getAvailableItems: getAvailableItemsIos;
  buyProduct: BuyProductIos;
  buyProductWithOffer: buyProductWithOfferIos;
  buyProductWithQuantity: buyProductWithQuantityIos;
  clearTransaction: clearTransactionIos;
  clearProducts: clearProductsIos;
  promotedProduct: promotedProductIos;
  buyPromotedProduct: buyPromotedProductIos;
  requestReceipt: requestReceiptIos;
  finishTransaction: finishTransactionIos;
  getPendingTransactions: getPendingTransactionsIos;
  presentCodeRedemptionSheet: presentCodeRedemptionSheetIos;
}

const {RNIapIos} = NativeModules;

export const IosModule = (RNIapIos ? RNIapIos : linkingError) as IosModuleProps;

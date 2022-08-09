import {NativeModules} from 'react-native';
import type {ResponseBody} from '@jeremybarbet/apple-api-types';

import {enhancedFetch, errorProxy, isIos, linkingError} from '../internal';
import type {
  NativeModuleProps,
  PaymentDiscount,
  Product,
  ProductProduct,
  ProductPurchase,
  Purchase,
  Sku,
} from '../types';

type getItems = (skus: Sku[]) => Promise<Product[]>;
type getAvailableItems = () => Promise<Purchase[]>;

export type BuyProduct = (
  sku: Sku,
  andDangerouslyFinishTransactionAutomaticallyIOS: boolean,
  applicationUsername?: string,
) => Promise<void>;

type buyProductWithOffer = (
  sku: Sku,
  forUser: string,
  withOffer: PaymentDiscount,
) => Promise<void>;

type buyProductWithQuantity = (
  sku: Sku,
  quantity: number,
) => Promise<ProductPurchase>;

type clearTransaction = () => Promise<void>;
type clearProducts = () => Promise<void>;
type promotedProduct = () => Promise<ProductProduct | null>;
type buyPromotedProduct = () => Promise<void>;
type requestReceipt = (refresh: boolean) => Promise<string>;

type finishTransaction = (
  transactionIdentifier: string,
) => Promise<string | void>;

type getPendingTransactions = () => Promise<ProductPurchase[]>;
type presentCodeRedemptionSheet = () => Promise<null>;

export interface IosModuleProps extends NativeModuleProps {
  getItems: getItems;
  getAvailableItems: getAvailableItems;
  buyProduct: BuyProduct;
  buyProductWithOffer: buyProductWithOffer;
  buyProductWithQuantity: buyProductWithQuantity;
  clearTransaction: clearTransaction;
  clearProducts: clearProducts;
  promotedProduct: promotedProduct;
  buyPromotedProduct: buyPromotedProduct;
  requestReceipt: requestReceipt;
  finishTransaction: finishTransaction;
  getPendingTransactions: getPendingTransactions;
  presentCodeRedemptionSheet: presentCodeRedemptionSheet;
}

const TEST_RECEIPT = 21007;

export const IosModule = (
  !isIos
    ? {}
    : !NativeModules.RNIapIos
    ? errorProxy(linkingError)
    : NativeModules.RNIapIos
) as IosModuleProps;

/**
 * Clear Transaction
 *
 * Finish remaining transactions. Related to issue #257 and #801
 *
 * @platform iOS
 *
 * @see {@link https://github.com/dooboolab/react-native-iap/issues/257}
 * @see {@link https://github.com/dooboolab/react-native-iap/issues/801}
 */
export const clearTransactionIOS = () => IosModule.clearTransaction();

/**
 * Clear valid Products
 *
 * @platform iOS
 *
 * Remove all products which are validated by Apple server.
 */
export const clearProductsIOS = () => IosModule.clearProducts();

/**
 * Should Add Store Payment
 *
 * Indicates the the App Store purchase should continue from the app instead of the App Store.
 *
 * @platform iOS
 */
export const getPromotedProductIOS = () => IosModule.promotedProduct();

/**
 * Request a purchase for product.
 *
 * The response will be received through the `PurchaseUpdatedListener`.
 *
 * @platform iOS
 */
export const requestPurchaseWithQuantityIOS = (
  /** The product's sku/ID */
  sku: Sku,

  /** The quantity to request to buy */
  quantity: number,
) => IosModule.buyProductWithQuantity(sku, quantity);

/**
 * Buy the currently selected promoted product
 *
 * Initiates the payment process for a promoted product. Should only be called in response to the `iap-promoted-product` event.
 *
 * @platform iOS
 */
export const buyPromotedProductIOS = () => IosModule.buyPromotedProduct();

const requestAgnosticReceiptValidationIOS = async (
  receiptBody: Record<string, any>,
) => {
  const response = await enhancedFetch<ResponseBody>(
    'https://buy.itunes.apple.com/verifyReceipt',
    {
      method: 'POST',
      body: receiptBody,
    },
  );

  /**
   * Best practice is to check for test receipt and check sandbox instead
   *
   * @see {@link https://developer.apple.com/documentation/appstorereceipts/verifyreceipt}
   */
  if (response && response.status === TEST_RECEIPT) {
    const testResponse = await enhancedFetch<ResponseBody>(
      'https://sandbox.itunes.apple.com/verifyReceipt',
      {
        method: 'POST',
        body: receiptBody,
      },
    );

    return testResponse;
  }

  return response;
};

/**
 * Validate receipt
 *
 * @platform iOS
 */
export const validateReceiptIOS = async (
  /** The receipt body to send to apple server. */
  receiptBody: Record<string, unknown>,

  /** Whether this is in test environment which is sandbox. */
  isTest?: boolean,
) => {
  if (isTest == null) {
    return await requestAgnosticReceiptValidationIOS(receiptBody);
  }

  const url = isTest
    ? 'https://sandbox.itunes.apple.com/verifyReceipt'
    : 'https://buy.itunes.apple.com/verifyReceipt';

  return await enhancedFetch<ResponseBody>(url, {
    method: 'POST',
    body: receiptBody,
  });
};

/**
 * Buy products or subscriptions with offers
 *
 * Runs the payment process with some info you must fetch
 * from your server.
 *
 * @platform iOS
 */
export const requestPurchaseWithOfferIOS = (
  /** The product identifier */
  sku: Sku,

  /** An user identifier on you system */
  forUser: string,

  /** The offer information */
  withOffer: PaymentDiscount,
) => IosModule.buyProductWithOffer(sku, forUser, withOffer);

/**
 * Get the current receipt encoded in base64.
 *
 * @platform iOS
 */
export const getPendingPurchasesIOS = async () =>
  IosModule.getPendingTransactions();

/**
 * Launches a modal to register the redeem offer code.
 *
 * @platform iOS
 */
export const presentCodeRedemptionSheetIOS = async () =>
  IosModule.presentCodeRedemptionSheet();

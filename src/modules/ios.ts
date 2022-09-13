import type {ResponseBody as ReceiptValidationResponse} from '@jeremybarbet/apple-api-types';

import {enhancedFetch, getIosModule, isIosStorekit2} from '../internal';
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
  applicationUsername: string | undefined,
  quantity: number,
  withOffer: PaymentDiscount | undefined,
) => Promise<Purchase>;

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
  clearTransaction: clearTransaction;
  clearProducts: clearProducts;
  promotedProduct: promotedProduct;
  buyPromotedProduct: buyPromotedProduct;
  requestReceipt: requestReceipt;
  finishTransaction: finishTransaction;
  getPendingTransactions: getPendingTransactions;
  presentCodeRedemptionSheet: presentCodeRedemptionSheet;
}

/**
 * Get the current receipt base64 encoded in IOS.
 * @param {forceRefresh?:boolean}
 * @returns {Promise<ProductPurchase[]>}
 */
export const getPendingPurchasesIOS = async (): Promise<ProductPurchase[]> =>
  getIosModule().getPendingTransactions();

/**
 * Get the current receipt base64 encoded in IOS.
 * @param {forceRefresh?:boolean}
 * @returns {Promise<string>}
 */
export const getReceiptIOS = async ({
  forceRefresh,
}: {
  forceRefresh?: boolean;
}): Promise<string> => getIosModule().requestReceipt(forceRefresh ?? false);

/**
 * Launches a modal to register the redeem offer code in IOS.
 * @returns {Promise<null>}
 */
export const presentCodeRedemptionSheetIOS = async (): Promise<null> =>
  getIosModule().presentCodeRedemptionSheet();

/**
 * Should Add Store Payment (iOS only)
 *   Indicates the the App Store purchase should continue from the app instead of the App Store.
 * @returns {Promise<Product | null>} promoted product
 */
export const getPromotedProductIOS = (): Promise<Product | null> => {
  if (!isIosStorekit2()) {
    return getIosModule().promotedProduct();
  } else {
    return Promise.reject('Only available on SK1');
  }
};

/**
 * Buy the currently selected promoted product (iOS only)
 *   Initiates the payment process for a promoted product. Should only be called in response to the `iap-promoted-product` event.
 * @returns {Promise<void>}
 */
export const buyPromotedProductIOS = (): Promise<void> =>
  getIosModule().buyPromotedProduct();

const TEST_RECEIPT = 21007;
const requestAgnosticReceiptValidationIos = async (
  receiptBody: Record<string, unknown>,
): Promise<ReceiptValidationResponse | false> => {
  const response = await enhancedFetch<ReceiptValidationResponse>(
    'https://buy.itunes.apple.com/verifyReceipt',
    {
      method: 'POST',
      body: receiptBody,
    },
  );

  // Best practice is to check for test receipt and check sandbox instead
  // https://developer.apple.com/documentation/appstorereceipts/verifyreceipt
  if (response && response.status === TEST_RECEIPT) {
    const testResponse = await enhancedFetch<ReceiptValidationResponse>(
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
 * Validate receipt for iOS.
 * @param {object} receiptBody the receipt body to send to apple server.
 * @param {boolean} isTest whether this is in test environment which is sandbox.
 * @returns {Promise<Apple.ReceiptValidationResponse | false>}
 */
export const validateReceiptIos = async ({
  receiptBody,
  isTest,
}: {
  receiptBody: Record<string, unknown>;
  isTest?: boolean;
}): Promise<ReceiptValidationResponse | false> => {
  if (isTest == null) {
    return await requestAgnosticReceiptValidationIos(receiptBody);
  }

  const url = isTest
    ? 'https://sandbox.itunes.apple.com/verifyReceipt'
    : 'https://buy.itunes.apple.com/verifyReceipt';

  return await enhancedFetch<ReceiptValidationResponse>(url);
};

/**
 * Clear Transaction (iOS only)
 *   Finish remaining transactions. Related to issue #257 and #801
 *     link : https://github.com/dooboolab/react-native-iap/issues/257
 *            https://github.com/dooboolab/react-native-iap/issues/801
 * @returns {Promise<void>}
 */
export const clearTransactionIOS = (): Promise<void> =>
  getIosModule().clearTransaction();

/**
 * Clear valid Products (iOS only)
 *   Remove all products which are validated by Apple server.
 * @returns {void}
 */
export const clearProductsIOS = (): Promise<void> =>
  getIosModule().clearProducts();

import {useCallback} from 'react';

import {
  finishTransaction as iapFinishTransaction,
  getAvailablePurchases as iapGetAvailablePurchases,
  getProducts as iapGetProducts,
  getPurchaseHistory as iapGetPurchaseHistory,
  getSubscriptions as iapGetSubscriptions,
} from '../iap';
import type {PurchaseError} from '../purchaseError';
import type {Product, Purchase, Subscription} from '../types';

import {useIAPContext} from './withIAPContext';

type IAP_STATUS = {
  connected: boolean;
  products: Product[];
  promotedProductsIOS: Product[];
  subscriptions: Subscription[];
  purchaseHistory: Purchase[];
  availablePurchases: Purchase[];
  currentPurchase?: Purchase;
  currentPurchaseError?: PurchaseError;
  initConnectionError?: Error;
  finishTransaction: (
    purchase: Purchase,
    isConsumable?: boolean,
    developerPayloadAndroid?: string,
  ) => Promise<string | void>;
  getAvailablePurchases: () => Promise<void>;
  getPurchaseHistory: () => Promise<void>;
  getProducts: (skus: string[]) => Promise<void>;
  getSubscriptions: (skus: string[]) => Promise<void>;
};

export function useIAP(): IAP_STATUS {
  const {
    connected,
    products,
    promotedProductsIOS,
    subscriptions,
    purchaseHistory,
    availablePurchases,
    currentPurchase,
    currentPurchaseError,
    initConnectionError,
    setProducts,
    setSubscriptions,
    setAvailablePurchases,
    setPurchaseHistory,
    setCurrentPurchase,
    setCurrentPurchaseError,
  } = useIAPContext();

  const getProducts = useCallback(
    async (skus: string[]): Promise<void> => {
      setProducts(await iapGetProducts(skus));
    },
    [setProducts],
  );

  const getSubscriptions = useCallback(
    async (skus: string[]): Promise<void> => {
      setSubscriptions(await iapGetSubscriptions(skus));
    },
    [setSubscriptions],
  );

  const getAvailablePurchases = useCallback(async (): Promise<void> => {
    setAvailablePurchases(await iapGetAvailablePurchases());
  }, [setAvailablePurchases]);

  const getPurchaseHistory = useCallback(async (): Promise<void> => {
    setPurchaseHistory(await iapGetPurchaseHistory());
  }, [setPurchaseHistory]);

  const finishTransaction = useCallback(
    async (
      purchase: Purchase,
      isConsumable?: boolean,
      developerPayloadAndroid?: string,
    ): Promise<string | void> => {
      try {
        return await iapFinishTransaction(
          purchase,
          isConsumable,
          developerPayloadAndroid,
        );
      } catch (err) {
        throw err;
      } finally {
        if (purchase.productId === currentPurchase?.productId) {
          setCurrentPurchase(undefined);
        }

        if (purchase.productId === currentPurchaseError?.productId) {
          setCurrentPurchaseError(undefined);
        }
      }
    },
    [
      currentPurchase?.productId,
      currentPurchaseError?.productId,
      setCurrentPurchase,
      setCurrentPurchaseError,
    ],
  );

  return {
    connected,
    products,
    promotedProductsIOS,
    subscriptions,
    purchaseHistory,
    availablePurchases,
    currentPurchase,
    currentPurchaseError,
    initConnectionError,
    finishTransaction,
    getProducts,
    getSubscriptions,
    getAvailablePurchases,
    getPurchaseHistory,
  };
}

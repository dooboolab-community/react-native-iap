import {useCallback} from 'react';

import {useIAPContext} from '../context';
import type {PurchaseResult} from '../modules';
import {
  finishTransaction as iapFinishTransaction,
  getAvailablePurchases as iapGetAvailablePurchases,
  getProducts as iapGetProducts,
  getPurchaseHistory as iapGetPurchaseHistory,
  getSubscriptions as iapGetSubscriptions,
} from '../modules';
import type {PurchaseError} from '../purchaseError';
import type {Product, Purchase, SubscriptionProduct} from '../types';

type IAP_STATUS = {
  connected: boolean;
  products: Product[];
  promotedProductsIOS: Product[];
  subscriptions: SubscriptionProduct[];
  purchaseHistory: Purchase[];
  availablePurchases: Purchase[];
  currentPurchase?: Purchase;
  currentPurchaseError?: PurchaseError;
  initConnectionError?: Error;

  finishTransaction: (
    purchase: Parameters<typeof iapFinishTransaction>[0],
    isConsumable?: Parameters<typeof iapFinishTransaction>[1],
    developerPayloadAndroid?: Parameters<typeof iapFinishTransaction>[2],
  ) => Promise<PurchaseResult | string | void>;

  getAvailablePurchases: () => Promise<void>;
  getPurchaseHistory: () => Promise<void>;
  getProducts: (skus: Parameters<typeof iapGetProducts>[0]) => Promise<void>;

  getSubscriptions: (
    skus: Parameters<typeof iapGetSubscriptions>[0],
  ) => Promise<void>;
};

export const useIAP = (): IAP_STATUS => {
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
    async (skus: Parameters<typeof iapGetProducts>[0]) => {
      setProducts(await iapGetProducts(skus));
    },
    [setProducts],
  );

  const getSubscriptions = useCallback(
    async (skus: Parameters<typeof iapGetSubscriptions>[0]) => {
      setSubscriptions(await iapGetSubscriptions(skus));
    },
    [setSubscriptions],
  );

  const getAvailablePurchases = useCallback(async () => {
    setAvailablePurchases(await iapGetAvailablePurchases());
  }, [setAvailablePurchases]);

  const getPurchaseHistory = useCallback(async () => {
    setPurchaseHistory(await iapGetPurchaseHistory());
  }, [setPurchaseHistory]);

  const finishTransaction = useCallback(
    async (
      purchase: Purchase,
      isConsumable?: boolean,
      developerPayloadAndroid?: string,
    ) => {
      try {
        return await iapFinishTransaction(
          purchase,
          isConsumable,
          developerPayloadAndroid,
        );
      } catch (error) {
        throw error;
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
};

import type {
  Product,
  Purchase,
  PurchaseError,
  Subscription,
} from '../types';
import {
  getPurchaseHistory,
  finishTransaction as iapFinishTransaction,
  getAvailablePurchases as iapGetAvailablePurchases,
  getProducts as iapGetProducts,
  getSubscriptions as iapGetSubscriptions,
} from '../iap';
import {useCallback} from 'react';
import {useIAPContext} from './withIAPContext';

type IAP_STATUS = {
  connected: boolean;
  products: Product[];
  promotedProductsIOS: Product[];
  subscriptions: Subscription[];
  purchaseHistories: Purchase[];
  availablePurchases: Purchase[];
  currentPurchase?: Purchase;
  currentPurchaseError?: PurchaseError;
  finishTransaction: (purchase: Purchase) => Promise<string | void>;
  getAvailablePurchases: () => Promise<void>;
  getPurchaseHistories: () => Promise<void>;
  getProducts: (skus: string[]) => Promise<void>;
  getSubscriptions: (skus: string[]) => Promise<void>;
};

export function useIAP(): IAP_STATUS {
  const {
    connected,
    products,
    promotedProductsIOS,
    subscriptions,
    purchaseHistories,
    availablePurchases,currentPurchase,
    currentPurchaseError,
    setProducts,
    setSubscriptions,
    setAvailablePurchases,
    setPurchaseHistories,
    setCurrentPurchase,
    setCurrentPurchaseError,
  } = useIAPContext();

  const getProducts = useCallback(async (skus: string[]): Promise<void> => {
    setProducts(await iapGetProducts(skus));
  }, []);

  const getSubscriptions = useCallback(
    async (skus: string[]): Promise<void> => {
      setSubscriptions(await iapGetSubscriptions(skus));
    },
    [],
  );

  const getAvailablePurchases = useCallback(async (): Promise<void> => {
    setAvailablePurchases(await iapGetAvailablePurchases());
  }, []);

  const getPurchaseHistories = useCallback(async (): Promise<void> => {
    setPurchaseHistories(await getPurchaseHistory());
  }, []);

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
        throw new Error(err);
      } finally {
        if (purchase.productId === currentPurchase?.productId)
          setCurrentPurchase(undefined);

        if (purchase.productId === currentPurchaseError?.productId)
          setCurrentPurchaseError(undefined);
      }
    },
    [currentPurchase?.productId, currentPurchaseError?.productId],
  );

  return {
    connected,
    products,
    promotedProductsIOS,
    subscriptions,
    purchaseHistories,
    availablePurchases,
    currentPurchase,
    currentPurchaseError,
    finishTransaction,
    getProducts,
    getSubscriptions,
    getAvailablePurchases,
    getPurchaseHistories,
  };
}

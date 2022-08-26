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
  subscriptions: Subscription[];
  purchaseHistory: Purchase[];
  availablePurchases: Purchase[];
  currentPurchase?: Purchase;
  currentPurchaseError?: PurchaseError;
  initConnectionError?: Error;
  finishTransaction: ({
    purchase,
    isConsumable,
    developerPayloadAndroid,
  }: {
    purchase: Purchase;
    isConsumable?: boolean;
    developerPayloadAndroid?: string;
  }) => Promise<string | void>;
  getAvailablePurchases: () => Promise<void>;
  getPurchaseHistory: () => Promise<void>;
  getProducts: ({skus}: {skus: string[]}) => Promise<void>;
  getSubscriptions: ({skus}: {skus: string[]}) => Promise<void>;
  setCurrentPurchase: (currentPurchase: Purchase | undefined) => void;
};

export function useIAP(): IAP_STATUS {
  const {
    connected,
    products,
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
    async ({skus}: {skus: string[]}): Promise<void> => {
      const prods = await iapGetProducts({skus});
      console.log(prods);
      setProducts(prods);
    },
    [setProducts],
  );

  const getSubscriptions = useCallback(
    async ({skus}: {skus: string[]}): Promise<void> => {
      setSubscriptions(await iapGetSubscriptions({skus}));
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
    async ({
      purchase,
      isConsumable,
      developerPayloadAndroid,
    }: {
      purchase: Purchase;
      isConsumable?: boolean;
      developerPayloadAndroid?: string;
    }): Promise<string | void> => {
      try {
        return await iapFinishTransaction({
          purchase,
          isConsumable,
          developerPayloadAndroid,
        });
      } catch (err) {
        throw err;
      } finally {
        if (purchase.id === currentPurchase?.id) {
          setCurrentPurchase(undefined);
        }

        if (purchase.id === currentPurchaseError?.id) {
          setCurrentPurchaseError(undefined);
        }
      }
    },
    [
      currentPurchase?.id,
      currentPurchaseError?.id,
      setCurrentPurchase,
      setCurrentPurchaseError,
    ],
  );

  return {
    connected,
    products,
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
    setCurrentPurchase,
  };
}

import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import type {
  InAppPurchase,
  Product,
  Purchase,
  PurchaseError,
  Subscription,
  SubscriptionPurchase,
} from '../types';
import {
  endConnection,
  getPromotedProductIOS,
  getPurchaseHistory,
  finishTransaction as iapFinishTransaction,
  getAvailablePurchases as iapGetAvailablePurchases,
  getProducts as iapGetProducts,
  getSubscriptions as iapGetSubscriptions,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from '../iap';
import {useCallback, useEffect, useState} from 'react';

const {RNIapIos} = NativeModules;
const IAPEmitter = new NativeEventEmitter(RNIapIos);

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

let purchaseUpdateSubscription: EmitterSubscription;
let purchaseErrorSubscription: EmitterSubscription;
let promotedProductsSubscription: EmitterSubscription;

export function useIAP(): IAP_STATUS {
  const [connected, setConnected] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotedProductsIOS, setPromotedProductsIOS] = useState<Product[]>([]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [purchaseHistories, setPurchaseHistories] = useState<Purchase[]>([]);
  const [availablePurchases, setAvailablePurchases] = useState<Purchase[]>([]);

  const [currentPurchase, setCurrentPurchase] = useState<Purchase>();

  const [currentPurchaseError, setCurrentPurchaseError] =
    useState<PurchaseError>();

  const getProducts = useCallback(async (skus: string[]): Promise<void> => {
    const iaps = await iapGetProducts(skus);

    setProducts(iaps);
  }, []);

  const getSubscriptions = useCallback(
    async (skus: string[]): Promise<void> => {
      const subs = await iapGetSubscriptions(skus);

      setSubscriptions(subs);
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

  const initIapWithSubscriptions = useCallback(async (): Promise<void> => {
    const result = await initConnection();

    setConnected(result);

    if (result) {
      purchaseUpdateSubscription = purchaseUpdatedListener(
        async (purchase: InAppPurchase | SubscriptionPurchase) => {
          setCurrentPurchaseError(undefined);
          setCurrentPurchase(purchase);
        },
      );

      purchaseErrorSubscription = purchaseErrorListener(
        (error: PurchaseError) => {
          setCurrentPurchase(undefined);
          setCurrentPurchaseError(error);
        },
      );

      promotedProductsSubscription = IAPEmitter.addListener(
        'iap-promoted-product',
        async () => {
          const productId = await getPromotedProductIOS();

          setPromotedProductsIOS((prevProducts) => [
            ...prevProducts,
            productId,
          ]);
        },
      );
    }
  }, []);

  useEffect(() => {
    initIapWithSubscriptions();

    return (): void => {
      if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();

      if (purchaseErrorSubscription) purchaseErrorSubscription.remove();

      if (promotedProductsSubscription) promotedProductsSubscription.remove();

      endConnection();
      setConnected(false);
    };
  }, [initIapWithSubscriptions]);

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

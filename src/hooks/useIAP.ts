import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import {
  InAppPurchase,
  Product,
  Purchase,
  PurchaseError,
  Subscription,
  SubscriptionPurchase,
} from '../types';
import RNIap, {
  endConnection,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from '../index';
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
  currentPurchase: Purchase;
  currentPurchaseError: PurchaseError;
  finishTransaction: (purchase: Purchase) => Promise<string | void>;
  getAvailablePurchases: () => Promise<void>;
  getPurchaseHistories: () => Promise<void>;
  getProducts: (skus: string[]) => Promise<void>;
  getSubscriptions: (skus: string[]) => Promise<void>;
};

let purchaseUpdateSubscription: EmitterSubscription;
let purchaseErrorSubscription: EmitterSubscription;

export default function useIAP(): IAP_STATUS {
  const [connected, setConnected] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotedProductsIOS, setPromotedProductsIOS] = useState<Product[]>([]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [purchaseHistories, setPurchaseHistories] = useState<Purchase[]>([]);
  const [availablePurchases, setAvailablePurchases] = useState<Purchase[]>([]);

  const [currentPurchase, setCurrentPurchase] = useState<Purchase>();

  const [
    currentPurchaseError,
    setCurrentPurchaseError,
  ] = useState<PurchaseError>();

  const getProducts = useCallback(async (skus: string[]): Promise<void> => {
    setProducts(await RNIap.getProducts(skus));
  }, []);

  const getSubscriptions = useCallback(
    async (skus: string[]): Promise<void> => {
      setSubscriptions(await RNIap.getSubscriptions(skus));
    },
    [],
  );

  const getAvailablePurchases = useCallback(async (): Promise<void> => {
    setAvailablePurchases(await RNIap.getAvailablePurchases());
  }, []);

  const getPurchaseHistories = useCallback(async (): Promise<void> => {
    setPurchaseHistories(await RNIap.getPurchaseHistory());
  }, []);

  const finishTransaction = useCallback(
    async (purchase: Purchase): Promise<string | void> => {
      try {
        return await RNIap.finishTransaction(purchase);
      } catch (err) {
        throw new Error(err);
      } finally {
        if (purchase.productId === currentPurchase.productId)
          setCurrentPurchase(undefined);

        if (purchase.productId === currentPurchaseError.productId)
          setCurrentPurchaseError(undefined);
      }
    },
    [currentPurchase.productId, currentPurchaseError.productId],
  );

  const initIapWithSubscriptions = useCallback(async (): Promise<void> => {
    const result = await initConnection();

    setConnected(result);

    if (result) {
      purchaseUpdateSubscription = purchaseUpdatedListener(
        async (purchase: InAppPurchase | SubscriptionPurchase) => {
          setCurrentPurchase(purchase);
        },
      );

      purchaseErrorSubscription = purchaseErrorListener(
        (error: PurchaseError) => {
          setCurrentPurchaseError(error);
        },
      );

      IAPEmitter.addListener('iap-promoted-product', async () => {
        const productId = await RNIap.getPromotedProductIOS();

        setPromotedProductsIOS((prevProducts) => [...prevProducts, productId]);
      });
    }
  }, []);

  useEffect(() => {
    initIapWithSubscriptions();

    return (): void => {
      if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();

      if (purchaseErrorSubscription) purchaseErrorSubscription.remove();

      endConnection();
      setConnected(false);
    };
  });

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

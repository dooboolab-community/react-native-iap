import React, {
  ComponentType,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  promotedProductListener,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from '../eventEmitter';
import {getPromotedProductIOS, initConnection} from '../modules';
import type {PurchaseError} from '../purchaseError';
import type {ProductProduct, Purchase, SubscriptionProduct} from '../types';

interface IAPContextType {
  connected: boolean;
  products: ProductProduct[];
  promotedProductsIOS: ProductProduct[];
  subscriptions: SubscriptionProduct[];
  purchaseHistory: Purchase[];
  availablePurchases: Purchase[];
  currentPurchase?: Purchase;
  currentPurchaseError?: PurchaseError;
  initConnectionError?: Error;
  setProducts: (products: ProductProduct[]) => void;
  setSubscriptions: (subscriptions: SubscriptionProduct[]) => void;
  setPurchaseHistory: (purchaseHistory: Purchase[]) => void;
  setAvailablePurchases: (availablePurchases: Purchase[]) => void;
  setCurrentPurchase: (currentPurchase: Purchase | undefined) => void;
  setCurrentPurchaseError: (
    currentPurchaseError: PurchaseError | undefined,
  ) => void;
}

const IAPContext = createContext<IAPContextType>({} as IAPContextType);

export const useIAPContext = () => {
  const context = useContext(IAPContext);

  if (!context) {
    throw new Error('You need wrap your app with withIAPContext HOC');
  }

  return context;
};

export const withIAPContext = <T,>(Component: ComponentType<T>) => {
  return (props: T) => {
    const [connected, setConnected] = useState(false);
    const [products, setProducts] = useState<ProductProduct[]>([]);
    const [promotedProductsIOS, setPromotedProductsIOS] = useState<
      ProductProduct[]
    >([]);
    const [subscriptions, setSubscriptions] = useState<SubscriptionProduct[]>(
      [],
    );
    const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
    const [availablePurchases, setAvailablePurchases] = useState<Purchase[]>(
      [],
    );
    const [currentPurchase, setCurrentPurchase] = useState<Purchase>();
    const [currentPurchaseError, setCurrentPurchaseError] =
      useState<PurchaseError>();
    const [initConnectionError, setInitConnectionError] = useState<Error>();

    const context = useMemo(
      () => ({
        connected,
        products,
        subscriptions,
        promotedProductsIOS,
        purchaseHistory,
        availablePurchases,
        currentPurchase,
        currentPurchaseError,
        initConnectionError,
        setProducts,
        setSubscriptions,
        setPurchaseHistory,
        setAvailablePurchases,
        setCurrentPurchase,
        setCurrentPurchaseError,
      }),
      [
        connected,
        products,
        subscriptions,
        promotedProductsIOS,
        purchaseHistory,
        availablePurchases,
        currentPurchase,
        currentPurchaseError,
        initConnectionError,
        setProducts,
        setSubscriptions,
        setPurchaseHistory,
        setAvailablePurchases,
        setCurrentPurchase,
        setCurrentPurchaseError,
      ],
    );

    useEffect(() => {
      initConnection()
        .then((value) => {
          setInitConnectionError(undefined);
          setConnected(value);
        })
        .catch(setInitConnectionError);
    }, []);

    useEffect(() => {
      if (!connected) {
        return;
      }

      const purchaseUpdateSubscription = purchaseUpdatedListener(
        async (purchase: Purchase) => {
          setCurrentPurchaseError(undefined);
          setCurrentPurchase(purchase);
        },
      );

      const purchaseErrorSubscription = purchaseErrorListener(
        (error: PurchaseError) => {
          setCurrentPurchase(undefined);
          setCurrentPurchaseError(error);
        },
      );

      const promotedProductSubscription = promotedProductListener(async () => {
        const product = await getPromotedProductIOS();

        setPromotedProductsIOS((prevProducts) => [
          ...prevProducts,
          ...(product ? [product] : []),
        ]);
      });

      return () => {
        purchaseUpdateSubscription.remove();
        purchaseErrorSubscription.remove();
        promotedProductSubscription?.remove();
      };
    }, [connected]);

    return (
      <IAPContext.Provider value={context}>
        <Component {...props} />
      </IAPContext.Provider>
    );
  };
};

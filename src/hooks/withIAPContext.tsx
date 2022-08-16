import React, {useContext, useEffect, useMemo, useState} from 'react';

import {
  getPromotedProductIOS,
  initConnection,
  promotedProductListener,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from '../iap';
import type {PurchaseError} from '../purchaseError';
import type {
  InAppPurchase,
  Product,
  Purchase,
  Subscription,
  SubscriptionPurchase,
} from '../types';

type IAPContextType = {
  connected: boolean;
  products: Product[];
  promotedProductsIOS: Product[];
  subscriptions: Subscription[];
  purchaseHistories: Purchase[];
  availablePurchases: Purchase[];
  currentPurchase?: Purchase;
  currentPurchaseError?: PurchaseError;
  initConnectionError?: Error;
  setProducts: (products: Product[]) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setPurchaseHistories: (purchaseHistories: Purchase[]) => void;
  setAvailablePurchases: (availablePurchases: Purchase[]) => void;
  setCurrentPurchase: (currentPurchase: Purchase | undefined) => void;
  setCurrentPurchaseError: (
    currentPurchaseError: PurchaseError | undefined,
  ) => void;
};

// @ts-ignore
const IAPContext = React.createContext<IAPContextType>(null);

export function useIAPContext(): IAPContextType {
  const ctx = useContext(IAPContext);

  if (!ctx) {
    throw new Error('You need wrap your app with withIAPContext HOC');
  }

  return ctx;
}

export function withIAPContext<T>(Component: React.ComponentType<T>) {
  return function WrapperComponent(props: T) {
    const [connected, setConnected] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);

    const [promotedProductsIOS, setPromotedProductsIOS] = useState<Product[]>(
      [],
    );
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [purchaseHistories, setPurchaseHistories] = useState<Purchase[]>([]);

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
        purchaseHistories,
        availablePurchases,
        currentPurchase,
        currentPurchaseError,
        initConnectionError,
        setProducts,
        setSubscriptions,
        setPurchaseHistories,
        setAvailablePurchases,
        setCurrentPurchase,
        setCurrentPurchaseError,
      }),
      [
        connected,
        products,
        subscriptions,
        promotedProductsIOS,
        purchaseHistories,
        availablePurchases,
        currentPurchase,
        currentPurchaseError,
        initConnectionError,
        setProducts,
        setSubscriptions,
        setPurchaseHistories,
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
        async (purchase: InAppPurchase | SubscriptionPurchase) => {
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
}

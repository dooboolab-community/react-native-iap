import React, {useContext, useEffect, useMemo, useState} from 'react';

import {purchaseErrorListener, purchaseUpdatedListener} from '../eventEmitter';
import {initConnection} from '../iap';
import type {PurchaseError} from '../purchaseError';
import type {
  Product,
  ProductPurchase,
  Purchase,
  Subscription,
  SubscriptionPurchase,
} from '../types';

type IAPContextType = {
  connected: boolean;
  products: Product[];
  subscriptions: Subscription[];
  purchaseHistory: Purchase[];
  availablePurchases: Purchase[];
  currentPurchase?: Purchase;
  currentPurchaseError?: PurchaseError;
  initConnectionError?: Error;
  setProducts: (products: Product[]) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setPurchaseHistory: (purchaseHistory: Purchase[]) => void;
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
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
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
        async (purchase: ProductPurchase | SubscriptionPurchase) => {
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

      return () => {
        purchaseUpdateSubscription.remove();
        purchaseErrorSubscription.remove();
      };
    }, [connected]);

    return (
      <IAPContext.Provider value={context}>
        <Component {...props} />
      </IAPContext.Provider>
    );
  };
}

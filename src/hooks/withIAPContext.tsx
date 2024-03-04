import React, {useContext, useEffect, useMemo, useState} from 'react';

import {
  promotedProductListener,
  purchaseErrorListener,
  purchaseUpdatedListener,
  transactionListener,
  userChoiceListener,
} from '../eventEmitter';
import {IapIos, initConnection} from '../iap';
import type {PurchaseError} from '../purchaseError';
import type {
  Product,
  ProductPurchase,
  Purchase,
  Subscription,
  SubscriptionPurchase,
} from '../types';
import {UserChoiceDetails} from '../types/android';
import type {TransactionEvent, TransactionSk2} from '../types/appleSk2';

type IAPContextType = {
  connected: boolean;
  products: Product[];
  promotedProductsIOS: Product[];
  subscriptions: Subscription[];
  purchaseHistory: Purchase[];
  availablePurchases: Purchase[];
  currentPurchase?: Purchase;
  currentTransaction?: TransactionSk2;
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

    const [promotedProductsIOS, setPromotedProductsIOS] = useState<Product[]>(
      [],
    );
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);

    const [availablePurchases, setAvailablePurchases] = useState<Purchase[]>(
      [],
    );
    const [currentPurchase, setCurrentPurchase] = useState<Purchase>();
    const [currentTransaction, setCurrentTransaction] =
      useState<TransactionSk2>();

    const [currentPurchaseError, setCurrentPurchaseError] =
      useState<PurchaseError>();

    const [initConnectionError, setInitConnectionError] = useState<Error>();

    const [userChoice, setUserChoice] = useState<UserChoiceDetails>();

    const context = useMemo(
      () => ({
        connected,
        products,
        subscriptions,
        promotedProductsIOS,
        purchaseHistory,
        availablePurchases,
        currentPurchase,
        currentTransaction,
        currentPurchaseError,
        initConnectionError,
        setProducts,
        setSubscriptions,
        setPurchaseHistory,
        setAvailablePurchases,
        setCurrentPurchase,
        setCurrentPurchaseError,
        userChoice,
        setUserChoice,
      }),
      [
        connected,
        products,
        subscriptions,
        promotedProductsIOS,
        purchaseHistory,
        availablePurchases,
        currentPurchase,
        currentTransaction,
        currentPurchaseError,
        initConnectionError,
        setProducts,
        setSubscriptions,
        setPurchaseHistory,
        setAvailablePurchases,
        setCurrentPurchase,
        setCurrentPurchaseError,
        userChoice,
        setUserChoice,
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

      const transactionUpdateSubscription = transactionListener(
        async (transactionOrError: TransactionEvent) => {
          setCurrentPurchaseError(transactionOrError?.error);
          setCurrentTransaction(transactionOrError?.transaction);
        },
      );

      const purchaseErrorSubscription = purchaseErrorListener(
        (error: PurchaseError) => {
          setCurrentPurchase(undefined);
          setCurrentPurchaseError(error);
        },
      );

      const promotedProductSubscription = promotedProductListener(async () => {
        const product = await IapIos.getPromotedProductIOS();

        setPromotedProductsIOS((prevProducts) => [
          ...prevProducts,
          ...(product ? [product] : []),
        ]);
      });

      const userChoiceSubscription = userChoiceListener(
        async (userChoice: UserChoiceDetails) => {
          setUserChoice(userChoice);
        },
      );

      return () => {
        purchaseUpdateSubscription.remove();
        purchaseErrorSubscription.remove();
        promotedProductSubscription?.remove();
        transactionUpdateSubscription?.remove();
        userChoiceSubscription?.remove();
      };
    }, [connected]);

    return (
      // @ts-ignore
      <IAPContext.Provider value={context}>
        {/* @ts-ignore */}
        <Component {...props} />
      </IAPContext.Provider>
    );
  };
}

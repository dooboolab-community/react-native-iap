import type {ProductIOS, Purchase, SubscriptionIOS} from '.';

export type ProductSk2 = {
  description: string;
  displayName: string;
  displayPrice: string;
  id: number;
  isFamilyShareable: boolean;
  jsonRepresentation: string;
  price: number;
  subscription: any; //TODO
  type: 'autoRenewable' | 'consumable' | 'nonConsumable' | 'nonRenewable';
};
export const productSk2Map = ({
  id,
  description,
  displayName,
  price,
  displayPrice,
}: ProductSk2): ProductIOS => {
  const prod: ProductIOS = {
    title: displayName,
    productId: String(id),
    description,
    type: 'iap',
    price: String(price),
    localizedPrice: displayPrice,
    currency: '', //TODO: Not avaiable on new API, use localizedPrice instead?
  };
  return prod;
};

export const subscriptionSk2Map = ({
  id,
  description,
  displayName,
  price,
  displayPrice,
}: ProductSk2): SubscriptionIOS => {
  const prod: SubscriptionIOS = {
    title: displayName,
    productId: String(id),
    description,
    type: 'subs',
    price: String(price),
    localizedPrice: displayPrice,
    currency: '', //TODO: Not avaiable on new API, use localizedPrice instead?
  };
  return prod;
};

export type TransactionSk2 = {
  appAccountToken: string;
  appBundleID: string;
  debugDescription: string;
  deviceVerification: string;
  deviceVerificationNonce: string;
  expirationDate: number;
  id: number;
  isUpgraded: boolean;
  jsonRepresentation: string;
  offerID: string;
  offerType: string;
  originalID: string;
  originalPurchaseDate: number;
  ownershipType: string;
  productID: string;
  productType: string;
  purchaseDate: number;
  purchasedQuantity: number;
  revocationDate: number;
  revocationReason: string;
  signedDate: number;
  subscriptionGroupID: number;
  webOrderLineItemID: number;
};
export const transactionSk2Map = ({
  id,
  originalPurchaseDate,
  productID,
  purchaseDate,
  purchasedQuantity,
}: TransactionSk2): Purchase => {
  const purchase: Purchase = {
    productId: productID,
    transactionId: String(id),
    transactionDate: purchaseDate, //??
    transactionReceipt: '', // Not available
    purchaseToken: '', //Not avaiable
    quantityIOS: purchasedQuantity,
    originalTransactionDateIOS: String(originalPurchaseDate),
    originalTransactionIdentifierIOS: String(id), // ??
  };
  return purchase;
};

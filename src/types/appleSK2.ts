import type {ProductIOS, SubscriptionIOS} from '.';

export type ProductSK2 = {
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
}: ProductSK2): ProductIOS => {
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
}: ProductSK2): SubscriptionIOS => {
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

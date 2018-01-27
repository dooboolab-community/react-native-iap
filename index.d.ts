export interface Skus {
  ios: string[];
  android: string[];
}

/*
  currency: string,
  description: string,
  localizedPrice: string;
  price: string;
  price_currency: string;
  productId: string;
  title: string;
  type: string;
*/
export function getItems(skus: Skus) : Promise<any>;
export function getSubscribeItems(skus: Skus) : Promise<any>;
export function buyItem(item: string) : Promise<any>;
export function buySubscribeItem(item: string) : Promise<any>;
export function refreshAllItems() : Promise<any>;

export function prepareAndroid() : Promise<string> | void;
export function refreshPurchaseItemsAndroid(type: string | null) : void;
export function getPurchasedItemsAndroid(type: string | null) : Promise<any> | void;
export function consumeItemAndroid(token: string) : Promise<string> | void;
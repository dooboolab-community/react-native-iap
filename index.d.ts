export interface Skus {
  ios: string[];
  android: string[];
}

export interface ItemDescription {
  type?: string; // only on Android
  productId: string;
  title: string;
  description: string;
  price: number | string; // number on iOS, string on Android
  currency: string;
  localizedPrice: string; // only on Android
}

export function getItems(skus: Skus) : Promise<ItemDescription[]>;
export function getSubscribeItems(skus: Skus) : Promise<ItemDescription[]>;
export function buyItem(item: string) : Promise<string>;
export function buySubscribeItem(item: string) : Promise<any>;
export function refreshAllItems() : Promise<any>;

export function prepareAndroid() : Promise<string> | void;
export function refreshPurchaseItemsAndroid(type: string | null) : void;
export function getPurchasedItemsAndroid(type: string | null) : Promise<any> | void;
export function consumeItemAndroid(token: string) : Promise<string> | void;
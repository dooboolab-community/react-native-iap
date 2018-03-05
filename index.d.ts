export interface Skus {
  ios: string[];
  android: string[];
}

export type ItemDescription = ItemDescriptionAndroid | ItemDescriptionIos 

export type SkuTypeAndroid = 'INAPP' | 'SUBS'

export interface ItemDescriptionAndroid {
  type: SkuTypeAndroid;
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  price_currency: string;
  localizedPrice: string;
}

export interface ItemDescriptionIos {
  productId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
}

/**
 * Get purchasable items in array.
 * @param {Skus} skus
 * @returns {Promise<ItemDescription[]>} Promise of the array of purchasable items
 */
export function getItems(skus: Skus) : Promise<ItemDescription[]>;

/**
 * Get subscription items.
 * @param {Skus} skus
 * @returns {Promise<ItemDescription[]>} Promise of the array of subscription items
 */
export function getSubscribeItems(skus: Skus) : Promise<ItemDescription[]>;

/**
 * Purchase item.
 * @param {string} item
 * @returns {Promise<string>} Promise of the ...
 */
export function buyItem(item: string) : Promise<string>;

/**
 * Buy subscription item.
 * @param {string} item
 * @returns {Promise<any>} Promise of the ...
 */
export function buySubscribeItem(item: string) : Promise<any>;

/** 
 * Get history of purchases.
 * @returns {Promise<any>} Promise of the refreshed items.
*/
export function fetchHistory() : Promise<any>;

/**
 * Prepare IAP module for android. Should be called in android before using any methods in RNIap.
 * @returns {Promise<string>|null} Promise of the messages, or null if the Platform is not Android.
 */
export function prepareAndroid() : Promise<string> | null;

/**
 * Refresh purchased items for android.
 * What is different from refreshAllItems is that this method can get parameter to refresh INAPP items or SUBS items.
 * @param {SkuTypeAndroid} [type] `'INAPP'` or `'SUBS'`
 */
export function refreshPurchaseItemsAndroid(type?: SkuTypeAndroid) : void;

/**
 * Get purchased items for android.
 * This method returns the current un-consumed products owned by the user, including both purchased items and items acquired by redeeming a promo code.
 * This method also gets parameter to refresh INAPP items or SUBS items.
 * @param {SkuTypeAndroid} [type] `'INAPP'` or `'SUBS' and default for 'INAPP'`
 * @returns {Promise<any>|null} Promise of the purchased items, or null if the Platform is not Android.
 */
export function getPurchasesAndroid(type?: SkuTypeAndroid) : Promise<any> | null;

/**
 * Get purchased items for android.
 * This method also gets parameter to refresh INAPP items or SUBS items.
 * @param {SkuTypeAndroid} [type] `'INAPP'` or `'SUBS'`
 * @returns {Promise<any>|null} Promise of the purchased items, or null if the Platform is not Android.
 */
export function getPurchasedItemsAndroid(type?: SkuTypeAndroid) : Promise<any> | null;

/**
 * Consume item for android.
 * After buying some item from consumable item in android, you can use this method to consume it.
 * Therefore you can purchase the item again.
 * @param {string} token
 * @returns {boolean|null} Promise of the status of billing response, or null if the Platform is not Android.
 */
export function consumeItemAndroid(token: string) : Promise<boolean> | null;

/**
 * TODO: Add description here.
 * @returns {Promise<Object>|null} Promise of somthing, or null if the Platform is not iOS
 */
export function restoreIosNonConsumableProducts() : Promise<Object> | null;

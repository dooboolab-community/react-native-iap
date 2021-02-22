export enum AndroidPurchaseState {
  purchased = 0,
  canceled = 1,
  pending = 2,
}

export enum AndroidPurchaseType {
  test = 0,
  promo = 1,
  rewarded = 2,
}

export enum AndroidConsumptionState {
  yet = 0,
  consumed = 1,
}

export enum AndroidAcknowledgementState {
  yet = 0,
  acknowledged = 1,
}

/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 * @param {number} startTimeMillis The time the product was purchased, in milliseconds since the epoch (Jan 1, 1970).
 * @param {number} expiryTimeMillis The time the product expires, in milliseconds since the epoch (Jan 1, 1970).
 * @param {boolean} autoRenewing Check if it is a renewable product.
 * @param {string} priceCurrencyCode The price currency.
 * @param {number} priceAmountMicros Price amount int micros.
 * @param {string} countryCode Country code.
 * @param {string} developerPayload Developer payload.
 * @param {string} orderId Order id.
 * @param {AndroidPurchaseType} purchaseType Purchase type.
 * @param {AndroidAcknowledgementState} acknowledgementState Check if product is acknowledged.
 * @param {string} kind
 */
export type ReceiptType = {
  startTimeMillis: number;
  expiryTimeMillis: number;
  autoRenewing: boolean;
  priceCurrencyCode: string;
  priceAmountMicros: number;
  countryCode: string;
  developerPayload: string;
  orderId: string;
  consumptionState?: AndroidConsumptionState;
  purchaseState: AndroidPurchaseState;
  purchaseType: AndroidPurchaseType;
  acknowledgementState: AndroidAcknowledgementState;
  kind: string;
} & Record<string, unknown>;

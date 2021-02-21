export declare enum AndroidPurchaseState {
    Purchased = 0,
    Canceled = 1,
    Pending = 2
}
export declare enum AndroidPurchaseType {
    Test = 0,
    Promo = 1,
    Rewarded = 2
}
export declare enum AndroidAcknowledgementState {
    Yet = 0,
    Acknowledged = 1
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
export declare type AndroidReceiptType = {
    startTimeMillis: number;
    expiryTimeMillis: number;
    autoRenewing: boolean;
    priceCurrencyCode: string;
    priceAmountMicros: number;
    countryCode: string;
    developerPayload: string;
    orderId: string;
    purchaseType: AndroidPurchaseType;
    acknowledgementState: AndroidAcknowledgementState;
    kind: string;
} & Record<string, unknown>;

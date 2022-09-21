/**
 * Payment discount interface @see https://developer.apple.com/documentation/storekit/skpaymentdiscount?language=objc
 */
export interface PaymentDiscount {
  /**
   * A string used to uniquely identify a discount offer for a product.
   */
  identifier: string;

  /**
   * A string that identifies the key used to generate the signature.
   */
  keyIdentifier: string;

  /**
   * A universally unique ID (UUID) value that you define.
   */
  nonce: string;

  /**
   * A UTF-8 string representing the properties of a specific discount offer, cryptographically signed.
   */
  signature: string;

  /**
   * The date and time of the signature's creation in milliseconds, formatted in Unix epoch time.
   */
  timestamp: number;
}

export const offerToRecord = (
  offer: PaymentDiscount | undefined,
): Record<keyof PaymentDiscount, string> | undefined => {
  if (!offer) {
    return undefined;
  }
  return {
    identifier: offer.identifier,
    keyIdentifier: offer.keyIdentifier,
    nonce: offer.nonce,
    signature: offer.signature,
    timestamp: offer.timestamp.toString(),
  };
};

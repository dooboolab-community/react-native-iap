export enum ReceiptValidationStatus {
  /** The receipt validated successfully. */
  SUCCESS = 0,
  /** The App Store could not read the JSON object you provided. */
  INVALID_JSON = 21000,
  /** The data in the receipt-data property was malformed or missing. */
  INVALID_RECEIPT_DATA = 21002,
  /** The receipt could not be authenticated. */
  COULT_NOT_AUTHENTICATE = 21003,
  /** The shared secret you provided does not match the shared secret on file for your account. */
  INVALID_SECRET = 21004,
  /** The receipt server is not currently available. */
  UNAVAILABLE = 21005,
  /** This receipt is valid but the subscription has expired. When this status code is returned to your server, the receipt data is also decoded and returned as part of the response.
    Only returned for iOS 6 style transaction receipts for auto-renewable subscriptions. */
  EXPIRED_SUBSCRIPTION = 21006,
  /** This receipt is from the test environment, but it was sent to the production environment for verification. Send it to the test environment instead. */
  TEST_RECEIPT = 21007,
  /** This receipt is from the production environment, but it was sent to the test environment for verification. Send it to the production environment instead. */
  PROD_RECEIPT = 21008,
  /** This receipt could not be authorized. Treat this the same as if a purchase was never made. */
  COULD_NOT_AUTHORIZE = 21010,

  /** Internal data access error. */ INTERNAL_ERROR_00 = 21100,
  /** Internal data access error. */ INTERNAL_ERROR_01 = 21101,
  /** Internal data access error. */ INTERNAL_ERROR_02 = 21102,
  /** Internal data access error. */ INTERNAL_ERROR_03 = 21103,
  /** Internal data access error. */ INTERNAL_ERROR_04 = 21104,
  /** Internal data access error. */ INTERNAL_ERROR_05 = 21105,
  /** Internal data access error. */ INTERNAL_ERROR_06 = 21106,
  /** Internal data access error. */ INTERNAL_ERROR_07 = 21107,
  /** Internal data access error. */ INTERNAL_ERROR_08 = 21108,
  /** Internal data access error. */ INTERNAL_ERROR_09 = 21109,
  /** Internal data access error. */ INTERNAL_ERROR_10 = 21110,
  /** Internal data access error. */ INTERNAL_ERROR_11 = 21111,
  /** Internal data access error. */ INTERNAL_ERROR_12 = 21112,
  /** Internal data access error. */ INTERNAL_ERROR_13 = 21113,
  /** Internal data access error. */ INTERNAL_ERROR_14 = 21114,
  /** Internal data access error. */ INTERNAL_ERROR_15 = 21115,
  /** Internal data access error. */ INTERNAL_ERROR_16 = 21116,
  /** Internal data access error. */ INTERNAL_ERROR_17 = 21117,
  /** Internal data access error. */ INTERNAL_ERROR_18 = 21118,
  /** Internal data access error. */ INTERNAL_ERROR_19 = 21119,
  /** Internal data access error. */ INTERNAL_ERROR_20 = 21120,
  /** Internal data access error. */ INTERNAL_ERROR_21 = 21121,
  /** Internal data access error. */ INTERNAL_ERROR_22 = 21122,
  /** Internal data access error. */ INTERNAL_ERROR_23 = 21123,
  /** Internal data access error. */ INTERNAL_ERROR_24 = 21124,
  /** Internal data access error. */ INTERNAL_ERROR_25 = 21125,
  /** Internal data access error. */ INTERNAL_ERROR_26 = 21126,
  /** Internal data access error. */ INTERNAL_ERROR_27 = 21127,
  /** Internal data access error. */ INTERNAL_ERROR_28 = 21128,
  /** Internal data access error. */ INTERNAL_ERROR_29 = 21129,
  /** Internal data access error. */ INTERNAL_ERROR_30 = 21130,
  /** Internal data access error. */ INTERNAL_ERROR_31 = 21131,
  /** Internal data access error. */ INTERNAL_ERROR_32 = 21132,
  /** Internal data access error. */ INTERNAL_ERROR_33 = 21133,
  /** Internal data access error. */ INTERNAL_ERROR_34 = 21134,
  /** Internal data access error. */ INTERNAL_ERROR_35 = 21135,
  /** Internal data access error. */ INTERNAL_ERROR_36 = 21136,
  /** Internal data access error. */ INTERNAL_ERROR_37 = 21137,
  /** Internal data access error. */ INTERNAL_ERROR_38 = 21138,
  /** Internal data access error. */ INTERNAL_ERROR_39 = 21139,
  /** Internal data access error. */ INTERNAL_ERROR_40 = 21140,
  /** Internal data access error. */ INTERNAL_ERROR_41 = 21141,
  /** Internal data access error. */ INTERNAL_ERROR_42 = 21142,
  /** Internal data access error. */ INTERNAL_ERROR_43 = 21143,
  /** Internal data access error. */ INTERNAL_ERROR_44 = 21144,
  /** Internal data access error. */ INTERNAL_ERROR_45 = 21145,
  /** Internal data access error. */ INTERNAL_ERROR_46 = 21146,
  /** Internal data access error. */ INTERNAL_ERROR_47 = 21147,
  /** Internal data access error. */ INTERNAL_ERROR_48 = 21148,
  /** Internal data access error. */ INTERNAL_ERROR_49 = 21149,
  /** Internal data access error. */ INTERNAL_ERROR_50 = 21150,
  /** Internal data access error. */ INTERNAL_ERROR_51 = 21151,
  /** Internal data access error. */ INTERNAL_ERROR_52 = 21152,
  /** Internal data access error. */ INTERNAL_ERROR_53 = 21153,
  /** Internal data access error. */ INTERNAL_ERROR_54 = 21154,
  /** Internal data access error. */ INTERNAL_ERROR_55 = 21155,
  /** Internal data access error. */ INTERNAL_ERROR_56 = 21156,
  /** Internal data access error. */ INTERNAL_ERROR_57 = 21157,
  /** Internal data access error. */ INTERNAL_ERROR_58 = 21158,
  /** Internal data access error. */ INTERNAL_ERROR_59 = 21159,
  /** Internal data access error. */ INTERNAL_ERROR_60 = 21160,
  /** Internal data access error. */ INTERNAL_ERROR_61 = 21161,
  /** Internal data access error. */ INTERNAL_ERROR_62 = 21162,
  /** Internal data access error. */ INTERNAL_ERROR_63 = 21163,
  /** Internal data access error. */ INTERNAL_ERROR_64 = 21164,
  /** Internal data access error. */ INTERNAL_ERROR_65 = 21165,
  /** Internal data access error. */ INTERNAL_ERROR_66 = 21166,
  /** Internal data access error. */ INTERNAL_ERROR_67 = 21167,
  /** Internal data access error. */ INTERNAL_ERROR_68 = 21168,
  /** Internal data access error. */ INTERNAL_ERROR_69 = 21169,
  /** Internal data access error. */ INTERNAL_ERROR_70 = 21170,
  /** Internal data access error. */ INTERNAL_ERROR_71 = 21171,
  /** Internal data access error. */ INTERNAL_ERROR_72 = 21172,
  /** Internal data access error. */ INTERNAL_ERROR_73 = 21173,
  /** Internal data access error. */ INTERNAL_ERROR_74 = 21174,
  /** Internal data access error. */ INTERNAL_ERROR_75 = 21175,
  /** Internal data access error. */ INTERNAL_ERROR_76 = 21176,
  /** Internal data access error. */ INTERNAL_ERROR_77 = 21177,
  /** Internal data access error. */ INTERNAL_ERROR_78 = 21178,
  /** Internal data access error. */ INTERNAL_ERROR_79 = 21179,
  /** Internal data access error. */ INTERNAL_ERROR_80 = 21180,
  /** Internal data access error. */ INTERNAL_ERROR_81 = 21181,
  /** Internal data access error. */ INTERNAL_ERROR_82 = 21182,
  /** Internal data access error. */ INTERNAL_ERROR_83 = 21183,
  /** Internal data access error. */ INTERNAL_ERROR_84 = 21184,
  /** Internal data access error. */ INTERNAL_ERROR_85 = 21185,
  /** Internal data access error. */ INTERNAL_ERROR_86 = 21186,
  /** Internal data access error. */ INTERNAL_ERROR_87 = 21187,
  /** Internal data access error. */ INTERNAL_ERROR_88 = 21188,
  /** Internal data access error. */ INTERNAL_ERROR_89 = 21189,
  /** Internal data access error. */ INTERNAL_ERROR_90 = 21190,
  /** Internal data access error. */ INTERNAL_ERROR_91 = 21191,
  /** Internal data access error. */ INTERNAL_ERROR_92 = 21192,
  /** Internal data access error. */ INTERNAL_ERROR_93 = 21193,
  /** Internal data access error. */ INTERNAL_ERROR_94 = 21194,
  /** Internal data access error. */ INTERNAL_ERROR_95 = 21195,
  /** Internal data access error. */ INTERNAL_ERROR_96 = 21196,
  /** Internal data access error. */ INTERNAL_ERROR_97 = 21197,
  /** Internal data access error. */ INTERNAL_ERROR_98 = 21198,
  /** Internal data access error. */ INTERNAL_ERROR_99 = 21199,
}

export enum SubscriptionExpirationIntent {
  /** Customer canceled their subscription. **/
  CUSTOMER_CANCELED = '1',
  /** Billing error; for example customer’s payment information was no longer valid. **/
  BILLING_ERROR = '2',
  /** Customer did not agree to a recent price increase. **/
  DENIED_PRICE_INCREASE = '3',
  /** Product was not available for purchase at the time of renewal. **/
  PRODUCT_NOT_AVAILABLE = '4',
  /** Unknown error. **/
  UNKNOWN_ERROR = '5',
}

export enum SubscriptionRetryFlag {
  /** App Store is still attempting to renew the subscription. */
  ACTIVE = '1',
  /** App Store has stopped attempting to renew the subscription. */
  STOPPED = '0',
}

export enum CancellationReason {
  /** Customer canceled their transaction due to an actual or perceived issue within your app. */
  ACTUAL_ISSUE = '1',
  /** Transaction was canceled for another reason, for example, if the customer made the purchase accidentally. */
  OTHER_REASON = '0',
}

export enum SubscriptionAutoRenewStatus {
  /** Subscription will renew at the end of the current subscription period. */
  ACTIVE = '1',
  /** Customer has turned off automatic renewal for their subscription. */
  STOPPED = '0',
}

export enum SubscriptionPriceConsentStatus {
  /** Customer has agreed to the price increase. Subscription will renew at the higher price. */
  AGREED = '1',
  /** Customer has not taken action regarding the increased price. Subscription expires if the customer takes no action before the renewal date. */
  NO_ACTION = '0',
}

export interface ReceiptValidationRequest {
  /** The base64 encoded receipt data. */
  'receipt-data': string;
  /** *Only used for receipts that contain auto-renewable subscriptions.* Your app’s shared secret (a hexadecimal string). */
  password?: string;
  /** *Only used for iOS7 style app receipts that contain auto-renewable or non-renewing subscriptions.* If value is true, response includes only the latest renewal transaction for any subscriptions. */
  'exclude-old-transactions'?: boolean;
}

export interface ReceiptValidationResponse {
  /**
   * Either `0` if the receipt is valid, or one of the error codes listed in [Table 2-1](https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html#//apple_ref/doc/uid/TP40010573-CH104-SW5).
   *
   * For iOS 6 style transaction receipts, the status code reflects the status of the specific transaction’s receipt.
   *
   * For iOS 7 style app receipts, the status code is reflects the status of the app receipt as a whole. For example, if you send a valid app receipt that contains an expired subscription, the response is 0 because the receipt as a whole is valid.
   */
  status: ReceiptValidationStatus;

  /**
   * A JSON representation of the receipt that was sent for verification. For information about keys found in a receipt, see [Receipt Fields](https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ReceiptFields.html#//apple_ref/doc/uid/TP40010573-CH106-SW1).
   */
  receipt: AppReceipt;

  /**
   * *Only returned for receipts containing auto-renewable subscriptions.*
   *
   * For iOS 6 style transaction receipts, this is the base-64 encoded receipt for the most recent renewal.
   *
   * For iOS 7 style app receipts, this is the latest base-64 encoded app receipt.
   */
  latest_receipt?: string;

  /**
   * *Only returned for receipts containing auto-renewable subscriptions.*
   *
   * For iOS 6 style transaction receipts, this is the JSON representation of the receipt for the most recent renewal.
   *
   * For iOS 7 style app receipts, the value of this key is an array containing all in-app purchase transactions. This excludes transactions for a consumable product that have been marked as finished by your app.
   */
  latest_receipt_info?: object;

  /**
   * *Only returned for iOS 6 style transaction receipts, for an auto-renewable subscription.*
   *
   * The JSON representation of the receipt for the expired subscription.
   */
  latest_expired_receipt_info?: object;

  /**
   * *Only returned for iOS 7 style app receipts containing auto-renewable subscriptions.*
   *
   * In the JSON file, the value of this key is an array where each element contains the pending renewal information for each auto-renewable subscription identified by the [Product Identifier](https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ReceiptFields.html#//apple_ref/doc/uid/TP40010573-CH106-SW11). A pending renewal may refer to a renewal that is scheduled in the future or a renewal that failed in the past for some reason.
   */
  pending_renewal_info?: object[];
}

export interface AppReceipt {
  /**
   * The app’s bundle identifier.
   *
   * This corresponds to the value of `CFBundleIdentifier` in the `Info.plist` file. Use this value to validate if the receipt was indeed generated for your app.
   */
  bundle_id: string;

  /**
   * The app’s version number.
   *
   * This corresponds to the value of `CFBundleVersion` (in iOS) or `CFBundleShortVersionString` (in macOS) in the `Info.plist`.
   */
  application_version: string;

  /**
   * The receipt for an in-app purchase.
   *
   * In the JSON file, the value of this key is an array containing all in-app purchase receipts based on the in-app purchase transactions present in the input base-64 receipt-data. For receipts containing auto-renewable subscriptions, check the value of the `latest_receipt_info` key to get the status of the most recent renewal.
   *
   * **Note:** An empty array is a valid receipt.
   *
   * The in-app purchase receipt for a consumable product is added to the receipt when the purchase is made. It is kept in the receipt until your app finishes that transaction. After that point, it is removed from the receipt the next time the receipt is updated - for example, when the user makes another purchase or if your app explicitly refreshes the receipt.
   *
   * The in-app purchase receipt for a non-consumable product, auto-renewable subscription, non-renewing subscription, or free subscription remains in the receipt indefinitely.
   */
  in_app: IAPReceipt[];

  /**
   * The version of the app that was originally purchased.
   *
   * This corresponds to the value of `CFBundleVersion` (in iOS) or `CFBundleShortVersionString` (in macOS) in the `Info.plist` file when the purchase was originally made.
   *
   * In the sandbox environment, the value of this field is always `"1.0"`.
   */
  original_application_version: string;

  /**
   * The date when the app receipt was created, interpreted as an RFC 3339 date.
   *
   * When validating a receipt, use this date to validate the receipt’s signature.
   *
   * **Note:** Many cryptographic libraries default to using the device’s current time and date when validating a PKCS7 package, but this may not produce the correct results when validating a receipt’s signature. For example, if the receipt was signed with a valid certificate, but the certificate has since expired, using the device’s current date incorrectly returns an invalid result.
   *
   * Therefore, make sure your app always uses the date from the Receipt Creation Date field to validate the receipt’s signature.
   */
  receipt_creation_date: string;

  /**
   * The date that the app receipt expires, interpreted as an RFC 3339 date.
   *
   * This key is present only for apps purchased through the Volume Purchase Program. If this key is not present, the receipt does not expire.
   *
   * When validating a receipt, compare this date to the current date to determine whether the receipt is expired. Do not try to use this date to calculate any other information, such as the time remaining before expiration.
   */
  expiration_date?: string;
}

export interface IAPReceipt {
  /**
   * The number of items purchased. (string, interpreted as an integer)
   *
   * This value corresponds to the `quantity` property of the `SKPayment` object stored in the transaction’s `payment` property.
   */
  quantity: string;

  /**
   * The product identifier of the item that was purchased.
   *
   * This value corresponds to the `productIdentifier` property of the `SKPayment` object stored in the transaction’s `payment` property.
   */
  product_id: string;

  /**
   * The transaction identifier of the item that was purchased.
   *
   * This value corresponds to the transaction’s `transactionIdentifier` property.
   *
   * For a transaction that restores a previous transaction, this value is different from the transaction identifier of the original purchase transaction. In an auto-renewable subscription receipt, a new value for the transaction identifier is generated every time the subscription automatically renews or is restored on a new device.
   */
  transaction_id: string;

  /**
   * For a transaction that restores a previous transaction, the transaction identifier of the original transaction. Otherwise, identical to the transaction identifier.
   *
   * This value corresponds to the original transaction’s `transactionIdentifier` property.
   *
   * This value is the same for all receipts that have been generated for a specific subscription. This value is useful for relating together multiple iOS 6 style transaction receipts for the same individual customer’s subscription.
   */
  original_transaction_id: string;

  /**
   * The date and time that the item was purchased, interpreted as an RFC 3339 date.
   *
   * This value corresponds to the transaction’s `transactionDate` property.
   *
   * For a transaction that restores a previous transaction, the purchase date is the same as the original purchase date. Use [Original Purchase Date](https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ReceiptFields.html#//apple_ref/doc/uid/TP40010573-CH106-SW4) to get the date of the original transaction.
   *
   * In an auto-renewable subscription receipt, the purchase date is the date when the subscription was either purchased or renewed (with or without a lapse). For an automatic renewal that occurs on the expiration date of the current period, the purchase date is the start date of the next period, which is identical to the end date of the current period.
   */
  purchase_date: string;

  /**
   * For a transaction that restores a previous transaction, the date of the original transaction, interpreted as an RFC 3339 date.
   *
   * This value corresponds to the original transaction’s `transactionDate` property.
   *
   * In an auto-renewable subscription receipt, this indicates the beginning of the subscription period, even if the subscription has been renewed.
   */
  original_purchase_date: string;

  /**
   * The expiration date for the subscription, interpreted as an RFC 3339 date.
   *
   * This key is only present for auto-renewable subscription receipts. Use this value to identify the date when the subscription will renew or expire, to determine if a customer should have access to content or service. After validating the latest receipt, if the subscription expiration date for the latest renewal transaction is a past date, it is safe to assume that the subscription has expired.
   */
  expires_date: string;

  /**
   * For an expired subscription, the reason for the subscription expiration.
   *
   * This key is only present for a receipt containing an expired auto-renewable subscription. You can use this value to decide whether to display appropriate messaging in your app for customers to resubscribe.
   */
  expiration_intent?: SubscriptionExpirationIntent;

  /**
   * For an expired subscription, whether or not Apple is still attempting to automatically renew the subscription.
   *
   * This key is only present for auto-renewable subscription receipts. If the customer’s subscription failed to renew because the App Store was unable to complete the transaction, this value will reflect whether or not the App Store is still trying to renew the subscription.
   */
  is_in_billing_retry_period?: SubscriptionRetryFlag;

  /**
   * For a subscription, whether or not it is in the free trial period.
   *
   * This key is only present for auto-renewable subscription receipts. The value for this key is `"true"` if the customer’s subscription is currently in the free trial period, or `"false"` if not.
   *
   * **Note:** If a previous subscription period in the receipt has the value “true” for either the `is_trial_period` or the `is_in_intro_offer_period` key, the user is not eligible for a free trial or introductory price within that subscription group.
   */
  is_trial_period?: 'true' | 'false';

  /**
   * For an auto-renewable subscription, whether or not it is in the introductory price period.
   *
   * This key is only present for auto-renewable subscription receipts. The value for this key is `"true"` if the customer’s subscription is currently in an introductory price period, or `"false"` if not.
   *
   * **Note:** If a previous subscription period in the receipt has the value “true” for either the `is_trial_period` or the `is_in_intro_offer_period` key, the user is not eligible for a free trial or introductory price within that subscription group.
   */
  is_in_intro_offer_period?: 'true' | 'false';

  /**
   * For a transaction that was canceled by Apple customer support, the time and date of the cancellation. For an auto-renewable subscription plan that was upgraded, the time and date of the upgrade transaction. Interpreted as an RFC 3339 date.
   *
   * Treat a canceled receipt the same as if no purchase had ever been made.
   *
   * **Note:** A canceled in-app purchase remains in the receipt indefinitely. Only applicable if the refund was for a non-consumable product, an auto-renewable subscription, a non-renewing subscription, or for a free subscription.
   */
  cancellation_date?: string;

  /**
   * For a transaction that was canceled, the reason for cancellation.
   *
   * Use this value along with the cancellation date to identify possible issues in your app that may lead customers to contact Apple customer support.
   */
  cancellation_reason?: CancellationReason;

  /**
   * A string that the App Store uses to uniquely identify the application that created the transaction.
   *
   * If your server supports multiple applications, you can use this value to differentiate between them.
   *
   * Apps are assigned an identifier only in the production environment, so this key is not present for receipts created in the test environment.
   *
   * This field is not present for Mac apps.
   *
   * See also [Bundle Identifier](https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ReceiptFields.html#//apple_ref/doc/uid/TP40010573-CH106-SW3).
   */
  app_item_id?: string;

  /**
   * An arbitrary number that uniquely identifies a revision of your application.
   *
   * This key is not present for receipts created in the test environment. Use this value to identify the version of the app that the customer bought.
   */
  version_external_identifier?: string;

  /**
   * The primary key for identifying subscription purchases.
   *
   * This value is a unique ID that identifies purchase events across devices, including subscription renewal purchase events.
   */
  web_order_line_item_id: string;

  /**
   * The current renewal status for the auto-renewable subscription.
   *
   * This key is only present for auto-renewable subscription receipts, for active or expired subscriptions. The value for this key should not be interpreted as the customer’s subscription status. You can use this value to display an alternative subscription product in your app, for example, a lower level subscription plan that the customer can downgrade to from their current plan.
   */
  auto_renew_status?: SubscriptionAutoRenewStatus;

  /**
   * The current renewal preference for the auto-renewable subscription.
   *
   * This key is only present for auto-renewable subscription receipts. The value for this key corresponds to the `productIdentifier` property of the product that the customer’s subscription renews. You can use this value to present an alternative service level to the customer before the current subscription period ends.
   */
  auto_renew_product_id?: string;

  /**
   * The current price consent status for a subscription price increase.
   *
   * This key is only present for auto-renewable subscription receipts if the subscription price was increased without keeping the existing price for active subscribers. You can use this value to track customer adoption of the new price and take appropriate action.
   */
  price_consent_status?: SubscriptionPriceConsentStatus;
}

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

export enum IAPErrorCode {
  E_UNKNOWN = 'E_UNKNOWN',
  E_USER_CANCELLED = 'E_USER_CANCELLED',
  E_USER_ERROR = 'E_USER_ERROR',
  E_ITEM_UNAVAILABLE = 'E_ITEM_UNAVAILABLE',
  E_REMOTE_ERROR = 'E_REMOTE_ERROR',
  E_NETWORK_ERROR = 'E_NETWORK_ERROR',
  E_SERVICE_ERROR = 'E_SERVICE_ERROR',
  E_RECEIPT_FAILED = 'E_RECEIPT_FAILED',
  E_RECEIPT_FINISHED_FAILED = 'E_RECEIPT_FINISHED_FAILED',
  E_NOT_PREPARED = 'E_NOT_PREPARED',
  E_NOT_ENDED = 'E_NOT_ENDED',
  E_ALREADY_OWNED = 'E_ALREADY_OWNED',
  E_DEVELOPER_ERROR = 'E_DEVELOPER_ERROR',
  E_BILLING_RESPONSE_JSON_PARSE_ERROR = 'E_BILLING_RESPONSE_JSON_PARSE_ERROR',
  E_DEFERRED_PAYMENT = 'E_DEFERRED_PAYMENT',
}

export interface PurchaseError {
  responseCode?: number;
  debugMessage?: string;
  code?: IAPErrorCode;
  message?: string;
  productId?: string;
}

export class IAPPurchaseError implements PurchaseError {
  constructor(
    public responseCode?: PurchaseError['responseCode'],
    public debugMessage?: PurchaseError['debugMessage'],
    public code?: PurchaseError['code'],
    public message?: PurchaseError['message'],
    public productId?: PurchaseError['productId'],
  ) {
    this.responseCode = responseCode;
    this.debugMessage = debugMessage;
    this.code = code;
    this.message = message;
    this.productId = productId;
  }
}

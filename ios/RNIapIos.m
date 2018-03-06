#import "RNIapIos.h"

#import <React/RCTLog.h>
#import <React/RCTConvert.h>

#import <StoreKit/StoreKit.h>

////////////////////////////////////////////////////     _//////////_  // Private Members
@interface RNIapIos() {
  NSMutableDictionary *promisesByKey;
}
@end

////////////////////////////////////////////////////     _//////////_  // Implementation
@implementation RNIapIos

-(instancetype)init {
  if ((self = [super init])) {
    promisesByKey = [NSMutableDictionary dictionary];
    [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
  }
  return self;
}

-(void) dealloc {
  [[SKPaymentQueue defaultQueue] removeTransactionObserver:self];
}

-(void)addPromiseForKey:(NSString*)key
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  NSMutableArray* promises = [promisesByKey valueForKey:key];

  if (promises == nil) {
    promises = [NSMutableArray array];
    [promisesByKey setValue:promises forKey:key];
  }

  [promises addObject:@[resolve, reject]];
}

-(void)resolvePromisesForKey:(NSString*)key value:(id)value {
  NSMutableArray* promises = [promisesByKey valueForKey:key];

  if (promises != nil) {
    for (NSMutableArray *tuple in promises) {
      RCTPromiseResolveBlock resolve = tuple[0];
      resolve(value);
    }
    [promisesByKey removeObjectForKey:key];
  }
}

-(void)rejectPromisesForKey:(NSString*)key code:(NSString*)code message:(NSString*)message error:(NSError*) error {
  NSMutableArray* promises = [promisesByKey valueForKey:key];

  if (promises != nil) {
    for (NSMutableArray *tuple in promises) {
      RCTPromiseRejectBlock reject = tuple[1];
      reject(code, message, error);
    }
    [promisesByKey removeObjectForKey:key];
  }
}

////////////////////////////////////////////////////     _//////////_//      EXPORT_MODULE
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getItems:(NSArray*)skus
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
  NSSet* productIdentifiers = [NSSet setWithArray:skus];
  productsRequest = [[SKProductsRequest alloc] initWithProductIdentifiers:productIdentifiers];
  productsRequest.delegate = self;
  NSString* key = RCTKeyForInstance(productsRequest);
  [self addPromiseForKey:key resolve:resolve reject:reject];
  [productsRequest start];
}

RCT_EXPORT_METHOD(getAvailableItems:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
  [self addPromiseForKey:@"availableItems" resolve:resolve reject:reject];
  [[SKPaymentQueue defaultQueue] restoreCompletedTransactions];
}

RCT_EXPORT_METHOD(buyProduct:(NSString*)sku
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
  SKProduct *product;
  for (SKProduct *p in validProducts) {
    if([sku isEqualToString:p.productIdentifier]) {
      product = p;
      break;
    }
  }

  if (product) {
    SKMutablePayment *payment = [SKMutablePayment paymentWithProduct:product];
    [[SKPaymentQueue defaultQueue] addPayment:payment];
    [self addPromiseForKey:RCTKeyForInstance(payment.productIdentifier) resolve:resolve reject:reject];
  } else {
    reject(@"E_DEVELOPER_ERROR", @"Invalid product ID.", nil);
  }
}

#pragma mark ===== StoreKit Delegate

-(void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response {
  validProducts = response.products;
  NSMutableArray* items = [NSMutableArray array];

  for (SKProduct* product in validProducts) {
    [items addObject:[self getProductObject:product]];
  }

  [self resolvePromisesForKey:RCTKeyForInstance(request) value:items];
}

-(void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions {
  for (SKPaymentTransaction *transaction in transactions) {
    switch (transaction.transactionState) {
      case SKPaymentTransactionStatePurchasing:
        NSLog(@"\n\n Purchase Started !! \n\n");
        break;
      case SKPaymentTransactionStatePurchased:
        NSLog(@"\n\n\n\n\n Purchase Successful !! \n\n\n\n\n.");
        [self purchaseProcess:transaction];
        break;
      case SKPaymentTransactionStateRestored: // 기존 구매한 아이템 복구..
        NSLog(@"Restored ");
        [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
        break;
      case SKPaymentTransactionStateDeferred:
        NSLog(@"Deferred (awaiting approval via parental controls, etc.)");
        break;
      case SKPaymentTransactionStateFailed:
        NSLog(@"\n\n\n\n\n\n Purchase Failed  !! \n\n\n\n\n");
        [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
        NSString *key = RCTKeyForInstance(transaction.payment.productIdentifier);
        [self rejectPromisesForKey:key code:[self standardErrorCode:transaction.error.code] message:[self englishErrorCodeDescription:(int)transaction.error.code] error:transaction.error];
        break;
    }
  }
}

-(void)paymentQueueRestoreCompletedTransactionsFinished:(SKPaymentQueue *)queue {  ////////   RESTORE
  NSLog(@"\n\n\n  paymentQueueRestoreCompletedTransactionsFinished  \n\n.");
  NSMutableArray* items = [NSMutableArray arrayWithCapacity:queue.transactions.count];

  for(SKPaymentTransaction *transaction in queue.transactions) {
    if(transaction.transactionState == SKPaymentTransactionStateRestored) {
      NSDictionary *restored = [self getPurchaseData:transaction];
      [items addObject:restored];
      [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
    }
  }

  [self resolvePromisesForKey:@"availableItems" value:items];
}

-(void)paymentQueue:(SKPaymentQueue *)queue restoreCompletedTransactionsFailedWithError:(NSError *)error {
  [self rejectPromisesForKey:@"availableItems" code:[self standardErrorCode:error.code] message:[self englishErrorCodeDescription:(int)error.code] error:error];
    NSLog(@"\n\n\n restoreCompletedTransactionsFailedWithError \n\n.");
}

-(void)purchaseProcess:(SKPaymentTransaction *)transaction {
  [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
  NSURL *receiptUrl = [[NSBundle mainBundle] appStoreReceiptURL];

  NSString *receipt = nil;
  if ([[NSFileManager defaultManager] fileExistsAtPath:[receiptUrl path]]) {
    NSData *receiptData = [NSData dataWithContentsOfURL:receiptUrl];
    receipt = [receiptData base64EncodedStringWithOptions:0];

    NSLog(@"\n\n Purchasing : receipt : %@  \n\n", receipt);
  } else {
    NSLog(@"iOS 7 AppReceipt not found, refreshing...");
    //          SKReceiptRefreshRequest *refreshReceiptRequest = [[SKReceiptRefreshRequest alloc] initWithReceiptProperties:@{}];
    //          refreshReceiptRequest.delegate = self;
    //          [refreshReceiptRequest start];
  }

  [self resolvePromisesForKey:RCTKeyForInstance(transaction.payment.productIdentifier) value:receipt];
}

-(NSString *)standardErrorCode:(int)code {
  NSArray *descriptions = @[
    @"E_UNKNOWN",
    @"E_SERVICE_ERROR",
    @"E_USER_CANCELLED",
    @"E_USER_ERROR",
    @"E_USER_ERROR",
    @"E_ITEM_UNAVAILABLE",
    @"E_REMOTE_ERROR",
    @"E_NETWORK_ERROR",
    @"E_SERVICE_ERROR"
  ];

  if (code > descriptions.count - 1) {
    return descriptions[0];
  }
  return descriptions[code];
}

-(NSString *)englishErrorCodeDescription:(int)code {
  NSArray *descriptions = @[
    @"An unknown or unexpected error has occured. Please try again later.",
    @"Unable to process the transaction: your device is not allowed to make purchases.",
    @"Cancelled.",
    @"Oops! Payment information invalid. Did you enter your password correctly?",
    @"Payment is not allowed on this device. If you are the one authorized to make purchases on this device, you can turn payments on in Settings.",
    @"Sorry, but this product is currently not available in the store.",
    @"Unable to make purchase: Cloud service permission denied.",
    @"Unable to process transaction: Your internet connection isn't stable! Try again later.",
    @"Unable to process transaction: Cloud service revoked."
  ];

  if (code > descriptions.count - 1) {
    return descriptions[0];
  }
  return descriptions[code];
}

-(NSDictionary*)getProductObject:(SKProduct *)product {
  NSNumberFormatter *formatter = [[NSNumberFormatter alloc] init];
  formatter.numberStyle = NSNumberFormatterCurrencyStyle;
  formatter.locale = product.priceLocale;
  NSString *localizedPrice = [formatter stringFromNumber:product.price];

  NSString* itemType = @"iap";
  NSString* currencyCode = nil;

  if (@available(iOS 11.2, *)) {
    itemType = product.subscriptionPeriod ? @"sub" : @"iap";
  }

  if (@available(iOS 10.0, *)) {
    currencyCode = product.priceLocale.currencyCode;
  }

  return @{
    @"productId" : product.productIdentifier,
    @"price" : [product.price stringValue],
    @"currency" : currencyCode,
    @"type": itemType,
    @"title" : product.localizedTitle,
    @"description" : product.localizedDescription,
    @"localizedPrice" : localizedPrice
  };
}


- (NSDictionary *)getPurchaseData:(SKPaymentTransaction *)transaction {
  NSData *receiptData;
  if (NSFoundationVersionNumber >= NSFoundationVersionNumber_iOS_7_0) {
    receiptData = [NSData dataWithContentsOfURL:[[NSBundle mainBundle] appStoreReceiptURL]];
  } else {
    receiptData = [transaction transactionReceipt];
  }

  NSMutableDictionary *purchase = [NSMutableDictionary dictionaryWithDictionary: @{
    @"transactionDate": @(transaction.transactionDate.timeIntervalSince1970 * 1000),
    @"transactionId": transaction.transactionIdentifier,
    @"productId": transaction.payment.productIdentifier,
    @"transactionReceipt":[receiptData base64EncodedStringWithOptions:0]
  }];
  // originalTransaction is available for restore purchase and purchase of cancelled/expired subscriptions
  SKPaymentTransaction *originalTransaction = transaction.originalTransaction;
  if (originalTransaction) {
    purchase[@"originalTransactionDate"] = @(originalTransaction.transactionDate.timeIntervalSince1970 * 1000);
    purchase[@"originalTransactionIdentifier"] = originalTransaction.transactionIdentifier;
  }

  return purchase;
}

static NSString *RCTKeyForInstance(id instance)
{
    return [NSString stringWithFormat:@"%p", instance];
}

@end

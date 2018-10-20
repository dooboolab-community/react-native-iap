#import "RNIapIos.h"

#import <React/RCTLog.h>
#import <React/RCTConvert.h>

#import <StoreKit/StoreKit.h>

////////////////////////////////////////////////////     _//////////_  // Private Members
@interface RNIapIos() {
  NSMutableDictionary *promisesByKey;
  BOOL autoReceiptConform;
  SKPaymentTransaction *currentTransaction;
  dispatch_queue_t myQueue;
}
@end

////////////////////////////////////////////////////     _//////////_  // Implementation
@implementation RNIapIos

-(instancetype)init {
  if ((self = [super init])) {
    promisesByKey = [NSMutableDictionary dictionary];
    [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
  }
  myQueue = dispatch_queue_create("reject", DISPATCH_QUEUE_SERIAL);
  validProducts = [NSMutableArray array];
  return self;
}

-(void) dealloc {
  [[SKPaymentQueue defaultQueue] removeTransactionObserver:self];
}

+(BOOL)requiresMainQueueSetup {
  return YES;
}

-(void)addPromiseForKey:(NSString*)key resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
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
      RCTPromiseResolveBlock resolveBlck = tuple[0];
      resolveBlck(value);
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

RCT_EXPORT_METHOD(canMakePayments:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    BOOL canMakePayments = [SKPaymentQueue canMakePayments];
    NSString* str = canMakePayments ? @"true" : @"false";
    resolve(str);
}

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
  autoReceiptConform = true;
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

RCT_EXPORT_METHOD(buyProductWithQuantityIOS:(NSString*)sku
                  quantity:(NSInteger*)quantity
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
  NSLog(@"\n\n\n  buyProductWithQuantityIOS  \n\n.");
  autoReceiptConform = true;
  SKProduct *product;
  for (SKProduct *p in validProducts) {
    if([sku isEqualToString:p.productIdentifier]) {
      product = p;
      break;
    }
  }
  if (product) {
    SKMutablePayment *payment = [SKMutablePayment paymentWithProduct:product];
    payment.quantity = quantity;
    [[SKPaymentQueue defaultQueue] addPayment:payment];
    [self addPromiseForKey:RCTKeyForInstance(payment.productIdentifier) resolve:resolve reject:reject];
  } else {
    reject(@"E_DEVELOPER_ERROR", @"Invalid product ID.", nil);
  }
}

RCT_EXPORT_METHOD(buyProductWithoutAutoConfirm:(NSString*)sku
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
  NSLog(@"\n\n\n  buyProductWithoutAutoConfirm  \n\n.");
  autoReceiptConform = false;
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

RCT_EXPORT_METHOD(finishTransaction) {
  NSLog(@"\n\n\n  finish Transaction  \n\n.");
  if (currentTransaction) {
    [[SKPaymentQueue defaultQueue] finishTransaction:currentTransaction];
  }
  currentTransaction = nil;
}

RCT_EXPORT_METHOD(clearTransaction) {
  NSArray *pendingTrans = [[SKPaymentQueue defaultQueue] transactions];
  NSLog(@"\n\n\n  ***  clear remaining Transactions. Call this before make a new transaction   \n\n.");
  for (int k = 0; k < pendingTrans.count; k++) {
    [[SKPaymentQueue defaultQueue] finishTransaction:pendingTrans[k]];
  }
}

RCT_EXPORT_METHOD(clearProducts) {
  NSLog(@"\n\n\n  ***  clear valid products. \n\n.");
  [validProducts removeAllObjects];
}

#pragma mark ===== StoreKit Delegate

-(void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response {
  // validProducts = response.products; // do not set directly. use addProduct methods.
  for (SKProduct* prod in response.products) {
    [self addProduct:prod];
  }
  NSMutableArray* items = [NSMutableArray array];

  for (SKProduct* product in validProducts) {
    [items addObject:[self getProductObject:product]];
  }

  [self resolvePromisesForKey:RCTKeyForInstance(request) value:items];
}

// Add to valid products from Apple server response. Allowing getProducts, getSubscriptions call several times.
// Doesn't allow duplication. Replace new product.
-(void)addProduct:(SKProduct *)aProd {
  NSLog(@"\n  Add new object : %@", aProd.productIdentifier);
  int delTar = -1;
  for (int k = 0; k < validProducts.count; k++) {
    SKProduct *cur = validProducts[k];
    if ([cur.productIdentifier isEqualToString:aProd.productIdentifier]) {
      delTar = k;
    }
  }
  if (delTar >= 0) {
    [validProducts removeObjectAtIndex:delTar];
  }
  [validProducts addObject:aProd];
}

- (void)request:(SKRequest *)request didFailWithError:(NSError *)error{
  NSString* key = RCTKeyForInstance(productsRequest);
  dispatch_sync(myQueue, ^{
    [self rejectPromisesForKey:key code:[self standardErrorCode:(int)error.code]
                       message:error.localizedDescription error:error];
  });
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
        dispatch_sync(myQueue, ^{
          [self rejectPromisesForKey:key code:[self standardErrorCode:(int)transaction.error.code]
                             message:transaction.error.localizedDescription
                               error:transaction.error];
        });
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
  dispatch_sync(myQueue, ^{
    [self rejectPromisesForKey:@"availableItems" code:[self standardErrorCode:(int)error.code]
                       message:error.localizedDescription error:error];
  });
  NSLog(@"\n\n\n restoreCompletedTransactionsFailedWithError \n\n.");
}

-(void)purchaseProcess:(SKPaymentTransaction *)transaction {
  if (autoReceiptConform) {
    [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
    currentTransaction = nil;
  } else {
    currentTransaction = transaction;
  }
  NSURL *receiptUrl = [[NSBundle mainBundle] appStoreReceiptURL];
  NSDictionary* purchase = [self getPurchaseData:transaction];
  [self resolvePromisesForKey:RCTKeyForInstance(transaction.payment.productIdentifier) value:purchase];
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

-(NSDictionary*)getProductObject:(SKProduct *)product {
  NSNumberFormatter *formatter = [[NSNumberFormatter alloc] init];
  formatter.numberStyle = NSNumberFormatterCurrencyStyle;
  formatter.locale = product.priceLocale;
	
  NSString* localizedPrice = [formatter stringFromNumber:product.price];
  NSString* introductoryPrice = localizedPrice;
	
  NSString* introductoryPricePaymentMode = @"";
  NSString* introductoryPriceNumberOfPeriods = @"";
  NSString* introductoryPriceSubscriptionPeriod = @"";
	
  NSString* currencyCode = @"";
  NSString* periodNumberIOS = @"0";
  NSString* periodUnitIOS = @"";

  NSString* itemType = @"Do not use this. It returned sub only before";

  if (@available(iOS 11.2, *)) {
    // itemType = product.subscriptionPeriod ? @"sub" : @"iap";
    unsigned long numOfUnits = (unsigned long) product.subscriptionPeriod.numberOfUnits;
    SKProductPeriodUnit unit = product.subscriptionPeriod.unit;

    if (unit == SKProductPeriodUnitYear) {
        periodUnitIOS = @"YEAR";
    } else if (unit == SKProductPeriodUnitMonth) {
        periodUnitIOS = @"MONTH";
    } else if (unit == SKProductPeriodUnitWeek) {
        periodUnitIOS = @"WEEK";
    } else if (unit == SKProductPeriodUnitDay) {
        periodUnitIOS = @"DAY";
    }

    periodNumberIOS = [NSString stringWithFormat:@"%lu", numOfUnits];

    // subscriptionPeriod = product.subscriptionPeriod ? [product.subscriptionPeriod stringValue] : @"";
    //introductoryPrice = product.introductoryPrice != nil ? [NSString stringWithFormat:@"%@", product.introductoryPrice] : @"";
    if (product.introductoryPrice != nil) {
      
      //SKProductDiscount introductoryPriceObj = product.introductoryPrice;
      formatter.locale = product.introductoryPrice.priceLocale;
      introductoryPrice = [formatter stringFromNumber:product.introductoryPrice.price];
      
      switch (product.introductoryPrice.paymentMode) {
        case SKProductDiscountPaymentModeFreeTrial:
          introductoryPricePaymentMode = @"FREETRIAL";
          break;
        case SKProductDiscountPaymentModePayAsYouGo:
          introductoryPricePaymentMode = @"PAYASYOUGO";
          break;
        case SKProductDiscountPaymentModePayUpFront:
          introductoryPricePaymentMode = @"PAYUPFRONT";
          break;
        default:
          introductoryPricePaymentMode = @"";
          break;
      }
      
      introductoryPriceNumberOfPeriods = [@(product.introductoryPrice.numberOfPeriods) stringValue];
      
      if (product.introductoryPrice.subscriptionPeriod.unit == SKProductPeriodUnitDay) {
        introductoryPriceSubscriptionPeriod = @"DAY";
      }	else if (product.introductoryPrice.subscriptionPeriod.unit == SKProductPeriodUnitWeek) {
        introductoryPriceSubscriptionPeriod = @"WEEK";
      }	else if (product.introductoryPrice.subscriptionPeriod.unit == SKProductPeriodUnitMonth) {
        introductoryPriceSubscriptionPeriod = @"MONTH";
      } else if (product.introductoryPrice.subscriptionPeriod.unit == SKProductPeriodUnitYear) {
        introductoryPriceSubscriptionPeriod = @"YEAR";
      } else {
        introductoryPriceSubscriptionPeriod = @"";
      }
      
    } else {
      introductoryPrice = @"";
      introductoryPricePaymentMode = @"";
      introductoryPriceNumberOfPeriods = @"";
      introductoryPriceSubscriptionPeriod = @"";
    }
  }

  if (@available(iOS 10.0, *)) {
    currencyCode = product.priceLocale.currencyCode;
  }

  return @{
    @"productId" : product.productIdentifier,
    @"price" : [product.price stringValue],
    @"currency" : currencyCode,
    @"type": itemType,
    @"title" : product.localizedTitle ? product.localizedTitle : @"",
    @"description" : product.localizedDescription ? product.localizedDescription : @"",
    @"localizedPrice" : localizedPrice,
    @"subscriptionPeriodNumberIOS" : periodNumberIOS,
    @"subscriptionPeriodUnitIOS" : periodUnitIOS,
    @"introductoryPrice" : introductoryPrice,
    @"introductoryPricePaymentModeIOS" : introductoryPricePaymentMode,
    @"introductoryPriceNumberOfPeriodsIOS" : introductoryPriceNumberOfPeriods,
    @"introductoryPriceSubscriptionPeriodIOS" : introductoryPriceSubscriptionPeriod
  };
}

- (NSDictionary *)getPurchaseData:(SKPaymentTransaction *)transaction {
  NSData *receiptData;
  if (NSFoundationVersionNumber >= NSFoundationVersionNumber_iOS_7_0) {
    receiptData = [NSData dataWithContentsOfURL:[[NSBundle mainBundle] appStoreReceiptURL]];
  } else {
    receiptData = [transaction transactionReceipt];
  }
  
  if (receiptData == nil) return nil;

  NSMutableDictionary *purchase = [NSMutableDictionary dictionaryWithDictionary: @{
    @"transactionDate": @(transaction.transactionDate.timeIntervalSince1970 * 1000),
    @"transactionId": transaction.transactionIdentifier,
    @"productId": transaction.payment.productIdentifier,
    @"transactionReceipt":[receiptData base64EncodedStringWithOptions:0]
  }];
  // originalTransaction is available for restore purchase and purchase of cancelled/expired subscriptions
  SKPaymentTransaction *originalTransaction = transaction.originalTransaction;
  if (originalTransaction) {
    purchase[@"originalTransactionDateIOS"] = @(originalTransaction.transactionDate.timeIntervalSince1970 * 1000);
    purchase[@"originalTransactionIdentifierIOS"] = originalTransaction.transactionIdentifier;
  }

  return purchase;
}

static NSString *RCTKeyForInstance(id instance)
{
    return [NSString stringWithFormat:@"%p", instance];
}

@end

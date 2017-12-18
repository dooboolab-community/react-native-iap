
#import "RNIapIos.h"

#import <React/RCTLog.h>
#import <React/RCTConvert.h>

#import <StoreKit/StoreKit.h>

////////////////////////////////////////////////////     _//////////_  // Private Members
@interface RNIapIos() {
  RCTResponseSenderBlock purchaseCallback;
  RCTResponseSenderBlock productListCB;
  RCTResponseSenderBlock historyCB;

  int cnt;

  NSString * productID;
}
@end

////////////////////////////////////////////////////     _//////////_  // Implementation
@implementation RNIapIos

-(instancetype)init {
  self = [super init];
  [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
  return self;
}

-(void) dealloc {
    [[SKPaymentQueue defaultQueue] removeTransactionObserver:self];
}


////////////////////////////////////////////////////     _//////////_//      EXPORT_MODULE
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(fetchHistory:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"\n\n\n\n Obj c >> InAppPurchase  :: fetchHistory \n\n\n\n .");

  historyCB = callback;

  SKReceiptRefreshRequest *request = [[SKReceiptRefreshRequest alloc] init];
  request.delegate = self;
  [request start];
}

RCT_EXPORT_METHOD(fetchProducts:(NSString *)prodJsonArray callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"\n\n\n\n Obj c >> InAppPurchase  :: fetchProducts \n\n\n\n .");
  productListCB = callback;
  // Parsing...
  NSData* data = [prodJsonArray dataUsingEncoding:NSUTF8StringEncoding];
  NSArray *arrProd = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableContainers error:nil];
  NSLog(@"   Obj c >> InAppPurchase  :: fetchProducts  >>  arrProd parsed as follows  ... %@", arrProd);
  NSSet * productIdentifiers = [NSSet setWithObject:arrProd[0]];
  for (int k = 0; k < arrProd.count; k++) {
    productIdentifiers = [productIdentifiers setByAddingObject:arrProd[k]];
  }
  productsRequest = [[SKProductsRequest alloc] initWithProductIdentifiers:productIdentifiers];
  productsRequest.delegate = self;
  [productsRequest start];
}

// RCT_EXPORT_METHOD(login:(NSString *)keyJson callback:(RCTResponseSenderBlock)callback) {
RCT_EXPORT_METHOD(purchaseItem:(NSString *)productID callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"\n\n\n\n Obj c >> InAppPurchase  :: purchaseItem :: %@    Valid Product : %ld  \n\n\n\n .", productID, (unsigned long)validProducts.count);
  purchaseCallback = callback;

  for (int k = 0; k < validProducts.count; k++) {
    SKProduct *theProd = [validProducts objectAtIndex:k];
    if ([productID isEqualToString:theProd.productIdentifier]) {
      NSLog(@"\n\n\n Obj c >> InAppPurchase  :: purchaseItem :: Product Found  \n\n\n.");
      SKPayment *payment = [SKPayment paymentWithProduct:theProd];
      [[SKPaymentQueue defaultQueue] addPayment:payment];
      return;
    }
  }
}

// hyochan add
RCT_EXPORT_METHOD(purchaseSubscribeItem:(NSString *)productID callback:(RCTResponseSenderBlock)callback) {
    RCTLogInfo(@"\n\n\n\n Obj c >> InAppPurchase  :: purchaseItem :: %@    Valid Product : %ld  \n\n\n\n .", productID, (unsigned long)validProducts.count);
    purchaseCallback = callback;

    for (int k = 0; k < validProducts.count; k++) {
        SKProduct *theProd = [validProducts objectAtIndex:k];
        if ([productID isEqualToString:theProd.productIdentifier]) {
            NSLog(@"\n\n\n Obj c >> InAppPurchase  :: purchaseItem :: Product Found  \n\n\n.");
            SKPayment *payment = [SKPayment paymentWithProduct:theProd];
            [[SKPaymentQueue defaultQueue] addPayment:payment];
            return;
        }
    }
}

#pragma mark ===== StoreKit Delegate

-(void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response {
  validProducts = response.products;
  long count = [validProducts count];
  NSLog(@"\n\n\n Obj c >> InAppPurchase   ###  didReceiveResponse :: Valid Product Count ::  %ld", count);

  if (count == 0) {
    productListCB(@[@"No Valid Product returned !!", [NSNull null]]);
    return;
  }

  NSError * err;
  NSMutableArray *ids = [NSMutableArray arrayWithCapacity: count];
  // Valid Product .. send callback.
  for (int k = 0; k < count; k++) {
    SKProduct *theProd = [validProducts objectAtIndex:k];
    NSDictionary *dic = @{ @"productId" : theProd.productIdentifier, @"price" : theProd.price,
                           @"currency" : theProd.priceLocale.currencyCode };
    NSData * jsonData = [NSJSONSerialization dataWithJSONObject:dic options:0 error:&err];
    NSString * myString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];

    [ids addObject:myString];

    NSLog(@"\n\n\n Obj c >> InAppPurchase   ###  didReceiveResponse  유효 상품 Id : %@", theProd.productIdentifier);
  }
  NSLog(@"  xxx  %@", ids);
  if(productListCB) productListCB(@[[NSNull null], ids]);
  productListCB = nil;
}


-(void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions {

  historyCB(@[[NSNull null], transactions]);

  for (SKPaymentTransaction *transaction in transactions) {
    switch (transaction.transactionState) {
      case SKPaymentTransactionStatePurchasing:
        NSLog(@"\n\n Purchase Started !! \n\n");
        break;
      case SKPaymentTransactionStatePurchased:
        NSLog(@"\n\n\n\n\n Purchase  OK !! \n\n\n\n\n.");
        [self purchaseProcess:transaction];
        break;
      case SKPaymentTransactionStateRestored:
        NSLog(@"Restored ");
        [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
        break;
      case SKPaymentTransactionStateFailed:
        NSLog(@"\n\n\n\n\n\n Purchase Failed  !! \n\n\n\n\n");
        [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
        // if (purchaseCallback) purchaseCallback(@[@"Purchase Failed !!"]);
        break;
      default:
        NSLog(@" default case ...   error  ... ");
        break;
    }
  }
}

-(void)paymentQueueRestoreCompletedTransactionsFinished:(SKPaymentQueue *)queue {
  NSLog(@"  paymentQueueRestoreCompletedTransactionsFinished  ");
}

-(void)purchaseProcess:(SKPaymentTransaction *)trans {
  NSURL *receiptUrl = [[NSBundle mainBundle] appStoreReceiptURL];

  if ([[NSFileManager defaultManager] fileExistsAtPath:[receiptUrl path]]) {
    NSData *rcptData = [NSData dataWithContentsOfURL:receiptUrl];
    NSString *rcptStr = [rcptData base64EncodedStringWithOptions:0];
    if(purchaseCallback && rcptStr != NULL) {
      purchaseCallback(@[[NSNull null], rcptStr]);
      purchaseCallback = nil;
    }
    [[SKPaymentQueue defaultQueue] finishTransaction:trans];
    NSLog(@"\n\n Purchasing : receipt : %@  \n\n", rcptStr);
  } else {
    NSLog(@"iOS 7 AppReceipt not found, refreshing...");
    //          SKReceiptRefreshRequest *refreshReceiptRequest = [[SKReceiptRefreshRequest alloc] initWithReceiptProperties:@{}];
    //          refreshReceiptRequest.delegate = self;
    //          [refreshReceiptRequest start];
  }

}


@end

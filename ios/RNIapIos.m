
#import "RNIapIos.h"

#import <React/RCTLog.h>
#import <React/RCTConvert.h>

#import <StoreKit/StoreKit.h>

////////////////////////////////////////////////////     _//////////_  // Private Members
@interface RNIapIos() {
  RCTResponseSenderBlock purchaseCallback;
  RCTResponseSenderBlock productListCB;
  
  NSString * productID;
}
@end

////////////////////////////////////////////////////     _//////////_  // Implementation
@implementation RNIapIos


////////////////////////////////////////////////////     _//////////_//      EXPORT_MODULE
RCT_EXPORT_MODULE();

////////////////////////////////////////////////////_  상품 구매
// RCT_EXPORT_METHOD(login:(NSString *)keyJson callback:(RCTResponseSenderBlock)callback) {
RCT_EXPORT_METHOD(purchaseItem:(NSString *)keyJson callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"\n\n\n\n Obj c >> InAppPurchase  :: purchaseItem \n\n\n\n .");
  purchaseCallback = callback;
  
  NSData *jsonData = [keyJson dataUsingEncoding:NSUTF8StringEncoding];
  NSError *e;
  NSDictionary *keyObj = [NSJSONSerialization JSONObjectWithData:jsonData options:nil error:&e];
  
  NSString* name = [keyObj objectForKey:@"name"];
  NSLog(@"\n InAppPurchase name ::  %@", name);
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


#pragma mark ===== StoreKit Delegate

-(void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions {
  for (SKPaymentTransaction *transaction in transactions) {
    NSData *newReceipt = transaction.transactionReceipt;
    
    switch (transaction.transactionState) {
      case SKPaymentTransactionStatePurchasing:
        break;
      case SKPaymentTransactionStatePurchased:
        NSLog(@"Purchasing : receipt : %@", transaction.transactionReceipt);
        //        if ([transaction.payment.productIdentifier
        //             isEqualToString:productID]) {
        //          NSLog(@"Purchased ");
        //          UIAlertView *alertView = [[UIAlertView alloc]initWithTitle:
        //                                    @"Purchase is completed succesfully" message:nil delegate:
        //                                    self cancelButtonTitle:@"Ok" otherButtonTitles: nil];
        //          [alertView show];
        //        }
        [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
        break;
      case SKPaymentTransactionStateRestored:
        NSLog(@"Restored ");
        [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
        break;
      case SKPaymentTransactionStateFailed:
        NSLog(@"Purchase failed ");
        break;
      default:
        break;
    }
  }
}


-(void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response
{
  validProducts = response.products;
  long count = [validProducts count];
  NSLog(@"\n\n\n Obj c >> InAppPurchase   ###  didReceiveResponse :: Valid Product Count ::  %ld", count);
  
  if (count == 0) {
    productListCB(@[@"No Valid Product returned !!", [NSNull null]]);
    return;
  }
  
  NSMutableArray *ids = [NSMutableArray arrayWithCapacity: count];
  // Valid Product .. send callback.
  for (int k = 0; k < count; k++) {
    SKProduct *theProd = [validProducts objectAtIndex:k];
    [ids addObject:theProd.productIdentifier];
    NSLog(@"\n\n\n Obj c >> InAppPurchase   ###  didReceiveResponse  유효 상품 Id : %@", theProd.productIdentifier);
  }
  NSLog(@"  xxx  %@", ids);
  if(productListCB) productListCB(@[[NSNull null], ids]);
  productListCB = nil;
}

@end

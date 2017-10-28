
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

RCT_EXPORT_METHOD(fetchProducts:(NSString *)prodID callback:(RCTResponseSenderBlock)callback) {
  productID = prodID;
  productListCB = callback;
  [self fetchAvailableProducts];
}

-(void)fetchAvailableProducts {
  NSLog(@"\n\n\n\n Obj c >> InAppPurchase  :: fetchAvailableProducts \n\n\n\n .");
  
  NSSet *productIdentifiers = [NSSet setWithObjects:productID,nil];
  productsRequest = [[SKProductsRequest alloc]
                     initWithProductIdentifiers:productIdentifiers];
  productsRequest.delegate = self;
  [productsRequest start];
}



#pragma mark ===== StoreKit Delegate

-(void)paymentQueue:(SKPaymentQueue *)queue
updatedTransactions:(NSArray *)transactions {
  for (SKPaymentTransaction *transaction in transactions) {
    switch (transaction.transactionState) {
      case SKPaymentTransactionStatePurchasing:
        NSLog(@"Purchasing");
        break;
      case SKPaymentTransactionStatePurchased:
        if ([transaction.payment.productIdentifier
             isEqualToString:productID]) {
          NSLog(@"Purchased ");
          UIAlertView *alertView = [[UIAlertView alloc]initWithTitle:
                                    @"Purchase is completed succesfully" message:nil delegate:
                                    self cancelButtonTitle:@"Ok" otherButtonTitles: nil];
          [alertView show];
        }
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


-(void)productsRequest:(SKProductsRequest *)request
    didReceiveResponse:(SKProductsResponse *)response
{
  SKProduct *validProduct = nil;
  int count = [response.products count];
  if (count>0) {
    validProducts = response.products;
    validProduct = [response.products objectAtIndex:0];
    if ([validProduct.productIdentifier
         isEqualToString:productID]) {
      [productTitleLabel setText:[NSString stringWithFormat:
                                  @"Product Title: %@",validProduct.localizedTitle]];
      [productDescriptionLabel setText:[NSString stringWithFormat:
                                        @"Product Desc: %@",validProduct.localizedDescription]];
      [productPriceLabel setText:[NSString stringWithFormat:
                                  @"Product Price: %@",validProduct.price]];
    }
  } else {
    UIAlertView *tmp = [[UIAlertView alloc]
                        initWithTitle:@"Not Available"
                        message:@"No products to purchase"
                        delegate:self
                        cancelButtonTitle:nil
                        otherButtonTitles:@"Ok", nil];
    [tmp show];
  }
  [activityIndicatorView stopAnimating];
  purchaseButton.hidden = NO;
}


@end


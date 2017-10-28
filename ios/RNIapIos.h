
#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#import <StoreKit/StoreKit.h>

@interface RNIapIos : NSObject <RCTBridgeModule, SKProductsRequestDelegate,SKPaymentTransactionObserver>
{
  SKProductsRequest *productsRequest;
  NSArray *validProducts;
}
@end
  

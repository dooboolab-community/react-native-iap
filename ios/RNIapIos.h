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
  
// Restoring Purchased Products : https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/StoreKitGuide/Chapters/Restoring.html#//apple_ref/doc/uid/TP40008267-CH8-SW9

// Reference : https://github.com/chirag04/react-native-in-app-utils/blob/master/InAppUtils/InAppUtils.m


#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <StoreKit/StoreKit.h>

@interface RNIapIos : RCTEventEmitter <RCTBridgeModule, SKProductsRequestDelegate,SKPaymentTransactionObserver>
{
  SKProductsRequest *productsRequest;
  NSMutableArray *validProducts;
  SKPayment *promotedPayment;
  SKProduct *promotedProduct;
  NSInteger countPendingTransaction;
}
@end
  
// Restoring Purchased Products : https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/StoreKitGuide/Chapters/Restoring.html#//apple_ref/doc/uid/TP40008267-CH8-SW9

// Reference : https://github.com/chirag04/react-native-in-app-utils/blob/master/InAppUtils/InAppUtils.m


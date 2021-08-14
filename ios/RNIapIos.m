#import <StoreKit/StoreKit.h>

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (RNIapIos, NSObject)
RCT_EXTERN_METHOD(initConnection:(RCTPromiseResolveBlock)resolve 
                  reject:(RCTPromiseRejectBlock)reject) 
RCT_EXTERN_METHOD(endConnection:(RCTPromiseResolveBlock)resolve 
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getItems:(NSArray*)skus 
                  resolve:(RCTPromiseResolveBlock)resolve 
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getAvailableItems:(RCTPromiseResolveBlock)resolve 
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(buyProduct:(NSString*)sku andDangerouslyFinishTransactionAutomatically:(BOOL)finishAutomatically
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(buyProductWithOffer:(NSString*)sku
                  forUser:(NSString*)usernameHash
                  withOffer:(NSDictionary*)discountOffer
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(buyProductWithQuantityIOS:(NSString*)sku
                  quantity:(NSInteger)quantity
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(clearTransaction:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(clearProducts) 
RCT_EXTERN_METHOD(promotedProduct:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(buyPromotedProduct:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(requestReceipt:(BOOL)refresh
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(finishTransaction:(NSString*)transactionIdentifier)
RCT_EXTERN_METHOD(getPendingTransactions:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(presentCodeRedemptionSheet:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
@end

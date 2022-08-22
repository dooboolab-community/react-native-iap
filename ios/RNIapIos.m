#import <StoreKit/StoreKit.h>

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (RNIapIos, NSObject)

RCT_EXTERN_METHOD(initConnection:
                  (RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(endConnection:
                  (RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(products:
                  (NSArray*)skus
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(currentEntitlements:
                  (RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(purchase:
                  (NSString*)sku
                  andDangerouslyFinishTransactionAutomatically:(BOOL)andDangerouslyFinishTransactionAutomatically
                  appAccountToken:(NSString*)appAccountToken
                  quantity:(NSInteger)quantity
                  withOffer:(NSDictionary*)discountOffer
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isEligibleForIntroOffer:
                  (NSString*)groupID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(currentEntitlement:
                  (NSString*)sku
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(latestTransaction:
                  (NSString*)sku
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(finishTransaction:
                  (NSString*)transactionIdentifier
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(pendingTransactions:
                  (RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sync:
                  (RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(presentCodeRedemptionSheet:
                  (RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end

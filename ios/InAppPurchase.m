
#import "InAppPurchase.h"

#import <React/RCTLog.h>
#import <React/RCTConvert.h>


////////////////////////////////////////////////////     _//////////_  // Private Members
@interface InAppPurchase() {
    RCTResponseSenderBlock purchaseCallback;
}
@end

////////////////////////////////////////////////////     _//////////_  // Implementation
@implementation InAppPurchase


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
@end
  

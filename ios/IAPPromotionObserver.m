#import "IAPPromotionObserver.h"

@interface IAPPromotionObserver () {
  SKPayment *_promotedPayment;
  SKProduct *_promotedProduct;
}

@end

@implementation IAPPromotionObserver

+ (instancetype)sharedObserver {
  static IAPPromotionObserver *sharedInstance = nil;
  static dispatch_once_t onceToken;

  dispatch_once(&onceToken, ^{
    sharedInstance = [[IAPPromotionObserver alloc] init];
  });

  return sharedInstance;
}

+ (void)startObserving {
  [IAPPromotionObserver sharedObserver];
}

- (instancetype)init {
  if ((self = [super init])) {
    [SKPaymentQueue.defaultQueue addTransactionObserver:self];
  }

  return self;
}

-(void) dealloc {
  [[SKPaymentQueue defaultQueue] removeTransactionObserver:self];
}

- (SKPayment *)payment {
  return _promotedPayment;
}

- (SKProduct *)product {
  return _promotedProduct;
}

- (void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray<SKPaymentTransaction *> *)transactions {
}

- (BOOL)paymentQueue:(SKPaymentQueue *)queue shouldAddStorePayment:(SKPayment *)payment forProduct:(SKProduct *)product {
  _promotedProduct = product;
  _promotedPayment = payment;

  if (self.delegate != nil && [self.delegate respondsToSelector:@selector(shouldAddStorePayment:forProduct:)]) {
    return [self.delegate shouldAddStorePayment:payment forProduct:product];
  }

  return NO;
}

@end

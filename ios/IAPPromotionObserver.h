#import <StoreKit/StoreKit.h>

@protocol IAPPromotionObserverDelegate;

@interface IAPPromotionObserver: NSObject <SKPaymentTransactionObserver>

@property (strong, nonatomic, readonly) SKPayment *payment;
@property (strong, nonatomic, readonly) SKProduct *product;
@property (weak, nonatomic) id<IAPPromotionObserverDelegate> delegate;

+ (instancetype)sharedObserver;
+ (void)startObserving;

@end

@protocol IAPPromotionObserverDelegate <NSObject>

@required
- (BOOL)shouldAddStorePayment:(SKPayment *)payment forProduct:(SKProduct *)product;

@end

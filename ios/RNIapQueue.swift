//
//  RNIapQueue.swift
//  
//
//  Created by Andres Aguilar on 9/8/21.
//

import Foundation
import StoreKit

// Temporarily stores payment information since it is sent by the OS before RN instantiates the RNModule
@objc(RNIapQueue)
public class RNIapQueue: NSObject, SKPaymentTransactionObserver {
    public func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        //No-op
    }
    
    @objc
    public static let shared = RNIapQueue()
    
    var queue: SKPaymentQueue? = nil;
    var payment: SKPayment? = nil;
    var product: SKProduct? = nil;
    
    private override init(){}
    
    // Sent when a user initiates an IAP buy from the App Store
    @available(iOS 11.0, *)
    func paymentQueue(_ queue: SKPaymentQueue, shouldAddStorePayment payment: SKPayment, for product: SKProduct) -> Bool{
        RNIapQueue.shared.queue = queue
        RNIapQueue.shared.payment = payment
        RNIapQueue.shared.product = product
        return false
    }
    
}

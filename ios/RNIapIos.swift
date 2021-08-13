// WIP Migrating from Objective C to swift
func paymentQueue(_ queue: SKPaymentQueue, removedTransactions transactions: [SKPaymentTransaction]) {
    print("removedTransactions")
    if countPendingTransaction != nil && countPendingTransaction > 0 {
        countPendingTransaction -= transactions.count
        if countPendingTransaction == 0 {
            resolvePromises(forKey: "cleaningTransactions", value: nil)
            countPendingTransaction = nil
        }
    }
}
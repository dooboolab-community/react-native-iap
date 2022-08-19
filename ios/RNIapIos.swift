import Foundation
import React
import StoreKit

extension SKProductsRequest {
    var key: String {
        return String(self.hashValue)
    }
}

@objc(RNIapIos)
class RNIapIos: RCTEventEmitter, SKRequestDelegate {
    private var hasListeners = false
    private var products: [String: Product]
    private var transactions: [String: Transaction]
    private var updateListenerTask: Task<Void, Error>?

    override init() {
        products = [String: Product]()
        transactions = [String: Transaction]()
        super.init()
        addTransactionObserver()
    }

    deinit {
        removeTransactionObserver()
    }

    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    func addTransactionObserver() {
        if updateListenerTask == nil {
            updateListenerTask = listenForTransactions()
        }
    }

    func removeTransactionObserver() {
        updateListenerTask?.cancel()
        updateListenerTask = nil
    }

    func addTransaction(_ transaction: Transaction) {
        let transactionId = String(transaction.id)
        self.transactions[transactionId] = transaction
    }

    func listenForTransactions() -> Task<Void, Error> {
        return Task.detached {
            // Iterate through any transactions that don't come from a direct call to `purchase()`.
            for await result in Transaction.updates {
                do {
                    let transaction = try checkVerified(result)
                    self.addTransaction(transaction)
                    // Deliver products to the user.
                    // await self.updateCustomerProductStatus()

                    if self.hasListeners {
                        self.sendEvent(withName: "transaction-updated", body: ["transaction": serialize(transaction)])
                    }
                    // Always finish a transaction.
                    // await transaction.finish() //TODO: Document
                } catch {
                    // StoreKit has a transaction that fails verification. Don't deliver content to the user.
                    debugMessage("Transaction failed verification")
                    if self.hasListeners {
                        let err = [
                            "responseCode": "-1",
                            "debugMessage": error.localizedDescription,
                            "code": "E_RECEIPT_FINISHED_FAILED",
                            "message": error.localizedDescription
                        ]

                        self.sendEvent(withName: "transaction-updated", body: ["error": err])
                    }
                }
            }
        }
    }

    override func startObserving() {
        hasListeners = true
    }

    override func stopObserving() {
        hasListeners = false
    }
    override func addListener(_ eventName: String?) {
        super.addListener(eventName)
    }

    override func supportedEvents() -> [String]? {
        return [ "transaction-updated"]
    }

    @objc public func initConnection(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        addTransactionObserver()
        resolve(AppStore.canMakePayments)
    }
    @objc public func endConnection(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        updateListenerTask?.cancel()
        updateListenerTask = nil
        resolve(nil)
    }

    @objc public func products( // TODO: renamed from getItems
        _ skus: [String],
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) async {
        do {
            let products: [[String: Any?]] = try await Product.products(for: skus).map({ (prod: Product) -> [String: Any?]? in
                return serialize(prod)
            }).compactMap({$0})
            resolve(products)
        } catch {
            reject(IapErrors.E_UNKNOWN.rawValue, "Error fetching items", error)
        }
    }

    @objc public func currentEntitlements( // TODO: renamed from getAvailableItems
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) async {
        var purchasedItems: [ProductOrError] = []
        // Iterate through all of the user's purchased products.
        for await result in Transaction.currentEntitlements {
            do {
                // Check whether the transaction is verified. If it isn’t, catch `failedVerification` error.
                let transaction = try checkVerified(result)
                // Check the `productType` of the transaction and get the corresponding product from the store.
                switch transaction.productType {
                case .nonConsumable:
                    if let product = products[transaction.productID] {
                        purchasedItems.append(ProductOrError(product: product, error: nil))
                    }

                case .nonRenewable:
                    if let nonRenewable = products[transaction.productID] {
                        // Non-renewing subscriptions have no inherent expiration date, so they're always
                        // contained in `Transaction.currentEntitlements` after the user purchases them.
                        // This app defines this non-renewing subscription's expiration date to be one year after purchase.
                        // If the current date is within one year of the `purchaseDate`, the user is still entitled to this
                        // product.
                        let currentDate = Date()
                        let expirationDate = Calendar(identifier: .gregorian).date(byAdding: DateComponents(year: 1),
                                                                                   to: transaction.purchaseDate)!

                        if currentDate < expirationDate {
                            purchasedItems.append(ProductOrError(product: nonRenewable, error: nil))
                        }
                    }

                case .autoRenewable:
                    if let subscription = products[transaction.productID] {
                        purchasedItems.append(ProductOrError(product: subscription, error: nil))
                    }

                default:
                    break
                }
            } catch StoreError.failedVerification {
                purchasedItems.append(ProductOrError(product: nil, error: StoreError.failedVerification))
            } catch {
                debugMessage(error)
                purchasedItems.append(ProductOrError(product: nil, error: error))
            }
        }

        // Check the `subscriptionGroupStatus` to learn the auto-renewable subscription state to determine whether the customer
        // is new (never subscribed), active, or inactive (expired subscription). This app has only one subscription
        // group, so products in the subscriptions array all belong to the same group. The statuses that
        // `product.subscription.status` returns apply to the entire subscription group.
        // subscriptionGroupStatus = try? await subscriptions.first?.subscription?.status.first?.state
        resolve(purchasedItems.map({(p: ProductOrError) in ["product": p.product.flatMap { serialize($0)}, "error": serialize(p.error)]}))
    }

    @objc public func purchase( // TODO: renamed from buyProduct
        _ sku: String,
        andDangerouslyFinishTransactionAutomatically: Bool,
        appAccountToken: String?,
        quantity: Int,
        withOffer discountOffer: [String: String],
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) async {
        let product: Product? = products[sku]

        if let product = product {
            do {
                var options: Set<Product.PurchaseOption> = []
                if quantity > -1 {
                    options.insert(.quantity(quantity))
                }

                let offerID = discountOffer["offerID"] // TODO: Adjust JS to match these new names
                let keyID = discountOffer["keyID"]
                let nonce = discountOffer["nonce"]
                let signature = discountOffer["signature"]
                let timestamp = discountOffer["timestamp"]

                if let offerID = offerID, let keyID = keyID, let nonce = nonce, let nonce = UUID(uuidString: nonce), let signature = signature, let signature = signature.data(using: .utf8), let timestamp = timestamp, let timestamp = Int(timestamp) {
                    options.insert(.promotionalOffer(offerID: offerID, keyID: keyID, nonce: nonce, signature: signature, timestamp: timestamp ))
                }
                if let appAccountToken = appAccountToken, let appAccountToken = UUID(uuidString: appAccountToken) {
                    options.insert(.appAccountToken(appAccountToken))
                }
                debugMessage("Purchase Started")

                let result = try await product.purchase(options: options)
                switch result {
                case .success(let verification):
                    debugMessage("Purchase Successful")

                    // Check whether the transaction is verified. If it isn't,
                    // this function rethrows the verification error.
                    let transaction = try checkVerified(verification)

                    // The transaction is verified. Deliver content to the user.
                    // Do on JS :await updateCustomerProductStatus()

                    // Always finish a transaction.
                    if andDangerouslyFinishTransactionAutomatically {
                        await transaction.finish()
                        resolve(nil)
                    } else {
                        self.addTransaction(transaction)
                        resolve(serialize(transaction))
                    }
                    return

                case .userCancelled, .pending:
                    debugMessage("Deferred (awaiting approval via parental controls, etc.)")

                    let err = [
                        "debugMessage": "The payment was deferred (awaiting approval via parental controls for instance)",
                        "code": IapErrors.E_DEFERRED_PAYMENT.rawValue,
                        "message": "The payment was deferred (awaiting approval via parental controls for instance)",
                        "productId": sku,
                        "quantity": "\(quantity)"
                    ]
                    debugMessage(err)

                    reject(
                        IapErrors.E_DEFERRED_PAYMENT.rawValue,
                        "The payment was deferred for \(sku) (awaiting approval via parental controls for instance)",
                        nil)

                    return

                default:
                    reject(IapErrors.E_UNKNOWN.rawValue, "Unknown response from purchase", nil)
                    return
                }
            } catch {
                debugMessage("Purchase Failed")

                let err = [
                    "responseCode": IapErrors.E_PURCHASE_ERROR.rawValue,
                    "debugMessage": error.localizedDescription,
                    "message": error.localizedDescription,
                    "productId": sku
                ]
                print(err)

                reject(
                    IapErrors.E_UNKNOWN.rawValue,
                    "Purchased failed for sku:\(sku): \(error.localizedDescription)",
                    error)
            }
        } else {
            reject("E_DEVELOPER_ERROR", "Invalid product ID.", nil)
        }
    }

    @objc public func isEligibleForIntroOffer( // TODO: new method
        _ groupID: String,
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) async {
        let isEligibleForIntroOffer = await Product.SubscriptionInfo.isEligibleForIntroOffer(for: groupID)
        resolve(isEligibleForIntroOffer)
    }

    @objc public func subscriptionStatus( // TODO: new method
        _ sku: String,
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) async {
        do {
            let status = try await products[sku]?.subscription?.status
            resolve(status)
        } catch {
            reject("", "", error)
        }
    }

    @objc public func currentEntitlement( // TODO: new method
        _ sku: String,
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) async {
        if let product = products[sku] {
            if let result = await product.currentEntitlement {
                do {
                    // Check whether the transaction is verified. If it isn’t, catch `failedVerification` error.
                    let transaction = try checkVerified(result)
                    resolve(serialize(transaction))
                } catch StoreError.failedVerification {
                    reject(IapErrors.E_UNKNOWN.rawValue, "Failed to verify transaction for sku \(sku)", StoreError.failedVerification)
                } catch {
                    debugMessage(error)
                    reject(IapErrors.E_UNKNOWN.rawValue, "Error fetching entitlement for sku \(sku)", error)
                }
            } else {
                reject(IapErrors.E_DEVELOPER_ERROR.rawValue, "Can't find entitlement for sku \(sku)", nil)
            }
        } else {
            reject(IapErrors.E_DEVELOPER_ERROR.rawValue, "Can't find product for sku \(sku)", nil)
        }
    }

    @objc public func latestTransaction( // TODO: new method
        _ sku: String,
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) async {
        if let product = products[sku] {
            if let result = await product.latestTransaction {
                do {
                    // Check whether the transaction is verified. If it isn’t, catch `failedVerification` error.
                    let transaction = try checkVerified(result)
                    resolve(serialize(transaction))
                } catch StoreError.failedVerification {
                    reject(IapErrors.E_UNKNOWN.rawValue, "Failed to verify transaction for sku \(sku)", StoreError.failedVerification)
                } catch {
                    debugMessage(error)
                    reject(IapErrors.E_UNKNOWN.rawValue, "Error fetching latest transaction for sku \(sku)", error)
                }
            } else {
                reject(IapErrors.E_DEVELOPER_ERROR.rawValue, "Can't find latest transaction for sku \(sku)", nil)
            }
        } else {
            reject(IapErrors.E_DEVELOPER_ERROR.rawValue, "Can't find product for sku \(sku)", nil)
        }
    }

    @objc public func  finishTransaction(
        _ transactionIdentifier: String,
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) async {
        await transactions[transactionIdentifier]?.finish()
        transactions.removeValue(forKey: transactionIdentifier)
        resolve(nil)
    }

    @objc public func pendingTransactions (
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        resolve(transactions.values.map({(t: Transaction) in serialize(t)}))
    }

    // TODO: New method
    @objc public func sync(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in},
        reject: @escaping RCTPromiseRejectBlock = {_, _, _ in}
    ) async {
        do {
            try await AppStore.sync()
        } catch {
            reject(IapErrors.E_SYNC_ERROR.rawValue, "Error synchronizing with the AppStore", error)
        }
    }

    /**
     Should remain the same according to:
     https://stackoverflow.com/a/72789651/570612
     */
    @objc public func  presentCodeRedemptionSheet(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        #if !os(tvOS)
        SKPaymentQueue.default().presentCodeRedemptionSheet()
        resolve(nil)
        #else
        reject(standardErrorCode(2), "This method is not available on tvOS", nil)
        #endif
    }
}

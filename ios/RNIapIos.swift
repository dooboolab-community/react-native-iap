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
  private var promisesByKey: [String: [RNIapIosPromise]]
  private var hasListeners = false
  private var pendingTransactionWithAutoFinish = false // TODO:
  private var receiptBlock: ((Data?, Error?) -> Void)? // Block to handle request the receipt async from delegate
  private var products: [String: Product]
  private var transactions: [String: Transaction]
  private var updateListenerTask: Task<Void, Error>?
  private var promotedPayment: SKPayment?
  private var promotedProduct: SKProduct?
  private var productsRequest: SKProductsRequest?
  private var countPendingTransaction: Int = 0

  override init() {
    promisesByKey = [String: [RNIapIosPromise]]()
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
    if updateListenerTask != nil {
      updateListenerTask?.cancel()
      updateListenerTask = nil
    }
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
          let transaction = try self.checkVerified(result)
          self.addTransaction(transaction)
          // Deliver products to the user.
          // await self.updateCustomerProductStatus()
          if self.hasListeners {
            self.sendEvent(withName: "purchase-updated", body: transaction) // TODO: serialize transaction
          }
          // Always finish a transaction.
          // await transaction.finish() //TODO: Document
        } catch {
          // StoreKit has a transaction that fails verification. Don't deliver content to the user.
          print("Transaction failed verification")
          if self.hasListeners {
            let err = [ // TODO: add info
              "responseCode": "-1",
              "debugMessage": error.localizedDescription,
              "code": "E_RECEIPT_FINISHED_FAILED",
              "message": error.localizedDescription,
              "productId": ""
            ]

            self.sendEvent(withName: "purchase-error", body: err)
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

    if (eventName == "iap-promoted-product") && promotedPayment != nil {
      sendEvent(withName: "iap-promoted-product", body: promotedPayment?.productIdentifier)
    }
  }

  func paymentQueue(_ queue: SKPaymentQueue, shouldAddStorePayment payment: SKPayment, for product: SKProduct) -> Bool {
    promotedProduct = product
    promotedPayment = payment
    sendEvent(withName: "iap-promoted-product", body: product.productIdentifier)
    return false
  }

  override func supportedEvents() -> [String]? {
    return ["iap-promoted-product", "purchase-updated", "purchase-error"]
  }

  @objc public func initConnection(
    _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
    reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
  ) {
    let canMakePayments = AppStore.canMakePayments
    addTransactionObserver()
    resolve(NSNumber(value: canMakePayments))
  }
  @objc public func endConnection(
    _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
    reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
  ) {
    updateListenerTask?.cancel()
    updateListenerTask = nil
    resolve(nil)
  }
  @objc public func getItems(
    _ skus: [String],
    resolve: @escaping RCTPromiseResolveBlock = { _ in },
    reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
  ) async {
    do {
      let products: [[String: Any]] = try await Product.products(for: skus).map({ (product: Product) -> [String: Any] in
        var prod = [String: Any]()
        prod["displayName"] = product.displayName
        prod["description"] = product.description
        prod["id"] = product.id
        prod["displayPrice"] = product.displayPrice
        prod["price"] = product.price
        prod["isFamilyShareable"] = product.isFamilyShareable
        prod["subscription"] = product.subscription?.subscriptionGroupID
        return prod
      })
      resolve(products)
    } catch {
      reject("E_UNKNOWN", "Error fetching items", nil)
    }
  }
  @objc public func getAvailableItems(
    _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
    reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
  ) async {
    var purchasedItems: [Product] = []
    // Iterate through all of the user's purchased products.
    for await result in Transaction.currentEntitlements {
      do {
        // Check whether the transaction is verified. If it isn’t, catch `failedVerification` error.
        let transaction = try checkVerified(result)
        // Check the `productType` of the transaction and get the corresponding product from the store.
        switch transaction.productType {
        case .nonConsumable:
          if let product = products[transaction.productID] {
            purchasedItems.append(product)
          }

        case .nonRenewable:
          if let nonRenewable = products[transaction.productID],
             transaction.productID == "nonRenewing.standard" {
            // Non-renewing subscriptions have no inherent expiration date, so they're always
            // contained in `Transaction.currentEntitlements` after the user purchases them.
            // This app defines this non-renewing subscription's expiration date to be one year after purchase.
            // If the current date is within one year of the `purchaseDate`, the user is still entitled to this
            // product.
            let currentDate = Date()
            let expirationDate = Calendar(identifier: .gregorian).date(byAdding: DateComponents(year: 1),
                                                                       to: transaction.purchaseDate)!

            if currentDate < expirationDate {
              purchasedItems.append(nonRenewable)
            }
          }

        case .autoRenewable:
          if let subscription = products[transaction.productID] {
            purchasedItems.append(subscription)
          }

        default:
          break
        }
      } catch {
        print()
        reject("", "", nil) // TODO
      }
    }

    // Check the `subscriptionGroupStatus` to learn the auto-renewable subscription state to determine whether the customer
    // is new (never subscribed), active, or inactive (expired subscription). This app has only one subscription
    // group, so products in the subscriptions array all belong to the same group. The statuses that
    // `product.subscription.status` returns apply to the entire subscription group.
    // subscriptionGroupStatus = try? await subscriptions.first?.subscription?.status.first?.state
    resolve(purchasedItems)
  }

  @objc public func buyProduct(
    _ sku: String,
    andDangerouslyFinishTransactionAutomatically: Bool,
    appAccountToken: String?,
    quantity: Int,
    withOffer discountOffer: [String: String],
    resolve: @escaping RCTPromiseResolveBlock = { _ in },
    reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
  ) async {
    pendingTransactionWithAutoFinish = andDangerouslyFinishTransactionAutomatically
    let product: Product? = products[sku]

    if let product = product {
      do {
        var options: Set<Product.PurchaseOption> = []
        if quantity > -1 {
          options.insert(.quantity(quantity))
        }

        let offerID = discountOffer["identifier"] // TODO: Change names to match Native API
        let keyID = discountOffer["keyIdentifier"]
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
            resolve(transaction)
          }
          return

        case .userCancelled, .pending:
          debugMessage("Deferred (awaiting approval via parental controls, etc.)")

          if hasListeners {
            let err = [
              "debugMessage": "The payment was deferred (awaiting approval via parental controls for instance)",
              "code": "E_DEFERRED_PAYMENT",
              "message": "The payment was deferred (awaiting approval via parental controls for instance)",
              "productId": sku,
              "quantity": "\(quantity)"
            ]

            sendEvent(withName: "purchase-error", body: err)
          }

          reject(
            "E_DEFERRED_PAYMENT",
            "The payment was deferred for \(sku) (awaiting approval via parental controls for instance)",
            nil)

          return

        default:
          reject("", "", nil)// TODO
          return
        }
      } catch {
        debugMessage("Purchase Failed")

        if hasListeners {
          let code = IapErrors.E_PURCHASE_ERROR
          let responseCode = code.rawValue
          let err = [
            "responseCode": responseCode,
            "debugMessage": error.localizedDescription,
            "code": "\(code.asInt())",
            "message": error.localizedDescription,
            "productId": sku
          ]

          sendEvent(withName: "purchase-error", body: err)
        }

        reject(
          IapErrors.E_UNKNOWN.rawValue,
          "Purchased failed for sku:\(sku): \(error.localizedDescription)",
          error)
      }
    } else {
      reject("E_DEVELOPER_ERROR", "Invalid product ID.", nil)
    }
  }

  @MainActor
  func updateCustomerProductStatus() async {
  }

  public enum StoreError: Error {
    case failedVerification
  }
  func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
    // Check whether the JWS passes StoreKit verification.
    switch result {
    case .unverified:
      // StoreKit parses the JWS, but it fails verification.
      throw StoreError.failedVerification

    case .verified(let safe):
      // The result is verified. Return the unwrapped value.
      return safe
    }
  }

  @objc public func  promotedProduct(
    _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
    reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
  ) {
    debugMessage("get promoted product")
    resolve((promotedProduct != nil) ? getProductObject(promotedProduct!) : nil)
  }

  @objc public func  buyPromotedProduct(
    _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
    reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
  ) {
    if let promoPayment = promotedPayment {
      debugMessage("buy promoted product")
      SKPaymentQueue.default().add(promoPayment)
    } else {
      reject(IapErrors.E_DEVELOPER_ERROR.rawValue, "Invalid product ID.", nil)
    }
  }

  @objc public func  requestReceipt(
    _ refresh: Bool,
    resolve: @escaping RCTPromiseResolveBlock = { _ in },
    reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
  ) {
    requestReceiptData(withBlock: refresh) {  receiptData, error in
      if error == nil {
        resolve(receiptData?.base64EncodedString(options: []))
      } else {
        reject(IapErrors.E_RECEIPT_FAILED.rawValue, "Invalid receipt", nil)
      }
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

  @objc public func getPendingTransactions (
    _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
    reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
  ) {
    resolve(transactions.values)
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

  enum IapErrors: String, CaseIterable {
    case E_UNKNOWN = "E_UNKNOWN"
    case E_SERVICE_ERROR = "E_SERVICE_ERROR"
    case E_USER_CANCELLED = "E_USER_CANCELLED"
    case E_USER_ERROR = "E_USER_ERROR"
    case E_ITEM_UNAVAILABLE = "E_ITEM_UNAVAILABLE"
    case E_REMOTE_ERROR = "E_REMOTE_ERROR"
    case E_NETWORK_ERROR = "E_NETWORK_ERROR"
    case E_RECEIPT_FAILED = "E_RECEIPT_FAILED"
    case E_RECEIPT_FINISHED_FAILED = "E_RECEIPT_FINISHED_FAILED"
    case E_DEVELOPER_ERROR = "E_DEVELOPER_ERROR"
    case E_PURCHASE_ERROR = "E_PURCHASE_ERROR"
    func asInt() -> Int {
      return IapErrors.allCases.firstIndex(of: self)!
    }
  }

  func requestReceiptData(withBlock forceRefresh: Bool, withBlock block: @escaping (_ data: Data?, _ error: Error?) -> Void) {
    debugMessage("requestReceiptDataWithBlock with force refresh: \(forceRefresh ? "YES" : "NO")")

    if forceRefresh || isReceiptPresent() == false {
      let refreshRequest = SKReceiptRefreshRequest()
      refreshRequest.delegate = self
      refreshRequest.start()
      receiptBlock = block
    } else {
      receiptBlock = nil
      block(receiptData(), nil)
    }
  }

  func isReceiptPresent() -> Bool {
    let receiptURL = Bundle.main.appStoreReceiptURL
    var canReachError: Error?

    do {
      try _ = receiptURL?.checkResourceIsReachable()
    } catch let error {
      canReachError = error
    }

    return canReachError == nil
  }

  func receiptData() -> Data? {
    let receiptURL = Bundle.main.appStoreReceiptURL
    var receiptData: Data?

    if let receiptURL = receiptURL {
      do {
        try receiptData = Data(contentsOf: receiptURL)
      } catch _ {
      }
    }

    return receiptData
  }
}

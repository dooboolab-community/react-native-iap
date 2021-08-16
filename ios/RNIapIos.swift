// WIP Migrating from Objective C to swift 

import React
import StoreKit

// Based on https://stackoverflow.com/a/40135192/570612
extension Date {
    var millisecondsSince1970:Int64 {
        return Int64((self.timeIntervalSince1970 * 1000.0).rounded())
    }
    
    var millisecondsSince1970String:String {
        return String((self.timeIntervalSince1970 * 1000.0).rounded())
    }
    
    init(milliseconds:Int64) {
        self = Date(timeIntervalSince1970: TimeInterval(milliseconds) / 1000)
    }
}

extension SKProductsRequest {
    var key:String{
        return String(self.hashValue)
    }
}
typealias IapPromise = (RCTPromiseResolveBlock,RCTPromiseRejectBlock)
@objc(RNIapIos)
class RNIapIos: RCTEventEmitter, SKRequestDelegate, SKPaymentTransactionObserver, SKProductsRequestDelegate {
    private var promisesByKey: [String: [IapPromise]]
    private var myQueue: DispatchQueue
    private var hasListeners = false
    private var pendingTransactionWithAutoFinish = false
    private var receiptBlock: ((Data?, Error?) -> Void)? // Block to handle request the receipt async from delegate
    private var validProducts: [SKProduct]
    private var promotedPayment: SKPayment? = nil
    private var promotedProduct: SKProduct? = nil
    private var productsRequest: SKProductsRequest? = nil
    private var countPendingTransaction: Int?
    
    override init() {
        promisesByKey = [String : [IapPromise]]()
        pendingTransactionWithAutoFinish = false
        myQueue = DispatchQueue(label: "reject")
        validProducts = [SKProduct]()
        super.init()
    }
    
    deinit {
        SKPaymentQueue.default().remove(self)
    }
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    func flushUnheardEvents() {
        paymentQueue(SKPaymentQueue.default(), updatedTransactions: SKPaymentQueue.default().transactions)
    }
    
    override func startObserving() {
        hasListeners = true
        flushUnheardEvents()
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
    
    func addPromise(forKey key: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        var promises:[IapPromise]? = promisesByKey[key]
        
        if promises == nil {
            promises = []
            promisesByKey[key] = promises
        }
        
        promises?.append((resolve, reject))
    }
    
    func resolvePromises(forKey key: String?, value: Any?) {
        let promises:[IapPromise]? = promisesByKey[key ?? ""]
        
        if let promises = promises {
            for tuple in promises {
                let resolveBlck = tuple.0
                resolveBlck(value)
            }
            promisesByKey[key ?? ""] = nil
        }
    }
    
    func rejectPromises(forKey key: String, code: String?, message: String?, error: Error?) {
        let promises = promisesByKey[key]
        
        if let promises = promises {
            for tuple in promises {
                let reject = tuple.1
                reject(code, message, error)
            }
            promisesByKey[key]=nil
        }
    }
    
    func paymentQueue(_ queue: SKPaymentQueue, shouldAddStorePayment payment: SKPayment, for product: SKProduct) -> Bool {
        promotedProduct = product
        promotedPayment = payment
        
        if hasListeners {
            sendEvent(withName: "iap-promoted-product", body: product.productIdentifier)
        }
        return false
    }
    
    override func supportedEvents() -> [String]? {
        return ["iap-promoted-product", "purchase-updated", "purchase-error"]
    }
    
    
    @objc public func initConnection(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        SKPaymentQueue.default().add(self)
        let canMakePayments = SKPaymentQueue.canMakePayments()
        resolve(NSNumber(value: canMakePayments))
    }
    
    @objc public func endConnection(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        SKPaymentQueue.default().remove(self)
        resolve(nil)
    }
    
    @objc public func getItems(
        _ skus: [String],
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        let productIdentifiers = Set<AnyHashable>(skus)
        if let productIdentifiers = productIdentifiers as? Set<String> {
            productsRequest = SKProductsRequest(productIdentifiers: productIdentifiers)
            if let productsRequest = productsRequest {
                productsRequest.delegate = self
                let key: String = productsRequest.key
                addPromise(forKey: key, resolve: resolve, reject: reject)
                productsRequest.start()
            }
        }
    }
    
    @objc public func getAvailableItems(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        addPromise(forKey: "availableItems", resolve: resolve, reject: reject)
        SKPaymentQueue.default().restoreCompletedTransactions()
    }
    
    
    @objc public func buyProduct(
        _ sku:String,
        finishAutomatically: Bool,
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        pendingTransactionWithAutoFinish = finishAutomatically
        var product: SKProduct?
        let lockQueue = DispatchQueue(label: "validProducts")
        lockQueue.sync {
            for p in validProducts {
                if sku == p.productIdentifier {
                    product = p
                    break
                }
            }
        }
        if let prod = product {
            addPromise(forKey: prod.productIdentifier, resolve: resolve, reject: reject)
            
            let payment = SKMutablePayment(product: prod)
            SKPaymentQueue.default().add(payment)
        } else{
            if hasListeners {
                let err = [
                    "debugMessage" : "Invalid product ID.",
                    "code" : "E_DEVELOPER_ERROR",
                    "message" : "Invalid product ID.",
                    "productId" : sku
                ]
                sendEvent(withName: "purchase-error", body: err)
            }
            reject("E_DEVELOPER_ERROR", "Invalid product ID.", nil)
        }
    }
    
    
    @objc public func buyProductWithOffer(
        _ sku: String,
        usernameHash: String,
        discountOffer: Dictionary<String,String>,
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        var product: SKProduct?
        
        let lockQueue = DispatchQueue(label: "validProducts")
        lockQueue.sync {
            for p in validProducts {
                if sku == p.productIdentifier {
                    product = p
                    break
                }
            }
        }
        
        if let prod = product {
            addPromise(forKey: prod.productIdentifier, resolve: resolve, reject: reject)
            
            let payment: SKMutablePayment = SKMutablePayment(product: prod)
            
            if #available(iOS 12.2, *) {
                let discount: SKPaymentDiscount = SKPaymentDiscount(
                    identifier: discountOffer["identifier"]!,
                    keyIdentifier: discountOffer["keyIdentifier"]!,
                    nonce: UUID(uuidString: discountOffer["nonce"]!)!,
                    signature: discountOffer["signature"]!,
                    timestamp: NSNumber(value: Int(discountOffer["timestamp"]!)!))
                payment.paymentDiscount = discount
            }
            payment.applicationUsername = usernameHash
            SKPaymentQueue.default().add(payment)
        }else {
            if hasListeners {
                let err = [
                    "debugMessage" : "Invalid product ID.",
                    "message" : "Invalid product ID.",
                    "code" : "E_DEVELOPER_ERROR",
                    "productId" : sku
                ]
                sendEvent(withName: "purchase-error", body: err)
            }
            reject("E_DEVELOPER_ERROR", "Invalid product ID.", nil)
        }
        
    }
    
    
    
    @objc public func buyProductWithQuantityIOS(
        _ sku: String,
        quantity: Int,
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        
        print("\n\n\n  buyProductWithQuantityIOS  \n\n.")
        var product: SKProduct?
        let lockQueue = DispatchQueue(label: "validProducts")
        lockQueue.sync {
            for p in validProducts {
                if sku == p.productIdentifier {
                    product = p
                    break
                }
            }
        }
        
        if let prod = product {
            let payment = SKMutablePayment(product: prod)
            payment.quantity = quantity
            SKPaymentQueue.default().add(payment)
        } else {
            if hasListeners {
                let err = [
                    "debugMessage" : "Invalid product ID.",
                    "message" : "Invalid product ID.",
                    "code" : "E_DEVELOPER_ERROR",
                    "productId" : sku
                ]
                sendEvent(withName: "purchase-error", body: err)
            }
            reject("E_DEVELOPER_ERROR", "Invalid product ID.", nil)
        }
    }
    
    
    @objc public func clearTransaction(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        
        print("\n\n\n  ***  clear remaining Transactions. Call this before make a new transaction   \n\n.")
        
        let pendingTrans = SKPaymentQueue.default().transactions
        let countPendingTransaction = pendingTrans.count
        
        if countPendingTransaction > 0 {
            addPromise(forKey: "cleaningTransactions", resolve: resolve, reject: reject)
            for transaction in pendingTrans {
                SKPaymentQueue.default().finishTransaction(transaction)
            }
        } else {
            resolve(nil)
        }
    }
    
    
    @objc public func clearProducts(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        print("\n\n\n  ***  clear valid products. \n\n.")
        let lockQueue = DispatchQueue(label: "validProducts")
        lockQueue.sync {
            validProducts.removeAll()
        }
    }
    
    @objc public func  promotedProduct(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        print("\n\n\n  ***  get promoted product. \n\n.")
        resolve(promotedProduct )
    }
    
    @objc public func  buyPromotedProduct(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        if let promoPayment = promotedPayment {
            print("\n\n\n  ***  buy promoted product. \n\n.")
            SKPaymentQueue.default().add(promoPayment)
        } else {
            reject("E_DEVELOPER_ERROR", "Invalid product ID.", nil)
        }
    }
    
    
    
    @objc public func  requestReceipt(
        _ refresh: Bool,
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        requestReceiptData(withBlock: refresh) { [self] receiptData, error in
            if error == nil {
                resolve(receiptData?.base64EncodedString(options: []))
            } else {
                reject(standardErrorCode(9), "Invalid receipt", nil)
            }
        }
    }
    
    
    
    @objc public func  finishTransaction(
        _ transactionIdentifier: String,
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        finishTransaction(withIdentifier: transactionIdentifier)
    }
    
    
    @objc public func getPendingTransactions (
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        requestReceiptData(withBlock: false) { receiptData, error in
            var output: [AnyHashable] = []
            if let receipt = receiptData {
                let transactions = SKPaymentQueue.default().transactions
                
                for item in transactions {
                    let timestamp = item.transactionDate?.millisecondsSince1970 == nil ? nil : String(item.transactionDate!.millisecondsSince1970)
                    let purchase = [
                        "transactionDate" : timestamp,
                        "transactionId" : item.transactionIdentifier,
                        "productId" : item.payment.productIdentifier,
                        "transactionReceipt" : receipt.base64EncodedString(options: [])
                    ]
                    output.append(purchase)
                    
                }
            }
            resolve(output)
        }
        
    }
    
    @objc public func  presentCodeRedemptionSheet(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        #if !os(tvOS)
        if #available(iOS 14.0, *) {
            SKPaymentQueue.default().presentCodeRedemptionSheet()
            resolve(nil)
        } else {
            reject(standardErrorCode(2), "This method only available above iOS 14", nil)
        }
        #else
        reject(standardErrorCode(2), "This method is not available on tvOS", nil)
        #endif
    }
    
    
    // StoreKitDelegate
    func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        for prod in response.products {
            add(prod)
        }
        var items: [[String: Any?]] = [[:]]
        
        
        let lockQueue = DispatchQueue(label: "validProducts")
        lockQueue.sync {
            for product in validProducts {
                items.append(getProductObject(product))
            }
        }
        
        resolvePromises(forKey: request.key, value: items)
    }
    // Add to valid products from Apple server response. Allowing getProducts, getSubscriptions call several times.
    // Doesn't allow duplication. Replace new product.
    func add(_ aProd: SKProduct) {
        let lockQueue = DispatchQueue(label: "validProducts")
        lockQueue.sync {
            print("\n  Add new object : \(aProd.productIdentifier)")
            var delTar = -1
            for k in 0..<validProducts.count {
                let cur = validProducts[k]
                if cur.productIdentifier == aProd.productIdentifier {
                    delTar = k
                }
            }
            if delTar >= 0 {
                validProducts.remove(at: delTar)
            }
            validProducts.append(aProd)
        }
    }
    
    func request(_ request: SKRequest, didFailWithError error: Error) {
        let nsError = error as NSError
        if request is SKReceiptRefreshRequest {
            if let unwrappedReceiptBlock = receiptBlock {
                let standardError = NSError(domain: nsError.domain, code: 9, userInfo: nsError.userInfo)
                unwrappedReceiptBlock(nil, standardError)
                receiptBlock = nil
                return
            }else {
                if let key: String = productsRequest?.key{
                    myQueue.sync(execute: { [self] in
                                    rejectPromises(
                                        forKey: key,
                                        code: standardErrorCode(nsError.code),
                                        message: error.localizedDescription,
                                        error: error)}
                    )
                    
                }
            }
        }
    }
    
    
    func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchasing:
                print("\n\n Purchase Started !! \n\n")
                break
            case .purchased:
                print("\n\n\n\n\n Purchase Successful !! \n\n\n\n\n.")
                purchaseProcess(transaction)
                break
            case .restored:
                print("Restored ")
                SKPaymentQueue.default().finishTransaction(transaction)
                break
            case .deferred:
                print("Deferred (awaiting approval via parental controls, etc.)")
                myQueue.sync(execute: { [self] in
                    if hasListeners {
                        let err = [
                            "debugMessage" : "The payment was deferred (awaiting approval via parental controls for instance)",
                            "code" : "E_DEFERRED_PAYMENT",
                            "message" : "The payment was deferred (awaiting approval via parental controls for instance)",
                            "productId" : transaction.payment.productIdentifier
                        ]
                        sendEvent(withName: "purchase-error", body: err)
                    }
                    rejectPromises(
                        forKey: transaction.payment.productIdentifier,
                        code: "E_DEFERRED_PAYMENT",
                        message: "The payment was deferred (awaiting approval via parental controls for instance)",
                        error: nil)
                });
                
            case .failed:
                print("\n\n\n\n\n\n Purchase Failed  !! \n\n\n\n\n")
                SKPaymentQueue.default().finishTransaction(transaction)
                myQueue.sync(execute: { [self] in
                    let nsError = transaction.error as NSError?
                    if hasListeners {
                        let code =  nsError?.code
                        let responseCode = String(code ?? 0)
                        let err = [
                            "responseCode" : responseCode,
                            "debugMessage" : transaction.error?.localizedDescription,
                            "code" : standardErrorCode(code),
                            "message" : transaction.error?.localizedDescription,
                            "productId" : transaction.payment.productIdentifier
                        ]
                        sendEvent(withName: "purchase-error", body: err)
                    }
                    
                    //if nsError?.code != .paymentCancelled {
                    rejectPromises(
                        forKey: transaction.payment.productIdentifier,
                        code: standardErrorCode(nsError?.code),
                        message: nsError?.localizedDescription,
                        error: nsError)
                    //}
                    
                })
                break;
            }
            
        }
    }
    
    func finishTransaction(withIdentifier transactionIdentifier: String?) {
        let queue = SKPaymentQueue.default()
        for transaction in queue.transactions {
            if transaction.transactionIdentifier == transactionIdentifier {
                SKPaymentQueue.default().finishTransaction(transaction)
            }
        }
    }
    
    func paymentQueueRestoreCompletedTransactionsFinished(_ queue: SKPaymentQueue) {
        ////////   RESTORE
        print("\n\n\n  paymentQueueRestoreCompletedTransactionsFinished  \n\n.")
        var items = [[String: Any?]]()
        for transaction in queue.transactions {
            if transaction.transactionState == .restored || transaction.transactionState == .purchased {
                getPurchaseData(transaction) { restored in
                    if let restored = restored {
                        items.append(restored)
                    }
                    SKPaymentQueue.default().finishTransaction(transaction)
                }
            }
        }
        resolvePromises(forKey: "availableItems", value: items)
    }
    
    func paymentQueue(_ queue: SKPaymentQueue, restoreCompletedTransactionsFailedWithError error: Error) {
        myQueue.sync(execute: { [self] in
            rejectPromises(
                forKey: "availableItems",
                code: standardErrorCode((error as NSError).code),
                message: error.localizedDescription,
                error: error)
        })
        print("\n\n\n restoreCompletedTransactionsFailedWithError \n\n.")
    }
    
    func purchaseProcess(_ transaction: SKPaymentTransaction) {
        if pendingTransactionWithAutoFinish {
            SKPaymentQueue.default().finishTransaction(transaction)
            pendingTransactionWithAutoFinish = false
        }
        getPurchaseData(transaction) { [self] purchase in
            resolvePromises(forKey: transaction.payment.productIdentifier, value: purchase)
            
            // additionally send event
            if hasListeners {
                sendEvent(withName: "purchase-updated", body: purchase)
            }
        }
    }
    
    
    func standardErrorCode(_ code: Int?) -> String? {
        
        
        let descriptions = [
            "E_UNKNOWN",
            "E_SERVICE_ERROR",
            "E_USER_CANCELLED",
            "E_USER_ERROR",
            "E_USER_ERROR",
            "E_ITEM_UNAVAILABLE",
            "E_REMOTE_ERROR",
            "E_NETWORK_ERROR",
            "E_SERVICE_ERROR",
            "E_RECEIPT_FAILED",
            "E_RECEIPT_FINISHED_FAILED"
        ]
        guard let code = code else {
            return descriptions[0]
        }
        
        if code > descriptions.count - 1 {
            return descriptions[0]
        }
        return descriptions[code]
    }
    
    
    func getProductObject(_ product: SKProduct) -> [String : Any?] {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = product.priceLocale
        
        let localizedPrice = formatter.string(from: product.price)
        var introductoryPrice = localizedPrice
        var introductoryPriceAsAmountIOS = "\(product.price)"
        
        var introductoryPricePaymentMode = ""
        var introductoryPriceNumberOfPeriods = ""
        
        var introductoryPriceSubscriptionPeriod = ""
        
        var currencyCode: String? = ""
        var countryCode: String? = ""
        var periodNumberIOS = "0"
        var periodUnitIOS = ""
        
        var itemType = "iap"
        
        if #available(iOS 11.2, *) {
            let numOfUnits = UInt(product.subscriptionPeriod?.numberOfUnits ?? 0)
            let unit = product.subscriptionPeriod?.unit
            
            if unit == .year {
                periodUnitIOS = "YEAR"
            } else if unit == .month {
                periodUnitIOS = "MONTH"
            } else if unit == .week {
                periodUnitIOS = "WEEK"
            } else if unit == .day {
                periodUnitIOS = "DAY"
            }
            
            periodNumberIOS = String(format: "%lu", numOfUnits)
            if numOfUnits != 0 {
                itemType = "subs"
            }
            
            // subscriptionPeriod = product.subscriptionPeriod ? [product.subscriptionPeriod stringValue] : @"";
            //introductoryPrice = product.introductoryPrice != nil ? [NSString stringWithFormat:@"%@", product.introductoryPrice] : @"";
            if product.introductoryPrice != nil {
                formatter.locale = product.introductoryPrice?.priceLocale
                if let price = product.introductoryPrice?.price {
                    introductoryPrice = formatter.string(from: price)
                }
                introductoryPriceAsAmountIOS = product.introductoryPrice?.price.stringValue ?? ""
                
                switch product.introductoryPrice?.paymentMode {
                case .freeTrial:
                    introductoryPricePaymentMode = "FREETRIAL"
                    introductoryPriceNumberOfPeriods = NSNumber(value: product.introductoryPrice?.subscriptionPeriod.numberOfUnits ?? 0).stringValue
                case .payAsYouGo:
                    introductoryPricePaymentMode = "PAYASYOUGO"
                    introductoryPriceNumberOfPeriods = NSNumber(value: product.introductoryPrice?.numberOfPeriods ?? 0).stringValue
                case .payUpFront:
                    introductoryPricePaymentMode = "PAYUPFRONT"
                    introductoryPriceNumberOfPeriods = NSNumber(value: product.introductoryPrice?.subscriptionPeriod.numberOfUnits ?? 0).stringValue
                default:
                    introductoryPricePaymentMode = ""
                    introductoryPriceNumberOfPeriods = "0"
                }
                
                if product.introductoryPrice?.subscriptionPeriod.unit == .day {
                    introductoryPriceSubscriptionPeriod = "DAY"
                } else if product.introductoryPrice?.subscriptionPeriod.unit == .week {
                    introductoryPriceSubscriptionPeriod = "WEEK"
                } else if product.introductoryPrice?.subscriptionPeriod.unit == .month {
                    introductoryPriceSubscriptionPeriod = "MONTH"
                }else if product.introductoryPrice?.subscriptionPeriod.unit == .year {
                    introductoryPriceSubscriptionPeriod = "YEAR"
                } else {
                    introductoryPriceSubscriptionPeriod = ""
                }
            }
            else{
                introductoryPrice = ""
                introductoryPriceAsAmountIOS = ""
                introductoryPricePaymentMode = ""
                introductoryPriceNumberOfPeriods = ""
                introductoryPriceSubscriptionPeriod = ""
            }
        }
        
        
        
        if #available(iOS 10.0, *) {
            currencyCode = product.priceLocale.currencyCode
        }
        
        if #available(iOS 13.0, *) {
            countryCode = SKPaymentQueue.default().storefront?.countryCode
        } else if #available(iOS 10.0, *) {
            countryCode = product.priceLocale.regionCode
        }
        
        var discounts: [[String: String?]]?
        
        if #available(iOS 12.2, *) {
            discounts = getDiscountData(product)
        }
        
        
        let obj: [String: Any?] = [
            "productId" : product.productIdentifier,
            "price" : "\(product.price)",
            "currency" : currencyCode,
            "countryCode" : countryCode ?? "",
            "type" : itemType,
            "title" : product.localizedTitle != "" ? product.localizedTitle : "",
            "description" : product.localizedDescription != "" ? product.localizedDescription : "",
            "localizedPrice" : localizedPrice,
            "subscriptionPeriodNumberIOS" : periodNumberIOS,
            "subscriptionPeriodUnitIOS" : periodUnitIOS,
            "introductoryPrice" : introductoryPrice,
            "introductoryPriceAsAmountIOS" : introductoryPriceAsAmountIOS,
            "introductoryPricePaymentModeIOS" : introductoryPricePaymentMode,
            "introductoryPriceNumberOfPeriodsIOS" : introductoryPriceNumberOfPeriods,
            "introductoryPriceSubscriptionPeriodIOS" : introductoryPriceSubscriptionPeriod,
            "discounts" : discounts
        ]
        
        return obj
    }
    
    
    
    func getDiscountData(_ product: SKProduct) -> [[String:String?]]? {
        if #available(iOS 12.2, *) {
            var mappedDiscounts : [[String:String?]] = []
            var localizedPrice: String?
            var paymendMode: String?
            var subscriptionPeriods: String?
            var discountType: String?
            
            for discount in product.discounts {
                let formatter = NumberFormatter()
                formatter.numberStyle = .currency
                formatter.locale = discount.priceLocale
                localizedPrice = formatter.string(from: discount.price)
                var numberOfPeriods: String?
                
                switch discount.paymentMode {
                case .freeTrial:
                    paymendMode = "FREETRIAL"
                    numberOfPeriods = NSNumber(value: discount.subscriptionPeriod.numberOfUnits ).stringValue
                    break
                case .payAsYouGo:
                    paymendMode = "PAYASYOUGO"
                    numberOfPeriods = NSNumber(value: discount.numberOfPeriods).stringValue
                    break
                case .payUpFront:
                    paymendMode = "PAYUPFRONT"
                    numberOfPeriods = NSNumber(value: discount.subscriptionPeriod.numberOfUnits ).stringValue
                    break
                default:
                    paymendMode = ""
                    numberOfPeriods = "0"
                    break
                }
                switch discount.subscriptionPeriod.unit {
                case .day:
                    subscriptionPeriods = "DAY"
                case .week:
                    subscriptionPeriods = "WEEK"
                case .month:
                    subscriptionPeriods = "MONTH"
                case .year:
                    subscriptionPeriods = "YEAR"
                default:
                    subscriptionPeriods = ""
                }
                
                
                let discountIdentifier = discount.identifier
                switch discount.type {
                case SKProductDiscount.Type.introductory:
                    discountType = "INTRODUCTORY"
                    break
                case SKProductDiscount.Type.subscription:
                    discountType = "SUBSCRIPTION"
                    break
                default:
                    discountType = ""
                    break
                }
                
                
                let discountObj = [
                    "identifier" : discountIdentifier,
                    "type" : discountType,
                    "numberOfPeriods" : numberOfPeriods,
                    "price" : "\(discount.price)",
                    "localizedPrice" : localizedPrice,
                    "paymentMode" : paymendMode,
                    "subscriptionPeriod" : subscriptionPeriods
                ]
                mappedDiscounts.append(discountObj)
            }
            return mappedDiscounts
        }
        return nil
    }
    
    
    func getPurchaseData(_ transaction: SKPaymentTransaction, withBlock block: @escaping (_ transactionDict: [String : Any]?) -> Void) {
        requestReceiptData(withBlock: false) { receiptData, error in
            if receiptData == nil {
                block(nil)
            } else {
                var purchase = [
                    "transactionDate" : transaction.transactionDate?.millisecondsSince1970String,
                    "transactionId" : transaction.transactionIdentifier,
                    "productId" : transaction.payment.productIdentifier,
                    "transactionReceipt" : receiptData?.base64EncodedString(options: [])
                ]
                // originalTransaction is available for restore purchase and purchase of cancelled/expired subscriptions
                if let originalTransaction = transaction.original {
                    purchase["originalTransactionDateIOS"] = originalTransaction.transactionDate?.millisecondsSince1970String
                    purchase["originalTransactionIdentifierIOS"] = originalTransaction.transactionIdentifier
                }
                
                block(purchase as [String : Any])
            }
        }
    }
    
    func requestReceiptData(withBlock forceRefresh: Bool, withBlock block: @escaping (_ data: Data?, _ error: Error?) -> Void) {
        print("\n\n\n requestReceiptDataWithBlock with force refresh: \(forceRefresh ? "YES" : "NO") \n\n.")
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
        var canReachError: Error? = nil
        do {
            try _ = receiptURL?.checkResourceIsReachable()
        } catch let error {
            canReachError = error
        }
        return canReachError == nil
    }
    
    func receiptData() -> Data? {
        let receiptURL = Bundle.main.appStoreReceiptURL
        var receiptData: Data? = nil
        if let receiptURL = receiptURL {
            do{
                try receiptData = Data(contentsOf: receiptURL)
            }catch _{
                
            }
        }
        return receiptData
    }
    
    func requestDidFinish(_ request: SKRequest) {
        if request is SKReceiptRefreshRequest {
            if isReceiptPresent() == true {
                print("Receipt refreshed success.")
                if let receiptBlock = receiptBlock {
                    receiptBlock(receiptData(), nil)
                }
            } else if let receiptBlock = receiptBlock {
                print("Finished but receipt refreshed failed!")
                let error = NSError(domain: "Receipt request finished but it failed!", code: 10, userInfo: nil)
                receiptBlock(nil, error)
            }
            receiptBlock = nil
        }
    }
    
    
    func paymentQueue(_ queue: SKPaymentQueue, removedTransactions transactions: [SKPaymentTransaction]) {
        print("removedTransactions")
        guard var unwrappedCount = countPendingTransaction else {
            return
        }
        if unwrappedCount > 0 {
            unwrappedCount -= transactions.count
            if unwrappedCount == 0 {
                resolvePromises(forKey: "cleaningTransactions", value: nil)
                countPendingTransaction = nil
            }
        }
    }
}

import React
import StoreKit

@objc(RNIapIos)
class RNIapIos: RCTEventEmitter, SKRequestDelegate, SKPaymentTransactionObserver, SKProductsRequestDelegate {
    private var promisesByKey: [String: [RNIapIosPromise]]
    private var myQueue: DispatchQueue
    private var hasListeners = false
    private var pendingTransactionWithAutoFinish = false
    private var receiptBlock: ((Data?, Error?) -> Void)? // Block to handle request the receipt async from delegate
    private var validProducts: [String: SKProduct]
    private var promotedPayment: SKPayment?
    private var promotedProduct: SKProduct?
    private var productsRequest: SKProductsRequest?
    private var countPendingTransaction: Int = 0
    private var hasTransactionObserver = false

    override init() {
        promisesByKey = [String: [RNIapIosPromise]]()
        pendingTransactionWithAutoFinish = false
        myQueue = DispatchQueue(label: "reject")
        validProducts = [String: SKProduct]()
        super.init()
        addTransactionObserver()
    }

    deinit {
        removeTransactionObserver()
    }

    @objc public func disable(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        removeTransactionObserver()
        resolve(nil)
    }

    override class func requiresMainQueueSetup() -> Bool {
        return true
    }

    func addTransactionObserver() {
        if !hasTransactionObserver {
            hasTransactionObserver = true
            SKPaymentQueue.default().add(self)
        }
    }

    func removeTransactionObserver() {
        if hasTransactionObserver {
            hasTransactionObserver = false
            SKPaymentQueue.default().remove(self)
        }
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
        var promises: [RNIapIosPromise]? = promisesByKey[key]

        if promises == nil {
            promises = []
        }

        promises?.append((resolve, reject))
        promisesByKey[key] = promises
    }

    func resolvePromises(forKey key: String?, value: Any?) {
        let promises: [RNIapIosPromise]? = promisesByKey[key ?? ""]

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
            promisesByKey[key] = nil
        }
    }

    func rejectAllPendingPromises() {
        promisesByKey.values.reduce([], +).forEach({tuple in
            let reject = tuple.1
            reject("E_CONNECTION_CLOSED", "Connection has been closed", nil)
        })
        promisesByKey.removeAll()
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
        addTransactionObserver()
        let canMakePayments = SKPaymentQueue.canMakePayments()
        resolve(NSNumber(value: canMakePayments))
    }
    @objc public func endConnection(
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        removeTransactionObserver()
        stopObserving()
        rejectAllPendingPromises()
        receiptBlock = nil
        validProducts.removeAll()
        promotedPayment = nil
        promotedProduct = nil
        productsRequest = nil
        countPendingTransaction = 0
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
        _ automaticallyFinishRestoredTransactions: Bool,
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        pendingTransactionWithAutoFinish = automaticallyFinishRestoredTransactions
        addPromise(forKey: "availableItems", resolve: resolve, reject: reject)
        SKPaymentQueue.default().restoreCompletedTransactions()
    }

    @objc public func buyProduct(
        _ sku: String,
        andDangerouslyFinishTransactionAutomatically: Bool,
        applicationUsername: String?,
        quantity: Int,
        withOffer discountOffer: [String: String]?,
        resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        pendingTransactionWithAutoFinish = andDangerouslyFinishTransactionAutomatically
        var product: SKProduct? = validProducts[sku]

        if let prod = product {
            addPromise(forKey: prod.productIdentifier, resolve: resolve, reject: reject)

            let payment = SKMutablePayment(product: prod)

            if #available(iOS 12.2, tvOS 12.2, *) {
                if let discountOffer = discountOffer, let identifier = discountOffer["identifier"], let keyIdentifier = discountOffer["keyIdentifier"], let nonce = discountOffer["nonce"], let signature = discountOffer["signature"], let timestamp = discountOffer["timestamp"] {
                    let discount = SKPaymentDiscount(
                        identifier: identifier,
                        keyIdentifier: keyIdentifier,
                        nonce: UUID(uuidString: nonce)!,
                        signature: signature,
                        timestamp: NSNumber(value: Int(timestamp)!))
                    payment.paymentDiscount = discount
                }
            }

            if let applicationUsername = applicationUsername {
                payment.applicationUsername = applicationUsername
            }
            if quantity > 0 {
                payment.quantity = quantity
            }

            SKPaymentQueue.default().add(payment)
        } else {
            if hasListeners {
                let err = [
                    "debugMessage": "Invalid product ID.",
                    "code": "E_DEVELOPER_ERROR",
                    "message": "Invalid product ID.",
                    "productId": sku
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
        let pendingTrans = SKPaymentQueue.default().transactions
        countPendingTransaction = pendingTrans.count

        debugMessage("clear remaining Transactions (\(countPendingTransaction)). Call this before make a new transaction")

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
        debugMessage("clear valid products")

        let lockQueue = DispatchQueue(label: "validProducts")

        lockQueue.sync {
            validProducts.removeAll()
        }

        resolve(nil)
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
                resolve(receiptData?.base64EncodedString(options: [.endLineWithCarriageReturn]))
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
        resolve(nil)
    }

    @objc public func getPendingTransactions (
        _ resolve: @escaping RCTPromiseResolveBlock = { _ in },
        reject: @escaping RCTPromiseRejectBlock = { _, _, _ in }
    ) {
        requestReceiptData(withBlock: false) { receiptData, _ in
            var output: [AnyHashable] = []

            if let receipt = receiptData {
                let transactions = SKPaymentQueue.default().transactions

                for item in transactions {
                    let timestamp = item.transactionDate?.millisecondsSince1970 == nil ? nil : String(item.transactionDate!.millisecondsSince1970)
                    let purchase = [
                        "transactionDate": timestamp,
                        "transactionId": item.transactionIdentifier,
                        "productId": item.payment.productIdentifier,
                        "quantity": "\(item.payment.quantity)",
                        "transactionReceipt": receipt.base64EncodedString(options: [.endLineWithCarriageReturn])
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
        if #available(iOS 14.0, tvOS 14.0, *) {
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
        for product in validProducts.values {
            items.append(getProductObject(product))
        }

        resolvePromises(forKey: request.key, value: items)
    }

    // Add to valid products from Apple server response. Allowing getProducts, getSubscriptions call several times.
    // Doesn't allow duplication. Replace new product.
    func add(_ aProd: SKProduct) {
        debugMessage("Add new object: \(aProd.productIdentifier)")
        validProducts[aProd.productIdentifier] = aProd
    }

    func request(_ request: SKRequest, didFailWithError error: Error) {
        let nsError = error as NSError

        if request is SKReceiptRefreshRequest {
            if let unwrappedReceiptBlock = receiptBlock {
                let standardError = NSError(domain: nsError.domain, code: 9, userInfo: nsError.userInfo)
                unwrappedReceiptBlock(nil, standardError)
                receiptBlock = nil
                return
            } else {
                if let key: String = productsRequest?.key {
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
                debugMessage("Purchase Started")
                break

            case .purchased:
                debugMessage("Purchase Successful")
                purchaseProcess(transaction)
                break

            case .restored:
                debugMessage("Restored")
                SKPaymentQueue.default().finishTransaction(transaction)
                break

            case .deferred:
                debugMessage("Deferred (awaiting approval via parental controls, etc.)")

                myQueue.sync(execute: { [self] in
                    if hasListeners {
                        let err = [
                            "debugMessage": "The payment was deferred (awaiting approval via parental controls for instance)",
                            "code": "E_DEFERRED_PAYMENT",
                            "message": "The payment was deferred (awaiting approval via parental controls for instance)",
                            "productId": transaction.payment.productIdentifier,
                            "quantity": "\(transaction.payment.quantity)"
                        ]

                        sendEvent(withName: "purchase-error", body: err)
                    }

                    rejectPromises(
                        forKey: transaction.payment.productIdentifier,
                        code: "E_DEFERRED_PAYMENT",
                        message: "The payment was deferred (awaiting approval via parental controls for instance)",
                        error: nil)
                })

            case .failed:
                debugMessage("Purchase Failed")

                SKPaymentQueue.default().finishTransaction(transaction)

                myQueue.sync(execute: { [self] in
                    var nsError = transaction.error as? NSError
                    // From https://developer.apple.com/forums/thread/674081
                    if let underlyingError = nsError?.userInfo["NSUnderlyingError"] as? NSError,
                       underlyingError.code == 3038 {
                        // General conditions have changed, don't display an error for the interrupted transaction
                        nsError = underlyingError
                    }

                    if hasListeners {
                        let code = nsError?.code
                        let responseCode = String(code ?? 0)
                        let err = [
                            "responseCode": responseCode,
                            "debugMessage": transaction.error?.localizedDescription,
                            "code": standardErrorCode(code),
                            "message": transaction.error?.localizedDescription,
                            "productId": transaction.payment.productIdentifier
                        ]

                        sendEvent(withName: "purchase-error", body: err)
                    }

                    rejectPromises(
                        forKey: transaction.payment.productIdentifier,
                        code: standardErrorCode(nsError?.code),
                        message: nsError?.localizedDescription,
                        error: nsError)
                })

                break
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
        debugMessage("PaymentQueueRestoreCompletedTransactionsFinished")
        var items = [[String: Any?]]()

        for transaction in queue.transactions {
            if transaction.transactionState == .restored || transaction.transactionState == .purchased {
                getPurchaseData(transaction) { restored in
                    if let restored = restored {
                        items.append(restored)
                    }
                    if self.pendingTransactionWithAutoFinish {
                        SKPaymentQueue.default().finishTransaction(transaction)
                    }
                }
            }
        }
        pendingTransactionWithAutoFinish = false
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

        debugMessage("restoreCompletedTransactionsFailedWithError")
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
        if code == 3038 { // Purchase interrupted so user can accept terms and conditions
            return "E_INTERRUPTED"
        }

        if code > descriptions.count - 1 || code < 0 { // Fix crash app without internet connection
            return descriptions[0]
        }

        return descriptions[code]
    }

    func getProductObject(_ product: SKProduct) -> [String: Any?] {
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

        if #available(iOS 11.2, tvOS 11.2, *) {
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
            // More reliable way of determining a subs on newer iOS versions
            if #available(iOS 12.0, tvOS 12.0, *) {
                if product.subscriptionGroupIdentifier != nil {
                    itemType = "subs"
                }
            }

            // subscriptionPeriod = product.subscriptionPeriod ? [product.subscriptionPeriod stringValue] : @"";
            // introductoryPrice = product.introductoryPrice != nil ? [NSString stringWithFormat:@"%@", product.introductoryPrice] : @"";
            if product.introductoryPrice != nil {
                formatter.locale = product.introductoryPrice?.priceLocale

                if let price = product.introductoryPrice?.price {
                    introductoryPrice = formatter.string(from: price)
                }

                introductoryPriceAsAmountIOS = product.introductoryPrice?.price.stringValue ?? ""

                switch product.introductoryPrice?.paymentMode {
                case .freeTrial:
                    introductoryPricePaymentMode = "FREETRIAL"
                    introductoryPriceNumberOfPeriods = String( product.introductoryPrice?.subscriptionPeriod.numberOfUnits ?? 0)

                case .payAsYouGo:
                    introductoryPricePaymentMode = "PAYASYOUGO"
                    introductoryPriceNumberOfPeriods = String( product.introductoryPrice?.numberOfPeriods ?? 0)

                case .payUpFront:
                    introductoryPricePaymentMode = "PAYUPFRONT"
                    introductoryPriceNumberOfPeriods = String( product.introductoryPrice?.subscriptionPeriod.numberOfUnits ?? 0)

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
                } else if product.introductoryPrice?.subscriptionPeriod.unit == .year {
                    introductoryPriceSubscriptionPeriod = "YEAR"
                } else {
                    introductoryPriceSubscriptionPeriod = ""
                }
            } else {
                introductoryPrice = ""
                introductoryPriceAsAmountIOS = ""
                introductoryPricePaymentMode = ""
                introductoryPriceNumberOfPeriods = ""
                introductoryPriceSubscriptionPeriod = ""
            }
        }

        if #available(iOS 10.0, tvOS 10.0, *) {
            currencyCode = product.priceLocale.currencyCode
        }

        if #available(iOS 13.0, tvOS 13.0, *) {
            countryCode = SKPaymentQueue.default().storefront?.countryCode
        } else if #available(iOS 10.0, tvOS 10.0, *) {
            countryCode = product.priceLocale.regionCode
        }

        var discounts: [[String: String?]]?

        if #available(iOS 12.2, tvOS 12.2, *) {
            discounts = getDiscountData(product)
        }

        let obj: [String: Any?] = [
            "productId": product.productIdentifier,
            "price": "\(product.price)",
            "currency": currencyCode,
            "countryCode": countryCode ?? "",
            "type": itemType,
            "title": product.localizedTitle != "" ? product.localizedTitle : "",
            "description": product.localizedDescription != "" ? product.localizedDescription : "",
            "localizedPrice": localizedPrice,
            "subscriptionPeriodNumberIOS": periodNumberIOS,
            "subscriptionPeriodUnitIOS": periodUnitIOS,
            "introductoryPrice": introductoryPrice,
            "introductoryPriceAsAmountIOS": introductoryPriceAsAmountIOS,
            "introductoryPricePaymentModeIOS": introductoryPricePaymentMode,
            "introductoryPriceNumberOfPeriodsIOS": introductoryPriceNumberOfPeriods,
            "introductoryPriceSubscriptionPeriodIOS": introductoryPriceSubscriptionPeriod,
            "discounts": discounts
        ]

        return obj
    }

    func getDiscountData(_ product: SKProduct) -> [[String: String?]]? {
        if #available(iOS 12.2, tvOS 12.2, *) {
            var mappedDiscounts: [[String: String?]] = []
            var localizedPrice: String?
            var paymendMode: String?
            var subscriptionPeriods: String?
            var discountType: String?

            for discount in product.discounts {
                let formatter = NumberFormatter()
                formatter.numberStyle = .currency
                // This causes a crash on certain versions of iOS.
                //                let priceLocale: Locale? = discount.priceLocale
                //                if let priceLocale = priceLocale {
                //                    formatter.locale = priceLocale
                //                }
                localizedPrice = formatter.string(from: discount.price)
                var numberOfPeriods: String?

                switch discount.paymentMode {
                case .freeTrial:
                    paymendMode = "FREETRIAL"
                    numberOfPeriods = String(discount.subscriptionPeriod.numberOfUnits)
                    break

                case .payAsYouGo:
                    paymendMode = "PAYASYOUGO"
                    numberOfPeriods = String(discount.numberOfPeriods)
                    break

                case .payUpFront:
                    paymendMode = "PAYUPFRONT"
                    numberOfPeriods = String(discount.subscriptionPeriod.numberOfUnits )
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
                    "identifier": discountIdentifier,
                    "type": discountType,
                    "numberOfPeriods": numberOfPeriods,
                    "price": "\(discount.price)",
                    "localizedPrice": localizedPrice,
                    "paymentMode": paymendMode,
                    "subscriptionPeriod": subscriptionPeriods
                ]

                mappedDiscounts.append(discountObj)
            }

            return mappedDiscounts
        }

        return nil
    }

    func getPurchaseData(_ transaction: SKPaymentTransaction, withBlock block: @escaping (_ transactionDict: [String: Any?]?) -> Void) {
        requestReceiptData(withBlock: false) { receiptData, _ in
            if receiptData == nil {
                block(nil)
            } else {
                var purchase: [String: Any?] = [
                    "transactionDate": transaction.transactionDate?.millisecondsSince1970,
                    "transactionId": transaction.transactionIdentifier,
                    "productId": transaction.payment.productIdentifier,
                    "transactionReceipt": receiptData?.base64EncodedString(options: [.endLineWithCarriageReturn])
                ]

                // originalTransaction is available for restore purchase and purchase of cancelled/expired subscriptions
                if let originalTransaction = transaction.original {
                    purchase["originalTransactionDateIOS"] = originalTransaction.transactionDate?.millisecondsSince1970
                    purchase["originalTransactionIdentifierIOS"] = originalTransaction.transactionIdentifier
                }

                block(purchase)
            }
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

    func requestDidFinish(_ request: SKRequest) {
        if request is SKReceiptRefreshRequest {
            if isReceiptPresent() == true {
                debugMessage("Receipt refreshed success")

                if let receiptBlock = receiptBlock {
                    receiptBlock(receiptData(), nil)
                }
            } else if let receiptBlock = receiptBlock {
                debugMessage("Finished but receipt refreshed failed")

                let error = NSError(domain: "Receipt request finished but it failed!", code: 10, userInfo: nil)
                receiptBlock(nil, error)
            }

            receiptBlock = nil
        }
    }

    func paymentQueue(_ queue: SKPaymentQueue, removedTransactions transactions: [SKPaymentTransaction]) {
        debugMessage("removedTransactions - countPendingTransactions \(countPendingTransaction)")

        if countPendingTransaction > 0 {
            countPendingTransaction -= transactions.count

            if countPendingTransaction <= 0 {
                resolvePromises(forKey: "cleaningTransactions", value: nil)
                countPendingTransaction = 0
            }
        }
    }
}

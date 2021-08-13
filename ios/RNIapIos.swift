// WIP Migrating from Objective C to swift

import React
import StoreKit

class RNIapIos: SKRequestDelegate {
    private var promisesByKey: [AnyHashable : Any]?
    private var myQueue: DispatchQueue?
    private var hasListeners = false
    private var pendingTransactionWithAutoFinish = false
    private var receiptBlock: ((Data?, Error?) -> Void)? // Block to handle request the receipt async from delegate
}

init() {
    super.init()
        promisesByKey = [AnyHashable : Any]()
        pendingTransactionWithAutoFinish = false
    myQueue = DispatchQueue(label: "reject")
    validProducts = [AnyHashable]()
}

deinit {
    SKPaymentQueue.default().removeTransactionObserver(self)
}

class func requiresMainQueueSetup() -> Bool {
    return true
}

func flushUnheardEvents() {
    paymentQueue(SKPaymentQueue.default(), updatedTransactions: SKPaymentQueue.default().transactions())
}

func startObserving() {
    hasListeners = true
    flushUnheardEvents()
}

func stopObserving() {
    hasListeners = false
}

func addListener(_ eventName: String?) {
    super.addListener(eventName)

    if (eventName == "iap-promoted-product") && promotedPayment != nil {
        sendEvent(withName: "iap-promoted-product", body: promotedPayment.productIdentifier)
    }
}

func addPromise(forKey key: String?, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    var promises = promisesByKey.value(forKey: key ?? "") as? [AnyHashable]

    if promises == nil {
        promises = []
        promisesByKey.setValue(promises, forKey: key ?? "")
    }

    promises?.append([resolve, reject])
}

func resolvePromises(forKey key: String?, value: Any?) {
    var promises = promisesByKey.value(forKey: key ?? "") as? [AnyHashable]

    if let promises = promises {
        for tuple in promises {
            guard let tuple = tuple as? [AnyHashable] else {
                continue
            }
            let resolveBlck = tuple[0] as? RCTPromiseResolveBlock
            resolveBlck?(value)
        }
        promisesByKey.removeObject(forKey: key ?? "")
    }
}

func rejectPromises(forKey key: String?, code: String?, message: String?, error: Error?) {
    var promises = promisesByKey.value(forKey: key ?? "") as? [AnyHashable]

    if let promises = promises {
        for tuple in promises {
            guard let tuple = tuple as? [AnyHashable] else {
                continue
            }
            let reject = tuple[1] as? RCTPromiseRejectBlock
            reject?(code, message, error)
        }
        promisesByKey.removeObject(forKey: key ?? "")
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

////////////////////////////////////////////////////     _//////////_//      EXPORT_MODULE
//RCT_EXPORT_MODULE();

func supportedEvents() -> [String]? {
    return ["iap-promoted-product", "purchase-updated", "purchase-error"]
}



// StoreKitDelegate
func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
    for prod in response.products {
        add(prod)
    }
    var items: [AnyHashable] = []


    let lockQueue = DispatchQueue(label: "validProducts")
    lockQueue.sync {
        for product in validProducts {
            items.append(getProductObject(product))
        }
    }

    resolvePromises(forKey: RCTKeyForInstance(request), value: items)
}
// Add to valid products from Apple server response. Allowing getProducts, getSubscriptions call several times.
// Doesn't allow duplication. Replace new product.
func add(_ aProd: SKProduct?) {
    let lockQueue = DispatchQueue(label: "validProducts")
    lockQueue.sync {
        print("\n  Add new object : \(aProd?.productIdentifier ?? "")")
        var delTar = -1
        for k in 0..<validProducts.count {
    let cur = validProducts[k]
    if cur?.productIdentifier == aProd.productIdentifier {
        delTar = k
    }
}
if delTar >= 0 {
    validProducts.remove(at: delTar)
}
validProducts.append(aProd)
    }

func request(_ request: SKRequest, didFailWithError error: Error) {
    if request is SKReceiptRefreshRequest {
    if receiptBlock != nil {
        let standardError = NSError(domain: (error as NSError).domain, code: 9, userInfo: (error as NSError).userInfo)
        receiptBlock(nil, standardError)
        receiptBlock = nil
        return
    }else {
      let key = RCTKeyForInstance(productsRequest)
myQueue.sync(execute: { [self] in
    rejectPromises(
        forKey: key,
        code: standardErrorCode(error.code),
        message: error.localizedDescription,
        error: error)
})
    }


    func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
    for transaction in transactions {
        switch transaction.transactionState {
        case .purchasing:
            print("\n\n Purchase Started !! \n\n")
        case .purchased:
            print("\n\n\n\n\n Purchase Successful !! \n\n\n\n\n.")
            purchaseProcess(transaction)
        case .restored:
            print("Restored ")
            SKPaymentQueue.default().finishTransaction(transaction)
        case .deferred:
    print("Deferred (awaiting approval via parental controls, etc.)")
    myQueue.sync(execute: { [self] in
        if hasListeners {
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
        message: "The payment was deferred (awaiting approval via parental controls for instance)")
            }
      break;
    case .failed:
    print("\n\n\n\n\n\n Purchase Failed  !! \n\n\n\n\n")
    SKPaymentQueue.default().finishTransaction(transaction)
myQueue.sync(execute: { [self] in
    if hasListeners {
        let responseCode = NSNumber(value: transaction.error.code).stringValue
        let err = [
    "responseCode" : responseCode,
    "debugMessage" : transaction.error.localizedDescription,
    "code" : standardErrorCode(Int(transaction.error.code)),
    "message" : transaction.error.localizedDescription,
    "productId" : transaction.payment.productIdentifier
]
sendEvent(withName: "purchase-error", body: err)
    }

    if transaction.error.code != .paymentCancelled {
      rejectPromises(
        forKey: transaction.payment.productIdentifier,
        code: standardErrorCode(Int(transaction.error.code)),
        message: transaction.error.localizedDescription)
    }
    break;
})

func finishTransaction(withIdentifier transactionIdentifier: String?) {
    let queue = SKPaymentQueue.default()
    for transaction in queue.transactions {
        if transaction.transactionIdentifier == transactionIdentifier {
            SKPaymentQueue.default().finish(transaction)
        }
    }
}

func paymentQueueRestoreCompletedTransactionsFinished(_ queue: SKPaymentQueue) {
    ////////   RESTORE
    print("\n\n\n  paymentQueueRestoreCompletedTransactionsFinished  \n\n.")
    var items = [AnyHashable](repeating: 0, count: queue.transactions.count)
    for transaction in queue.transactions {
    if transaction.transactionState == .restored || transaction.transactionState == .purchased {
        getPurchaseData(transaction) { restored in
            if let restored = restored {
                items.append(restored)
            }
            SKPaymentQueue.default().finish(transaction)
        }
    }
}

func paymentQueue(_ queue: SKPaymentQueue, restoreCompletedTransactionsFailedWithError error: Error) {
    myQueue.sync(execute: { [self] in
        rejectPromises(
            forKey: "availableItems",
            code: standardErrorCode(error.code),
            message: error.localizedDescription,
            error: error)
    })
    print("\n\n\n restoreCompletedTransactionsFailedWithError \n\n.")
}

func purchaseProcess(_ transaction: SKPaymentTransaction?) {
    if pendingTransactionWithAutoFinish {
        SKPaymentQueue.default().finish(transaction)
        pendingTransactionWithAutoFinish = false
    }
    getPurchaseData(transaction) { [self] purchase in
        resolvePromises(forKey: transaction?.payment.productIdentifier, value: purchase)

        // additionally send event
        if hasListeners {
            sendEvent(withName: "purchase-updated", body: purchase)
        }
    }


    resolvePromises(forKey: "availableItems", value: items)
}


func standardErrorCode(_ code: Int) -> String? {
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

    if code > descriptions.count - 1 {
        return descriptions[0]
    }
    return descriptions[code]
}


func getProductObject(_ product: SKProduct?) -> [AnyHashable : Any]? {
    let formatter = NumberFormatter()
formatter.numberStyle = .currency
formatter.locale = product.priceLocale

let localizedPrice = formatter.string(from: product.price)
let introductoryPrice = localizedPrice
let introductoryPriceAsAmountIOS = "\(product.price)"

let introductoryPricePaymentMode = ""
let introductoryPriceNumberOfPeriods = ""

let introductoryPriceSubscriptionPeriod = ""

let currencyCode = ""
let countryCode = ""
let periodNumberIOS = "0"
let periodUnitIOS = ""

let itemType = "iap"

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
    countryCode = SKPaymentQueue.default().storefront.countryCode
} else if #available(iOS 10.0, *) {
    countryCode = product.priceLocale.countryCode
}

var discounts: [AnyHashable]?
if __IPHONE_12_2 {
if #available(iOS 12.2, *) {
    discounts = getDiscountData(product)
}
}

let obj = [
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



func getDiscountData(_ product: SKProduct?) -> [AnyHashable]? {
    if #available(iOS 12.2, *) {
        var mappedDiscounts = [AnyHashable](repeating: 0, count: product?.discounts.count ?? 0)
        var localizedPrice: String?
        var paymendMode: String?
        var subscriptionPeriods: String?
        var discountType: String?

        for discount in product.discounts {
    let formatter = NumberFormatter()
    formatter.numberStyle = .currency
    formatter.locale = discount.priceLocale ?? product.priceLocale
    localizedPrice = formatter.string(from: discount.price)
    var numberOfPeriods: String?

    switch discount.paymentMode {
case .freeTrial:
    paymendMode = "FREETRIAL"
    numberOfPeriods = NSNumber(value: discount.subscriptionPeriod?.numberOfUnits ?? 0).stringValue
case .payAsYouGo:
    paymendMode = "PAYASYOUGO"
    numberOfPeriods = NSNumber(value: discount.numberOfPeriods).stringValue
case .payUpFront:
    paymendMode = "PAYUPFRONT"
    numberOfPeriods = NSNumber(value: discount.subscriptionPeriod?.numberOfUnits ?? 0).stringValue
default:
    paymendMode = ""
    numberOfPeriods = "0"
}
switch discount.subscriptionPeriod?.unit {
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


var discountIdentifier = ""
if __IPHONE_12_2 {
var discountIdentifier = ""
if __IPHONE_12_2 {
if #available(iOS 12.2, *) {
    discountIdentifier = discount.identifier
    switch discount.type {
    case SKProductDiscount.Type.introductory:
        discountType = "INTRODUCTORY"
    case SKProductDiscount.Type.subscription:
        discountType = "SUBSCRIPTION"
    default:
        discountType = ""
    }
}
}
mappedDiscounts.append(
    [
        "identifier" : discountIdentifier,
        "type" : discountType,
        "numberOfPeriods" : numberOfPeriods,
        "price" : "\(discount.price)",
        "localizedPrice" : localizedPrice,
        "paymentMode" : paymendMode,
        "subscriptionPeriod" : subscriptionPeriods
    ])
    return mappedDiscounts
}
    return nil
}


func getPurchaseData(_ transaction: SKPaymentTransaction?, withBlock block: @escaping (_ transactionDict: [AnyHashable : Any]?) -> Void) {
    requestReceiptData(withBlock: false) { receiptData, error in
        if receiptData == nil {
            block(nil)
        } else {
          var purchase = [
    "transactionDate" : NSNumber(value: transaction.transactionDate.timeIntervalSince1970 * 1000),
    "transactionId" : transaction.transactionIdentifier,
    "productId" : transaction.payment.productIdentifier,
    "transactionReceipt" : receiptData.base64EncodedString(options: [])
    let originalTransaction = transaction.original
if originalTransaction {
    purchase["originalTransactionDateIOS"] = NSNumber(value: originalTransaction.transactionDate?.timeIntervalSince1970 * 1000)]
    purchase["originalTransactionIdentifierIOS"] = originalTransaction.transactionIdentifier
}

block(purchase)
}
    }
}







////////
private func RCTKeyForInstance(_ instance: Any?) -> String? {
    if let instance = instance {
        return String(format: "%p", instance)
    }
    return nil
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
        try receiptURL?.checkResourceIsReachable()
    } catch let canReachError {
    }
    return canReachError == nil
}

func receiptData() -> Data? {
    let receiptURL = Bundle.main.appStoreReceiptURL
    var receiptData: Data? = nil
    if let receiptURL = receiptURL {
        receiptData = Data(contentsOf: receiptURL)
    }
    return receiptData
}

func requestDidFinish(_ request: SKRequest) {
    if request is SKReceiptRefreshRequest {
        if isReceiptPresent() == true {
            print("Receipt refreshed success.")
            if receiptBlock {
                receiptBlock(receiptData(), nil)
            }
        } else if receiptBlock {
            print("Finished but receipt refreshed failed!")
            let error = NSError(domain: "Receipt request finished but it failed!", code: 10, userInfo: nil)
            receiptBlock(nil, error)
        }
      receiptBlock = nil
    }


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
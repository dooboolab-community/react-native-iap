//
//  IapUtils.swift
//  RNIap
//
//  Created by Aguilar Andres on 8/15/22.
//

import Foundation
import StoreKit

typealias RNIapIosPromise = (RCTPromiseResolveBlock, RCTPromiseRejectBlock)

public func debugMessage(_ object: Any...) {
  #if DEBUG
  for item in object {
    print("[react-native-iap] \(item)")
  }
  #endif
}

// Based on https://stackoverflow.com/a/40135192/570612
extension Date {
  var millisecondsSince1970: Int64 {
    return Int64((self.timeIntervalSince1970 * 1000.0).rounded())
  }

  var millisecondsSince1970String: String {
    return String((self.timeIntervalSince1970 * 1000.0).rounded())
  }

  init(milliseconds: Int64) {
    self = Date(timeIntervalSince1970: TimeInterval(milliseconds) / 1000)
  }
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

  currencyCode = product.priceLocale.currencyCode

  countryCode = SKPaymentQueue.default().storefront?.countryCode
  // countryCode = product.priceLocale.regionCode

  var discounts: [[String: String?]]?

  discounts = getDiscountData(product)

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
  var mappedDiscounts: [[String: String?]] = []
  var localizedPrice: String?
  var paymendMode: String?
  var subscriptionPeriods: String?
  var discountType: String?

  for discount in product.discounts {
    let formatter = NumberFormatter()
    formatter.numberStyle = .currency
    let priceLocale: Locale? = discount.priceLocale
    if let pLocale = priceLocale {
      formatter.locale = pLocale
    }
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

func serialize(_ p: Product) -> [String: Any?] {
  return ["displayName": p.displayName,
          "description": p.description,
          "id": p.id,
          "displayPrice": p.displayPrice,
          "price": p.price,
          "isFamilyShareable": p.isFamilyShareable,
          "subscription": p.subscription?.subscriptionGroupID,
          "jsonRepresentation": p.jsonRepresentation,
          "debugDescription": p.debugDescription,
          "subscription": serialize(p.subscription)
  ]
}

func serialize(_ ot: Product.SubscriptionInfo?) -> String? {
  return nil
  // TODO:    switch ot{
  //    case .none:
  //        return nil
  //    case .some(.promotional): return "promotional"
  //    case .some(.introductory): return "introductory"
  //    case .some(.code): return "code"
  //    case .some(_): return nil
  //
  //    }
}

func serialize(_ t: Transaction) -> [String: Any?] {
  return ["id": t.id,
          "appBundleID": t.appBundleID,
          "offerID": t.offerID,
          "subscriptionGroupID": t.subscriptionGroupID,
          "appAccountToken": t.appAccountToken,
          "debugDescription": t.debugDescription,
          "deviceVerification": t.deviceVerification,
          "deviceVerificationNonce": t.deviceVerificationNonce,
          "expirationDate": t.expirationDate,
          "isUpgraded": t.isUpgraded,
          "jsonRepresentation": t.jsonRepresentation,
          "offerType": serialize(t.offerType),
          "expirationDate": t.expirationDate,
          "originalID": t.originalID,
          "originalPurchaseDate": t.originalPurchaseDate,
          "ownershipType": serialize(t.ownershipType),
          "productType": serialize(t.productType),
          "productID": t.productID,
          "purchasedQuantity": t.purchasedQuantity,
          "revocationDate": t.revocationDate,
          "revocationReason": t.revocationReason,
          "purchaseDate": t.purchaseDate,
          "signedDate": t.signedDate,
          "webOrderLineItemID": t.webOrderLineItemID
  ]
}

func serialize(_ ot: Transaction.OfferType?) -> String? {
  switch ot {
  case .none:
    return nil
  case .some(.promotional): return "promotional"
  case .some(.introductory): return "introductory"
  case .some(.code): return "code"
  case .some: return nil
  }
}
func serialize(_ ot: Transaction.OwnershipType?) -> String? {
  switch ot {
  case .none:
    return nil
  case .some(.purchased): return "purchased"
  case .some(.familyShared): return "familyShared"
  case .some: return nil
  }
}
func serialize(_ pt: Product.ProductType?) -> String? {
  switch pt {
  case .none:
    return nil
  case .some(.autoRenewable): return "autoRenewable"
  case .some(.consumable): return "consumable"
  case .some(.nonConsumable): return "nonConsumable"
  case .some(.nonRenewable): return "nonRenewable"
  case .some: return nil
  }
}

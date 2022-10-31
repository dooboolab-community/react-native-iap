//
//  IapSerializationUtils.swift
//  RNIap
//
//  Created by Andres Aguilar on 8/18/22.
//

import Foundation
import StoreKit
@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ p: Product) -> [String: Any?] {
    return [
        "debugDescription": serializeDebug( p.debugDescription),
        "description": p.description,
        "displayName": p.displayName,
        "displayPrice": p.displayPrice,
        "id": p.id,
        "isFamilyShareable": p.isFamilyShareable,
        "jsonRepresentation": serializeDebug(p.jsonRepresentation),
        "price": p.price,
        "subscription": serialize(p.subscription),
        "type": serialize(p.type)
    ]
}

func serializeDebug (_ d: Data) -> String? {
    #if DEBUG
    return String( decoding: d, as: UTF8.self)
    #else
    return nil
    #endif
}

func serializeDebug (_ s: String) -> String? {
    #if DEBUG
    return s
    #else
    return nil
    #endif
}

func serialize(_ e: Error?) -> [String: Any?]? {
    guard let e = e else {return nil}
    return ["localizedDescription": e.localizedDescription]
}
@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ si: Product.SubscriptionInfo?) -> [String: Any?]? {
    guard let si = si else {return nil}
    return [
        "introductoryOffer": serialize(si.introductoryOffer),
        "promotionalOffers": si.promotionalOffers.map {(offer: Product.SubscriptionOffer) in serialize(offer)},
        "subscriptionGroupID": si.subscriptionGroupID,
        "subscriptionPeriod": serialize(si.subscriptionPeriod)
    ]
}
@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ sp: Product.SubscriptionPeriod?) -> [String: Any?]? {
    guard let sp = sp else {return nil}
    return ["value": sp.value,
            "unit": serialize(sp.unit)]
}
@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ sp: Product.SubscriptionPeriod.Unit?) -> String? {
    guard let sp = sp else {return nil}
    switch sp {
    case .day: return "day"
    case .week: return "week"
    case .month: return "month"
    case .year: return "year"
    default:
        return nil
    }
}

@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ s: Product.SubscriptionInfo.Status?) -> [String: Any?]? {
    guard let s = s else {return nil}
    return ["state": serialize( s.state)
            // "renewalInfo": serialize(s.renewalInfo),
            // "transaction": serialize(s.transaction),
    ]
}

@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ rs: Product.SubscriptionInfo.RenewalState?) -> String? {
    guard let rs = rs else {return nil}
    switch rs {
    case .expired: return "expired"
    case .inBillingRetryPeriod: return "inBillingRetryPeriod"
    case .inGracePeriod: return "inGracePeriod"
    case .revoked: return "revoked"
    case .subscribed: return "subscribed"
    default:
        return nil
    }
}

@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ ri: Product.SubscriptionInfo.RenewalInfo?) -> [String: Any?]? {
    guard let ri = ri else {return nil}
    return ["signedDate": ri.signedDate.millisecondsSince1970
    ]
}

@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ so: Product.SubscriptionOffer?) -> [String: Any?]? {
    guard let so = so else {return nil}
    return [
        "displayPrice": so.displayPrice,
        "id": so.id,
        "paymentMode": serialize(so.paymentMode),
        "period": serialize(so.period),
        "periodCount": so.periodCount,
        "price": so.price,
        "type": serialize(so.type)
    ]
}
@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ pm: Product.SubscriptionOffer.PaymentMode?) -> String? {
    guard let pm = pm else {return nil}
    switch pm {
    case .freeTrial: return "freeTrial"
    case .payAsYouGo: return "payAsYouGo"
    case .payUpFront: return "payUpFront"
    default:
        return nil
    }
}
@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ ot: Product.SubscriptionOffer.OfferType?) -> String? {
    guard let ot = ot else {return nil}
    switch ot {
    case .introductory: return "introductory"
    case .promotional: return "promotional"
    default:
        return nil
    }
}
@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ t: Transaction) -> [String: Any?] {
    return ["appAccountToken": t.appAccountToken,
            "appBundleID": t.appBundleID,
            "debugDescription": serializeDebug(t.debugDescription),
            "deviceVerification": t.deviceVerification,
            "deviceVerificationNonce": t.deviceVerificationNonce,
            "expirationDate": t.expirationDate?.millisecondsSince1970,
            "id": t.id,
            "isUpgraded": t.isUpgraded,
            "jsonRepresentation": serializeDebug(t.jsonRepresentation),
            "offerID": t.offerID,
            "offerType": serialize(t.offerType),
            "originalID": t.originalID,
            "originalPurchaseDate": t.originalPurchaseDate.millisecondsSince1970,
            "ownershipType": serialize(t.ownershipType),
            "productID": t.productID,
            "productType": serialize(t.productType),
            "purchaseDate": t.purchaseDate.millisecondsSince1970,
            "purchasedQuantity": t.purchasedQuantity,
            "revocationDate": t.revocationDate?.millisecondsSince1970,
            "revocationReason": t.revocationReason,
            "signedDate": t.signedDate.millisecondsSince1970,
            "subscriptionGroupID": t.subscriptionGroupID,
            "webOrderLineItemID": t.webOrderLineItemID
    ]
}
@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ ot: Transaction.OfferType?) -> String? {
    guard let ot = ot else {return nil}
    switch ot {
    case .promotional: return "promotional"
    case .introductory: return "introductory"
    case .code: return "code"
    default:
        return nil
    }
}
@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ ot: Transaction.OwnershipType?) -> String? {
    guard let ot = ot else {return nil}
    switch ot {
    case .purchased: return "purchased"
    case .familyShared: return "familyShared"
    default:
        return nil
    }
}
@available(iOS 15.0, tvOS 15.0, *)
func serialize(_ pt: Product.ProductType?) -> String? {
    guard let pt = pt else {return nil}
    switch pt {
    case .autoRenewable: return "autoRenewable"
    case .consumable: return "consumable"
    case .nonConsumable: return "nonConsumable"
    case .nonRenewable: return "nonRenewable"
    default:
        return nil
    }
}

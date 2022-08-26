//
//  IapSerializationUtils.swift
//  RNIap
//
//  Created by Aguilar Andres on 8/18/22.
//

import Foundation
import StoreKit

func serialize(_ p: Product) -> [String: Any?] {
    return [
        "debugDescription": serializeDebug( p.debugDescription),
        "description": p.description,
        "displayName": p.displayName,
        "displayPrice": p.displayPrice,
        "id": p.id,
        "isFamilyShareable": p.isFamilyShareable,
        "jsonRepresentation":serializeDebug(p.jsonRepresentation),
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

func serialize(_ si: Product.SubscriptionInfo?) -> [String: Any?]? {
    guard let si = si else {return nil}
    return [
        "introductoryOffer": serialize(si.introductoryOffer),
        "promotionalOffers": si.promotionalOffers.map {(offer: Product.SubscriptionOffer) in serialize(offer)},
        "subscriptionGroupID": si.subscriptionGroupID,
        "subscriptionPeriod": si.subscriptionPeriod
    ]
}

func serialize(_ so: Product.SubscriptionOffer?) -> [String: Any?]? {
    guard let so = so else {return nil}
    return [
        "displayPrice": so.displayPrice,
        "id": so.id,
        "paymentMode": so.paymentMode,
        "period": so.period,
        "periodCount": so.periodCount,
        "price": so.price,
        "type": so.type
    ]
}

// Transaction
func serialize(_ t: Transaction) -> [String: Any?] {
    return ["appAccountToken": t.appAccountToken,
            "appBundleID": t.appBundleID,
            "debugDescription": serializeDebug(t.debugDescription),
            "deviceVerification": t.deviceVerification,
            "deviceVerificationNonce": t.deviceVerificationNonce,
            "expirationDate": t.expirationDate,
            "id": t.id,
            "isUpgraded": t.isUpgraded,
            "jsonRepresentation": serializeDebug(t.jsonRepresentation),
            "offerID": t.offerID,
            "offerType": serialize(t.offerType),
            "originalID": t.originalID,
            "originalPurchaseDate": t.originalPurchaseDate,
            "ownershipType": serialize(t.ownershipType),
            "productID": t.productID,
            "productType": serialize(t.productType),
            "purchaseDate": t.purchaseDate,
            "purchasedQuantity": t.purchasedQuantity,
            "revocationDate": t.revocationDate,
            "revocationReason": t.revocationReason,
            "signedDate": t.signedDate,
            "subscriptionGroupID": t.subscriptionGroupID,
            "webOrderLineItemID": t.webOrderLineItemID
    ]
}

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
func serialize(_ ot: Transaction.OwnershipType?) -> String? {
    guard let ot = ot else {return nil}
    switch ot {
    case .purchased: return "purchased"
    case .familyShared: return "familyShared"
    default:
        return nil
    }
}
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

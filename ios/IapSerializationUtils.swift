//
//  IapSerializationUtils.swift
//  RNIap
//
//  Created by Aguilar Andres on 8/18/22.
//

import Foundation
import StoreKit

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
            "subscription": serialize(p.subscription),
            "type": serialize(p.type)
    ]
}

func serialize(_ e: Error?) -> [String: Any?]? {
    guard let e = e else {return nil}
    return ["localizedDescription": e.localizedDescription]
}

func serialize(_ si: Product.SubscriptionInfo?) -> [String: Any?]? {
    guard let si = si else {return nil}
    return [
        "subscriptionGroupID": si.subscriptionGroupID,
        "promotionalOffers": si.promotionalOffers.map {(offer: Product.SubscriptionOffer) in serialize(offer)},
        "introductoryOffer": serialize(si.introductoryOffer),
        "subscriptionPeriod": si.subscriptionPeriod
    ]
}

func serialize(_ so: Product.SubscriptionOffer?) -> [String: Any?]? {
    guard let so = so else {return nil}
    return [
        "id": so.id,
        "price": so.price,
        "displayPrice": so.displayPrice,
        "type": so.type,
        "paymentMode": so.paymentMode,
        "period": so.period,
        "periodCount": so.periodCount
    ]
}

// Transaction
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

//
//  IapTypes.swift
//  RNIap
//
//  Created by Andres Aguilar on 8/18/22.
//

import Foundation
import StoreKit

typealias RNIapIosPromise = (RCTPromiseResolveBlock, RCTPromiseRejectBlock)

@available(iOS 15.0, *)
struct ProductOrError {
    let product: Product?
    let error: Error?
}

public enum StoreError: Error {
    case failedVerification
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
    case E_SYNC_ERROR = "E_SYNC_ERROR"
    case E_DEFERRED_PAYMENT = "E_DEFERRED_PAYMENT"
    func asInt() -> Int {
        return IapErrors.allCases.firstIndex(of: self)!
    }
}

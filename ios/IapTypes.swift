//
//  IapTypes.swift
//  RNIap
//
//  Created by Andres Aguilar on 8/18/22.
//

import Foundation
import StoreKit

typealias RNIapIosPromise = (RCTPromiseResolveBlock, RCTPromiseRejectBlock)

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
    case E_TRANSACTION_VALIDATION_FAILED = "E_TRANSACTION_VALIDATION_FAILED"
    func asInt() -> Int {
        return IapErrors.allCases.firstIndex(of: self)!
    }
}

// Based on https://stackoverflow.com/a/40135192/570612
extension Date {
    var millisecondsSince1970: Int64 {
        return Int64((self.timeIntervalSince1970 * 1000.0).rounded())
    }

    var millisecondsSince1970String: String {
        return String(self.millisecondsSince1970)
    }

    init(milliseconds: Int64) {
        self = Date(timeIntervalSince1970: TimeInterval(milliseconds) / 1000)
    }
}

extension SKProductsRequest {
    var key: String {
        return String(self.hashValue)
    }
}

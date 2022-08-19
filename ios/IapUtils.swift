//
//  IapUtils.swift
//  RNIap
//
//  Created by Aguilar Andres on 8/15/22.
//

import Foundation
import StoreKit

public func debugMessage(_ object: Any...) {
    #if DEBUG
    for item in object {
        print("[react-native-iap] \(item)")
    }
    #endif
}

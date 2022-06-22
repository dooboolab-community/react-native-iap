package com.dooboolab.RNIap

import android.util.Log
import com.facebook.react.bridge.ObjectAlreadyConsumedException
import com.facebook.react.bridge.Promise

/**
 * Extension functions used to simplify promise handling since we don't
 * want to crash in the case of it being resolved/rejected more than once
 */

fun Promise.safeResolve(value: Any) {
    try {
        this.resolve(value)
    } catch (oce: ObjectAlreadyConsumedException) {
        Log.d(RNIapModule.TAG, "Already consumed ${oce.message}")
    }
}

fun Promise.safeReject(code: String?, message: String?) {
    try {
        this.reject(code, message)
    } catch (oce: ObjectAlreadyConsumedException) {
        Log.d(RNIapModule.TAG, "Already consumed ${oce.message}")
    }
}

fun Promise.safeReject(message: String) {
    try {
        this.reject(message)
    } catch (oce: ObjectAlreadyConsumedException) {
        Log.d(RNIapModule.TAG, "Already consumed ${oce.message}")
    }
}

fun Promise.safeReject(code: String, throwable: Throwable) {
    try {
        this.reject(code, throwable)
    } catch (oce: ObjectAlreadyConsumedException) {
        Log.d(RNIapModule.TAG, "Already consumed ${oce.message}")
    }
}

fun Promise.safeReject(code: String, message: String, throwable: Throwable) {
    try {
        this.reject(code, message, throwable)
    } catch (oce: ObjectAlreadyConsumedException) {
        Log.d(RNIapModule.TAG, "Already consumed ${oce.message}")
    }
}

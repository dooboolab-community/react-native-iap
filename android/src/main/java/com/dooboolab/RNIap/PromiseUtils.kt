package com.dooboolab.RNIap

import android.util.Log
import com.facebook.react.bridge.ObjectAlreadyConsumedException
import com.facebook.react.bridge.Promise
import java.lang.Exception
import java.util.ArrayList
import java.util.HashMap

object PromiseUtils {
    private val promises = HashMap<String, ArrayList<Promise>>()
    fun addPromiseForKey(key: String, promise: Promise) {
        try {
            val list: ArrayList<Promise>
            if (promises.containsKey(key)) {
                list = promises[key]!!
            } else {
                list = ArrayList()
            }
            list.add(promise)
            promises[key] = list
        } catch (oce: ObjectAlreadyConsumedException) {
            Log.e(TAG, oce.message!!)
        }
    }

    fun resolvePromisesForKey(key: String, value: Any?) {
        try {
            if (promises.containsKey(key)) {
                val list = promises[key]!!
                for (promise in list) {
                    promise.resolve(value)
                }
                promises.remove(key)
            }
        } catch (oce: ObjectAlreadyConsumedException) {
            Log.e(TAG, oce.message!!)
        }
    }

    fun rejectAllPendingPromises() {
        promises.flatMap { it.value }.forEach { promise ->
            promise.safeReject(E_CONNECTION_CLOSED, "Connection has been closed", null)
        }
        promises.clear()
    }

    fun rejectPromisesForKey(
        key: String,
        code: String?,
        message: String?,
        err: Exception?
    ) {
        try {
            if (promises.containsKey(key)) {
                val list = promises[key]!!
                for (promise in list) {
                    promise.reject(code, message, err)
                }
                promises.remove(key)
            }
        } catch (oce: ObjectAlreadyConsumedException) {
            Log.e(TAG, oce.message!!)
        }
    }

        private const val TAG = "PromiseUtils"
        const val E_UNKNOWN = "E_UNKNOWN"
        const val E_NOT_PREPARED = "E_NOT_PREPARED"
        const val E_ALREADY_PREPARED = "E_ALREADY_PREPARED"
        const val E_NOT_ENDED = "E_NOT_ENDED"
        const val E_USER_CANCELLED = "E_USER_CANCELLED"
        const val E_ITEM_UNAVAILABLE = "E_ITEM_UNAVAILABLE"
        const val E_NETWORK_ERROR = "E_NETWORK_ERROR"
        const val E_SERVICE_ERROR = "E_SERVICE_ERROR"
        const val E_ALREADY_OWNED = "E_ALREADY_OWNED"
        const val E_REMOTE_ERROR = "E_REMOTE_ERROR"
        const val E_USER_ERROR = "E_USER_ERROR"
        const val E_DEVELOPER_ERROR = "E_DEVELOPER_ERROR"
        const val E_BILLING_RESPONSE_JSON_PARSE_ERROR = "E_BILLING_RESPONSE_JSON_PARSE_ERROR"
        const val E_CONNECTION_CLOSED = "E_CONNECTION_CLOSED"

}

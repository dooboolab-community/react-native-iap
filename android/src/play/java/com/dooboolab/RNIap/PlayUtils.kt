package com.dooboolab.RNIap

import com.facebook.react.bridge.Promise
import com.android.billingclient.api.BillingClient
import com.dooboolab.RNIap.DoobooUtils
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.android.billingclient.api.PurchasesUpdatedListener
import com.facebook.react.bridge.ReactContext
import com.android.billingclient.api.SkuDetails
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.common.ConnectionResult
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingResult
import com.facebook.react.bridge.ObjectAlreadyConsumedException
import java.lang.Exception
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.ConsumeParams
import com.android.billingclient.api.ConsumeResponseListener
import com.facebook.react.bridge.WritableNativeArray
import com.android.billingclient.api.PurchasesResponseListener
import java.util.ArrayList
import com.facebook.react.bridge.ReadableArray
import com.android.billingclient.api.SkuDetailsParams
import com.android.billingclient.api.SkuDetailsResponseListener
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableNativeMap
import com.android.billingclient.api.PurchaseHistoryResponseListener
import com.android.billingclient.api.PurchaseHistoryRecord
import com.facebook.react.bridge.WritableArray
import android.app.Activity
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingFlowParams.SubscriptionUpdateParams
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.AcknowledgePurchaseResponseListener
import com.android.billingclient.api.AccountIdentifiers
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.JavaScriptModule
import com.facebook.react.bridge.NativeModule

class PlayUtils {
    fun rejectPromiseWithBillingError(promise: Promise, responseCode: Int) {
        val errorData = getBillingResponseData(responseCode)
        promise.reject(errorData[0], errorData[1])
    }

    fun getBillingResponseData(responseCode: Int): Array<String?> {
        val errorData = arrayOfNulls<String>(2)
        when (responseCode) {
            BillingClient.BillingResponseCode.FEATURE_NOT_SUPPORTED -> {
                errorData[0] = DoobooUtils.E_SERVICE_ERROR
                errorData[1] = "This feature is not available on your device."
            }
            BillingClient.BillingResponseCode.SERVICE_DISCONNECTED -> {
                errorData[0] = DoobooUtils.E_NETWORK_ERROR
                errorData[1] = "The service is disconnected (check your internet connection.)"
            }
            BillingClient.BillingResponseCode.OK -> {
                errorData[0] = "OK"
                errorData[1] = ""
            }
            BillingClient.BillingResponseCode.USER_CANCELED -> {
                errorData[0] = DoobooUtils.E_USER_CANCELLED
                errorData[1] = "Payment is Cancelled."
            }
            BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE -> {
                errorData[0] = DoobooUtils.E_SERVICE_ERROR
                errorData[1] =
                    "The service is unreachable. This may be your internet connection, or the Play Store may be down."
            }
            BillingClient.BillingResponseCode.BILLING_UNAVAILABLE -> {
                errorData[0] = DoobooUtils.E_SERVICE_ERROR
                errorData[1] =
                    "Billing is unavailable. This may be a problem with your device, or the Play Store may be down."
            }
            BillingClient.BillingResponseCode.ITEM_UNAVAILABLE -> {
                errorData[0] = DoobooUtils.E_ITEM_UNAVAILABLE
                errorData[1] = "That item is unavailable."
            }
            BillingClient.BillingResponseCode.DEVELOPER_ERROR -> {
                errorData[0] = DoobooUtils.E_DEVELOPER_ERROR
                errorData[1] = "Google is indicating that we have some issue connecting to payment."
            }
            BillingClient.BillingResponseCode.ERROR -> {
                errorData[0] = DoobooUtils.E_UNKNOWN
                errorData[1] = "An unknown or unexpected error has occured. Please try again later."
            }
            BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED -> {
                errorData[0] = DoobooUtils.E_ALREADY_OWNED
                errorData[1] = "You already own this item."
            }
            else -> {
                errorData[0] = DoobooUtils.E_UNKNOWN
                errorData[1] = "Purchase failed with code: $responseCode"
            }
        }
        Log.e(TAG, "Error Code : $responseCode")
        return errorData
    }

    fun rejectPromisesWithBillingError(key: String, responseCode: Int) {
        val errorData = getBillingResponseData(responseCode)
        DoobooUtils.instance.rejectPromisesForKey(key, errorData[0], errorData[1], null)
    }

    companion object {
        private const val TAG = "PlayUtils"
        const val E_PLAY_SERVICES_UNAVAILABLE = "E_PLAY_SERVICES_UNAVAILABLE"
        val instance = PlayUtils()
    }
}
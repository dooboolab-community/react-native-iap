package com.dooboolab.RNIap

import android.util.Log
import com.amazon.device.drm.LicensingListener
import com.amazon.device.drm.LicensingService
import com.amazon.device.drm.model.LicenseResponse
import com.amazon.device.iap.PurchasingService
import com.amazon.device.iap.model.FulfillmentResult
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.module.annotations.ReactModule


@ReactModule(name = RNIapAmazonModule.TAG)
class RNIapAmazonModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    var hasListener = false
    private var amazonListener: RNIapAmazonListener? = null
    override fun getName(): String {
        return TAG
    }

    @ReactMethod
    fun initConnection(promise: Promise) {
        val context = reactApplicationContext
        val amazonListener = RNIapAmazonListener(context)
        this.amazonListener = amazonListener
        UiThreadUtil.runOnUiThread {
            try {
                    PurchasingService.registerListener(context.applicationContext, amazonListener)
                    hasListener = true
                    // Prefetch user and purchases as per Amazon SDK documentation:
                    PurchasingService.getUserData()
                    PurchasingService.getPurchaseUpdates(false)
                    promise.safeResolve(true)

            }catch (e:Exception){
                promise.safeReject("Error initializing Amazon appstore sdk", e)
            }
        }
    }

    @ReactMethod
    fun verifyLicense(promise: Promise){
        try {
            LicensingService.verifyLicense(reactApplicationContext) { licenseResponse ->
                when (val status: LicenseResponse.RequestStatus =
                    licenseResponse.requestStatus) {
                    LicenseResponse.RequestStatus.LICENSED -> {
                        Log.d(TAG, "LicenseResponse status: $status")
                        promise.resolve("LICENSED")
                    }
                    LicenseResponse.RequestStatus.NOT_LICENSED -> {
                        Log.d(TAG, "LicenseResponse status: $status")
                        promise.resolve("NOT_LICENSED")
                    }
                    LicenseResponse.RequestStatus.EXPIRED -> {
                        Log.d(TAG, "LicenseResponse status: $status")
                        promise.resolve("EXPIRED")
                    }
                    LicenseResponse.RequestStatus.ERROR_VERIFICATION -> {
                        Log.d(TAG, "LicenseResponse status: $status")
                        promise.resolve("ERROR_VERIFICATION")
                    }
                    LicenseResponse.RequestStatus.ERROR_INVALID_LICENSING_KEYS -> {
                        Log.d(TAG, "LicenseResponse status: $status")
                        promise.resolve("ERROR_INVALID_LICENSING_KEYS")
                    }
                    LicenseResponse.RequestStatus.UNKNOWN_ERROR -> {
                        Log.d(TAG, "LicenseResponse status: $status")
                        promise.resolve("UNKNOWN_ERROR")
                    }
                }
            }
        }catch (exception: Exception){
            promise.reject("Error while attempting to check for License",exception)
        }
    }

    @ReactMethod
    fun endConnection(promise: Promise) {
        PromiseUtils.rejectAllPendingPromises()
        amazonListener?.clear()
        hasListener = false
        promise.resolve(true)
    }

    @ReactMethod
    fun getUser(promise: Promise) {
        val requestId = PurchasingService.getUserData()
        PromiseUtils.addPromiseForKey(PROMISE_GET_USER_DATA, promise)
    }

    @ReactMethod
    fun flushFailedPurchasesCachedAsPending(promise: Promise) {
        // No-op
        promise.resolve(true)
    }

    @ReactMethod
    fun getItemsByType(type: String?, skuArr: ReadableArray, promise: Promise) {
        val productSkus: MutableSet<String> = HashSet()
        var ii = 0
        val skuSize = skuArr.size()
        while (ii < skuSize) {
            val sku = skuArr.getString(ii)
            if (sku is String) {
                productSkus.add(sku)
            }
            ii++
        }
        PromiseUtils.addPromiseForKey(PROMISE_GET_PRODUCT_DATA, promise)
        val requestId = PurchasingService.getProductData(productSkus)
    }

    @ReactMethod
    fun getAvailableItems(promise: Promise) {
        PromiseUtils.addPromiseForKey(PROMISE_QUERY_AVAILABLE_ITEMS, promise)
        PurchasingService.getPurchaseUpdates(true)
    }

    @ReactMethod
    fun buyItemByType(
        sku: String?,
        promise: Promise
    ) {
        PromiseUtils.addPromiseForKey(PROMISE_BUY_ITEM, promise)
        val requestId = PurchasingService.purchase(sku)
    }

    @ReactMethod
    fun acknowledgePurchase(
        token: String?,
        developerPayLoad: String?,
        promise: Promise
    ) {
        PurchasingService.notifyFulfillment(token, FulfillmentResult.FULFILLED)
        promise.resolve(true)
    }

    @ReactMethod
    fun consumeProduct(
        token: String?,
        developerPayLoad: String?,
        promise: Promise
    ) {
        PurchasingService.notifyFulfillment(token, FulfillmentResult.FULFILLED)
        promise.resolve(true)
    }

    private fun sendUnconsumedPurchases(promise: Promise) {
        PromiseUtils.addPromiseForKey(PROMISE_QUERY_PURCHASES, promise)
        PurchasingService.getPurchaseUpdates(false)
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        sendUnconsumedPurchases(promise)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Keep: Required for RN built-in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Double) {
        // Keep: Required for RN built-in Event Emitter Calls.
    }

    companion object {
        const val PROMISE_BUY_ITEM = "PROMISE_BUY_ITEM"
        const val PROMISE_GET_PRODUCT_DATA = "PROMISE_GET_PRODUCT_DATA"
        const val PROMISE_QUERY_PURCHASES = "PROMISE_QUERY_PURCHASES"
        const val PROMISE_QUERY_AVAILABLE_ITEMS = "PROMISE_QUERY_AVAILABLE_ITEMS"
        const val PROMISE_GET_USER_DATA = "PROMISE_GET_USER_DATA"

        const val TAG = "RNIapAmazonModule"
    }
    init {
        val lifecycleEventListener: LifecycleEventListener = object : LifecycleEventListener {
            /**
             * From https://developer.amazon.com/docs/in-app-purchasing/iap-implement-iap.html#getpurchaseupdates-responses
             * We should fetch updates on resume
             */
            override fun onHostResume() {
                if (hasListener) {
                    PurchasingService.getUserData()
                    PurchasingService.getPurchaseUpdates(false)
                }
            }
            override fun onHostPause() {}
            override fun onHostDestroy() {
            }
        }
        reactContext.addLifecycleEventListener(lifecycleEventListener)
    }
}

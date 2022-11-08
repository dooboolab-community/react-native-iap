package com.dooboolab.RNIap

import android.os.Handler
import android.os.Looper
import android.util.Log
import com.amazon.device.drm.LicensingService
import com.amazon.device.drm.model.LicenseResponse
import com.amazon.device.iap.PurchasingListener
import com.amazon.device.iap.model.FulfillmentResult
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = RNIapAmazonModule.TAG)
class RNIapAmazonModule(
    reactContext: ReactApplicationContext,
    private val purchasingService: PurchasingServiceProxy = PurchasingServiceProxyAmazonImpl(),
    private val handler: Handler = Handler(Looper.getMainLooper()),
    private val amazonListener: PurchasingListener = RNIapAmazonListener(reactContext, purchasingService)
) :
    ReactContextBaseJavaModule(reactContext) {
    var hasListener = false
    override fun getName(): String {
        return TAG
    }

    @ReactMethod
    fun initConnection(promise: Promise) {
        val context = reactApplicationContext

        handler.postDelayed({
            try {
                purchasingService.registerListener(context.applicationContext, amazonListener)
                hasListener = true
                // Prefetch user and purchases as per Amazon SDK documentation:
                purchasingService.getUserData()
                purchasingService.getPurchaseUpdates(false)
                promise.safeResolve(true)
            } catch (e: Exception) {
                promise.safeReject("Error initializing Amazon appstore sdk", e)
            }
        }, 0L)
    }

    @ReactMethod
    fun verifyLicense(promise: Promise) {
        try {
            LicensingService.verifyLicense(reactApplicationContext) { licenseResponse ->
                when (
                    val status: LicenseResponse.RequestStatus =
                        licenseResponse.requestStatus
                ) {
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
        } catch (exception: Exception) {
            promise.reject("Error while attempting to check for License", exception)
        }
    }

    @ReactMethod
    fun endConnection(promise: Promise) {
        PromiseUtils.rejectAllPendingPromises()
        hasListener = false
        promise.resolve(true)
    }

    @ReactMethod
    fun getUser(promise: Promise) {
        val requestId = purchasingService.getUserData()
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
        val requestId = purchasingService.getProductData(productSkus)
    }

    @ReactMethod
    fun getAvailableItems(promise: Promise) {
        PromiseUtils.addPromiseForKey(PROMISE_QUERY_AVAILABLE_ITEMS, promise)
        purchasingService.getPurchaseUpdates(true)
    }

    @ReactMethod
    fun buyItemByType(
        sku: String?,
        promise: Promise
    ) {
        PromiseUtils.addPromiseForKey(PROMISE_BUY_ITEM, promise)
        val requestId = purchasingService.purchase(sku)
    }

    @ReactMethod
    fun acknowledgePurchase(
        token: String?,
        developerPayLoad: String?,
        promise: Promise
    ) {
        purchasingService.notifyFulfillment(token, FulfillmentResult.FULFILLED)
        promise.resolve(true)
    }

    @ReactMethod
    fun consumeProduct(
        token: String?,
        developerPayLoad: String?,
        promise: Promise
    ) {
        purchasingService.notifyFulfillment(token, FulfillmentResult.FULFILLED)
        promise.resolve(true)
    }

    private fun sendUnconsumedPurchases(promise: Promise) {
        PromiseUtils.addPromiseForKey(PROMISE_QUERY_PURCHASES, promise)
        purchasingService.getPurchaseUpdates(false)
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
                    purchasingService.getUserData()
                    purchasingService.getPurchaseUpdates(false)
                }
            }
            override fun onHostPause() {}
            override fun onHostDestroy() {
            }
        }
        reactContext.addLifecycleEventListener(lifecycleEventListener)
    }
}

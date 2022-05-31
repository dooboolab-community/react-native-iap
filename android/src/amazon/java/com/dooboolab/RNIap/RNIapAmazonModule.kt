package com.dooboolab.RNIap

import com.amazon.device.iap.PurchasingService
import com.amazon.device.iap.model.FulfillmentResult
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableNativeArray
import java.util.HashSet

class RNIapAmazonModule(reactContext: ReactApplicationContext?) :
    ReactContextBaseJavaModule(reactContext) {
    val TAG = "RNIapAmazonModule"
    override fun getName(): String {
        return TAG
    }

    @ReactMethod
    fun initConnection(promise: Promise) {
        val context = reactApplicationContext
        PurchasingService.registerListener(context, RNIapAmazonListener(context))
        // Prefetch user and purchases as per Amazon SDK documentation:
        PurchasingService.getUserData()
        PurchasingService.getPurchaseUpdates(false)
        promise.resolve(true)
    }

    @ReactMethod
    fun endConnection(promise: Promise) {
        promise.resolve(true)
    }

    @ReactMethod
    fun getUser(promise: Promise) {
        val requestId = PurchasingService.getUserData()
        DoobooUtils.instance.addPromiseForKey(PROMISE_GET_USER_DATA, promise)
    }

    @ReactMethod
    fun flushFailedPurchasesCachedAsPending(promise: Promise) {
        // No-op
        val items = WritableNativeArray()
        promise.resolve(items)
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
        DoobooUtils.instance.addPromiseForKey(PROMISE_GET_PRODUCT_DATA, promise)
        val requestId = PurchasingService.getProductData(productSkus)
    }

    @ReactMethod
    fun getAvailableItems(promise: Promise) {
        DoobooUtils.instance.addPromiseForKey(PROMISE_QUERY_AVAILABLE_ITEMS, promise)
        PurchasingService.getPurchaseUpdates(true)
    }

    @ReactMethod
    fun buyItemByType(
        type: String?,
        sku: String?,
        purchaseToken: String?,
        prorationMode: Int?,
        obfuscatedAccountId: String?,
        obfuscatedProfileId: String?,
        promise: Promise
    ) {
        DoobooUtils.instance.addPromiseForKey(PROMISE_BUY_ITEM, promise)
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
        PurchasingService.getPurchaseUpdates(false)
        DoobooUtils.instance.addPromiseForKey(PROMISE_QUERY_PURCHASES, promise)
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
    }
}

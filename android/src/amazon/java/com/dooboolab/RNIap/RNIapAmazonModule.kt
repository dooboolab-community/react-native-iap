package com.dooboolab.RNIap

import com.facebook.react.ReactPackage
import java.lang.Class
import com.facebook.react.bridge.JavaScriptModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.NativeModule
import java.util.ArrayList
import com.dooboolab.RNIap.RNIapAmazonModule
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.amazon.device.iap.PurchasingService
import com.dooboolab.RNIap.RNIapAmazonListener
import com.amazon.device.iap.model.RequestId
import com.dooboolab.RNIap.DoobooUtils
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.ReadableArray
import java.util.HashSet
import com.amazon.device.iap.model.FulfillmentResult
import com.facebook.react.bridge.ReactContext
import com.amazon.device.iap.PurchasingListener
import com.amazon.device.iap.model.Product
import com.amazon.device.iap.model.ProductDataResponse
import com.amazon.device.iap.model.ProductType
import java.lang.NumberFormatException
import android.util.Log
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.amazon.device.iap.model.CoinsReward
import com.amazon.device.iap.model.PurchaseUpdatesResponse
import com.amazon.device.iap.model.Receipt
import com.facebook.react.bridge.WritableNativeMap
import com.amazon.device.iap.model.PurchaseResponse
import com.amazon.device.iap.model.UserDataResponse
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

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
            productSkus.add(skuArr.getString(ii))
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
        token: String?, developerPayLoad: String?, promise: Promise
    ) {
        PurchasingService.notifyFulfillment(token, FulfillmentResult.FULFILLED)
        promise.resolve(true)
    }

    @ReactMethod
    fun consumeProduct(
        token: String?, developerPayLoad: String?, promise: Promise
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

    companion object {
        const val PROMISE_BUY_ITEM = "PROMISE_BUY_ITEM"
        const val PROMISE_GET_PRODUCT_DATA = "PROMISE_GET_PRODUCT_DATA"
        const val PROMISE_QUERY_PURCHASES = "PROMISE_QUERY_PURCHASES"
        const val PROMISE_QUERY_AVAILABLE_ITEMS = "PROMISE_QUERY_AVAILABLE_ITEMS"
        const val PROMISE_GET_USER_DATA = "PROMISE_GET_USER_DATA"
    }
}
package com.dooboolab.RNIap

import android.util.Log
import com.amazon.device.iap.PurchasingListener
import com.amazon.device.iap.PurchasingService
import com.amazon.device.iap.model.Product
import com.amazon.device.iap.model.ProductDataResponse
import com.amazon.device.iap.model.ProductType
import com.amazon.device.iap.model.PurchaseResponse
import com.amazon.device.iap.model.PurchaseUpdatesResponse
import com.amazon.device.iap.model.Receipt
import com.amazon.device.iap.model.UserData
import com.amazon.device.iap.model.UserDataResponse
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import java.lang.NumberFormatException
import java.util.ArrayList

class RNIapAmazonListener(private val reactContext: ReactContext) : PurchasingListener {
    private val skus: MutableList<Product>
    private var availableItems: WritableNativeArray
    private var availableItemsType: String?
    fun getPurchaseUpdatesByType(type: String?) {
        availableItemsType = type
        PurchasingService.getPurchaseUpdates(true)
    }

    override fun onProductDataResponse(response: ProductDataResponse) {
        val requestId = response.requestId.toString()
        when (response.requestStatus) {
            ProductDataResponse.RequestStatus.SUCCESSFUL -> {
                val productData = response.productData
                val unavailableSkus = response.unavailableSkus
                val items = WritableNativeArray()
                for ((_, product) in productData) {
                    if (!skus.contains(product)) {
                        skus.add(product)
                    }
                    val productType = product.productType
                    val productTypeString =
                        if (productType == ProductType.ENTITLED || productType == ProductType.CONSUMABLE) "inapp" else "subs"
                    var priceNumber: Number = 0.00
                    val priceString = product.price
                    try {
                        if (priceString?.isNotEmpty()== true) {
                            priceNumber = priceString.replace("[^\\d.,]+".toRegex(), "").toDouble()
                        }
                    } catch (e: NumberFormatException) {
                        Log.w(
                            TAG,
                            "onProductDataResponse: Failed to parse price for product: " + product.sku
                        )
                    }
                    val item = Arguments.createMap()
                    val coinsReward = product.coinsReward
                    item.putString("productId", product.sku)
                    item.putString("price", priceNumber.toString())
                    item.putString("type", productTypeString)
                    item.putString("localizedPrice", priceString)
                    item.putString("title", product.title)
                    item.putString("description", product.description)
                    item.putString("iconUrl", product.smallIconUrl)
                    item.putString("originalJson", product.toString())
                    item.putString("originalPrice", priceString)
                    // item.putString("userMarketplaceAmazon", marketplace);
                    if (coinsReward != null) {
                        item.putInt("coinsRewardAmountAmazon", coinsReward.amount)
                    }
                    items.pushMap(item)
                }
                PromiseUtils
                    .resolvePromisesForKey(
                        RNIapAmazonModule.PROMISE_GET_PRODUCT_DATA,
                        items
                    )
            }
            ProductDataResponse.RequestStatus.FAILED ->
                PromiseUtils
                    .rejectPromisesForKey(
                        RNIapAmazonModule.PROMISE_GET_PRODUCT_DATA,
                        E_PRODUCT_DATA_RESPONSE_FAILED,
                        null,
                        null
                    )
            ProductDataResponse.RequestStatus.NOT_SUPPORTED ->
                PromiseUtils
                    .rejectPromisesForKey(
                        RNIapAmazonModule.PROMISE_GET_PRODUCT_DATA,
                        E_PRODUCT_DATA_RESPONSE_NOT_SUPPORTED,
                        null,
                        null
                    )
        }
    }

    override fun onPurchaseUpdatesResponse(response: PurchaseUpdatesResponse) {
        // Info for potential error reporting
        val debugMessage: String?
        var errorCode = PromiseUtils.E_UNKNOWN
        val error = Arguments.createMap()
        when (response.requestStatus) {
            PurchaseUpdatesResponse.RequestStatus.SUCCESSFUL -> {
                val userData = response.userData
                var promiseItem: WritableMap? = null
                val purchases = response.receipts
                for (receipt in purchases) {
                    val item = receiptToMap(userData, receipt)
                    promiseItem = WritableNativeMap()
                    promiseItem.merge(item)
                    sendEvent(reactContext, "purchase-updated", item)
                    val productType = receipt.productType
                    val productTypeString =
                        if (productType == ProductType.ENTITLED || productType == ProductType.CONSUMABLE) "inapp" else "subs"
                    if (productTypeString == availableItemsType) {
                        availableItems.pushMap(promiseItem)
                    }
                }
                if (response.hasMore()) {
                    PurchasingService.getPurchaseUpdates(false)
                } else {
                    if (purchases.size > 0 && promiseItem != null) {
                        PromiseUtils
                            .resolvePromisesForKey(
                                RNIapAmazonModule.PROMISE_BUY_ITEM,
                                promiseItem
                            )
                    }
                    PromiseUtils
                        .resolvePromisesForKey(
                            RNIapAmazonModule.PROMISE_QUERY_PURCHASES,
                            true
                        )
                    PromiseUtils
                        .resolvePromisesForKey(
                            RNIapAmazonModule.PROMISE_QUERY_AVAILABLE_ITEMS,
                            availableItems
                        )
                    availableItems = WritableNativeArray()
                    availableItemsType = null
                }
            }
            PurchaseUpdatesResponse.RequestStatus.FAILED -> {
                debugMessage = "An unknown or unexpected error has occured. Please try again later."
                errorCode = PromiseUtils.E_UNKNOWN
                error.putInt("responseCode", 0)
                error.putString("debugMessage", debugMessage)
                error.putString("code", errorCode)
                error.putString("message", debugMessage)
                sendEvent(reactContext, "purchase-error", error)
                PromiseUtils
                    .rejectPromisesForKey(
                        RNIapAmazonModule.PROMISE_QUERY_PURCHASES,
                        errorCode,
                        debugMessage,
                        null
                    )
                PromiseUtils
                    .rejectPromisesForKey(
                        RNIapAmazonModule.PROMISE_QUERY_AVAILABLE_ITEMS,
                        errorCode,
                        debugMessage,
                        null
                    )
                availableItems = WritableNativeArray()
                availableItemsType = null
            }
            PurchaseUpdatesResponse.RequestStatus.NOT_SUPPORTED -> {
                debugMessage = "This feature is not available on your device."
                errorCode = PromiseUtils.E_SERVICE_ERROR
                error.putInt("responseCode", 0)
                error.putString("debugMessage", debugMessage)
                error.putString("code", errorCode)
                error.putString("message", debugMessage)
                sendEvent(reactContext, "purchase-error", error)
                PromiseUtils
                    .rejectPromisesForKey(
                        RNIapAmazonModule.PROMISE_QUERY_PURCHASES,
                        errorCode,
                        debugMessage,
                        null
                    )
                PromiseUtils
                    .rejectPromisesForKey(
                        RNIapAmazonModule.PROMISE_QUERY_AVAILABLE_ITEMS,
                        errorCode,
                        debugMessage,
                        null
                    )
                availableItems = WritableNativeArray()
                availableItemsType = null
            }
        }
    }

    private fun receiptToMap(userData: UserData, receipt: Receipt): WritableMap {
        val item = Arguments.createMap()
        item.putString("productId", receipt.sku)
        item.putDouble("transactionDate", receipt.purchaseDate.time.toDouble())
        item.putString("purchaseToken", receipt.receiptId)
        item.putString("transactionReceipt", receipt.toJSON().toString())
        item.putString("userIdAmazon", userData.userId)
        item.putString("userMarketplaceAmazon", userData.marketplace)
        item.putString("userJsonAmazon", userData.toJSON().toString())
        item.putBoolean("isCanceledAmazon", receipt.isCanceled)
        item.putString("termSku",receipt.termSku)
        return item
    }

    override fun onPurchaseResponse(response: PurchaseResponse) {
        val requestId = response.requestId.toString()
        val userId = response.userData.userId
        val status = response.requestStatus

        // Info for potential error reporting
        val debugMessage: String?
        var errorCode = PromiseUtils.E_UNKNOWN
        val error = Arguments.createMap()
        when (status) {
            PurchaseResponse.RequestStatus.SUCCESSFUL -> {
                val receipt = response.receipt
                val userData = response.userData
                val item = receiptToMap(userData, receipt)
                val promiseItem: WritableMap = WritableNativeMap()
                promiseItem.merge(item)
                sendEvent(reactContext, "purchase-updated", item)
                PromiseUtils
                    .resolvePromisesForKey(
                        RNIapAmazonModule.PROMISE_BUY_ITEM,
                        promiseItem
                    )
            }
            PurchaseResponse.RequestStatus.ALREADY_PURCHASED -> {
                debugMessage = "You already own this item."
                errorCode = PromiseUtils.E_ALREADY_OWNED
                error.putInt("responseCode", 0)
                error.putString("debugMessage", debugMessage)
                error.putString("code", errorCode)
                error.putString("message", debugMessage)
                sendEvent(reactContext, "purchase-error", error)
                PromiseUtils
                    .rejectPromisesForKey(
                        RNIapAmazonModule.PROMISE_BUY_ITEM,
                        errorCode,
                        debugMessage,
                        null
                    )
            }
            PurchaseResponse.RequestStatus.FAILED -> {
                debugMessage =
                    "An unknown or unexpected error has occurred. Please try again later."
                errorCode = PromiseUtils.E_UNKNOWN
                error.putInt("responseCode", 0)
                error.putString("debugMessage", debugMessage)
                error.putString("code", errorCode)
                error.putString("message", debugMessage)
                sendEvent(reactContext, "purchase-error", error)
                PromiseUtils
                    .rejectPromisesForKey(
                        RNIapAmazonModule.PROMISE_BUY_ITEM,
                        errorCode,
                        debugMessage,
                        null
                    )
            }
            PurchaseResponse.RequestStatus.INVALID_SKU -> {
                debugMessage = "That item is unavailable."
                errorCode = PromiseUtils.E_ITEM_UNAVAILABLE
                error.putInt("responseCode", 0)
                error.putString("debugMessage", debugMessage)
                error.putString("code", errorCode)
                error.putString("message", debugMessage)
                sendEvent(reactContext, "purchase-error", error)
                PromiseUtils
                    .rejectPromisesForKey(
                        RNIapAmazonModule.PROMISE_BUY_ITEM,
                        errorCode,
                        debugMessage,
                        null
                    )
            }
            PurchaseResponse.RequestStatus.NOT_SUPPORTED -> {
                debugMessage = "This feature is not available on your device."
                errorCode = PromiseUtils.E_SERVICE_ERROR
                error.putInt("responseCode", 0)
                error.putString("debugMessage", debugMessage)
                error.putString("code", errorCode)
                error.putString("message", debugMessage)
                sendEvent(reactContext, "purchase-error", error)
                PromiseUtils
                    .rejectPromisesForKey(
                        RNIapAmazonModule.PROMISE_BUY_ITEM,
                        errorCode,
                        debugMessage,
                        null
                    )
            }
        }
    }

    override fun onUserDataResponse(response: UserDataResponse) {
        when (response.requestStatus) {
            UserDataResponse.RequestStatus.SUCCESSFUL -> {
                val userData = response.userData
                val item = Arguments.createMap()
                item.putString("userIdAmazon", userData.userId)
                item.putString("userMarketplaceAmazon", userData.marketplace)
                item.putString("userJsonAmazon", userData.toJSON().toString())
                PromiseUtils
                    .resolvePromisesForKey(RNIapAmazonModule.PROMISE_GET_USER_DATA, item)
            }
            UserDataResponse.RequestStatus.NOT_SUPPORTED ->
                PromiseUtils
                    .rejectPromisesForKey(
                        RNIapAmazonModule.PROMISE_GET_USER_DATA,
                        E_USER_DATA_RESPONSE_NOT_SUPPORTED,
                        null,
                        null
                    )
            UserDataResponse.RequestStatus.FAILED ->
                PromiseUtils
                    .rejectPromisesForKey(
                        RNIapAmazonModule.PROMISE_GET_USER_DATA,
                        E_USER_DATA_RESPONSE_FAILED,
                        null,
                        null
                    )
        }
    }
    fun clear(){
        skus.clear()

    }

    private fun sendEvent(
        reactContext: ReactContext,
        eventName: String,
        params: WritableMap?
    ) {
        reactContext
            .getJSModule(RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    companion object {
        private const val E_PRODUCT_DATA_RESPONSE_FAILED = "E_PRODUCT_DATA_RESPONSE_FAILED"
        private const val E_PRODUCT_DATA_RESPONSE_NOT_SUPPORTED =
            "E_PRODUCT_DATA_RESPONSE_NOT_SUPPORTED"
        private const val E_PURCHASE_UPDATES_RESPONSE_FAILED = "E_PURCHASE_UPDATES_RESPONSE_FAILED"
        private const val E_PURCHASE_UPDATES_RESPONSE_NOT_SUPPORTED =
            "E_PURCHASE_UPDATES_RESPONSE_NOT_SUPPORTED"
        private const val E_PURCHASE_RESPONSE_FAILED = "E_PURCHASE_RESPONSE_FAILED"
        private const val E_PURCHASE_RESPONSE_ALREADY_PURCHASED =
            "E_PURCHASE_RESPONSE_ALREADY_PURCHASED"
        private const val E_PURCHASE_RESPONSE_NOT_SUPPORTED = "E_PURCHASE_RESPONSE_NOT_SUPPORTED"
        private const val E_PURCHASE_RESPONSE_INVALID_SKU = "E_PURCHASE_RESPONSE_INVALID_SKU"
        private const val E_USER_DATA_RESPONSE_FAILED = "E_USER_DATA_RESPONSE_FAILED"
        private const val E_USER_DATA_RESPONSE_NOT_SUPPORTED = "E_USER_DATA_RESPONSE_NOT_SUPPORTED"
        const val TAG = "RNIapAmazonListener"
    }

    init {
        skus = ArrayList()
        availableItems = WritableNativeArray()
        availableItemsType = null
    }
}

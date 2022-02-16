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
import java.math.BigDecimal

class RNIapModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext),
    PurchasesUpdatedListener {
    val TAG = "RNIapModule"
    private val reactContext: ReactContext
    private var billingClientCache: BillingClient? = null
    private val skus: MutableMap<String, SkuDetails>
    override fun getName(): String {
        return "RNIapModule"
    }

    private interface EnsureConnectionCallback {
        fun run(billingClient: BillingClient)
    }

    private fun ensureConnection(promise: Promise, callback: EnsureConnectionCallback) {
        val billingClient = billingClientCache
        if (billingClient != null && billingClient.isReady) {
            callback.run(billingClient)
            return
        }
        promise.reject(DoobooUtils.E_NOT_PREPARED, "Not initialized, Please call initConnection()")
    }

    @ReactMethod
    fun initConnection(promise: Promise) {
        if (billingClientCache != null) {
            Log.i(
                TAG,
                "Already initialized, you should only call initConnection() once when your app starts"
            )
            promise.resolve(true)
            return
        }
        if (GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(reactContext)
            != ConnectionResult.SUCCESS
        ) {
            Log.i(TAG, "Google Play Services are not available on this device")
            promise.resolve(false)
            return
        }
        billingClientCache =
            BillingClient.newBuilder(reactContext).enablePendingPurchases().setListener(this)
                .build()
        billingClientCache!!.startConnection(
            object : BillingClientStateListener {
                override fun onBillingSetupFinished(billingResult: BillingResult) {
                    val responseCode = billingResult.responseCode
                    try {
                        if (responseCode == BillingClient.BillingResponseCode.OK) {
                            promise.resolve(true)
                        } else {
                            PlayUtils.instance
                                .rejectPromiseWithBillingError(promise, responseCode)
                        }
                    } catch (oce: ObjectAlreadyConsumedException) {
                        Log.e(TAG, oce.message!!)
                    }
                }

                override fun onBillingServiceDisconnected() {
                    try {
                        promise.reject("initConnection", "Billing service disconnected")
                    } catch (oce: ObjectAlreadyConsumedException) {
                        Log.e(TAG, oce.message!!)
                    }
                }
            })
    }

    @ReactMethod
    fun endConnection(promise: Promise) {
        if (billingClientCache != null) {
            billingClientCache = try {
                billingClientCache!!.endConnection()
                null
            } catch (e: Exception) {
                promise.reject("endConnection", e.message)
                return
            }
        }
        try {
            promise.resolve(true)
        } catch (oce: ObjectAlreadyConsumedException) {
            Log.e(TAG, oce.message!!)
        }
    }

    private fun consumeItems(
        purchases: List<Purchase>,
        promise: Promise,
        expectedResponseCode: Int = BillingClient.BillingResponseCode.OK
    ) {
        for (purchase in purchases) {
            ensureConnection(
                promise,
                object : EnsureConnectionCallback {
                    override fun run(billingClient: BillingClient) {
                        val consumeParams =
                            ConsumeParams.newBuilder().setPurchaseToken(purchase.purchaseToken)
                                .build()
                        val listener =
                            ConsumeResponseListener { billingResult: BillingResult, outToken: String? ->
                                if (billingResult.responseCode != expectedResponseCode) {
                                    PlayUtils.instance
                                        .rejectPromiseWithBillingError(
                                            promise,
                                            billingResult.responseCode
                                        )
                                    return@ConsumeResponseListener
                                }
                                try {
                                    promise.resolve(true)
                                } catch (oce: ObjectAlreadyConsumedException) {
                                    promise.reject(oce.message)
                                }
                            }
                        billingClient.consumeAsync(consumeParams, listener)
                    }
                })
        }
    }

    @ReactMethod
    fun flushFailedPurchasesCachedAsPending(promise: Promise) {
        ensureConnection(
            promise,
            object : EnsureConnectionCallback {
                override fun run(billingClient: BillingClient) {
                    val array = WritableNativeArray()
                    billingClient.queryPurchasesAsync(
                        BillingClient.SkuType.INAPP
                    ) { billingResult: BillingResult?, list: List<Purchase>? ->
                        if (list == null) {
                            // No purchases found
                            promise.resolve(false)
                            return@queryPurchasesAsync
                        }
                        val pendingPurchases: MutableList<Purchase> = ArrayList()
                        for (purchase in list) {
                            // we only want to try to consume PENDING items, in order to force cache-refresh
                            // for
                            // them
                            if (purchase.purchaseState == Purchase.PurchaseState.PENDING) {
                                pendingPurchases.add(purchase)
                            }
                        }
                        if (pendingPurchases.size == 0) {
                            promise.resolve(false)
                            return@queryPurchasesAsync
                        }
                        consumeItems(
                            pendingPurchases,
                            promise,
                            BillingClient.BillingResponseCode.ITEM_NOT_OWNED
                        )
                    }
                }
            })
    }

    @ReactMethod
    fun getItemsByType(type: String?, skuArr: ReadableArray, promise: Promise) {
        ensureConnection(
            promise,
            object : EnsureConnectionCallback {
                override fun run(billingClient: BillingClient) {
                    val skuList = ArrayList<String>()
                    for (i in 0 until skuArr.size()) {
                        skuList.add(skuArr.getString(i))
                    }
                    val params = SkuDetailsParams.newBuilder()
                    params.setSkusList(skuList).setType(type!!)
                    billingClient.querySkuDetailsAsync(
                        params.build()
                    ) { billingResult: BillingResult, skuDetailsList: List<SkuDetails>? ->
                        Log.d(TAG, "responseCode: " + billingResult.responseCode)
                        if (billingResult.responseCode != BillingClient.BillingResponseCode.OK) {
                            PlayUtils.instance
                                .rejectPromiseWithBillingError(promise, billingResult.responseCode)
                            return@querySkuDetailsAsync
                        }
                        if (skuDetailsList != null) {
                            for (sku in skuDetailsList) {
                                skus.put(sku.getSku(), sku)
                            }
                        }
                        val items = WritableNativeArray()
                        for (skuDetails in skuDetailsList!!) {
                            val item = Arguments.createMap()
                            item.putString("productId", skuDetails.sku)
                            val introductoryPriceMicros = skuDetails.introductoryPriceAmountMicros
                            val priceAmountMicros = skuDetails.priceAmountMicros
                            // Use valueOf instead of constructors.
                            // See:
                            // https://www.javaworld.com/article/2073176/caution--double-to-bigdecimal-in-java.html
                            val priceAmount = BigDecimal.valueOf(priceAmountMicros)
                            val introductoryPriceAmount =
                                BigDecimal.valueOf(introductoryPriceMicros)
                            val microUnitsDivisor = BigDecimal.valueOf(1000000)
                            val price = priceAmount.divide(microUnitsDivisor).toString()
                            val introductoryPriceAsAmountAndroid =
                                introductoryPriceAmount.divide(microUnitsDivisor).toString()
                            item.putString("price", price)
                            item.putString("currency", skuDetails.priceCurrencyCode)
                            item.putString("type", skuDetails.type)
                            item.putString("localizedPrice", skuDetails.price)
                            item.putString("title", skuDetails.title)
                            item.putString("description", skuDetails.description)
                            item.putString("introductoryPrice", skuDetails.introductoryPrice)
                            item.putString("typeAndroid", skuDetails.type)
                            item.putString("packageNameAndroid", skuDetails.zzc())
                            item.putString("originalPriceAndroid", skuDetails.originalPrice)
                            item.putString(
                                "subscriptionPeriodAndroid",
                                skuDetails.subscriptionPeriod
                            )
                            item.putString("freeTrialPeriodAndroid", skuDetails.freeTrialPeriod)
                            item.putString(
                                "introductoryPriceCyclesAndroid",
                                skuDetails.introductoryPriceCycles.toString()
                            )
                            item.putString(
                                "introductoryPricePeriodAndroid", skuDetails.introductoryPricePeriod
                            )
                            item.putString(
                                "introductoryPriceAsAmountAndroid", introductoryPriceAsAmountAndroid
                            )
                            item.putString("iconUrl", skuDetails.iconUrl)
                            item.putString("originalJson", skuDetails.originalJson)
                            val originalPriceAmountMicros =
                                BigDecimal.valueOf(skuDetails.originalPriceAmountMicros)
                            val originalPrice =
                                originalPriceAmountMicros.divide(microUnitsDivisor).toString()
                            item.putString("originalPrice", originalPrice)
                            items.pushMap(item)
                        }
                        try {
                            promise.resolve(items)
                        } catch (oce: ObjectAlreadyConsumedException) {
                            Log.e(TAG, oce.message!!)
                        }
                    }
                }
            })
    }

    @ReactMethod
    fun getAvailableItemsByType(type: String, promise: Promise) {
        ensureConnection(
            promise,
            object : EnsureConnectionCallback {
                override fun run(billingClient: BillingClient) {
                    val items = WritableNativeArray()
                    billingClient.queryPurchasesAsync(
                        if (type == "subs") BillingClient.SkuType.SUBS else BillingClient.SkuType.INAPP
                    ) { billingResult: BillingResult?, purchases: List<Purchase>? ->
                        if (purchases != null) {
                            for (i in purchases.indices) {
                                val purchase = purchases[i]
                                val item = WritableNativeMap()
                                item.putString("productId", purchase.skus[0])
                                item.putString("transactionId", purchase.orderId)
                                item.putDouble("transactionDate", purchase.purchaseTime.toDouble())
                                item.putString("transactionReceipt", purchase.originalJson)
                                item.putString("orderId", purchase.orderId)
                                item.putString("purchaseToken", purchase.purchaseToken)
                                item.putString("developerPayloadAndroid", purchase.developerPayload)
                                item.putString("signatureAndroid", purchase.signature)
                                item.putInt("purchaseStateAndroid", purchase.purchaseState)
                                item.putBoolean("isAcknowledgedAndroid", purchase.isAcknowledged)
                                item.putString("packageNameAndroid", purchase.packageName)
                                item.putString(
                                    "obfuscatedAccountIdAndroid",
                                    purchase.accountIdentifiers!!.obfuscatedAccountId
                                )
                                item.putString(
                                    "obfuscatedProfileIdAndroid",
                                    purchase.accountIdentifiers!!.obfuscatedProfileId
                                )
                                if (type == BillingClient.SkuType.SUBS) {
                                    item.putBoolean("autoRenewingAndroid", purchase.isAutoRenewing)
                                }
                                items.pushMap(item)
                            }
                        }
                        try {
                            promise.resolve(items)
                        } catch (oce: ObjectAlreadyConsumedException) {
                            Log.e(TAG, oce.message!!)
                        }
                    }
                }
            })
    }

    @ReactMethod
    fun getPurchaseHistoryByType(type: String, promise: Promise) {
        ensureConnection(
            promise,
            object : EnsureConnectionCallback {
                override fun run(billingClient: BillingClient) {
                    billingClient.queryPurchaseHistoryAsync(
                        if (type == "subs") BillingClient.SkuType.SUBS else BillingClient.SkuType.INAPP
                    ) { billingResult, purchaseHistoryRecordList ->
                        if (billingResult.responseCode != BillingClient.BillingResponseCode.OK) {
                            PlayUtils.instance
                                .rejectPromiseWithBillingError(promise, billingResult.responseCode)
                            return@queryPurchaseHistoryAsync
                        }
                        Log.d(TAG, purchaseHistoryRecordList.toString())
                        val items = Arguments.createArray()
                        for (i in purchaseHistoryRecordList!!.indices) {
                            val item = Arguments.createMap()
                            val purchase = purchaseHistoryRecordList[i]
                            item.putString("productId", purchase.skus[0])
                            item.putDouble("transactionDate", purchase.purchaseTime.toDouble())
                            item.putString("transactionReceipt", purchase.originalJson)
                            item.putString("purchaseToken", purchase.purchaseToken)
                            item.putString("dataAndroid", purchase.originalJson)
                            item.putString("signatureAndroid", purchase.signature)
                            item.putString("developerPayload", purchase.developerPayload)
                            items.pushMap(item)
                        }
                        try {
                            promise.resolve(items)
                        } catch (oce: ObjectAlreadyConsumedException) {
                            Log.e(TAG, oce.message!!)
                        }
                    }
                }
            })
    }

    @ReactMethod
    fun buyItemByType(
        type: String,
        sku: String,
        purchaseToken: String?,
        prorationMode: Int?,
        obfuscatedAccountId: String?,
        obfuscatedProfileId: String?,
        promise: Promise
    ) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject(DoobooUtils.E_UNKNOWN, "getCurrentActivity returned null")
            return
        }
        ensureConnection(
            promise,
            object : EnsureConnectionCallback {
                override fun run(billingClient: BillingClient) {
                    DoobooUtils.instance.addPromiseForKey(
                        PROMISE_BUY_ITEM, promise
                    )
                    val builder = BillingFlowParams.newBuilder()
                    var selectedSku: SkuDetails? = skus.get(sku)
                    if (selectedSku == null) {
                        val debugMessage =
                            "The sku was not found. Please fetch products first by calling getItems"
                        val error = Arguments.createMap()
                        error.putString("debugMessage", debugMessage)
                        error.putString("code", PROMISE_BUY_ITEM)
                        error.putString("message", debugMessage)
                        error.putString("productId", sku)
                        sendEvent(reactContext, "purchase-error", error)
                        promise.reject(PROMISE_BUY_ITEM, debugMessage)
                        return
                    }
                    builder.setSkuDetails(selectedSku)
                    val subscriptionUpdateParamsBuilder = SubscriptionUpdateParams.newBuilder()
                    if (purchaseToken != null) {
                        subscriptionUpdateParamsBuilder.setOldSkuPurchaseToken(purchaseToken)
                    }
                    if (obfuscatedAccountId != null) {
                        builder.setObfuscatedAccountId(obfuscatedAccountId)
                    }
                    if (obfuscatedProfileId != null) {
                        builder.setObfuscatedProfileId(obfuscatedProfileId)
                    }
                    if (prorationMode != null && prorationMode != -1) {
                        if (prorationMode
                            == BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_PRORATED_PRICE
                        ) {
                            subscriptionUpdateParamsBuilder.setReplaceSkusProrationMode(
                                BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_PRORATED_PRICE
                            )
                            if (type != BillingClient.SkuType.SUBS) {
                                val debugMessage =
                                    ("IMMEDIATE_AND_CHARGE_PRORATED_PRICE for proration mode only works in"
                                            + " subscription purchase.")
                                val error = Arguments.createMap()
                                error.putString("debugMessage", debugMessage)
                                error.putString("code", PROMISE_BUY_ITEM)
                                error.putString("message", debugMessage)
                                error.putString("productId", sku)
                                sendEvent(reactContext, "purchase-error", error)
                                promise.reject(PROMISE_BUY_ITEM, debugMessage)
                                return
                            }
                        } else if (prorationMode
                            == BillingFlowParams.ProrationMode.IMMEDIATE_WITHOUT_PRORATION
                        ) {
                            subscriptionUpdateParamsBuilder.setReplaceSkusProrationMode(
                                BillingFlowParams.ProrationMode.IMMEDIATE_WITHOUT_PRORATION
                            )
                        } else if (prorationMode == BillingFlowParams.ProrationMode.DEFERRED) {
                            subscriptionUpdateParamsBuilder.setReplaceSkusProrationMode(
                                BillingFlowParams.ProrationMode.DEFERRED
                            )
                        } else if (prorationMode
                            == BillingFlowParams.ProrationMode.IMMEDIATE_WITH_TIME_PRORATION
                        ) {
                            subscriptionUpdateParamsBuilder.setReplaceSkusProrationMode(
                                BillingFlowParams.ProrationMode.IMMEDIATE_WITHOUT_PRORATION
                            )
                        } else if (prorationMode
                            == BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_FULL_PRICE
                        ) {
                            subscriptionUpdateParamsBuilder.setReplaceSkusProrationMode(
                                BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_FULL_PRICE
                            )
                        } else {
                            subscriptionUpdateParamsBuilder.setReplaceSkusProrationMode(
                                BillingFlowParams.ProrationMode.UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY
                            )
                        }
                    }
                    if (purchaseToken != null) {
                        val subscriptionUpdateParams = subscriptionUpdateParamsBuilder.build()
                        builder.setSubscriptionUpdateParams(subscriptionUpdateParams)
                    }
                    val flowParams = builder.build()
                    val billingResult = billingClient.launchBillingFlow(activity, flowParams)
                    val errorData: Array<String?> =
                        PlayUtils.instance.getBillingResponseData(billingResult.responseCode)
                }
            })
    }

    @ReactMethod
    fun acknowledgePurchase(
        token: String?, developerPayLoad: String?, promise: Promise
    ) {
        ensureConnection(
            promise,
            object : EnsureConnectionCallback {
                override fun run(billingClient: BillingClient) {
                    val acknowledgePurchaseParams =
                        AcknowledgePurchaseParams.newBuilder().setPurchaseToken(
                            token!!
                        ).build()
                    billingClient.acknowledgePurchase(
                        acknowledgePurchaseParams
                    ) { billingResult: BillingResult ->
                        if (billingResult.responseCode != BillingClient.BillingResponseCode.OK) {
                            PlayUtils.instance
                                .rejectPromiseWithBillingError(promise, billingResult.responseCode)
                        }
                        try {
                            val map = Arguments.createMap()
                            map.putInt("responseCode", billingResult.responseCode)
                            map.putString("debugMessage", billingResult.debugMessage)
                            val errorData: Array<String?> = PlayUtils.instance
                                .getBillingResponseData(billingResult.responseCode)
                            map.putString("code", errorData[0])
                            map.putString("message", errorData[1])
                            promise.resolve(map)
                        } catch (oce: ObjectAlreadyConsumedException) {
                            Log.e(TAG, oce.message!!)
                        }
                    }
                }
            })
    }

    @ReactMethod
    fun consumeProduct(
        token: String?, developerPayLoad: String?, promise: Promise
    ) {
        val params = ConsumeParams.newBuilder().setPurchaseToken(token!!).build()
        ensureConnection(
            promise,
            object : EnsureConnectionCallback {
                override fun run(billingClient: BillingClient) {
                    billingClient.consumeAsync(
                        params
                    ) { billingResult: BillingResult, purchaseToken: String? ->
                        if (billingResult.responseCode != BillingClient.BillingResponseCode.OK) {
                            PlayUtils.instance
                                .rejectPromiseWithBillingError(promise, billingResult.responseCode)
                        }
                        try {
                            val map = Arguments.createMap()
                            map.putInt("responseCode", billingResult.responseCode)
                            map.putString("debugMessage", billingResult.debugMessage)
                            val errorData: Array<String?> = PlayUtils.instance
                                .getBillingResponseData(billingResult.responseCode)
                            map.putString("code", errorData[0])
                            map.putString("message", errorData[1])
                            promise.resolve(map)
                        } catch (oce: ObjectAlreadyConsumedException) {
                            promise.reject(oce.message)
                        }
                    }
                }
            })
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?) {
        val responseCode = billingResult.responseCode
        if (responseCode != BillingClient.BillingResponseCode.OK) {
            val error = Arguments.createMap()
            error.putInt("responseCode", responseCode)
            error.putString("debugMessage", billingResult.debugMessage)
            val errorData: Array<String?> =
                PlayUtils.instance.getBillingResponseData(responseCode)
            error.putString("code", errorData[0])
            error.putString("message", errorData[1])
            sendEvent(reactContext, "purchase-error", error)
            PlayUtils.instance.rejectPromisesWithBillingError(PROMISE_BUY_ITEM, responseCode)
            return
        }
        if (purchases != null) {
            var promiseItem: WritableMap? = null
            for (i in purchases.indices) {
                val item = Arguments.createMap()
                val purchase = purchases[i]
                item.putString("productId", purchase.skus[0])
                item.putString("transactionId", purchase.orderId)
                item.putDouble("transactionDate", purchase.purchaseTime.toDouble())
                item.putString("transactionReceipt", purchase.originalJson)
                item.putString("purchaseToken", purchase.purchaseToken)
                item.putString("dataAndroid", purchase.originalJson)
                item.putString("signatureAndroid", purchase.signature)
                item.putBoolean("autoRenewingAndroid", purchase.isAutoRenewing)
                item.putBoolean("isAcknowledgedAndroid", purchase.isAcknowledged)
                item.putInt("purchaseStateAndroid", purchase.purchaseState)
                item.putString("packageNameAndroid", purchase.packageName)
                item.putString("developerPayloadAndroid", purchase.developerPayload)
                val accountIdentifiers = purchase.accountIdentifiers
                if (accountIdentifiers != null) {
                    item.putString(
                        "obfuscatedAccountIdAndroid",
                        accountIdentifiers.obfuscatedAccountId
                    )
                    item.putString(
                        "obfuscatedProfileIdAndroid",
                        accountIdentifiers.obfuscatedProfileId
                    )
                }
                promiseItem = WritableNativeMap()
                promiseItem.merge(item)
                sendEvent(reactContext, "purchase-updated", item)
            }
            if (promiseItem != null) {
                DoobooUtils.instance.resolvePromisesForKey(PROMISE_BUY_ITEM, promiseItem)
            }
        } else {
            val result = Arguments.createMap()
            result.putInt("responseCode", billingResult.responseCode)
            result.putString("debugMessage", billingResult.debugMessage)
            result.putString(
                "extraMessage",
                "The purchases are null. This is a normal behavior if you have requested DEFERRED"
                        + " proration. If not please report an issue."
            )
            sendEvent(reactContext, "purchase-updated", result)
            DoobooUtils.instance.resolvePromisesForKey(PROMISE_BUY_ITEM, null)
        }
    }

    private fun sendUnconsumedPurchases(promise: Promise) {
        ensureConnection(
            promise,
            object : EnsureConnectionCallback {
                override fun run(billingClient: BillingClient) {
                    val types = arrayOf(BillingClient.SkuType.INAPP, BillingClient.SkuType.SUBS)
                    for (type in types) {
                        billingClient.queryPurchasesAsync(
                            type
                        ) { billingResult: BillingResult, list: List<Purchase>? ->
                            val unacknowledgedPurchases = ArrayList<Purchase>()
                            if (list == null || list.size == 0) {
                                //                    continue;
                            }
                            for (purchase in list!!) {
                                if (!purchase.isAcknowledged) {
                                    unacknowledgedPurchases.add(purchase)
                                }
                            }
                            onPurchasesUpdated(billingResult, unacknowledgedPurchases)
                        }
                    }
                    promise.resolve(true)
                }
            })
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

    @get:ReactMethod
    val packageName: String
        get() = reactApplicationContext.packageName

    private fun sendEvent(
        reactContext: ReactContext, eventName: String, params: WritableMap?
    ) {
        reactContext
            .getJSModule(RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    companion object {
        private const val PROMISE_BUY_ITEM = "PROMISE_BUY_ITEM"
    }

    init {
        this.reactContext = reactContext
        skus = mutableMapOf<String, SkuDetails>()
        val lifecycleEventListener: LifecycleEventListener = object : LifecycleEventListener {
            override fun onHostResume() {}
            override fun onHostPause() {}
            override fun onHostDestroy() {
                if (billingClientCache != null) {
                    billingClientCache!!.endConnection()
                    billingClientCache = null
                }
            }
        }
        reactContext.addLifecycleEventListener(lifecycleEventListener)
    }
}

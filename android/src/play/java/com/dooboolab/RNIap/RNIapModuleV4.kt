package com.dooboolab.RNIap

import android.util.Log
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingFlowParams.SubscriptionUpdateParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.ConsumeParams
import com.android.billingclient.api.ConsumeResponseListener
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.SkuDetails
import com.android.billingclient.api.SkuDetailsParams
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.PromiseImpl
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import java.math.BigDecimal
import java.util.ArrayList

class RNIapModuleV4(
    private val reactContext: ReactApplicationContext,
    private val builder: BillingClient.Builder = BillingClient.newBuilder(reactContext).enablePendingPurchases(),
    private val googleApiAvailability: GoogleApiAvailability = GoogleApiAvailability.getInstance()
) :
    ReactContextBaseJavaModule(reactContext),
    PurchasesUpdatedListener,
    RNIapModuleInterface {

    private var billingClientCache: BillingClient? = null
    private val skus: MutableMap<String, SkuDetails> = mutableMapOf()
    override fun getName(): String {
        return TAG
    }

    fun ensureConnection(
        promise: Promise,
        callback: (billingClient: BillingClient) -> Unit
    ) {
        val billingClient = billingClientCache
        if (billingClient?.isReady == true) {
            callback(billingClient)
            return
        } else {
            val nested = PromiseImpl(
                {
                    if (it.isNotEmpty() && it[0] is Boolean && it[0] as Boolean) {
                        val connectedBillingClient = billingClientCache
                        if (connectedBillingClient?.isReady == true) {
                            callback(connectedBillingClient)
                        } else {
                            promise.safeReject(DoobooUtils.E_NOT_PREPARED, "Unable to auto-initialize connection")
                        }
                    } else {
                        Log.i(TAG, "Incorrect parameter in resolve")
                    }
                },
                {
                    if (it.size > 1 && it[0] is String && it[1] is String) {
                        promise.safeReject(
                            it[0] as String,
                            it[1] as String
                        )
                    } else {
                        Log.i(TAG, "Incorrect parameters in reject")
                    }
                }
            )
            initConnection(nested)
        }
    }

    @ReactMethod
    override fun initConnection(promise: Promise) {
        if (googleApiAvailability.isGooglePlayServicesAvailable(reactContext)
            != ConnectionResult.SUCCESS
        ) {
            Log.i(TAG, "Google Play Services are not available on this device")
            promise.safeReject(DoobooUtils.E_NOT_PREPARED, "Google Play Services are not available on this device")
            return
        }

        if (billingClientCache?.isReady == true) {
            Log.i(
                TAG,
                "Already initialized, you should only call initConnection() once when your app starts"
            )
            promise.safeResolve(true)
            return
        }
        builder.setListener(this).build().also {
            billingClientCache = it
            it.startConnection(
                object : BillingClientStateListener {
                    override fun onBillingSetupFinished(billingResult: BillingResult) {
                        if (!isValidResult(billingResult, promise)) return

                        promise.safeResolve(true)
                    }

                    override fun onBillingServiceDisconnected() {
                        Log.i(TAG, "Billing service disconnected")
                    }
                }
            )
        }
    }

    @ReactMethod
    override fun endConnection(promise: Promise) {
        billingClientCache?.endConnection()
        billingClientCache = null
        promise.safeResolve(true)
    }

    private fun consumeItems(
        purchases: List<Purchase>,
        promise: Promise,
        expectedResponseCode: Int = BillingClient.BillingResponseCode.OK
    ) {
        for (purchase in purchases) {
            ensureConnection(
                promise
            ) { billingClient ->
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

                        promise.safeResolve(true)
                    }
                billingClient.consumeAsync(consumeParams, listener)
            }
        }
    }

    @ReactMethod
    override fun flushFailedPurchasesCachedAsPending(promise: Promise) {
        ensureConnection(
            promise
        ) { billingClient ->
            billingClient.queryPurchasesAsync(
                BillingClient.SkuType.INAPP
            ) { billingResult: BillingResult, list: List<Purchase>? ->
                if (!isValidResult(billingResult, promise)) return@queryPurchasesAsync
                if (list == null) {
                    // No purchases found
                    promise.safeResolve(false)
                    return@queryPurchasesAsync
                }
                // we only want to try to consume PENDING items, in order to force cache-refresh
                // for  them
                val pendingPurchases = list.filter { it.purchaseState == Purchase.PurchaseState.PENDING }

                if (pendingPurchases.isEmpty()) {
                    promise.safeResolve(false)
                    return@queryPurchasesAsync
                }
                consumeItems(
                    pendingPurchases,
                    promise,
                    BillingClient.BillingResponseCode.ITEM_NOT_OWNED
                )
            }
        }
    }

    @ReactMethod
    override fun getItemsByType(type: String, skuArr: ReadableArray, promise: Promise) {
        ensureConnection(
            promise
        ) { billingClient ->
            val skuList = ArrayList<String>()
            for (i in 0 until skuArr.size()) {
                if (skuArr.getType(i) == ReadableType.String) {
                    val sku = skuArr.getString(i)
                    skuList.add(sku)
                }
            }
            val params = SkuDetailsParams.newBuilder()
            params.setSkusList(skuList).setType(type)
            billingClient.querySkuDetailsAsync(
                params.build()
            ) { billingResult: BillingResult, skuDetailsList: List<SkuDetails>? ->
                if (!isValidResult(billingResult, promise)) return@querySkuDetailsAsync

                val items = Arguments.createArray()
                if (skuDetailsList != null) {
                    for (skuDetails in skuDetailsList) {
                        skus[skuDetails.sku] = skuDetails

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
                            "introductoryPricePeriodAndroid",
                            skuDetails.introductoryPricePeriod
                        )
                        item.putString(
                            "introductoryPriceAsAmountAndroid",
                            introductoryPriceAsAmountAndroid
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
                }
                promise.safeResolve(items)
            }
        }
    }

    /**
     * Rejects promise with billing code if BillingResult is not OK
     */
    private fun isValidResult(
        billingResult: BillingResult,
        promise: Promise
    ): Boolean {
        Log.d(TAG, "responseCode: " + billingResult.responseCode)
        if (billingResult.responseCode != BillingClient.BillingResponseCode.OK) {
            PlayUtils.instance
                .rejectPromiseWithBillingError(promise, billingResult.responseCode)
            return false
        }
        return true
    }

    @ReactMethod
    override fun getAvailableItemsByType(type: String, promise: Promise) {
        ensureConnection(
            promise
        ) { billingClient ->
            val items = WritableNativeArray()
            billingClient.queryPurchasesAsync(
                if (type == "subs") BillingClient.SkuType.SUBS else BillingClient.SkuType.INAPP
            ) { billingResult: BillingResult, purchases: List<Purchase>? ->
                if (!isValidResult(billingResult, promise)) return@queryPurchasesAsync
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
                            purchase.accountIdentifiers?.obfuscatedAccountId
                        )
                        item.putString(
                            "obfuscatedProfileIdAndroid",
                            purchase.accountIdentifiers?.obfuscatedProfileId
                        )
                        if (type == BillingClient.SkuType.SUBS) {
                            item.putBoolean("autoRenewingAndroid", purchase.isAutoRenewing)
                        }
                        items.pushMap(item)
                    }
                }
                promise.safeResolve(items)
            }
        }
    }

    @ReactMethod
    override fun getPurchaseHistoryByType(type: String, promise: Promise) {
        ensureConnection(
            promise
        ) { billingClient ->
            billingClient.queryPurchaseHistoryAsync(
                if (type == "subs") BillingClient.SkuType.SUBS else BillingClient.SkuType.INAPP
            ) { billingResult, purchaseHistoryRecordList ->
                if (!isValidResult(billingResult, promise)) return@queryPurchaseHistoryAsync

                Log.d(TAG, purchaseHistoryRecordList.toString())
                val items = Arguments.createArray()
                purchaseHistoryRecordList?.forEach { purchase ->
                    val item = Arguments.createMap()
                    item.putString("productId", purchase.skus[0])
                    item.putDouble("transactionDate", purchase.purchaseTime.toDouble())
                    item.putString("transactionReceipt", purchase.originalJson)
                    item.putString("purchaseToken", purchase.purchaseToken)
                    item.putString("dataAndroid", purchase.originalJson)
                    item.putString("signatureAndroid", purchase.signature)
                    item.putString("developerPayload", purchase.developerPayload)
                    items.pushMap(item)
                }
                promise.safeResolve(items)
            }
        }
    }

    @ReactMethod
    override fun buyItemByType(
        type: String,
        sku: String,
        purchaseToken: String?,
        prorationMode: Int?,
        obfuscatedAccountId: String?,
        obfuscatedProfileId: String?,
        selectedOfferIndex: Int?, // New optional parameter in V5 (added to maintain interface consistency)
        promise: Promise
    ) {
        val activity = currentActivity
        if (activity == null) {
            promise.safeReject(DoobooUtils.E_UNKNOWN, "getCurrentActivity returned null")
            return
        }
        ensureConnection(
            promise
        ) { billingClient ->
            DoobooUtils.instance.addPromiseForKey(
                PROMISE_BUY_ITEM,
                promise
            )
            val builder = BillingFlowParams.newBuilder()
            val selectedSku: SkuDetails? = skus[sku]
            if (selectedSku == null) {
                val debugMessage =
                    "The sku was not found. Please fetch products first by calling getItems"
                val error = Arguments.createMap()
                error.putString("debugMessage", debugMessage)
                error.putString("code", PROMISE_BUY_ITEM)
                error.putString("message", debugMessage)
                error.putString("productId", sku)
                sendEvent(reactContext, "purchase-error", error)
                promise.safeReject(PROMISE_BUY_ITEM, debugMessage)
                return@ensureConnection
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
                            (
                                "IMMEDIATE_AND_CHARGE_PRORATED_PRICE for proration mode only works in" +
                                    " subscription purchase."
                                )
                        val error = Arguments.createMap()
                        error.putString("debugMessage", debugMessage)
                        error.putString("code", PROMISE_BUY_ITEM)
                        error.putString("message", debugMessage)
                        error.putString("productId", sku)
                        sendEvent(reactContext, "purchase-error", error)
                        promise.safeReject(PROMISE_BUY_ITEM, debugMessage)
                        return@ensureConnection
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
            val billingResultCode = billingClient.launchBillingFlow(activity, flowParams)?.responseCode ?: BillingClient.BillingResponseCode.ERROR
            if (billingResultCode == BillingClient.BillingResponseCode.OK) {
                promise.safeResolve(true)
                return@ensureConnection
            } else {
                val errorData: Array<String?> =
                    PlayUtils.instance.getBillingResponseData(billingResultCode)
                promise.safeReject(errorData[0], errorData[1])
            }
        }
    }

    @ReactMethod
    override fun acknowledgePurchase(
        token: String,
        developerPayLoad: String?,
        promise: Promise
    ) {
        ensureConnection(
            promise
        ) { billingClient ->
            val acknowledgePurchaseParams =
                AcknowledgePurchaseParams.newBuilder().setPurchaseToken(
                    token
                ).build()
            billingClient.acknowledgePurchase(
                acknowledgePurchaseParams
            ) { billingResult: BillingResult ->
                if (!isValidResult(billingResult, promise)) return@acknowledgePurchase

                val map = Arguments.createMap()
                map.putInt("responseCode", billingResult.responseCode)
                map.putString("debugMessage", billingResult.debugMessage)
                val errorData: Array<String?> = PlayUtils.instance
                    .getBillingResponseData(billingResult.responseCode)
                map.putString("code", errorData[0])
                map.putString("message", errorData[1])
                promise.safeResolve(map)
            }
        }
    }

    @ReactMethod
    override fun consumeProduct(
        token: String,
        developerPayLoad: String?,
        promise: Promise
    ) {
        val params = ConsumeParams.newBuilder().setPurchaseToken(token).build()
        ensureConnection(
            promise
        ) { billingClient ->
            billingClient.consumeAsync(
                params
            ) { billingResult: BillingResult, purchaseToken: String? ->
                if (!isValidResult(billingResult, promise)) return@consumeAsync

                val map = Arguments.createMap()
                map.putInt("responseCode", billingResult.responseCode)
                map.putString("debugMessage", billingResult.debugMessage)
                val errorData: Array<String?> = PlayUtils.instance
                    .getBillingResponseData(billingResult.responseCode)
                map.putString("code", errorData[0])
                map.putString("message", errorData[1])
                promise.safeResolve(map)
            }
        }
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
                "The purchases are null. This is a normal behavior if you have requested DEFERRED" +
                    " proration. If not please report an issue."
            )
            sendEvent(reactContext, "purchase-updated", result)
            DoobooUtils.instance.resolvePromisesForKey(PROMISE_BUY_ITEM, null)
        }
    }

    private fun sendUnconsumedPurchases(promise: Promise) {
        ensureConnection(
            promise
        ) { billingClient ->
            val types = arrayOf(BillingClient.SkuType.INAPP, BillingClient.SkuType.SUBS)
            for (type in types) {
                billingClient.queryPurchasesAsync(
                    type
                ) { billingResult: BillingResult, list: List<Purchase> ->
                    if (!isValidResult(billingResult, promise)) return@queryPurchasesAsync

                    val unacknowledgedPurchases = list.filter { !it.isAcknowledged }
                    onPurchasesUpdated(billingResult, unacknowledgedPurchases)
                }
            }
            promise.safeResolve(true)
        }
    }

    @ReactMethod
    override fun startListening(promise: Promise) {
        sendUnconsumedPurchases(promise)
    }

    @ReactMethod
    override fun addListener(eventName: String) {
        // Keep: Required for RN built-in Event Emitter Calls.
    }

    @ReactMethod
    override fun removeListeners(count: Double) {
        // Keep: Required for RN built-in Event Emitter Calls.
    }

    @ReactMethod
    override fun getPackageName(promise: Promise) = promise.resolve(reactApplicationContext.packageName)

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
        private const val PROMISE_BUY_ITEM = "PROMISE_BUY_ITEM"
        const val TAG = "RNIapModuleV4"
    }

    init {
        val lifecycleEventListener: LifecycleEventListener = object : LifecycleEventListener {
            override fun onHostResume() {}
            override fun onHostPause() {}
            override fun onHostDestroy() {
                billingClientCache?.endConnection()
            }
        }
        reactContext.addLifecycleEventListener(lifecycleEventListener)
    }
}

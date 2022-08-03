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
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchaseHistoryRecord
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchaseHistoryParams
import com.android.billingclient.api.QueryPurchasesParams
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
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import java.util.ArrayList

class RNIapModule(
    private val reactContext: ReactApplicationContext,
    private val builder: BillingClient.Builder = BillingClient.newBuilder(reactContext).enablePendingPurchases(),
    private val googleApiAvailability: GoogleApiAvailability = GoogleApiAvailability.getInstance()
) :
    ReactContextBaseJavaModule(reactContext),
    PurchasesUpdatedListener {

    private var billingClientCache: BillingClient? = null
    private val skus: MutableMap<String, ProductDetails> = mutableMapOf()
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
     fun initConnection(promise: Promise) {
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
     fun endConnection(promise: Promise) {
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
     fun flushFailedPurchasesCachedAsPending(promise: Promise) {
        ensureConnection(
            promise
        ) { billingClient ->
            billingClient.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder().setProductType(
                    BillingClient.ProductType.INAPP
                ).build()
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
     fun getItemsByType(type: String, skuArr: ReadableArray, promise: Promise) {
        ensureConnection(
            promise
        ) { billingClient ->
            val skuList = ArrayList<QueryProductDetailsParams.Product>()
            for (i in 0 until skuArr.size()) {
                if (skuArr.getType(i) == ReadableType.String) {
                    val sku = skuArr.getString(i)
                    sku?.let {
                        skuList.add(
                            QueryProductDetailsParams.Product.newBuilder().setProductId(sku)
                                .setProductType(type).build()
                        )
                    }
                }
            }
            val params = QueryProductDetailsParams.newBuilder().setProductList(skuList)
            billingClient.queryProductDetailsAsync(
                params.build()
            ) { billingResult: BillingResult, skuDetailsList: List<ProductDetails> ->
                if (!isValidResult(billingResult, promise)) return@queryProductDetailsAsync

                val items = Arguments.createArray()
                for (skuDetails in skuDetailsList) {
                    skus[skuDetails.productId] = skuDetails

                    val item = Arguments.createMap()
                    item.putString("productId", skuDetails.productId)
                    item.putString("title", skuDetails.title)
                    item.putString("description", skuDetails.description)
                    item.putString("productType", skuDetails.productType)
                    item.putString("name", skuDetails.name)
                    val oneTimePurchaseOfferDetails = Arguments.createMap()
                    skuDetails.oneTimePurchaseOfferDetails?.let {
                        oneTimePurchaseOfferDetails.putString(
                            "priceCurrencyCode",
                            it.priceCurrencyCode
                        )
                        oneTimePurchaseOfferDetails.putString("formattedPrice", it.formattedPrice)
                        oneTimePurchaseOfferDetails.putString(
                            "priceAmountMicros",
                            it.priceAmountMicros.toString()
                        )
                    }
                    item.putMap("oneTimePurchaseOfferDetails", oneTimePurchaseOfferDetails)

                    val subscriptionOfferDetails = Arguments.createArray()
                    skuDetails.subscriptionOfferDetails?.forEach { subscriptionOfferDetailsItem ->
                        val offerDetails = Arguments.createMap()
                        offerDetails.putString(
                            "offerToken",
                            subscriptionOfferDetailsItem.offerToken
                        )
                        val offerTags = Arguments.createArray()
                        subscriptionOfferDetailsItem.offerTags.forEach { offerTag ->
                            offerTags.pushString(offerTag)
                        }
                        offerDetails.putArray("offerTags", offerTags)

                        val pricingPhasesList = Arguments.createArray()
                        subscriptionOfferDetailsItem.pricingPhases.pricingPhaseList.forEach { pricingPhaseItem ->
                            val pricingPhase = Arguments.createMap()
                            pricingPhase.putString(
                                "formattedPrice",
                                pricingPhaseItem.formattedPrice
                            )
                            pricingPhase.putString(
                                "priceCurrencyCode",
                                pricingPhaseItem.priceCurrencyCode
                            )
                            pricingPhase.putString("billingPeriod", pricingPhaseItem.billingPeriod)
                            pricingPhase.putInt(
                                "billingCycleCount",
                                pricingPhaseItem.billingCycleCount
                            )
                            pricingPhase.putString(
                                "priceAmountMicros",
                                pricingPhaseItem.priceAmountMicros.toString()
                            )
                            pricingPhase.putInt("recurrenceMode", pricingPhaseItem.recurrenceMode)

                            pricingPhasesList.pushMap(pricingPhase)
                        }
                        val pricingPhases = Arguments.createMap()
                        pricingPhases.putArray("pricingPhaseList", pricingPhasesList)
                        offerDetails.putMap("pricingPhases", pricingPhases)
                        subscriptionOfferDetails.pushMap(offerDetails)
                    }
                    item.putArray("subscriptionOfferDetails", subscriptionOfferDetails)
                    items.pushMap(item)
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
    fun getAvailableItemsByType(type: String, promise: Promise) {
        ensureConnection(
            promise
        ) { billingClient ->
            val items = WritableNativeArray()
            billingClient.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder().setProductType(
                    if (type == "subs") BillingClient.ProductType.SUBS else BillingClient.ProductType.INAPP
                ).build()
            ) { billingResult: BillingResult, purchases: List<Purchase>? ->
                if (!isValidResult(billingResult, promise)) return@queryPurchasesAsync
                if (purchases != null) {
                    for (i in purchases.indices) {
                        val purchase = purchases[i]
                        val item = WritableNativeMap()
                        item.putString("productId", purchase.products[0])// kept for convenience/backward-compatibility. productIds has the complete list
                        val products = Arguments.createArray()
                        purchase.products.forEach { products.pushString(it) }
                        item.putArray("productIds", products)
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
                        if (type == BillingClient.ProductType.SUBS) {
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
    fun getPurchaseHistoryByType(type: String, promise: Promise) {
        ensureConnection(
            promise
        ) { billingClient ->
            billingClient.queryPurchaseHistoryAsync(
                QueryPurchaseHistoryParams.newBuilder().setProductType(
                    if (type == "subs") BillingClient.ProductType.SUBS else BillingClient.ProductType.INAPP
                ).build()
            ) {
                    billingResult: BillingResult, purchaseHistoryRecordList: MutableList<PurchaseHistoryRecord>? ->

                if (!isValidResult(billingResult, promise)) return@queryPurchaseHistoryAsync

                Log.d(TAG, purchaseHistoryRecordList.toString())
                val items = Arguments.createArray()
                purchaseHistoryRecordList?.forEach { purchase ->
                    val item = Arguments.createMap()
                    item.putString("productId", purchase.products[0])
                    val products = Arguments.createArray()
                    purchase.products.forEach { products.pushString(it) }
                    item.putArray("productIds", products)
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
    fun buyItemByType(
        type: String,
        skuArr: ReadableArray,
        purchaseToken: String?,
        prorationMode: Int,
        obfuscatedAccountId: String?,
        obfuscatedProfileId: String?,
        selectedOfferIndices: ReadableArray, // New optional parameter in V5
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
            val productParamsList =
            skuArr.toArrayList().map { it.toString() }.mapIndexed{ index,sku ->
                val selectedSku: ProductDetails? = skus[sku]
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
                var productParams = BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(selectedSku)
                val selectedOfferIndex = selectedOfferIndices.getInt(index)
                if (selectedOfferIndex > -1 && (
                    selectedSku.subscriptionOfferDetails?.size
                        ?: 0
                    ) > selectedOfferIndex
                ) {
                    val offerToken =
                        selectedSku.subscriptionOfferDetails?.get(selectedOfferIndex)?.offerToken
                    offerToken?.let { productParams = productParams.setOfferToken(offerToken) }
                }
                productParams.build()
            }
            val builder = BillingFlowParams.newBuilder()
            builder.setProductDetailsParamsList(productParamsList)
            val subscriptionUpdateParamsBuilder = SubscriptionUpdateParams.newBuilder()
            if (purchaseToken != null) {
                subscriptionUpdateParamsBuilder.setOldPurchaseToken(purchaseToken)
            }
            if (obfuscatedAccountId != null) {
                builder.setObfuscatedAccountId(obfuscatedAccountId)
            }
            if (obfuscatedProfileId != null) {
                builder.setObfuscatedProfileId(obfuscatedProfileId)
            }
            if (prorationMode != -1) {
                if (prorationMode
                    == BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_PRORATED_PRICE
                ) {
                    subscriptionUpdateParamsBuilder.setReplaceProrationMode(
                        BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_PRORATED_PRICE
                    )
                    if (type != BillingClient.ProductType.SUBS) {
                        val debugMessage =
                            (
                                "IMMEDIATE_AND_CHARGE_PRORATED_PRICE for proration mode only works in" +
                                    " subscription purchase."
                                )
                        val error = Arguments.createMap()
                        error.putString("debugMessage", debugMessage)
                        error.putString("code", PROMISE_BUY_ITEM)
                        error.putString("message", debugMessage)
                        error.putArray("productIds", skuArr)
                        sendEvent(reactContext, "purchase-error", error)
                        promise.safeReject(PROMISE_BUY_ITEM, debugMessage)
                        return@ensureConnection
                    }
                } else if (prorationMode
                    == BillingFlowParams.ProrationMode.IMMEDIATE_WITHOUT_PRORATION
                ) {
                    subscriptionUpdateParamsBuilder.setReplaceProrationMode(
                        BillingFlowParams.ProrationMode.IMMEDIATE_WITHOUT_PRORATION
                    )
                } else if (prorationMode == BillingFlowParams.ProrationMode.DEFERRED) {
                    subscriptionUpdateParamsBuilder.setReplaceProrationMode(
                        BillingFlowParams.ProrationMode.DEFERRED
                    )
                } else if (prorationMode
                    == BillingFlowParams.ProrationMode.IMMEDIATE_WITH_TIME_PRORATION
                ) {
                    subscriptionUpdateParamsBuilder.setReplaceProrationMode(
                        BillingFlowParams.ProrationMode.IMMEDIATE_WITHOUT_PRORATION
                    )
                } else if (prorationMode
                    == BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_FULL_PRICE
                ) {
                    subscriptionUpdateParamsBuilder.setReplaceProrationMode(
                        BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_FULL_PRICE
                    )
                } else {
                    subscriptionUpdateParamsBuilder.setReplaceProrationMode(
                        BillingFlowParams.ProrationMode.UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY
                    )
                }
            }
            if (purchaseToken != null) {
                val subscriptionUpdateParams = subscriptionUpdateParamsBuilder.build()
                builder.setSubscriptionUpdateParams(subscriptionUpdateParams)
            }
            val flowParams = builder.build()
            val billingResultCode = billingClient.launchBillingFlow(activity, flowParams).responseCode
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
    fun acknowledgePurchase(
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
    fun consumeProduct(
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
                map.putString("purchaseToken",purchaseToken)
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
            val promiseItems: WritableArray = Arguments.createArray()
            purchases.forEach { purchase ->
                val item = Arguments.createMap()
                item.putString("productId", purchase.products[0])
                val products = Arguments.createArray()
                purchase.products.forEach { products.pushString(it) }
                item.putArray("productIds", products)
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
                promiseItems.pushMap(item)
                sendEvent(reactContext, "purchase-updated", item)
            }
            DoobooUtils.instance.resolvePromisesForKey(PROMISE_BUY_ITEM, promiseItems)
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
            val types = arrayOf(BillingClient.ProductType.INAPP, BillingClient.ProductType.SUBS)
            for (type in types) {
                billingClient.queryPurchasesAsync(
                    QueryPurchasesParams.newBuilder().setProductType(
                        type
                    ).build()
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

    @ReactMethod
    fun getPackageName(promise: Promise) = promise.resolve(reactApplicationContext.packageName)

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
        const val TAG = "RNIapModule"
    }

    init {
        val lifecycleEventListener: LifecycleEventListener = object : LifecycleEventListener {
            override fun onHostResume() {}
            override fun onHostPause() {}
            override fun onHostDestroy() {
                billingClientCache?.endConnection()
                billingClientCache = null
            }
        }
        reactContext.addLifecycleEventListener(lifecycleEventListener)
    }
}

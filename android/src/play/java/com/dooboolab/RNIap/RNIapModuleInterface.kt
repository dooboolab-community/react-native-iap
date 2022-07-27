package com.dooboolab.RNIap

import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.Purchase
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray

/**
 * Common interface for consistency
 */
interface RNIapModuleInterface {
    fun getName(): String
    fun initConnection(promise: Promise)
    fun endConnection(promise: Promise)
    fun flushFailedPurchasesCachedAsPending(promise: Promise)
    fun getItemsByType(type: String, skuArr: ReadableArray, promise: Promise)
    fun getAvailableItemsByType(type: String, promise: Promise)
    fun getPurchaseHistoryByType(type: String, promise: Promise)
    fun buyItemByType(
        type: String,
        sku: String,
        purchaseToken: String?,
        prorationMode: Int?,
        obfuscatedAccountId: String?,
        obfuscatedProfileId: String?,
        selectedOfferIndex: Int?, // New optional parameter in V5 (added to maintain interface consistency)
        promise: Promise
    )
    fun acknowledgePurchase(
        token: String,
        developerPayLoad: String?,
        promise: Promise
    )
    fun consumeProduct(
        token: String,
        developerPayLoad: String?,
        promise: Promise
    )
    fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?)
    fun startListening(promise: Promise)
    fun addListener(eventName: String)
    fun removeListeners(count: Double)
    fun getPackageName(promise: Promise)
}

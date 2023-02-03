package com.dooboolab.RNIap.proxy

import android.app.Activity
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.AcknowledgePurchaseResponseListener
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.ConsumeParams
import com.android.billingclient.api.ConsumeResponseListener
import com.android.billingclient.api.ProductDetailsResponseListener
import com.android.billingclient.api.PurchaseHistoryResponseListener
import com.android.billingclient.api.PurchasesResponseListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchaseHistoryParams
import com.android.billingclient.api.QueryPurchasesParams

interface BillingClientProxy {
    fun startConnection(billingClientStateListener: BillingClientStateListener)
    fun endConnection()
    fun consumeAsync(params: ConsumeParams, listener: ConsumeResponseListener)
    fun queryPurchasesAsync(
        queryPurchasesParams: QueryPurchasesParams,
        purchasesResponseListener: PurchasesResponseListener
    )

    fun queryProductDetailsAsync(
        queryProductDetailsParams: QueryProductDetailsParams,
        productDetailsResponseListener: ProductDetailsResponseListener
    )

    fun queryPurchaseHistoryAsync(
        queryPurchaseHistoryParams: QueryPurchaseHistoryParams,
        purchaseHistoryResponseListener: PurchaseHistoryResponseListener
    )

    fun launchBillingFlow(activity: Activity, flowParams: BillingFlowParams): BillingResult

    fun acknowledgePurchase(
        acknowledgePurchaseParams: AcknowledgePurchaseParams,
        acknowledgePurchaseResponseListener: AcknowledgePurchaseResponseListener
    )

    abstract val isReady: Boolean
}

package com.dooboolab.RNIap.proxy.google

import android.app.Activity
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.AcknowledgePurchaseResponseListener
import com.android.billingclient.api.BillingClient
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
import com.dooboolab.RNIap.proxy.BillingClientProxy

class BillingClientGooglePlayImpl(private val billingClient: BillingClient) : BillingClientProxy {
    override fun startConnection(billingClientStateListener: BillingClientStateListener) {
        billingClient.startConnection(billingClientStateListener)
    }

    override fun endConnection() {
        billingClient.endConnection()
    }

    override fun consumeAsync(params: ConsumeParams, listener: ConsumeResponseListener) {
        billingClient.consumeAsync(params,listener)
    }

    override fun queryPurchasesAsync(
        queryPurchasesParams: QueryPurchasesParams,
        purchasesResponseListener: PurchasesResponseListener
    ) {
        billingClient.queryPurchasesAsync(queryPurchasesParams,purchasesResponseListener)
    }

    override fun queryProductDetailsAsync(
        queryProductDetailsParams: QueryProductDetailsParams,
        productDetailsResponseListener: ProductDetailsResponseListener
    ) {
        billingClient.queryProductDetailsAsync(queryProductDetailsParams,productDetailsResponseListener)
    }

    override fun queryPurchaseHistoryAsync(
        queryPurchaseHistoryParams: QueryPurchaseHistoryParams,
        purchaseHistoryResponseListener: PurchaseHistoryResponseListener
    ) {
        billingClient.queryPurchaseHistoryAsync(queryPurchaseHistoryParams,purchaseHistoryResponseListener)
    }

    override fun launchBillingFlow(
        activity: Activity,
        flowParams: BillingFlowParams
    ): BillingResult {
        return billingClient.launchBillingFlow(activity,flowParams)
    }

    override fun acknowledgePurchase(
        acknowledgePurchaseParams: AcknowledgePurchaseParams,
        acknowledgePurchaseResponseListener: AcknowledgePurchaseResponseListener
    ) {
        billingClient.acknowledgePurchase(acknowledgePurchaseParams,acknowledgePurchaseResponseListener)
    }

    override val isReady: Boolean
        get() = billingClient.isReady
}

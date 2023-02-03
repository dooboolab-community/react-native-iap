package com.dooboolab.RNIap.proxy

import com.android.billingclient.api.PurchasesUpdatedListener

interface ClientBuilderFactory {

    fun setListener(listener: PurchasesUpdatedListener): ClientBuilderFactory

    fun build(): BillingClientProxy
}

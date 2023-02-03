package com.dooboolab.RNIap.proxy.google

import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.PurchasesUpdatedListener
import com.dooboolab.RNIap.proxy.BillingClientProxy
import com.dooboolab.RNIap.proxy.ClientBuilderFactory

class ClientBuilderFactoryGooglePlayImpl(private val builder: BillingClient.Builder):
    ClientBuilderFactory {



    override fun setListener(listener: PurchasesUpdatedListener): ClientBuilderFactory {
        builder.setListener(listener)
        return this
    }

    override fun build(): BillingClientProxy {
        val billingClient = builder.build()
        return BillingClientGooglePlayImpl(billingClient)
    }
}

package com.dooboolab.RNIap

import android.content.Context
import com.amazon.device.iap.PurchasingListener
import com.amazon.device.iap.PurchasingService
import com.amazon.device.iap.model.FulfillmentResult
import com.amazon.device.iap.model.RequestId

class PurchasingServiceProxyAmazonImpl : PurchasingServiceProxy {
    override fun registerListener(var0: Context?, var1: PurchasingListener?) {
        return PurchasingService.registerListener(var0, var1)
    }

    override fun getUserData(): RequestId {
        return PurchasingService.getUserData()
    }

    override fun purchase(var0: String?): RequestId {
        return PurchasingService.purchase(var0)
    }

    override fun getProductData(var0: Set<String?>?): RequestId {
        return PurchasingService.getProductData(var0)
    }

    override fun getPurchaseUpdates(var0: Boolean): RequestId {
        return PurchasingService.getPurchaseUpdates(var0)
    }

    override fun notifyFulfillment(var0: String?, var1: FulfillmentResult?) {
        return PurchasingService.notifyFulfillment(var0, var1)
    }
}

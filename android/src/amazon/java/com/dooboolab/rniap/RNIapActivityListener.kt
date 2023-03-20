package com.dooboolab.rniap

import android.app.Activity
import android.util.Log
import com.amazon.device.iap.PurchasingService

/**
 * In order of the IAP process to show correctly, AmazonPurchasingService must be registered on Activity.onCreate
 * registering it in on Application.onCreate will not throw an error but it will now show the Native purchasing screen
 */
class RNIapActivityListener {
    companion object {
        @JvmStatic
        var hasListener = false

        @JvmStatic
        var amazonListener: RNIapAmazonListener? = null

        @JvmStatic
        fun registerActivity(activity: Activity) {
            amazonListener = RNIapAmazonListener(null, null)
            try {
                PurchasingService.registerListener(activity, amazonListener)
                hasListener = true
                // Prefetch user and purchases as per Amazon SDK documentation:
                PurchasingService.getUserData()
                PurchasingService.getPurchaseUpdates(false)
            } catch (e: Exception) {
                Log.e(RNIapAmazonModule.TAG, "Error initializing Amazon appstore sdk", e)
            }
        }
    }
}

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
import com.facebook.react.uimanager.ViewManager

class RNIapPackage : ReactPackage {
    override fun createJSModules(): List<Class<out JavaScriptModule?>> {
        return emptyList()
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        val modules: MutableList<NativeModule> = ArrayList()
        modules.add(RNIapModule(reactContext))
        return modules
    }
}
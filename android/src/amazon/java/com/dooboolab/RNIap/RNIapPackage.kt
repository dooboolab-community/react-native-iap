package com.dooboolab.RNIap

import com.facebook.react.ReactPackage
import java.lang.Class
import com.facebook.react.bridge.JavaScriptModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.NativeModule
import java.util.ArrayList
import com.dooboolab.RNIap.RNIapAmazonModule
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.amazon.device.iap.PurchasingService
import com.dooboolab.RNIap.RNIapAmazonListener
import com.amazon.device.iap.model.RequestId
import com.dooboolab.RNIap.DoobooUtils
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.ReadableArray
import java.util.HashSet
import com.amazon.device.iap.model.FulfillmentResult
import com.facebook.react.bridge.ReactContext
import com.amazon.device.iap.PurchasingListener
import com.amazon.device.iap.model.Product
import com.amazon.device.iap.model.ProductDataResponse
import com.amazon.device.iap.model.ProductType
import java.lang.NumberFormatException
import android.util.Log
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.amazon.device.iap.model.CoinsReward
import com.amazon.device.iap.model.PurchaseUpdatesResponse
import com.amazon.device.iap.model.Receipt
import com.facebook.react.bridge.WritableNativeMap
import com.amazon.device.iap.model.PurchaseResponse
import com.amazon.device.iap.model.UserDataResponse
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.facebook.react.uimanager.ViewManager

class RNIapPackage : ReactPackage {
    fun createJSModules(): MutableList<Class<out JavaScriptModule>> {
        return mutableListOf()
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        val modules: MutableList<NativeModule> = ArrayList()
        modules.add(RNIapAmazonModule(reactContext))
        return modules
    }

}
package com.dooboolab.RNIap

import com.facebook.react.bridge.WritableMap

interface EventSender {
    fun sendEvent(
        eventName: String,
        params: WritableMap?
    )
}

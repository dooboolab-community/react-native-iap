package com.dooboolab.rniap

import com.facebook.react.bridge.WritableMap

interface EventSender {
    fun sendEvent(
        eventName: String,
        params: WritableMap?,
    )
}

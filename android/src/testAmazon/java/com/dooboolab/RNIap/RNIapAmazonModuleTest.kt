package com.dooboolab.RNIap

import android.os.Handler
import com.amazon.device.iap.model.PurchaseResponse
import com.amazon.device.iap.model.Receipt
import com.amazon.device.iap.model.RequestId
import com.amazon.device.iap.model.UserData
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import io.mockk.MockKAnnotations
import io.mockk.Runs
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.impl.annotations.RelaxedMockK
import io.mockk.just
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.slot
import io.mockk.spyk
import io.mockk.verify
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import java.util.*

class RNIapAmazonModuleTest {

    @MockK
    lateinit var context: ReactApplicationContext

    @RelaxedMockK
    lateinit var purchasingServiceProxy: PurchasingServiceProxy

    @MockK
    lateinit var mainThreadHandler: Handler

    private lateinit var listener: RNIapAmazonListener

    private lateinit var module: RNIapAmazonModule

    @Before
    fun setUp() {
        MockKAnnotations.init(this, relaxUnitFun = true)
        listener = spyk(RNIapAmazonListener(context, purchasingServiceProxy))
        module = RNIapAmazonModule(context, purchasingServiceProxy, mainThreadHandler, listener)
    }

    @Test
    fun `initConnection should resolve to true`() {
        every { context.applicationContext } returns mockk()

        val promise = mockk<Promise>(relaxed = true)
        val slot = slot<Runnable>()
        every { mainThreadHandler.postDelayed(capture(slot), any()) } answers { slot.captured.run(); true }
        module.initConnection(promise)
        verify(exactly = 0) { promise.reject(any(), any<String>()) }
        verify { promise.resolve(true) }
        verify { purchasingServiceProxy.registerListener(any(), any()) }
    }

    @Test
    fun `Purchase Item`() {
        val purchaseResponse = mockk<PurchaseResponse>() {
            every { requestId } returns RequestId.fromString("0")

            every { requestStatus } returns PurchaseResponse.RequestStatus.SUCCESSFUL
            val mReceipt = mockk<Receipt>(relaxed = true) {
                every { sku } returns "mySku"
                every { purchaseDate } returns Date()
                every { receiptId } returns "rId"
            }
            every { receipt } returns mReceipt
            val mUserData = mockk<UserData>(relaxed = true) {
                every { userId } returns "uid1"
            }
            every { userData } returns mUserData
        }

        every { listener.sendEvent(any(), any(), any()) } just Runs

        every { purchasingServiceProxy.purchase(any()) } answers {
            listener.onPurchaseResponse(
                purchaseResponse
            ); RequestId.fromString("0")
        }

        val itemsMap = mockk<WritableMap>(relaxed = true) {
            every { getString("productId") } returns "mySku"
        }
        mockkStatic(Arguments::class)

        every { Arguments.createMap() } returns itemsMap

        val promise = mockk<Promise>(relaxed = true)

        module.buyItemByType("mySku", promise)
        verify(exactly = 0) { promise.reject(any(), any<String>()) }
        val response = slot<WritableMap>()
        verify { promise.resolve(capture(response)) }
        assertEquals("mySku", response.captured.getString("productId"))
        verify { listener.sendEvent(any(), "purchase-updated", any()) }
        verify(exactly = 0) { purchasingServiceProxy.getPurchaseUpdates(false) }
    }

//    @Test
//    fun `initConnection Play Services not available on device should reject`() {
//    }
//
//    @Test
//    fun `initConnection start new connection fails`() {
//    }
//
//    @Test
//    fun `endConnection resolves`() {
//    }
//
//    @Test
//    fun `flushFailedPurchasesCachedAsPending resolves to false if no pending purchases`() {
//    }
//
//    @Test
//    fun `flushFailedPurchasesCachedAsPending resolves to true if pending purchases`() {
//    }
//
//    @Test
//    fun getItemsByType() {
//    }
//
//    @Test
//    fun getAvailableItemsByType() {
//    }
//
//    @Test
//    fun getPurchaseHistoryByType() {
//    }
//
//
//    @Test
//    fun acknowledgePurchase() {
//    }
//
//    @Test
//    fun consumeProduct() {
//    }
//
//    @Test
//    fun onPurchasesUpdated() {
//    }
}

package com.dooboolab.RNIap

import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.ConsumeResponseListener
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesResponseListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.Before
import org.junit.Test

class RNIapModuleTest {

    @MockK
    lateinit var context: ReactApplicationContext
    @MockK
    lateinit var builder: BillingClient.Builder
    @MockK
    lateinit var billingClient: BillingClient
    @MockK
    lateinit var availability: GoogleApiAvailability

    private lateinit var module: RNIapModule

    @Before
    fun setUp() {
        MockKAnnotations.init(this, relaxUnitFun = true)
        every { builder.setListener(any()) } returns builder
        every { builder.build() } returns billingClient
        module = RNIapModule(context, builder, availability)
    }

    @Test
    fun `initConnection Already connected should resolve to true`() {
        every { billingClient.isReady } returns true
        val promise = mockk<Promise>(relaxed = true)

        module.initConnection(promise)
        verify(exactly = 0) { promise.reject(any(), any<String>()) }
        verify { promise.resolve(true) }
    }

    @Test
    fun `initConnection Play Services not available on device should reject`() {
        every { billingClient.isReady } returns false
        every { availability.isGooglePlayServicesAvailable(any()) } returns ConnectionResult.DEVELOPER_ERROR
        val promise = mockk<Promise>(relaxed = true)

        module.initConnection(promise)
        verify { promise.reject(any(), any<String>()) }
        verify(exactly = 0) { promise.resolve(any()) }
    }

    @Test
    fun `initConnection start new connection succeeds`() {
        every { billingClient.isReady } returns false
        val listener = slot<BillingClientStateListener>()
        every { billingClient.startConnection(capture(listener)) } answers {
            listener.captured.onBillingSetupFinished(BillingResult.newBuilder().setResponseCode(BillingClient.BillingResponseCode.OK).build())
        }
        every { availability.isGooglePlayServicesAvailable(any()) } returns ConnectionResult.SUCCESS
        val promise = mockk<Promise>(relaxed = true)

        module.initConnection(promise)
        verify(exactly = 0) { promise.reject(any(), any<String>()) }
        verify { promise.resolve(any()) }
    }

    @Test
    fun `initConnection start new connection fails`() {
        every { billingClient.isReady } returns false
        val listener = slot<BillingClientStateListener>()
        every { billingClient.startConnection(capture(listener)) } answers {
            listener.captured.onBillingSetupFinished(BillingResult.newBuilder().setResponseCode(BillingClient.BillingResponseCode.ERROR).build())
        }
        every { availability.isGooglePlayServicesAvailable(any()) } returns ConnectionResult.SUCCESS
        val promise = mockk<Promise>(relaxed = true)

        module.initConnection(promise)
        verify { promise.reject(any(), any<String>()) }
        verify(exactly = 0) { promise.resolve(any()) }
    }

    @Test
    fun `endConnection resolves`() {
        val promise = mockk<Promise>(relaxed = true)

        module.endConnection(promise)

        verify { billingClient.endConnection() }
        verify(exactly = 0) { promise.reject(any(), any<String>()) }
        verify { promise.resolve(true) }
    }

    @Test
    fun `flushFailedPurchasesCachedAsPending resolves to false if no pending purchases`() {
        every { billingClient.isReady } returns true
        val promise = mockk<Promise>(relaxed = true)
        val listener = slot<PurchasesResponseListener>()
        every { billingClient.queryPurchasesAsync(any(), capture(listener)) } answers {
            listener.captured.onQueryPurchasesResponse(BillingResult.newBuilder().build(), listOf())
        }
        module.flushFailedPurchasesCachedAsPending(promise)

        verify(exactly = 0) { promise.reject(any(), any<String>()) }
        verify { promise.resolve(false) } // empty list
    }

    @Test
    fun `flushFailedPurchasesCachedAsPending resolves to true if pending purchases`() {
        every { billingClient.isReady } returns true
        val promise = mockk<Promise>(relaxed = true)
        val listener = slot<PurchasesResponseListener>()
        every { billingClient.queryPurchasesAsync(any(), capture(listener)) } answers {
            listener.captured.onQueryPurchasesResponse(
                BillingResult.newBuilder().build(),
                listOf(
                    // 4 = Pending
                    mockk<Purchase> {
                        every { purchaseState } returns 2
                        every { purchaseToken } returns "token"
                    },
                    Purchase("", "1")
                )
            )
        }
        val consumeListener = slot<ConsumeResponseListener>()
        every { billingClient.consumeAsync(any(), capture(consumeListener)) } answers {
            consumeListener.captured.onConsumeResponse(BillingResult.newBuilder().setResponseCode(BillingClient.BillingResponseCode.ITEM_NOT_OWNED).build(), "")
        }

        module.flushFailedPurchasesCachedAsPending(promise)

        verify(exactly = 0) { promise.reject(any(), any<String>()) }
        verify { promise.resolve(true) } // at least one pending transactions
    }

    @Test
    fun getItemsByType() {
    }

    @Test
    fun getAvailableItemsByType() {
    }

    @Test
    fun getPurchaseHistoryByType() {
    }

    @Test
    fun buyItemByType() {
    }

    @Test
    fun acknowledgePurchase() {
    }

    @Test
    fun consumeProduct() {
    }

    @Test
    fun onPurchasesUpdated() {
    }
}

package com.dooboolab.RNIap

import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.ConsumeResponseListener
import com.android.billingclient.api.ProductDetailsResponseListener
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesResponseListener
import com.android.billingclient.api.QueryPurchasesParams
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.just
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.runs
import io.mockk.slot
import io.mockk.verify
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
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
        every { availability.isGooglePlayServicesAvailable(any()) } returns ConnectionResult.SUCCESS
        module.initConnection(mockk())

        every { billingClient.isReady } returns true

        val promise = mockk<Promise>(relaxed = true)
        // Already connected
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
        verify { promise.safeReject(any(), any<String>()) }
        verify(exactly = 0) { promise.resolve(any()) }
    }

    @Test
    fun `initConnection start new connection succeeds`() {
        every { billingClient.isReady } returns false
        val listener = slot<BillingClientStateListener>()
        every { billingClient.startConnection(capture(listener)) } answers {
            listener.captured.onBillingSetupFinished(
                BillingResult.newBuilder().setResponseCode(BillingClient.BillingResponseCode.OK)
                    .build()
            )
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
            listener.captured.onBillingSetupFinished(
                BillingResult.newBuilder().setResponseCode(BillingClient.BillingResponseCode.ERROR)
                    .build()
            )
        }
        every { availability.isGooglePlayServicesAvailable(any()) } returns ConnectionResult.SUCCESS
        val promise = mockk<Promise>(relaxed = true)

        module.initConnection(promise)
        verify { promise.safeReject(any(), any<String>()) }
        verify(exactly = 0) { promise.resolve(any()) }
    }

    @Test
    fun `endConnection resolves`() {
        every { availability.isGooglePlayServicesAvailable(any()) } returns ConnectionResult.SUCCESS
        val promise = mockk<Promise>(relaxed = true)

        module.initConnection(mockk())
        module.endConnection(promise)

        verify { billingClient.endConnection() }
        verify(exactly = 0) { promise.reject(any(), any<String>()) }
        verify { promise.resolve(true) }
    }

    @Test
    fun `flushFailedPurchasesCachedAsPending resolves to false if no pending purchases`() {
        every { availability.isGooglePlayServicesAvailable(any()) } returns ConnectionResult.SUCCESS
        every { billingClient.isReady } returns true
        val promise = mockk<Promise>(relaxed = true)
        val listener = slot<PurchasesResponseListener>()
        every { billingClient.queryPurchasesAsync(any<QueryPurchasesParams>(), capture(listener)) } answers {
            listener.captured.onQueryPurchasesResponse(BillingResult.newBuilder().build(), listOf())
        }
        module.initConnection(mockk())
        module.flushFailedPurchasesCachedAsPending(promise)

        verify(exactly = 0) { promise.reject(any(), any<String>()) }
        verify { promise.resolve(false) } // empty list
    }

    @Test
    fun `flushFailedPurchasesCachedAsPending resolves to true if pending purchases`() {
        every { availability.isGooglePlayServicesAvailable(any()) } returns ConnectionResult.SUCCESS
        every { billingClient.isReady } returns true
        val promise = mockk<Promise>(relaxed = true)
        val listener = slot<PurchasesResponseListener>()
        every { billingClient.queryPurchasesAsync(any<QueryPurchasesParams>(), capture(listener)) } answers {
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
            consumeListener.captured.onConsumeResponse(
                BillingResult.newBuilder()
                    .setResponseCode(BillingClient.BillingResponseCode.ITEM_NOT_OWNED).build(),
                ""
            )
        }
        module.initConnection(mockk())
        module.flushFailedPurchasesCachedAsPending(promise)

        verify(exactly = 0) { promise.reject(any(), any<String>()) }
        verify { promise.resolve(true) } // at least one pending transactions
    }

    @Test
    fun `ensureConnection should attempt to reconnect, if not in ready state`() {
        every { availability.isGooglePlayServicesAvailable(any()) } returns ConnectionResult.SUCCESS
        val promise = mockk<Promise>(relaxed = true)
        var isCallbackCalled = false
        val callback = { _: BillingClient ->
            isCallbackCalled = true
            promise.resolve(true)
        }

        every { billingClient.isReady } returns true
        val listener = slot<BillingClientStateListener>()
        every { billingClient.startConnection(capture(listener)) } answers {
            listener.captured.onBillingSetupFinished(
                BillingResult.newBuilder().setResponseCode(BillingClient.BillingResponseCode.OK)
                    .build()
            )
        }

        module.ensureConnection(promise, callback)
        verify { promise.resolve(true) } // at least one pending transactions
        assertTrue("Should call callback", isCallbackCalled)
    }

    @Test
    fun getItemsByType() {
        every { availability.isGooglePlayServicesAvailable(any()) } returns ConnectionResult.SUCCESS
        every { billingClient.isReady } returns true
        val promise = mockk<Promise>(relaxed = true)
        val listener = slot<ProductDetailsResponseListener>()
        every { billingClient.queryProductDetailsAsync(any(), capture(listener)) } answers {
            listener.captured.onProductDetailsResponse(
                BillingResult.newBuilder().build(),
                listOf(
                    mockk {
                        every { productId } returns "sku1"

                        every { title } returns "title2"
                        every { description } returns "My product"

                        every { productType } returns "sub"
                        every { name } returns "name of product"
                        every { oneTimePurchaseOfferDetails } returns mockk {
                            every { priceCurrencyCode} returns "my code"
                            every {formattedPrice} returns "$20.00"
                            every { priceAmountMicros } returns 20000

                            }
                        every { subscriptionOfferDetails } returns  listOf( mockk {
                            every { offerToken } returns "sToken"
                            every { offerTags  } returns listOf("offerTag1","offerTag2")
                            every { pricingPhases} returns listOf(mockk{
                                every { formattedPrice } returns "$13.0"
                                every { priceCurrencyCode } returns "USD"
                                every { billingPeriod } returns "1 week"
                                every { billingCycleCount } returns 1
                                every { priceAmountMicros } returns 13000
                                every { recurrenceMode } returns 2
                            })
                        })
                    }
                )
            )
        }
        val skus = mockk<ReadableArray>() {
            every { size() } returns 1
            every { getString(0) } returns "sku0"
            every { getType(0) } returns ReadableType.String
        }
        mockkStatic(Arguments::class)

        val itemsMap = mockk<WritableMap>(relaxed = true)
        var itemsSize = 0
        val itemsArr = mockk<WritableArray>{
            every { pushString(any()) } just runs
            every { pushMap(any()) } answers {
                itemsSize++
            }
        }
        every { Arguments.createMap() } returns itemsMap
        every { Arguments.createArray() } returns itemsArr

        module.initConnection(mockk())
        module.getItemsByType("subs", skus, promise)
        verify { promise.resolve(any()) }
        assertEquals(3, itemsSize)
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

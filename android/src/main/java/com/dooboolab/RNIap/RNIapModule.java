
package com.dooboolab.RNIap;

import android.app.Activity;
import androidx.annotation.Nullable;
import android.util.Log;

import com.android.billingclient.api.AcknowledgePurchaseResponseListener;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.PurchaseHistoryRecord;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ObjectAlreadyConsumedException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.ConsumeResponseListener;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchaseHistoryResponseListener;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.SkuDetails;
import com.android.billingclient.api.SkuDetailsParams;
import com.android.billingclient.api.SkuDetailsResponseListener;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class RNIapModule extends ReactContextBaseJavaModule implements PurchasesUpdatedListener{
  final String TAG = "RNIapModule";

  private static final String PROMISE_BUY_ITEM = "PROMISE_BUY_ITEM";

  private HashMap<String, ArrayList<Promise>> promises = new HashMap<>();

  private ReactContext reactContext;
  private BillingClient billingClient;

  private List<SkuDetails> skus;

  private LifecycleEventListener lifecycleEventListener = new LifecycleEventListener() {
    @Override
    public void onHostResume() {

    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {
      if (billingClient != null) {
        billingClient.endConnection();
        billingClient = null;
      }
    }
  };

  public RNIapModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    this.skus = new ArrayList<SkuDetails>();
    reactContext.addLifecycleEventListener(lifecycleEventListener);
  }

  @Override
  public String getName() {
    return "RNIapModule";
  }

  private void ensureConnection (final Promise promise, final Runnable callback) {
    if (billingClient != null && billingClient.isReady()) {
      callback.run();
      return;
    }

    final BillingClientStateListener billingClientStateListener = new BillingClientStateListener() {
      private boolean bSetupCallbackConsumed = false;

      @Override
      public void onBillingSetupFinished(BillingResult billingResult) {
        if (!bSetupCallbackConsumed) {
          bSetupCallbackConsumed = true;
          if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK ) {
            if (billingClient != null && billingClient.isReady()) {
              callback.run();
            }
          } else {
            WritableMap error = Arguments.createMap();
            error.putInt("responseCode", billingResult.getResponseCode());
            error.putString("debugMessage", billingResult.getDebugMessage());
            String[] errorData = DoobooUtils.getInstance().getBillingResponseData(billingResult.getResponseCode());
            error.putString("code", errorData[0]);
            error.putString("message", errorData[1]);
            sendEvent(reactContext, "purchase-error", error);
            DoobooUtils.getInstance().rejectPromiseWithBillingError(promise, billingResult.getResponseCode());
          }
        }
      }

      @Override
      public void onBillingServiceDisconnected() {
        Log.d(TAG, "billing client disconnected");
      }
    };

    try {
      billingClient = BillingClient.newBuilder(reactContext).enablePendingPurchases().setListener(this).build();
      billingClient.startConnection(billingClientStateListener);
    } catch (Exception e) {
      promise.reject(DoobooUtils.E_NOT_PREPARED, e.getMessage(), e);
    }
  }

  @ReactMethod
  public void initConnection(final Promise promise) {
    billingClient = BillingClient.newBuilder(reactContext)
        .enablePendingPurchases()
        .setListener(this).build();
    billingClient.startConnection(new BillingClientStateListener() {
      @Override
      public void onBillingSetupFinished(BillingResult billingResult) {
        int responseCode = billingResult.getResponseCode();
        try {
          if (responseCode == BillingClient.BillingResponseCode.OK) {
            promise.resolve(true);
          } else {
            DoobooUtils.getInstance().rejectPromiseWithBillingError(promise, responseCode);
          }
        } catch (ObjectAlreadyConsumedException oce) {
          Log.e(TAG, oce.getMessage());
        }
      }
      @Override
      public void onBillingServiceDisconnected() {
        try {
          promise.reject("initConnection", "Billing service disconnected");
        } catch (ObjectAlreadyConsumedException oce) {
          Log.e(TAG, oce.getMessage());
        }
      }
    });
  }

  @ReactMethod
  public void endConnection(final Promise promise) {
    if (billingClient != null) {
      try {
        billingClient.endConnection();
      } catch (Exception e) {
        promise.reject("endConnection", e.getMessage());
        return;
      }
    }
    try {
      promise.resolve(true);
    } catch (ObjectAlreadyConsumedException oce) {
      Log.e(TAG, oce.getMessage());
    }
  }

  private void consumeItems(final List<Purchase> purchases, final Promise promise) {
    consumeItems(purchases, promise, BillingClient.BillingResponseCode.OK);
  }

  private void consumeItems(final List<Purchase> purchases, final Promise promise, final int expectedResponseCode) {
    for (Purchase purchase : purchases) {
      final ConsumeParams consumeParams = ConsumeParams.newBuilder()
          .setPurchaseToken(purchase.getPurchaseToken())
          .build();

      final ConsumeResponseListener listener = new ConsumeResponseListener() {
        @Override
        public void onConsumeResponse(BillingResult billingResult, String outToken) {
          if (billingResult.getResponseCode() != expectedResponseCode) {
            DoobooUtils.getInstance().rejectPromiseWithBillingError(promise, billingResult.getResponseCode());
            return;
          }
          try {
            promise.resolve(true);
          } catch (ObjectAlreadyConsumedException oce) {
            promise.reject(oce.getMessage());
          }
        }
      };
      billingClient.consumeAsync(consumeParams, listener);
    }
  }

  @ReactMethod
  public void refreshItems(final Promise promise) {
//    Purchase.PurchasesResult purchasesResult = billingClient.queryPurchases(BillingClient.SkuType.INAPP);
//    purchasesResult.getPurchasesList();
    ensureConnection(promise, new Runnable() {
      @Override
      public void run() {
        final WritableNativeArray array = new WritableNativeArray();
        Purchase.PurchasesResult result = billingClient.queryPurchases(BillingClient.SkuType.INAPP);
        if (result == null) {
          promise.reject("refreshItem", "No results for query");
          return;
        }
        final List<Purchase> purchases = result.getPurchasesList();
        if (purchases == null || purchases.size() == 0) {
          promise.reject("refreshItem", "No purchases found");
          return;
        }

        consumeItems(purchases, promise);
      }
    });
  }

  @ReactMethod
  public void flushFailedPurchasesCachedAsPending(final Promise promise) {
    ensureConnection(promise, new Runnable() {
      @Override
      public void run() {
        final WritableNativeArray array = new WritableNativeArray();
        Purchase.PurchasesResult result = billingClient.queryPurchases(BillingClient.SkuType.INAPP);
        if (result == null) {
          // No results for query
          promise.resolve(false);
          return;
        }
        final List<Purchase> purchases = result.getPurchasesList();
        if (purchases == null) {
          // No purchases found
          promise.resolve(false);
          return;
        }
        final List<Purchase> pendingPurchases = new ArrayList<>();
        for (Purchase purchase : purchases) {
          // we only want to try to consume PENDING items, in order to force cache-refresh for them
          if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
            pendingPurchases.add(purchase);
          }
        }
        if (pendingPurchases.size() == 0) {
          promise.resolve(false);
          return;
        }

        consumeItems(pendingPurchases, promise, BillingClient.BillingResponseCode.ITEM_NOT_OWNED);
      }
    });
  }

  @ReactMethod
  public void getItemsByType(final String type, final ReadableArray skuArr, final Promise promise) {
    ensureConnection(promise, new Runnable() {
      @Override
      public void run() {
        final ArrayList<String> skuList = new ArrayList<>();

        for (int i = 0; i < skuArr.size(); i++) {
          skuList.add(skuArr.getString(i));
        }

        SkuDetailsParams.Builder params = SkuDetailsParams.newBuilder();
        params.setSkusList(skuList).setType(type);

        billingClient.querySkuDetailsAsync(params.build(), new SkuDetailsResponseListener() {
          @Override
          public void onSkuDetailsResponse(BillingResult billingResult, List<SkuDetails> skuDetailsList) {
            Log.d(TAG, "responseCode: " + billingResult.getResponseCode());
            if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
              DoobooUtils.getInstance().rejectPromiseWithBillingError(promise, billingResult.getResponseCode());
              return;
            }

            for (SkuDetails sku : skuDetailsList) {
              if (!skus.contains(sku)) {
                skus.add(sku);
              }
            }
            WritableNativeArray items = new WritableNativeArray();

            for (SkuDetails skuDetails : skuDetailsList) {
              WritableMap item = Arguments.createMap();
              item.putString("productId", skuDetails.getSku());
              long priceAmountMicros = skuDetails.getPriceAmountMicros();
              // Use valueOf instead of constructors.
              // See: https://www.javaworld.com/article/2073176/caution--double-to-bigdecimal-in-java.html
              BigDecimal priceAmount = BigDecimal.valueOf(priceAmountMicros);
              BigDecimal microUnitsDivisor = BigDecimal.valueOf(1000000);
              String price = priceAmount.divide(microUnitsDivisor).toString();
              item.putString("price", price);
              item.putString("currency", skuDetails.getPriceCurrencyCode());
              item.putString("type", skuDetails.getType());
              item.putString("localizedPrice", skuDetails.getPrice());
              item.putString("title", skuDetails.getTitle());
              item.putString("description", skuDetails.getDescription());
              item.putString("introductoryPrice", skuDetails.getIntroductoryPrice());
              item.putString("typeAndroid", skuDetails.getType());
              item.putString("packageNameAndroid", skuDetails.zza());
              item.putString("originalPriceAndroid", skuDetails.getOriginalPrice());
              item.putString("subscriptionPeriodAndroid", skuDetails.getSubscriptionPeriod());
              item.putString("freeTrialPeriodAndroid", skuDetails.getFreeTrialPeriod());
              item.putString("introductoryPriceCyclesAndroid", String.valueOf(skuDetails.getIntroductoryPriceCycles()));
              item.putString("introductoryPricePeriodAndroid", skuDetails.getIntroductoryPricePeriod());
              item.putString("iconUrl", skuDetails.getIconUrl());
              item.putString("originalJson", skuDetails.getOriginalJson());
              BigDecimal originalPriceAmountMicros = BigDecimal.valueOf(skuDetails.getOriginalPriceAmountMicros());
              String originalPrice = originalPriceAmountMicros.divide(microUnitsDivisor).toString();
              item.putString("originalPrice", originalPrice);
              items.pushMap(item);
            }

            try {
              promise.resolve(items);
            } catch (ObjectAlreadyConsumedException oce) {
              Log.e(TAG, oce.getMessage());
            }
          }
        });
      }
    });
  }

  @ReactMethod
  public void getAvailableItemsByType(final String type, final Promise promise) {
    ensureConnection(promise, new Runnable() {
      @Override
      public void run() {
        final WritableNativeArray items = new WritableNativeArray();
        Purchase.PurchasesResult result = billingClient.queryPurchases(type.equals("subs") ? BillingClient.SkuType.SUBS : BillingClient.SkuType.INAPP);
        final List<Purchase> purchases = result.getPurchasesList();

        if (purchases != null) {
          for (Purchase purchase : purchases) {
            WritableNativeMap item = new WritableNativeMap();
            item.putString("productId", purchase.getSku());
            item.putString("transactionId", purchase.getOrderId());
            item.putDouble("transactionDate", purchase.getPurchaseTime());
            item.putString("transactionReceipt", purchase.getOriginalJson());
            item.putString("orderId", purchase.getOrderId());
            item.putString("purchaseToken", purchase.getPurchaseToken());
            item.putString("developerPayloadAndroid", purchase.getDeveloperPayload());
            item.putString("signatureAndroid", purchase.getSignature());
            item.putInt("purchaseStateAndroid", purchase.getPurchaseState());
            item.putBoolean("isAcknowledgedAndroid", purchase.isAcknowledged());
            item.putString("packageNameAndroid", purchase.getPackageName());
            item.putString("obfuscatedAccountIdAndroid", purchase.getAccountIdentifiers().getObfuscatedAccountId());
            item.putString("obfuscatedProfileIdAndroid", purchase.getAccountIdentifiers().getObfuscatedProfileId());

            if (type.equals(BillingClient.SkuType.SUBS)) {
              item.putBoolean("autoRenewingAndroid", purchase.isAutoRenewing());
            }
            items.pushMap(item);
          }
        }

        try {
          promise.resolve(items);
        } catch (ObjectAlreadyConsumedException oce) {
          Log.e(TAG, oce.getMessage());
        }
      }
    });
  }

  @ReactMethod
  public void getPurchaseHistoryByType(final String type, final Promise promise) {
    ensureConnection(promise, new Runnable() {
      @Override
      public void run() {
        billingClient.queryPurchaseHistoryAsync(type.equals("subs") ? BillingClient.SkuType.SUBS : BillingClient.SkuType.INAPP, new PurchaseHistoryResponseListener() {
          @Override
          public void onPurchaseHistoryResponse(BillingResult billingResult, List<PurchaseHistoryRecord> purchaseHistoryRecordList) {
            if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
              DoobooUtils.getInstance().rejectPromiseWithBillingError(promise, billingResult.getResponseCode());
              return;
            }

            Log.d(TAG, purchaseHistoryRecordList.toString());
            WritableArray items = Arguments.createArray();

            for (PurchaseHistoryRecord purchase : purchaseHistoryRecordList) {
              WritableMap item = Arguments.createMap();
              item.putString("productId", purchase.getSku());
              item.putDouble("transactionDate", purchase.getPurchaseTime());
              item.putString("transactionReceipt", purchase.getOriginalJson());
              item.putString("purchaseToken", purchase.getPurchaseToken());
              item.putString("dataAndroid", purchase.getOriginalJson());
              item.putString("signatureAndroid", purchase.getSignature());
              item.putString("developerPayload", purchase.getDeveloperPayload());
              items.pushMap(item);
            }

            try {
              promise.resolve(items);
            } catch (ObjectAlreadyConsumedException oce) {
              Log.e(TAG, oce.getMessage());
            }
          }
        });
      }
    });
  }

  @ReactMethod
  public void buyItemByType(
    final String type,
    final String sku,
    final String oldSku,
    final String purchaseToken,
    final Integer prorationMode,
    final String obfuscatedAccountId,
    final String obfuscatedProfileId,
    final Promise promise
  ) {
    final Activity activity = getCurrentActivity();

    if (activity == null) {
      promise.reject(DoobooUtils.E_UNKNOWN, "getCurrentActivity returned null");
      return;
    }

    ensureConnection(promise, new Runnable() {
      @Override
      public void run() {
        DoobooUtils.getInstance().addPromiseForKey(PROMISE_BUY_ITEM, promise);
        final BillingFlowParams.Builder builder = BillingFlowParams.newBuilder();

        SkuDetails selectedSku = null;
        for (SkuDetails skuDetail : skus) {
          if (skuDetail.getSku().equals(sku)) {
            selectedSku = skuDetail;
            break;
          }
        }

        if (selectedSku == null) {
          String debugMessage = "The sku was not found. Please fetch products first by calling getItems";
          WritableMap error = Arguments.createMap();
          error.putString("debugMessage", debugMessage);
          error.putString("code", PROMISE_BUY_ITEM);
          error.putString("message", debugMessage);
          error.putString("productId", sku);
          sendEvent(reactContext, "purchase-error", error);
          promise.reject(PROMISE_BUY_ITEM, debugMessage);
          return;
        }
        builder.setSkuDetails(selectedSku);

        if (oldSku != null && purchaseToken != null) {
          builder.setOldSku(oldSku, purchaseToken);
        }

        if (obfuscatedAccountId != null) {
          builder.setObfuscatedAccountId(obfuscatedAccountId);
        }

        if (obfuscatedProfileId != null) {
          builder.setObfuscatedProfileId(obfuscatedProfileId);
        }

        if (prorationMode != null && prorationMode != -1) {
          if (prorationMode == BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_PRORATED_PRICE) {
            builder.setReplaceSkusProrationMode(BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_PRORATED_PRICE);
            if (type.equals(BillingClient.SkuType.SUBS) == false) {
              String debugMessage = "IMMEDIATE_AND_CHARGE_PRORATED_PRICE for proration mode only works in subscription purchase.";
              WritableMap error = Arguments.createMap();
              error.putString("debugMessage", debugMessage);
              error.putString("code", PROMISE_BUY_ITEM);
              error.putString("message", debugMessage);
              error.putString("productId", sku);
              sendEvent(reactContext, "purchase-error", error);
              promise.reject(PROMISE_BUY_ITEM, debugMessage);
              return;
            }
          } else if (prorationMode == BillingFlowParams.ProrationMode.IMMEDIATE_WITHOUT_PRORATION) {
            builder.setReplaceSkusProrationMode(BillingFlowParams.ProrationMode.IMMEDIATE_WITHOUT_PRORATION);
          } else if (prorationMode == BillingFlowParams.ProrationMode.DEFERRED) {
            builder.setReplaceSkusProrationMode(BillingFlowParams.ProrationMode.DEFERRED);
          } else if (prorationMode == BillingFlowParams.ProrationMode.IMMEDIATE_WITH_TIME_PRORATION) {
            builder.setReplaceSkusProrationMode(BillingFlowParams.ProrationMode.IMMEDIATE_WITH_TIME_PRORATION);
          } else {
            builder.setReplaceSkusProrationMode(BillingFlowParams.ProrationMode.UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY);
          }
        }

        BillingFlowParams flowParams = builder.build();
        BillingResult billingResult = billingClient.launchBillingFlow(activity, flowParams);
        String[] errorData = DoobooUtils.getInstance().getBillingResponseData(billingResult.getResponseCode());
      }
    });
  }

  @ReactMethod
  public void acknowledgePurchase(final String token, final String developerPayLoad, final Promise promise) {
    ensureConnection(promise, new Runnable(){
      @Override
      public void run() {
        AcknowledgePurchaseParams acknowledgePurchaseParams =
                AcknowledgePurchaseParams.newBuilder()
                        .setPurchaseToken(token)
                        .build();

        billingClient.acknowledgePurchase(acknowledgePurchaseParams, new AcknowledgePurchaseResponseListener() {
          @Override
          public void onAcknowledgePurchaseResponse(BillingResult billingResult) {
            if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
              DoobooUtils.getInstance().rejectPromiseWithBillingError(promise, billingResult.getResponseCode());
            }
            try {
              WritableMap map = Arguments.createMap();
              map.putInt("responseCode", billingResult.getResponseCode());
              map.putString("debugMessage", billingResult.getDebugMessage());
              String[] errorData = DoobooUtils.getInstance().getBillingResponseData(billingResult.getResponseCode());
              map.putString("code", errorData[0]);
              map.putString("message", errorData[1]);
              promise.resolve(map);
            } catch (ObjectAlreadyConsumedException oce) {
              Log.e(TAG, oce.getMessage());
            }
          }
        });
      }
    });
  }

  @ReactMethod
  public void consumeProduct(final String token, final String developerPayLoad, final Promise promise) {
    final ConsumeParams params = ConsumeParams.newBuilder()
        .setPurchaseToken(token)
        .build();
    billingClient.consumeAsync(params, new ConsumeResponseListener() {
      @Override
      public void onConsumeResponse(BillingResult billingResult, String purchaseToken) {
        if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
          DoobooUtils.getInstance().rejectPromiseWithBillingError(promise, billingResult.getResponseCode());
        }
        try {
          WritableMap map = Arguments.createMap();
          map.putInt("responseCode", billingResult.getResponseCode());
          map.putString("debugMessage", billingResult.getDebugMessage());
          String[] errorData = DoobooUtils.getInstance().getBillingResponseData(billingResult.getResponseCode());
          map.putString("code", errorData[0]);
          map.putString("message", errorData[1]);
          promise.resolve(map);
        } catch (ObjectAlreadyConsumedException oce) {
          promise.reject(oce.getMessage());
        }
      }
    });
  }

  @Override
  public void onPurchasesUpdated(BillingResult billingResult, @Nullable List<Purchase> purchases) {
    if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
      WritableMap error = Arguments.createMap();
      error.putInt("responseCode", billingResult.getResponseCode());
      error.putString("debugMessage", billingResult.getDebugMessage());
      String[] errorData = DoobooUtils.getInstance().getBillingResponseData(billingResult.getResponseCode());
      error.putString("code", errorData[0]);
      error.putString("message", errorData[1]);
      sendEvent(reactContext, "purchase-error", error);
      DoobooUtils.getInstance().rejectPromisesWithBillingError(PROMISE_BUY_ITEM, billingResult.getResponseCode());
      return;
    }

    if (purchases != null) {
      WritableMap promiseItem = null;
      for (Purchase purchase : purchases) {
        WritableMap item = Arguments.createMap();
        item.putString("productId", purchase.getSku());
        item.putString("transactionId", purchase.getOrderId());
        item.putDouble("transactionDate", purchase.getPurchaseTime());
        item.putString("transactionReceipt", purchase.getOriginalJson());
        item.putString("purchaseToken", purchase.getPurchaseToken());
        item.putString("dataAndroid", purchase.getOriginalJson());
        item.putString("signatureAndroid", purchase.getSignature());
        item.putBoolean("autoRenewingAndroid", purchase.isAutoRenewing());
        item.putBoolean("isAcknowledgedAndroid", purchase.isAcknowledged());
        item.putInt("purchaseStateAndroid", purchase.getPurchaseState());
        item.putString("packageNameAndroid", purchase.getPackageName());
        item.putString("developerPayloadAndroid", purchase.getDeveloperPayload());
        item.putString("obfuscatedAccountIdAndroid", purchase.getAccountIdentifiers().getObfuscatedAccountId());
        item.putString("obfuscatedProfileIdAndroid", purchase.getAccountIdentifiers().getObfuscatedProfileId());

        promiseItem = new WritableNativeMap();
        promiseItem.merge(item);
        sendEvent(reactContext, "purchase-updated", item);
      }
      if (purchases.size() > 0 && promiseItem != null) {
        DoobooUtils.getInstance().resolvePromisesForKey(PROMISE_BUY_ITEM, promiseItem);
      }
    } else {
      WritableMap error = Arguments.createMap();
      error.putInt("responseCode", billingResult.getResponseCode());
      error.putString("debugMessage", billingResult.getDebugMessage());
      String[] errorData = DoobooUtils.getInstance().getBillingResponseData(billingResult.getResponseCode());
      error.putString("code", errorData[0]);
      error.putString("message", "purchases are null.");
      sendEvent(reactContext, "purchase-error", error);
      DoobooUtils.getInstance().rejectPromisesWithBillingError(PROMISE_BUY_ITEM, billingResult.getResponseCode());
    }
  }

  private void sendUnconsumedPurchases(final Promise promise) {
    ensureConnection(promise, new Runnable() {
      @Override
      public void run() {
        String[] types = { BillingClient.SkuType.INAPP, BillingClient.SkuType.SUBS };

        for (String type : types) {
          Purchase.PurchasesResult purchasesResult = billingClient.queryPurchases(type);
          ArrayList<Purchase> unacknowledgedPurchases = new ArrayList<>();

          if (purchasesResult == null || purchasesResult.getPurchasesList() == null || purchasesResult.getPurchasesList().size() == 0) {
            continue;
          }
          for (Purchase purchase : purchasesResult.getPurchasesList()) {
            if (!purchase.isAcknowledged()) {
              unacknowledgedPurchases.add(purchase);
            }
          }
          onPurchasesUpdated(purchasesResult.getBillingResult(), unacknowledgedPurchases);
        }

        promise.resolve(true);
      }
    });
  }

  @ReactMethod
  public void startListening(final Promise promise) {
    sendUnconsumedPurchases(promise);
  }

  private void sendEvent(ReactContext reactContext,
                         String eventName,
                         @Nullable WritableMap params) {
    reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, params);
  }

  @ReactMethod
  public void getInstallSource(final Promise promise) {
    final String installSource = DoobooUtils.getInstance().getInstallSource(reactContext);
    promise.resolve(installSource);
  }
}

package com.dooboolab.RNIap;

import android.app.Activity;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.android.billingclient.api.AccountIdentifiers;
import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.ConsumeResponseListener;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchaseHistoryRecord;
import com.android.billingclient.api.PurchaseHistoryResponseListener;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.SkuDetails;
import com.android.billingclient.api.SkuDetailsParams;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ObjectAlreadyConsumedException;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RNIapModule extends ReactContextBaseJavaModule implements PurchasesUpdatedListener {
  final String TAG = "RNIapModule";

  private static final String PROMISE_BUY_ITEM = "PROMISE_BUY_ITEM";
  private final ReactContext reactContext;
  private BillingClient billingClientCache;

  private final Map<String, SkuDetails> skus;

  public RNIapModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    this.skus = new HashMap<>();
    LifecycleEventListener lifecycleEventListener =
        new LifecycleEventListener() {
          @Override
          public void onHostResume() {}

          @Override
          public void onHostPause() {}

          @Override
          public void onHostDestroy() {
            if (billingClientCache != null) {
              billingClientCache.endConnection();
              billingClientCache = null;
            }
          }
        };
    reactContext.addLifecycleEventListener(lifecycleEventListener);
  }

  @NonNull
  @Override
  public String getName() {
    return "RNIapModule";
  }

  private interface EnsureConnectionCallback {
    void run(final @NonNull BillingClient billingClient);
  }

  private void ensureConnection(final Promise promise, final EnsureConnectionCallback callback) {
    final BillingClient billingClient = billingClientCache;
    if (billingClient != null && billingClient.isReady()) {
      callback.run(billingClient);
      return;
    }
    promise.reject(DoobooUtils.E_NOT_PREPARED, "Not initialized, Please call initConnection()");
  }

  @ReactMethod
  public void initConnection(final Promise promise) {
    if (billingClientCache != null) {
      Log.i(
          TAG,
          "Already initialized, you should only call initConnection() once when your app starts");
      promise.resolve(true);
      return;
    }

    if (GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(reactContext)
        != ConnectionResult.SUCCESS) {
      Log.i(TAG, "Google Play Services are not available on this device");
      promise.resolve(false);
      return;
    }

    billingClientCache =
        BillingClient.newBuilder(reactContext).enablePendingPurchases().setListener(this).build();
    billingClientCache.startConnection(
        new BillingClientStateListener() {
          @Override
          public void onBillingSetupFinished(@NonNull BillingResult billingResult) {
            int responseCode = billingResult.getResponseCode();
            try {
              if (responseCode == BillingClient.BillingResponseCode.OK) {
                promise.resolve(true);
              } else {
                PlayUtils.getInstance().rejectPromiseWithBillingError(promise, responseCode);
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
    if (billingClientCache != null) {
      try {
        billingClientCache.endConnection();
        billingClientCache = null;
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

  private void consumeItems(
      final List<Purchase> purchases, final Promise promise, final int expectedResponseCode) {
    for (Purchase purchase : purchases) {
      ensureConnection(
          promise,
          billingClient -> {
            final ConsumeParams consumeParams =
                ConsumeParams.newBuilder().setPurchaseToken(purchase.getPurchaseToken()).build();

            final ConsumeResponseListener listener =
                (billingResult, outToken) -> {
                  if (billingResult.getResponseCode() != expectedResponseCode) {
                    PlayUtils.getInstance()
                        .rejectPromiseWithBillingError(promise, billingResult.getResponseCode());
                    return;
                  }
                  try {
                    promise.resolve(true);
                  } catch (ObjectAlreadyConsumedException oce) {
                    promise.reject(oce.getMessage());
                  }
                };
            billingClient.consumeAsync(consumeParams, listener);
          });
    }
  }

  @ReactMethod
  public void flushFailedPurchasesCachedAsPending(final Promise promise) {
    ensureConnection(
        promise,
        billingClient -> {
          final WritableNativeArray array = new WritableNativeArray();
          billingClient.queryPurchasesAsync(
              BillingClient.SkuType.INAPP,
              (billingResult, list) -> {
                final List<Purchase> purchases = list;
                if (purchases == null) {
                  // No purchases found
                  promise.resolve(false);
                  return;
                }
                final List<Purchase> pendingPurchases = new ArrayList<>();
                for (Purchase purchase : purchases) {
                  // we only want to try to consume PENDING items, in order to force cache-refresh
                  // for
                  // them
                  if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
                    pendingPurchases.add(purchase);
                  }
                }
                if (pendingPurchases.size() == 0) {
                  promise.resolve(false);
                  return;
                }

                consumeItems(
                    pendingPurchases, promise, BillingClient.BillingResponseCode.ITEM_NOT_OWNED);
              });
        });
  }

  @ReactMethod
  public void getItemsByType(final String type, final ReadableArray skuArr, final Promise promise) {
    ensureConnection(
        promise,
        billingClient -> {
          final ArrayList<String> skuList = new ArrayList<>();

          for (int i = 0; i < skuArr.size(); i++) {
            skuList.add(skuArr.getString(i));
          }

          SkuDetailsParams.Builder params = SkuDetailsParams.newBuilder();
          params.setSkusList(skuList).setType(type);

          billingClient.querySkuDetailsAsync(
              params.build(),
              (billingResult, skuDetailsList) -> {
                Log.d(TAG, "responseCode: " + billingResult.getResponseCode());
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                  PlayUtils.getInstance()
                      .rejectPromiseWithBillingError(promise, billingResult.getResponseCode());
                  return;
                }

                if (skuDetailsList != null) {
                  for (SkuDetails sku : skuDetailsList) {
                    skus.put(sku.getSku(), sku);
                  }
                }
                WritableNativeArray items = new WritableNativeArray();

                for (SkuDetails skuDetails : skuDetailsList) {
                  WritableMap item = Arguments.createMap();
                  item.putString("productId", skuDetails.getSku());
                  long introductoryPriceMicros = skuDetails.getIntroductoryPriceAmountMicros();
                  long priceAmountMicros = skuDetails.getPriceAmountMicros();
                  // Use valueOf instead of constructors.
                  // See:
                  // https://www.javaworld.com/article/2073176/caution--double-to-bigdecimal-in-java.html
                  BigDecimal priceAmount = BigDecimal.valueOf(priceAmountMicros);
                  BigDecimal introductoryPriceAmount = BigDecimal.valueOf(introductoryPriceMicros);
                  BigDecimal microUnitsDivisor = BigDecimal.valueOf(1000000);
                  String price = priceAmount.divide(microUnitsDivisor).toString();
                  String introductoryPriceAsAmountAndroid =
                      introductoryPriceAmount.divide(microUnitsDivisor).toString();
                  item.putString("price", price);
                  item.putString("currency", skuDetails.getPriceCurrencyCode());
                  item.putString("type", skuDetails.getType());
                  item.putString("localizedPrice", skuDetails.getPrice());
                  item.putString("title", skuDetails.getTitle());
                  item.putString("description", skuDetails.getDescription());
                  item.putString("introductoryPrice", skuDetails.getIntroductoryPrice());
                  item.putString("typeAndroid", skuDetails.getType());
                  item.putString("packageNameAndroid", skuDetails.zzc());
                  item.putString("originalPriceAndroid", skuDetails.getOriginalPrice());
                  item.putString("subscriptionPeriodAndroid", skuDetails.getSubscriptionPeriod());
                  item.putString("freeTrialPeriodAndroid", skuDetails.getFreeTrialPeriod());
                  item.putString(
                      "introductoryPriceCyclesAndroid",
                      String.valueOf(skuDetails.getIntroductoryPriceCycles()));
                  item.putString(
                      "introductoryPricePeriodAndroid", skuDetails.getIntroductoryPricePeriod());
                  item.putString(
                      "introductoryPriceAsAmountAndroid", introductoryPriceAsAmountAndroid);
                  item.putString("iconUrl", skuDetails.getIconUrl());
                  item.putString("originalJson", skuDetails.getOriginalJson());
                  BigDecimal originalPriceAmountMicros =
                      BigDecimal.valueOf(skuDetails.getOriginalPriceAmountMicros());
                  String originalPrice =
                      originalPriceAmountMicros.divide(microUnitsDivisor).toString();
                  item.putString("originalPrice", originalPrice);
                  items.pushMap(item);
                }

                try {
                  promise.resolve(items);
                } catch (ObjectAlreadyConsumedException oce) {
                  Log.e(TAG, oce.getMessage());
                }
              });
        });
  }

  @ReactMethod
  public void getAvailableItemsByType(final String type, final Promise promise) {
    ensureConnection(
        promise,
        billingClient -> {
          final WritableNativeArray items = new WritableNativeArray();
          billingClient.queryPurchasesAsync(
              type.equals("subs") ? BillingClient.SkuType.SUBS : BillingClient.SkuType.INAPP,
              (billingResult, purchases) -> {
                if (purchases != null) {
                  for (int i = 0; i < purchases.size(); i++) {
                    Purchase purchase = purchases.get(i);
                    WritableNativeMap item = new WritableNativeMap();
                    item.putString("productId", purchase.getSkus().get(0));
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
                    item.putString(
                        "obfuscatedAccountIdAndroid",
                        purchase.getAccountIdentifiers().getObfuscatedAccountId());
                    item.putString(
                        "obfuscatedProfileIdAndroid",
                        purchase.getAccountIdentifiers().getObfuscatedProfileId());

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
              });
        });
  }

  @ReactMethod
  public void getPurchaseHistoryByType(final String type, final Promise promise) {
    ensureConnection(
        promise,
        billingClient -> {
          billingClient.queryPurchaseHistoryAsync(
              type.equals("subs") ? BillingClient.SkuType.SUBS : BillingClient.SkuType.INAPP,
              new PurchaseHistoryResponseListener() {
                @Override
                public void onPurchaseHistoryResponse(
                    BillingResult billingResult,
                    List<PurchaseHistoryRecord> purchaseHistoryRecordList) {
                  if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    PlayUtils.getInstance()
                        .rejectPromiseWithBillingError(promise, billingResult.getResponseCode());
                    return;
                  }

                  Log.d(TAG, purchaseHistoryRecordList.toString());
                  WritableArray items = Arguments.createArray();

                  for (int i = 0; i < purchaseHistoryRecordList.size(); i++) {
                    WritableMap item = Arguments.createMap();
                    PurchaseHistoryRecord purchase = purchaseHistoryRecordList.get(i);
                    item.putString("productId", purchase.getSkus().get(0));
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
        });
  }

  @ReactMethod
  public void buyItemByType(
      final String type,
      final String sku,
      final String purchaseToken,
      final Integer prorationMode,
      final String obfuscatedAccountId,
      final String obfuscatedProfileId,
      final Promise promise) {
    final Activity activity = getCurrentActivity();

    if (activity == null) {
      promise.reject(DoobooUtils.E_UNKNOWN, "getCurrentActivity returned null");
      return;
    }

    ensureConnection(
        promise,
        billingClient -> {
          DoobooUtils.getInstance().addPromiseForKey(PROMISE_BUY_ITEM, promise);
          final BillingFlowParams.Builder builder = BillingFlowParams.newBuilder();

          SkuDetails selectedSku = skus.get(sku);

          if (selectedSku == null) {
            String debugMessage =
                "The sku was not found. Please fetch products first by calling getItems";
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

          BillingFlowParams.SubscriptionUpdateParams.Builder subscriptionUpdateParamsBuilder =
              BillingFlowParams.SubscriptionUpdateParams.newBuilder();

          if (purchaseToken != null) {
            subscriptionUpdateParamsBuilder.setOldSkuPurchaseToken(purchaseToken);
          }

          if (obfuscatedAccountId != null) {
            builder.setObfuscatedAccountId(obfuscatedAccountId);
          }

          if (obfuscatedProfileId != null) {
            builder.setObfuscatedProfileId(obfuscatedProfileId);
          }

          if (prorationMode != null && prorationMode != -1) {
            if (prorationMode
                == BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_PRORATED_PRICE) {
              subscriptionUpdateParamsBuilder.setReplaceSkusProrationMode(
                  BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_PRORATED_PRICE);
              if (!type.equals(BillingClient.SkuType.SUBS)) {
                String debugMessage =
                    "IMMEDIATE_AND_CHARGE_PRORATED_PRICE for proration mode only works in"
                        + " subscription purchase.";
                WritableMap error = Arguments.createMap();
                error.putString("debugMessage", debugMessage);
                error.putString("code", PROMISE_BUY_ITEM);
                error.putString("message", debugMessage);
                error.putString("productId", sku);
                sendEvent(reactContext, "purchase-error", error);
                promise.reject(PROMISE_BUY_ITEM, debugMessage);
                return;
              }
            } else if (prorationMode
                == BillingFlowParams.ProrationMode.IMMEDIATE_WITHOUT_PRORATION) {
              subscriptionUpdateParamsBuilder.setReplaceSkusProrationMode(
                  BillingFlowParams.ProrationMode.IMMEDIATE_WITHOUT_PRORATION);
            } else if (prorationMode == BillingFlowParams.ProrationMode.DEFERRED) {
              subscriptionUpdateParamsBuilder.setReplaceSkusProrationMode(
                  BillingFlowParams.ProrationMode.DEFERRED);
            } else if (prorationMode
                == BillingFlowParams.ProrationMode.IMMEDIATE_WITH_TIME_PRORATION) {
              subscriptionUpdateParamsBuilder.setReplaceSkusProrationMode(
                  BillingFlowParams.ProrationMode.IMMEDIATE_WITHOUT_PRORATION);
            } else if (prorationMode
                == BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_FULL_PRICE) {
              subscriptionUpdateParamsBuilder.setReplaceSkusProrationMode(
                  BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_FULL_PRICE);
            } else {
              subscriptionUpdateParamsBuilder.setReplaceSkusProrationMode(
                  BillingFlowParams.ProrationMode.UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY);
            }
          }

          if (purchaseToken != null) {
            BillingFlowParams.SubscriptionUpdateParams subscriptionUpdateParams =
                subscriptionUpdateParamsBuilder.build();

            builder.setSubscriptionUpdateParams(subscriptionUpdateParams);
          }

          BillingFlowParams flowParams = builder.build();
          BillingResult billingResult = billingClient.launchBillingFlow(activity, flowParams);
          String[] errorData =
              PlayUtils.getInstance().getBillingResponseData(billingResult.getResponseCode());
        });
  }

  @ReactMethod
  public void acknowledgePurchase(
      final String token, final String developerPayLoad, final Promise promise) {
    ensureConnection(
        promise,
        billingClient -> {
          AcknowledgePurchaseParams acknowledgePurchaseParams =
              AcknowledgePurchaseParams.newBuilder().setPurchaseToken(token).build();

          billingClient.acknowledgePurchase(
              acknowledgePurchaseParams,
              billingResult -> {
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                  PlayUtils.getInstance()
                      .rejectPromiseWithBillingError(promise, billingResult.getResponseCode());
                }
                try {
                  WritableMap map = Arguments.createMap();
                  map.putInt("responseCode", billingResult.getResponseCode());
                  map.putString("debugMessage", billingResult.getDebugMessage());
                  String[] errorData =
                      PlayUtils.getInstance()
                          .getBillingResponseData(billingResult.getResponseCode());
                  map.putString("code", errorData[0]);
                  map.putString("message", errorData[1]);
                  promise.resolve(map);
                } catch (ObjectAlreadyConsumedException oce) {
                  Log.e(TAG, oce.getMessage());
                }
              });
        });
  }

  @ReactMethod
  public void consumeProduct(
      final String token, final String developerPayLoad, final Promise promise) {
    final ConsumeParams params = ConsumeParams.newBuilder().setPurchaseToken(token).build();
    ensureConnection(
        promise,
        billingClient -> {
          billingClient.consumeAsync(
              params,
              (billingResult, purchaseToken) -> {
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                  PlayUtils.getInstance()
                      .rejectPromiseWithBillingError(promise, billingResult.getResponseCode());
                }
                try {
                  WritableMap map = Arguments.createMap();
                  map.putInt("responseCode", billingResult.getResponseCode());
                  map.putString("debugMessage", billingResult.getDebugMessage());
                  String[] errorData =
                      PlayUtils.getInstance()
                          .getBillingResponseData(billingResult.getResponseCode());
                  map.putString("code", errorData[0]);
                  map.putString("message", errorData[1]);
                  promise.resolve(map);
                } catch (ObjectAlreadyConsumedException oce) {
                  promise.reject(oce.getMessage());
                }
              });
        });
  }

  @Override
  public void onPurchasesUpdated(BillingResult billingResult, @Nullable List<Purchase> purchases) {
    final int responseCode = billingResult.getResponseCode();
    if (responseCode != BillingClient.BillingResponseCode.OK) {
      WritableMap error = Arguments.createMap();
      error.putInt("responseCode", responseCode);
      error.putString("debugMessage", billingResult.getDebugMessage());
      String[] errorData = PlayUtils.getInstance().getBillingResponseData(responseCode);
      error.putString("code", errorData[0]);
      error.putString("message", errorData[1]);
      sendEvent(reactContext, "purchase-error", error);

      PlayUtils.getInstance().rejectPromisesWithBillingError(PROMISE_BUY_ITEM, responseCode);
      return;
    }

    if (purchases != null) {
      WritableMap promiseItem = null;
      for (int i = 0; i < purchases.size(); i++) {
        WritableMap item = Arguments.createMap();
        Purchase purchase = purchases.get(i);
        item.putString("productId", purchase.getSkus().get(0));
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
        AccountIdentifiers accountIdentifiers = purchase.getAccountIdentifiers();
        if (accountIdentifiers != null) {
          item.putString("obfuscatedAccountIdAndroid", accountIdentifiers.getObfuscatedAccountId());
          item.putString("obfuscatedProfileIdAndroid", accountIdentifiers.getObfuscatedProfileId());
        }
        promiseItem = new WritableNativeMap();
        promiseItem.merge(item);
        sendEvent(reactContext, "purchase-updated", item);
      }
      if (promiseItem != null) {
        DoobooUtils.getInstance().resolvePromisesForKey(PROMISE_BUY_ITEM, promiseItem);
      }
    } else {
      WritableMap result = Arguments.createMap();
      result.putInt("responseCode", billingResult.getResponseCode());
      result.putString("debugMessage", billingResult.getDebugMessage());
      result.putString(
          "extraMessage",
          "The purchases are null. This is a normal behavior if you have requested DEFERRED"
              + " proration. If not please report an issue.");
      sendEvent(reactContext, "purchase-updated", result);
      DoobooUtils.getInstance().resolvePromisesForKey(PROMISE_BUY_ITEM, null);
    }
  }

  private void sendUnconsumedPurchases(final Promise promise) {
    ensureConnection(
        promise,
        billingClient -> {
          String[] types = {BillingClient.SkuType.INAPP, BillingClient.SkuType.SUBS};

          for (String type : types) {
            billingClient.queryPurchasesAsync(
                type,
                (billingResult, list) -> {
                  ArrayList<Purchase> unacknowledgedPurchases = new ArrayList<>();

                  if (list == null || list.size() == 0) {
                    //                    continue;
                  }

                  for (Purchase purchase : list) {
                    if (!purchase.isAcknowledged()) {
                      unacknowledgedPurchases.add(purchase);
                    }
                  }
                  onPurchasesUpdated(billingResult, unacknowledgedPurchases);
                });
          }

          promise.resolve(true);
        });
  }

  @ReactMethod
  public void startListening(final Promise promise) {
    sendUnconsumedPurchases(promise);
  }

  @ReactMethod
  public String getPackageName() {
    return getReactApplicationContext().getPackageName();
  }

  private void sendEvent(
      ReactContext reactContext, String eventName, @Nullable WritableMap params) {
    reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, params);
  }
}

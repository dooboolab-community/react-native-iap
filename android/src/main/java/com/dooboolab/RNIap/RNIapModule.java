package com.dooboolab.RNIap;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.os.RemoteException;
import java.lang.NullPointerException;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import org.json.JSONException;
import org.json.JSONObject;

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
import com.android.billingclient.api.SkuDetails;
import com.android.billingclient.api.SkuDetailsParams;
import com.android.billingclient.api.SkuDetailsResponseListener;
import com.android.vending.billing.IInAppBillingService;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

public class RNIapModule extends ReactContextBaseJavaModule {
  final String TAG = "RNIapModule";

  private static final String E_UNKNOWN = "E_UNKNOWN";
  private static final String E_NOT_PREPARED = "E_NOT_PREPARED";
  private static final String E_NOT_ENDED = "E_NOT_ENDED";
  private static final String E_USER_CANCELLED = "E_USER_CANCELLED";
  private static final String E_ITEM_UNAVAILABLE = "E_ITEM_UNAVAILABLE";
  private static final String E_NETWORK_ERROR = "E_NETWORK_ERROR";
  private static final String E_SERVICE_ERROR = "E_SERVICE_ERROR";
  private static final String E_ALREADY_OWNED = "E_ALREADY_OWNED";
  private static final String E_REMOTE_ERROR = "E_REMOTE_ERROR";
  private static final String E_USER_ERROR = "E_USER_ERROR";
  private static final String E_DEVELOPER_ERROR = "E_DEVELOPER_ERROR";
  private static final String E_BILLING_RESPONSE_JSON_PARSE_ERROR = "E_BILLING_RESPONSE_JSON_PARSE_ERROR";

  private static final String PROMISE_BUY_ITEM = "PROMISE_BUY_ITEM";

  private HashMap<String, ArrayList<Promise>> promises = new HashMap<>();

  private ReactContext reactContext;
  private IInAppBillingService mService;
  private BillingClient mBillingClient;

  ServiceConnection mServiceConn = new ServiceConnection() {
    @Override public void onServiceDisconnected(ComponentName name) {
      mService = null;
    }
    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
      mService = IInAppBillingService.Stub.asInterface(service);
    }
  };

  LifecycleEventListener lifecycleEventListener = new LifecycleEventListener() {
    @Override
    public void onHostResume() {

    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {
      try {
        if (mService != null) {
          reactContext.unbindService(mServiceConn);
        }
      } catch (IllegalArgumentException ie) {
        Log.e(TAG, "IllegalArgumentException");
        Log.e(TAG, ie.getMessage());
      }
    }
  };

  public RNIapModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    reactContext.addLifecycleEventListener(lifecycleEventListener);
  }

  private void ensureConnection (final Promise promise, final Runnable callback) {
    if (mBillingClient != null) {
      callback.run();
      return;
    }

    Intent intent = new Intent("com.android.vending.billing.InAppBillingService.BIND");
    // This is the key line that fixed everything for me
    intent.setPackage("com.android.vending");

    BillingClientStateListener billingClientStateListener = new BillingClientStateListener() {
      @Override
      public void onBillingSetupFinished(@BillingClient.BillingResponse int responseCode) {
        if (responseCode == BillingClient.BillingResponse.OK) {
          Log.d(TAG, "billing client ready");
          callback.run();
        } else {
          rejectPromiseWithBillingError(promise, responseCode);
        }
      }

      @Override
      public void onBillingServiceDisconnected() {
        Log.d(TAG, "billing client disconnected");
      }
    };

    try {
      reactContext.bindService(intent, mServiceConn, Context.BIND_AUTO_CREATE);
      mBillingClient = BillingClient.newBuilder(reactContext).setListener(purchasesUpdatedListener).build();
      mBillingClient.startConnection(billingClientStateListener);
    } catch (Exception e) {
      promise.reject(E_NOT_PREPARED, e.getMessage(), e);
    }
  }

  @Override
  public String getName() {
    return "RNIapModule";
  }

  @ReactMethod
  public void initConnection(final Promise promise) {
    ensureConnection(promise, new Runnable() {
      @Override
      public void run() {
        promise.resolve(true);
      }
    });
  }

  @ReactMethod
  public void endConnection(final Promise promise) {
    if (mBillingClient != null) {
      try {
        mBillingClient.endConnection();
      } catch (Exception e) {
        promise.reject("endConnection", e.getMessage());
        return;
      }
    }

    mBillingClient = null;
    promise.resolve(true);
  }

  @ReactMethod
  public void refreshItems(final Promise promise) {
    ensureConnection(promise, new Runnable() {
      @Override
      public void run() {
        try {
          Bundle ownedItems = mService.getPurchases(3, reactContext.getPackageName(), "inapp", null);
          int response = ownedItems.getInt("RESPONSE_CODE");
          if (response == 0) {
            ArrayList purchaseDataList = ownedItems.getStringArrayList("INAPP_PURCHASE_DATA_LIST");
            String[] tokens = new String[purchaseDataList.size()];
            for (int i = 0; i < purchaseDataList.size(); ++i) {
              String purchaseData = (String) purchaseDataList.get(i);
              JSONObject jo = new JSONObject(purchaseData);
              tokens[i] = jo.getString("purchaseToken");
              // Consume all remainingTokens
              mService.consumePurchase(3, reactContext.getPackageName(), tokens[i]);
            }
            promise.resolve("All items have been consumed");
            Log.d(TAG, "All items have been consumed");
          }
        } catch (Exception e) {
          promise.reject(E_UNKNOWN, e.getMessage());
        }
      }
    });
  }

  @ReactMethod
  public void getItemsByType(final String type, final ReadableArray skus, final Promise promise) {
    final ArrayList<String> skusList = new ArrayList<>();

    for (int i = 0; i < skus.size(); i++) {
      skusList.add(skus.getString(i));
    }

    ensureConnection(promise, new Runnable() {
      @Override
      public void run() {
        SkuDetailsParams.Builder params = SkuDetailsParams.newBuilder();
        params.setSkusList(skusList).setType(type);
        mBillingClient.querySkuDetailsAsync(params.build(), new SkuDetailsResponseListener() {
          @Override
          public void onSkuDetailsResponse(int responseCode, List<SkuDetails> skuDetailsList) {
            Log.d(TAG, "responseCode: " + responseCode);
            if (responseCode != BillingClient.BillingResponse.OK) {
              rejectPromiseWithBillingError(promise, responseCode);
              return;
            }

            WritableArray items = Arguments.createArray();

            for (SkuDetails skuDetails : skuDetailsList) {
              WritableMap item = Arguments.createMap();
              item.putString("productId", skuDetails.getSku());
              item.putString("price", String.format("%.02f", skuDetails.getPriceAmountMicros() / 1000000f));
              item.putString("currency", skuDetails.getPriceCurrencyCode());
              item.putString("type", skuDetails.getType());
              item.putString("localizedPrice", skuDetails.getPrice());
              item.putString("title", skuDetails.getTitle());
              item.putString("description", skuDetails.getDescription());
              item.putString("introductoryPrice", skuDetails.getIntroductoryPrice());
              item.putString("subscriptionPeriodAndroid", skuDetails.getSubscriptionPeriod());
              item.putString("freeTrialPeriodAndroid", skuDetails.getFreeTrialPeriod());
              item.putString("introductoryPriceCyclesAndroid", skuDetails.getIntroductoryPriceCycles());
              item.putString("introductoryPricePeriodAndroid", skuDetails.getIntroductoryPricePeriod());
              items.pushMap(item);
            }

            promise.resolve(items);
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
        Bundle availableItems;
        try {
          availableItems = mService.getPurchases(3, reactContext.getPackageName(), type, null);
        } catch (RemoteException e) {
          promise.reject(E_REMOTE_ERROR, e.getMessage());
          return;
        } catch (NullPointerException e){
          promise.reject(E_SERVICE_ERROR, e.getMessage());
          return;
        }

        int responseCode = availableItems.getInt("RESPONSE_CODE");

        WritableArray items = Arguments.createArray();

        ArrayList<String> purchaseDataList = availableItems.getStringArrayList("INAPP_PURCHASE_DATA_LIST");
        ArrayList<String> signatureDataList = availableItems.getStringArrayList("INAPP_DATA_SIGNATURE_LIST");

        if (responseCode != BillingClient.BillingResponse.OK && purchaseDataList != null) {
          rejectPromiseWithBillingError(promise, responseCode);
          return;
        }

        for (int i = 0; i < purchaseDataList.size(); i++) {
          try {
            String data = purchaseDataList.get(i);
            String signature = signatureDataList.get(i);

            JSONObject json = new JSONObject(data);

            WritableMap item = Arguments.createMap();
            item.putString("productId", json.getString("productId"));
            item.putString("transactionId", json.optString("orderId"));
            item.putString("transactionDate", String.valueOf(json.getLong("purchaseTime")));
            if (json.has("originalJson")) {
              item.putString("transactionReceipt", json.getString("originalJson"));
            }
            item.putString("purchaseToken", json.getString("purchaseToken"));
            item.putString("dataAndroid", data);
            item.putString("signatureAndroid", signature);

            if (type.equals(BillingClient.SkuType.SUBS)) {
              item.putBoolean("autoRenewingAndroid", json.getBoolean("autoRenewing"));
            }

            items.pushMap(item);
          } catch (JSONException e) {
            promise.reject(E_BILLING_RESPONSE_JSON_PARSE_ERROR, e.getMessage());
            return;
          }
        }

        promise.resolve(items);
      }
    });
  }

  @ReactMethod
  public void getPurchaseHistoryByType(final String type, final Promise promise) {
    ensureConnection(promise, new Runnable() {
      @Override
      public void run() {
        mBillingClient.queryPurchaseHistoryAsync(type, new PurchaseHistoryResponseListener() {
          @Override
          public void onPurchaseHistoryResponse(@BillingClient.BillingResponse int responseCode, List<Purchase> purchasesList) {
            Log.d(TAG, "responseCode: " + responseCode);

            if (responseCode != BillingClient.BillingResponse.OK) {
              rejectPromiseWithBillingError(promise, responseCode);
              return;
            }

            Log.d(TAG, purchasesList.toString());
            WritableArray items = Arguments.createArray();

            for (Purchase purchase : purchasesList) {
              WritableMap item = Arguments.createMap();
              item.putString("productId", purchase.getSku());
              item.putString("transactionId", purchase.getOrderId());
              item.putString("transactionDate", String.valueOf(purchase.getPurchaseTime()));
              item.putString("transactionReceipt", purchase.getOriginalJson());
              item.putString("purchaseToken", purchase.getPurchaseToken());
              item.putString("dataAndroid", purchase.getOriginalJson());
              item.putString("signatureAndroid", purchase.getSignature());

              if (type.equals(BillingClient.SkuType.SUBS)) {
                item.putBoolean("autoRenewingAndroid", purchase.isAutoRenewing());
              }

              items.pushMap(item);
            }

            promise.resolve(items);
          }
        });
      }
    });
  }

  @ReactMethod
  public void buyItemByType(final String type, final String sku, final String oldSku, final Integer prorationMode, final Promise promise) {
    final Activity activity = getCurrentActivity();

    if (activity == null) {
      promise.reject(E_UNKNOWN, "getCurrentActivity returned null");
      return;
    }

    ensureConnection(promise, new Runnable() {
      @Override
      public void run() {
        addPromiseForKey(PROMISE_BUY_ITEM, promise);
        BillingFlowParams.Builder builder = BillingFlowParams.newBuilder();

        if (type.equals(BillingClient.SkuType.SUBS) && oldSku != null && !oldSku.isEmpty()) {
          // Subscription upgrade/downgrade
          if (prorationMode != null && prorationMode != 0) {
            builder.setOldSku(oldSku);
            if (prorationMode == BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_PRORATED_PRICE) {
              builder.setReplaceSkusProrationMode(BillingFlowParams.ProrationMode.IMMEDIATE_AND_CHARGE_PRORATED_PRICE);
            } else if (prorationMode == BillingFlowParams.ProrationMode.IMMEDIATE_WITHOUT_PRORATION) {
              builder.setReplaceSkusProrationMode(BillingFlowParams.ProrationMode.IMMEDIATE_WITHOUT_PRORATION);
            } else {
              builder.addOldSku(oldSku);
            }
          } else {
            builder.addOldSku(oldSku);
          }
        }

        BillingFlowParams flowParams = builder.setSku(sku).setType(type).build();

        int responseCode = mBillingClient.launchBillingFlow(activity,flowParams);
        Log.d(TAG, "buyItemByType (type: " + type + ", sku: " + sku + ", oldSku: " + oldSku + ", prorationMode: " + prorationMode + ") responseCode: " + responseCode + "(" + getBillingResponseCodeName(responseCode) + ")");
        if (responseCode != BillingClient.BillingResponse.OK) {
          rejectPromisesWithBillingError(PROMISE_BUY_ITEM,responseCode);
        }
      }
    });
  }

  @ReactMethod
  public void consumeProduct(final String token, final Promise promise) {
    ensureConnection(promise, new Runnable() {
      @Override
      public void run() {
        mBillingClient.consumeAsync(token, new ConsumeResponseListener() {
          @Override
          public void onConsumeResponse(@BillingClient.BillingResponse int responseCode, String outToken) {
            Log.d(TAG, "consume responseCode: " + responseCode);

            if (responseCode != BillingClient.BillingResponse.OK) {
              rejectPromiseWithBillingError(promise, responseCode);
              return;
            }

            promise.resolve(true);
          }
        });
      }
    });
  }

  PurchasesUpdatedListener purchasesUpdatedListener = new PurchasesUpdatedListener() {
    @Override
    public void onPurchasesUpdated(int responseCode, @Nullable List<Purchase> purchases) {
      Log.d(TAG, "Purchase Updated Listener");
      Log.d(TAG, "responseCode: " + responseCode);

      if (responseCode != BillingClient.BillingResponse.OK) {
        rejectPromisesWithBillingError(PROMISE_BUY_ITEM, responseCode);
        return;
      }

      Purchase purchase = purchases.get(0);

      WritableMap item = Arguments.createMap();
      item.putString("productId", purchase.getSku());
      item.putString("transactionId", purchase.getOrderId());
      item.putString("transactionDate", String.valueOf(purchase.getPurchaseTime()));
      item.putString("transactionReceipt", purchase.getOriginalJson());
      item.putString("purchaseToken", purchase.getPurchaseToken());
      item.putString("dataAndroid", purchase.getOriginalJson());
      item.putString("signatureAndroid", purchase.getSignature());
      item.putBoolean("autoRenewingAndroid", purchase.isAutoRenewing());

      resolvePromisesForKey(PROMISE_BUY_ITEM, item);
    }
  };

  private void rejectPromiseWithBillingError(final Promise promise, final int responseCode) {
    switch (responseCode) {
      case BillingClient.BillingResponse.FEATURE_NOT_SUPPORTED:
        promise.reject(E_SERVICE_ERROR, "This feature is not available on your device.");
        break;
      case BillingClient.BillingResponse.SERVICE_DISCONNECTED:
        promise.reject(E_NETWORK_ERROR, "The service is disconnected (check your internet connection.)");
        break;
      case BillingClient.BillingResponse.USER_CANCELED:
        promise.reject(E_USER_CANCELLED, "Cancelled.");
        break;
      case BillingClient.BillingResponse.SERVICE_UNAVAILABLE:
        promise.reject(E_SERVICE_ERROR, "The service is unreachable. This may be your internet connection, or the Play Store may be down.");
        break;
      case BillingClient.BillingResponse.BILLING_UNAVAILABLE:
        promise.reject(E_SERVICE_ERROR, "Billing is unavailable. This may be a problem with your device, or the Play Store may be down.");
        break;
      case BillingClient.BillingResponse.ITEM_UNAVAILABLE:
        promise.reject(E_ITEM_UNAVAILABLE, "That item is unavailable.");
        break;
      case BillingClient.BillingResponse.DEVELOPER_ERROR:
        promise.reject(E_DEVELOPER_ERROR, "Google is indicating that we have an error in our code. Sorry about that.");
        break;
      case BillingClient.BillingResponse.ERROR:
        promise.reject(E_UNKNOWN, "An unknown or unexpected error has occured. Please try again later.");
        break;
      case BillingClient.BillingResponse.ITEM_ALREADY_OWNED:
        promise.reject(E_ALREADY_OWNED, "You already own this item.");
        break;
      default:
        promise.reject(E_UNKNOWN, "Purchase failed with code: " + responseCode + "(" + getBillingResponseCodeName(responseCode) + ")");
        break;
    }
  }

  private String getBillingResponseCodeName(final int responseCode) {
    switch (responseCode) {
      case BillingClient.BillingResponse.FEATURE_NOT_SUPPORTED:
        return "FEATURE_NOT_SUPPORTED";
      case BillingClient.BillingResponse.SERVICE_DISCONNECTED:
        return "SERVICE_DISCONNECTED";
      case BillingClient.BillingResponse.OK:
        return "OK";
      case BillingClient.BillingResponse.USER_CANCELED:
        return "USER_CANCELED";
      case BillingClient.BillingResponse.SERVICE_UNAVAILABLE:
        return "SERVICE_UNAVAILABLE";
      case BillingClient.BillingResponse.BILLING_UNAVAILABLE:
        return "BILLING_UNAVAILABLE";
      case BillingClient.BillingResponse.ITEM_UNAVAILABLE:
        return "ITEM_UNAVAILABLE";
      case BillingClient.BillingResponse.DEVELOPER_ERROR:
        return "DEVELOPER_ERROR";
      case BillingClient.BillingResponse.ERROR:
        return "ERROR";
      case BillingClient.BillingResponse.ITEM_ALREADY_OWNED:
        return "ITEM_ALREADY_OWNED";
    }

    return null;
  }

  private void addPromiseForKey(final String key, final Promise promise) {
    ArrayList<Promise> list;
    if (promises.containsKey(key)) {
      list = promises.get(key);
    }
    else {
      list = new ArrayList<Promise>();
      promises.put(key, list);
    }

    list.add(promise);
  }

  private void resolvePromisesForKey(final String key, final Object value) {
    if (promises.containsKey(key)) {
      ArrayList<Promise> list = promises.get(key);
      for (Promise promise : list) {
        promise.resolve(value);
      }
      promises.remove(key);
    }
  }

  private void rejectPromisesForKey(final String key, final String code, final String message, final Exception err) {
    if (promises.containsKey(key)) {
      ArrayList<Promise> list = promises.get(key);
      for (Promise promise : list) {
        promise.reject(code, message, err);
      }
      promises.remove(key);
    }
  }

  private void rejectPromisesWithBillingError(final String key, final int responseCode) {
    if (promises.containsKey(key)) {
      ArrayList<Promise> list = promises.get(key);
      for (Promise promise : list) {
        rejectPromiseWithBillingError(promise, responseCode);
      }
      promises.remove(key);
    }
  }
}

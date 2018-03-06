package com.dooboolab.RNIap;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.os.RemoteException;
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
  private static final String E_USER_CANCELLED = "E_USER_CANCELLED";
  private static final String E_ITEM_UNAVAILABLE = "E_ITEM_UNAVAILABLE";
  private static final String E_NETWORK_ERROR = "E_NETWORK_ERROR";
  private static final String E_SERVICE_ERROR = "E_SERVICE_ERROR";
  private static final String E_ALREADY_OWNED = "E_ALREADY_OWNED";
  private static final String E_REMOTE_ERROR = "E_REMOTE_ERROR";
  private static final String E_USER_ERROR = "E_USER_ERROR";
  private static final String E_DEVELOPER_ERROR = "E_DEVELOPER_ERROR";

  private static final String PROMISE_PREPARE = "PROMISE_PREPARE";
  private static final String PROMISE_BUY_ITEM = "PROMISE_BUY_ITEM";

  private HashMap<String, ArrayList<Promise>> promises = new HashMap<>();

  final Activity activity = getCurrentActivity();
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
        if (mServiceConn != null) {
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

  @Override
  public String getName() {
    return "RNIapModule";
  }

  @ReactMethod
  public void prepare(Promise promise) {
    Intent intent = new Intent("com.android.vending.billing.InAppBillingService.BIND");
    // This is the key line that fixed everything for me
    intent.setPackage("com.android.vending");

    try {
      addPromiseForKey(PROMISE_PREPARE, promise);
      reactContext.bindService(intent, mServiceConn, Context.BIND_AUTO_CREATE);
      mBillingClient = BillingClient.newBuilder(reactContext).setListener(purchasesUpdatedListener).build();
      mBillingClient.startConnection(billingClientStateListener);
    } catch (Exception e) {
      rejectPromisesForKey(PROMISE_PREPARE, E_NOT_PREPARED, e.getMessage(), e);
    }
  }

  @ReactMethod
  public void getItemsByType(String type, ReadableArray skus, final Promise promise) {
    if (mService == null) {
      promise.reject(E_NOT_PREPARED, "IAP not prepared. Check if Google Play service is available.");
      return;
    }

    ArrayList<String> skusList = new ArrayList<>();

    for (int i = 0; i < skus.size(); i++) {
      skusList.add(skus.getString(i));
    }

    SkuDetailsParams.Builder params = SkuDetailsParams.newBuilder();
    params.setSkusList(skusList).setType(type);
    mBillingClient.querySkuDetailsAsync(params.build(),
        new SkuDetailsResponseListener() {
          @Override
          public void onSkuDetailsResponse(int responseCode, List<SkuDetails> skuDetailsList) {
            Log.d(TAG, "responseCode: " + responseCode);
            if (responseCode == BillingClient.BillingResponse.OK) {
              WritableArray items = Arguments.createArray();

              for (SkuDetails skuDetails : skuDetailsList) {
                WritableMap item = Arguments.createMap();
                item.putString("productId", skuDetails.getSku());
                item.putString("price", skuDetails.getPrice());
                item.putString("currency", skuDetails.getPriceCurrencyCode());
                item.putString("type", skuDetails.getType());
                item.putString("localizedPrice", skuDetails.getPrice());
                item.putString("title", skuDetails.getTitle());
                item.putString("description", skuDetails.getDescription());
                items.pushMap(item);
              }

              promise.resolve(items);
            }
            else {
              rejectPromiseWithBillingError(promise, responseCode);
            }
          }
        }
    );
  }


  @ReactMethod
  public void getAvailableItemsByType(String type, final Promise promise) {
    if (mService == null) {
      promise.reject(E_NOT_PREPARED, "IAP not prepared. Check if Google Play service is available.");
      return;
    }

    Bundle availableItems;
    try {
      availableItems = mService.getPurchases(3, reactContext.getPackageName(), type, null);
    } catch (RemoteException e) {
      promise.reject(E_REMOTE_ERROR, e.getMessage());
      return;
    }

    int responseCode = availableItems.getInt("RESPONSE_CODE");

    WritableArray items = Arguments.createArray();
    ArrayList<String> purchaseDataList = availableItems.getStringArrayList("INAPP_PURCHASE_DATA_LIST");

    if (responseCode == BillingClient.BillingResponse.OK && purchaseDataList != null) {
      for (String purchaseJSON : purchaseDataList) {
        try {
          JSONObject json = new JSONObject(purchaseJSON);
          WritableMap item = Arguments.createMap();
          item.putString("productId", json.getString("productId"));
          item.putString("transactionId", json.getString("orderId"));
          item.putString("transactionDate", String.valueOf(json.getLong("purchaseTime")));
          item.putString("transactionReceipt", json.getString("purchaseToken"));
          item.putString("purchaseToken", json.getString("purchaseToken"));

          if (type.equals(BillingClient.SkuType.SUBS)) {
            item.putBoolean("autoRenewing", json.getBoolean("autoRenewing"));
          }

          items.pushMap(item);
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }

      promise.resolve(items);
    }
    else {
      rejectPromiseWithBillingError(promise, responseCode);
    }
  }

  @ReactMethod
  public void getPurchaseHistoryByType(final String type, final Promise promise) {
    if (mService == null) {
      promise.reject(E_NOT_PREPARED, "IAP not prepared. Check if Google Play service is available.");
      return;
    }

    mBillingClient.queryPurchaseHistoryAsync(type, new PurchaseHistoryResponseListener() {
      @Override
      public void onPurchaseHistoryResponse(@BillingClient.BillingResponse int responseCode,
                                            List<Purchase> purchasesList) {
        Log.d(TAG, "responseCode: " + responseCode);
        Log.d(TAG, purchasesList.toString());

        if (responseCode == BillingClient.BillingResponse.OK) {
          WritableArray items = Arguments.createArray();

          for (Purchase purchase : purchasesList) {
            WritableMap item = Arguments.createMap();
            item.putString("productId", purchase.getSku());
            item.putString("transactionId", purchase.getOrderId());
            item.putString("transactionDate", String.valueOf(purchase.getPurchaseTime()));
            item.putString("transactionReceipt", purchase.getPurchaseToken());
            item.putString("data", purchase.getOriginalJson());
            item.putString("signature", purchase.getSignature());
            item.putString("purchaseToken", purchase.getPurchaseToken());

            if (type.equals(BillingClient.SkuType.SUBS)) {
              item.putBoolean("autoRenewing", purchase.isAutoRenewing());
            }

            items.pushMap(item);
          }
          promise.resolve(items);
        } else {
          rejectPromiseWithBillingError(promise, responseCode);
        }
      }
    });
  }

  @ReactMethod
  public void buyItemByType(String type, String sku, Promise promise) {
    addPromiseForKey(PROMISE_BUY_ITEM, promise);
    BillingFlowParams flowParams = BillingFlowParams.newBuilder()
        .setSku(sku)
        .setType(type)
        .build();

    int responseCode = mBillingClient.launchBillingFlow(getCurrentActivity(), flowParams);
    Log.d(TAG, "buyItemByType (type: " + type + ", sku: " + sku + ") responseCode: " + responseCode + "(" + getBillingResponseCodeName(responseCode) + ")");
  }

  @ReactMethod
  public void consumeProduct(String token, final Promise promise) {
    if (mService == null) {
      promise.reject(E_NOT_PREPARED, "IAP not prepared. Check if google play service is available.");
      return;
    }

    mBillingClient.consumeAsync(token, new ConsumeResponseListener() {
      @Override
      public void onConsumeResponse(@BillingClient.BillingResponse int responseCode, String outToken) {
        if (responseCode == BillingClient.BillingResponse.OK) {
          Log.d(TAG, "consume responseCode: " + responseCode);
          promise.resolve(null);
        }
        else {
          rejectPromiseWithBillingError(promise, responseCode);
        }
      }
    });
  }

  BillingClientStateListener billingClientStateListener = new BillingClientStateListener() {
    @Override
    public void onBillingSetupFinished(@BillingClient.BillingResponse int responseCode) {
      if (responseCode == BillingClient.BillingResponse.OK) {
        // The billing client is ready.
        Log.d(TAG, "billing client ready");
        resolvePromisesForKey(PROMISE_PREPARE, null);
      }
      else {
        rejectPromisesWithBillingError(PROMISE_PREPARE, responseCode);
      }
    }
    @Override
    public void onBillingServiceDisconnected() {
      // Try to restart the connection on the next request to
      // Google Play by calling the startConnection() method.
      Log.d(TAG, "billing client disconnected");
      mBillingClient.startConnection(this);
    }
  };

  PurchasesUpdatedListener purchasesUpdatedListener = new PurchasesUpdatedListener() {
    @Override
    public void onPurchasesUpdated(int responseCode, @Nullable List<Purchase> purchases) {
      Log.d(TAG, "Purchase Updated Listener");
      Log.d(TAG, "responseCode: " + responseCode);

      if (responseCode == BillingClient.BillingResponse.OK) {
        Purchase purchase = purchases.get(0);

        WritableMap item = Arguments.createMap();
        item.putString("productId", purchase.getSku());
        item.putString("transactionId", purchase.getOrderId());
        item.putString("transactionDate", String.valueOf(purchase.getPurchaseTime()));
        item.putString("transactionReceipt", purchase.getPurchaseToken());
        item.putString("data", purchase.getOriginalJson());
        item.putString("signature", purchase.getSignature());
        item.putString("purchaseToken", purchase.getPurchaseToken());
        item.putBoolean("autoRenewing", purchase.isAutoRenewing());

        resolvePromisesForKey(PROMISE_BUY_ITEM, item);
      }
      else {
        rejectPromisesWithBillingError(PROMISE_BUY_ITEM, responseCode);
      }
    }
  };

  private void rejectPromiseWithBillingError(final Promise promise, int responseCode) {
    if (responseCode == BillingClient.BillingResponse.FEATURE_NOT_SUPPORTED) {
      promise.reject(E_SERVICE_ERROR, "This feature is not available on your device.");
    }
    else if (responseCode == BillingClient.BillingResponse.SERVICE_DISCONNECTED) {
      promise.reject(E_NETWORK_ERROR, "The service is disconnected (check your internet connection.)");
    }
    else if (responseCode == BillingClient.BillingResponse.USER_CANCELED) {
      promise.reject(E_USER_CANCELLED, "Cancelled.");
    }
    else if (responseCode == BillingClient.BillingResponse.SERVICE_UNAVAILABLE) {
      promise.reject(E_SERVICE_ERROR, "The service is unreachable. This may be your internet connection, or the Play Store may be down.");
    }
    else if (responseCode == BillingClient.BillingResponse.BILLING_UNAVAILABLE) {
      promise.reject(E_SERVICE_ERROR, "Billing is unavailable. This may be a problem with your device, or the Play Store may be down.");
    }
    else if (responseCode == BillingClient.BillingResponse.ITEM_UNAVAILABLE) {
      promise.reject(E_ITEM_UNAVAILABLE, "That item is unavailable.");
    }
    else if (responseCode == BillingClient.BillingResponse.DEVELOPER_ERROR) {
      promise.reject(E_DEVELOPER_ERROR, "Google is indicating that we have an error in our code. Sorry about that.");
    }
    else if (responseCode == BillingClient.BillingResponse.ERROR) {
      promise.reject(E_UNKNOWN, "An unknown or unexpected error has occured. Please try again later.");
    }
    else if (responseCode == BillingClient.BillingResponse.ITEM_ALREADY_OWNED) {
      promise.reject(E_ALREADY_OWNED, "You already own this item.");
    }
    else {
      promise.reject(E_UNKNOWN, "Purchase failed with code: " + responseCode + "(" + getBillingResponseCodeName(responseCode) + ")");
    }
  }

  private String getBillingResponseCodeName(int responseCode) {
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

  private void addPromiseForKey(String key, Promise promise) {
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

  private void resolvePromisesForKey(String key, Object value) {
    if (promises.containsKey(key)) {
      ArrayList<Promise> list = promises.get(key);
      for (Promise promise : list) {
        promise.resolve(value);
      }
      promises.remove(key);
    }
  }

  private void rejectPromisesForKey(String key, String code, String message, Exception err) {
    if (promises.containsKey(key)) {
      ArrayList<Promise> list = promises.get(key);
      for (Promise promise : list) {
        promise.reject(code, message, err);
      }
      promises.remove(key);
    }
  }

  private void rejectPromisesWithBillingError(String key, int responseCode) {
    if (promises.containsKey(key)) {
      ArrayList<Promise> list = promises.get(key);
      for (Promise promise : list) {
        rejectPromiseWithBillingError(promise, responseCode);
      }
      promises.remove(key);
    }
  }
}

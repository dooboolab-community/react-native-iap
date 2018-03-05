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
import com.facebook.react.bridge.WritableMap;

public class RNIapModule extends ReactContextBaseJavaModule {
  final String TAG = "RNIapModule";

  private static final String E_UNKNOWN = "E_UNKNOWN";
  private static final String E_NOT_PREPARED = "E_NOT_PREPARED";
  private static final String E_DEVICE_NOT_ALLOWED = "E_DEVICE_NOT_ALLOWED";
  private static final String E_PAYMENT_NOT_ALLOWED = "E_PAYMENT_NOT_ALLOWED";
  private static final String E_USER_CANCELLED = "E_USER_CANCELLED";
  private static final String E_INVALID_PAYMENT_INFORMATION = "E_INVALID_PAYMENT_INFORMATION";
  private static final String E_PURCHASE_HISTORY_FETCH_FAILED = "E_PURCHASE_HISTORY_FETCH_FAILED";
  private static final String E_ITEM_UNAVAILABLE = "E_ITEM_UNAVAILABLE";
  private static final String E_PERMISSION_DENIED = "E_PERMISSION_DENIED";
  private static final String E_NETWORK_CONNECTION_FAILED = "E_NETWORK_CONNECTION_FAILED";
  private static final String E_ITEMS_FETCH_FAILED = "E_ITEMS_FETCH_FAILED";
  private static final String E_PURCHASE_FAILED = "E_PURCHASE_FAILED";
  private static final String E_PURCHASE_CONSUME_FAILED = "E_PURCHASE_CONSUME_FAILED";
  private static final String E_USER_INTERFERENCE = "E_USER_INTERFERENCE";
  private static final String E_REMOTE_ERROR = "E_REMOTE_ERROR";

  final Activity activity = getCurrentActivity();
  private ReactContext reactContext;
  private Promise preparePromise = null;
  private Promise buyItemPromise = null;
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
    preparePromise = promise;

    try {
      reactContext.bindService(intent, mServiceConn, Context.BIND_AUTO_CREATE);
      mBillingClient = BillingClient.newBuilder(reactContext).setListener(purchasesUpdatedListener).build();
      mBillingClient.startConnection(billingClientStateListener);
    } catch (Exception e) {
      preparePromise.reject(E_NOT_PREPARED, e);
    }
  }

  @ReactMethod
  public void getItemsByType(String type, List<String> skus, final Promise promise) {
    if (mService == null) {
      promise.reject(E_NOT_PREPARED, "IAP not prepared. Check if Google Play service is available.");
      return;
    }

    SkuDetailsParams.Builder params = SkuDetailsParams.newBuilder();
    params.setSkusList(skus).setType(type);
    mBillingClient.querySkuDetailsAsync(params.build(),
        new SkuDetailsResponseListener() {
          @Override
          public void onSkuDetailsResponse(int responseCode, List<SkuDetails> skuDetailsList) {
            Log.d(TAG, "responseCode: " + responseCode);
            if (responseCode == BillingClient.BillingResponse.OK) {
              ArrayList<WritableMap> items = new ArrayList<WritableMap>();

              for (SkuDetails skuDetails : skuDetailsList) {
                WritableMap item = Arguments.createMap();
                item.putString("productId", skuDetails.getSku());
                item.putString("price", skuDetails.getPrice());
                item.putString("currency", skuDetails.getPriceCurrencyCode());
                item.putString("type", skuDetails.getType());
                item.putString("localizedPrice", skuDetails.getPrice());
                item.putString("title", skuDetails.getTitle());
                item.putString("description", skuDetails.getDescription());
                items.add(item);
              }

              promise.resolve(items);
            }
            else {
              promise.reject(E_ITEMS_FETCH_FAILED, "Get items failed with code: " + responseCode);
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

    ArrayList<WritableMap> items = new ArrayList<>();
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

          items.add(item);
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }

      promise.resolve(items);
    }
    else {
      promise.reject(E_PURCHASE_HISTORY_FETCH_FAILED, "Failed to get purchases with code: " + responseCode);
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
          ArrayList<WritableMap> items = new ArrayList<>();

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

            items.add(item);
          }
          promise.resolve(items);
        } else {
          promise.reject(E_PURCHASE_HISTORY_FETCH_FAILED, "Failed to get purchase history with code: " + responseCode);
        }
      }
    });
  }

  @ReactMethod
  public void buyItemByType(String type, String sku, Promise promise) {
    buyItemPromise = promise;
    BillingFlowParams flowParams = BillingFlowParams.newBuilder()
        .setSku(sku)
        .setType(type)
        .build();

    int responseCode = mBillingClient.launchBillingFlow(getCurrentActivity(), flowParams);
    Log.d(TAG, "buyItemByType (type: " + type + ", sku: " + sku + ") responseCode: " + responseCode);
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
          promise.reject(E_PURCHASE_CONSUME_FAILED, "Consumption failed with code: " + responseCode);
        }
      }
    });
  }

  BillingClientStateListener billingClientStateListener = new BillingClientStateListener() {
    @Override
    public void onBillingSetupFinished(@BillingClient.BillingResponse int billingResponseCode) {
      if (billingResponseCode == BillingClient.BillingResponse.OK) {
        // The billing client is ready.
        Log.d(TAG, "billing client ready");
        if (preparePromise != null) {
          preparePromise.resolve(null);
          return;
        }
      }
      if (preparePromise != null) {
        preparePromise.reject(E_NOT_PREPARED, "Billing setup finished with code: " + billingResponseCode);
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

        buyItemPromise.resolve(item);
      }
      else {
        buyItemPromise.reject(E_PURCHASE_FAILED, "Purchase failed with code: " + responseCode);
      }
    }
  };
}

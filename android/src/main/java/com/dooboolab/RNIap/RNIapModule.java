package com.dooboolab.RNIap;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import org.json.JSONArray;
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

public class RNIapModule extends ReactContextBaseJavaModule {
  final String TAG = "RNIapModule";

  final Activity activity = getCurrentActivity();
  private ReactContext reactContext;
  private Callback prepareCB = null;
  private Callback buyItemCB = null;
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
  public void prepare(final Callback cb) {
    Intent intent = new Intent("com.android.vending.billing.InAppBillingService.BIND");
    // This is the key line that fixed everything for me
    intent.setPackage("com.android.vending");
    prepareCB = cb;

    try {
      reactContext.bindService(intent, mServiceConn, Context.BIND_AUTO_CREATE);
      mBillingClient = BillingClient.newBuilder(reactContext).setListener(purchasesUpdatedListener).build();
      mBillingClient.startConnection(billingClientStateListener);
    } catch (Exception e) {
      prepareCB.invoke(e.getMessage(), null);
    }
  }

  @ReactMethod
  public void getItems(String items, final Callback cb) {
    if (mService == null) {
      cb.invoke("IAP not prepared. Check if google play service is available.", null);
      return;
    }

    try {
      JSONArray jsonArray = new JSONArray(items);
      ArrayList<String> skuList = new ArrayList<> ();

      for (int i = 0; i < jsonArray.length(); i++) {
        String str = jsonArray.get(i).toString();
        skuList.add(str);
      }

      SkuDetailsParams.Builder params = SkuDetailsParams.newBuilder();
      params.setSkusList(skuList).setType(BillingClient.SkuType.INAPP);
      mBillingClient.querySkuDetailsAsync(params.build(),
          new SkuDetailsResponseListener() {
            @Override
            public void onSkuDetailsResponse(int responseCode, List<SkuDetails> skuDetailsList) {
              Log.d(TAG, "responseCode: " + responseCode);
              // Log.d(TAG, skuDetailsList ? skuDetailsList.toString() : '');

              JSONArray jsonResponse = new JSONArray();
              try {
                for (SkuDetails skuDetails : skuDetailsList) {
                  JSONObject json = new JSONObject();
                  json.put("productId", skuDetails.getSku());
                  json.put("price", skuDetails.getPrice());
                  json.put("currency", skuDetails.getPriceCurrencyCode());
                  json.put("type", skuDetails.getType());
                  json.put("localizedPrice", skuDetails.getPrice());
                  json.put("price_currency", skuDetails.getPriceCurrencyCode());
                  json.put("title", skuDetails.getTitle());
                  json.put("description", skuDetails.getDescription());
                  jsonResponse.put(json);
                }
              } catch (JSONException je) {
                cb.invoke(je.getMessage(), null);
                return;
              }
              cb.invoke(null, jsonResponse.toString());
            }
          }
      );
    } catch (JSONException je) {
      cb.invoke(je.getMessage(), null);
    }
  }

  @ReactMethod
  public void getSubItems(String items, final Callback cb) {
    if (mService == null) {
      cb.invoke("IAP not prepared. Check if google play service is available.", null);
      return;
    }

    try {
      JSONArray jsonArray = new JSONArray(items);
      ArrayList<String> skuList = new ArrayList<> ();

      for (int i = 0; i < jsonArray.length(); i++) {
        String str = jsonArray.get(i).toString();
        skuList.add(str);
      }

      SkuDetailsParams.Builder params = SkuDetailsParams.newBuilder();
      params.setSkusList(skuList).setType(BillingClient.SkuType.SUBS);
      mBillingClient.querySkuDetailsAsync(params.build(),
          new SkuDetailsResponseListener() {
            @Override
            public void onSkuDetailsResponse(int responseCode, List<SkuDetails> skuDetailsList) {
              Log.d(TAG, "responseCode: " + responseCode);
              Log.d(TAG, skuDetailsList.toString());

              JSONArray jsonResponse = new JSONArray();
              try {
                for (SkuDetails skuDetails : skuDetailsList) {
                  JSONObject json = new JSONObject();
                  json.put("productId", skuDetails.getSku());
                  json.put("price", skuDetails.getPrice());
                  json.put("currency", skuDetails.getPriceCurrencyCode());
                  json.put("type", skuDetails.getType());
                  json.put("localizedPrice", skuDetails.getPrice());
                  json.put("price_currency", skuDetails.getPriceCurrencyCode());
                  json.put("title", skuDetails.getTitle());
                  json.put("description", skuDetails.getDescription());
                  jsonResponse.put(json);
                }
              } catch (JSONException je) {
                cb.invoke(je.getMessage(), null);
                return;
              }
              cb.invoke(null, jsonResponse.toString());
            }
          }
      );
    } catch (JSONException je) {
      cb.invoke(je.getMessage(), null);
    }
  }

  @ReactMethod
  public void buyItem(String id_item, Callback cb) {
    buyItemCB = cb;
    BillingFlowParams flowParams = BillingFlowParams.newBuilder()
        .setSku(id_item)
        .setType(BillingClient.SkuType.INAPP)
        .build();

    int responseCode = mBillingClient.launchBillingFlow(getCurrentActivity(), flowParams);
    Log.d(TAG, "buyItem responseCode: " + responseCode);
  }

  @ReactMethod
  public void buySubscribeItem(String id_item, Callback cb) {
    buyItemCB = cb;
    BillingFlowParams flowParams = BillingFlowParams.newBuilder()
        .setSku(id_item)
        .setType(BillingClient.SkuType.SUBS)
        .build();

    int responseCode = mBillingClient.launchBillingFlow(getCurrentActivity(), flowParams);
    Log.d(TAG, "buyItem responseCode: " + responseCode);
  }

  @ReactMethod
  public void getOwnedItems(String type, final Callback cb) {
    if (mService == null) {
      cb.invoke("IAP not prepared. Check if google play service is available.", null);
      return;
    }

    String skuType = BillingClient.SkuType.INAPP;
    if (type != null && type.equals("SUBS")) {
      skuType = BillingClient.SkuType.SUBS;
    }

    // Purchase.PurchasesResult purchasesResult = mBillingClient.queryPurchases(BillingClient.SkuType.INAPP);
    mBillingClient.queryPurchaseHistoryAsync(skuType, new PurchaseHistoryResponseListener() {
      @Override
      public void onPurchaseHistoryResponse(@BillingClient.BillingResponse int responseCode,
                                            List<Purchase> purchasesList) {
        // JSONArray jsonArray = new JSONArray();
        if (responseCode == BillingClient.BillingResponse.OK && purchasesList != null) {
          JSONArray jsonResponse = new JSONArray();
          for (Purchase purchase : purchasesList) {
            // Process the result.
            // jsonArray.put(purchase);
            Log.d(TAG, "responseCode: " + responseCode);
            Log.d(TAG, purchasesList.toString());
            try {
              JSONObject json = new JSONObject();
              json.put("data", purchase.getOriginalJson());
              json.put("signature", purchase.getSignature());
              jsonResponse.put(json);
            } catch (JSONException je) {
              cb.invoke(je.getMessage(), null);
              return;
            }
          }
          cb.invoke(null, jsonResponse.toString());
        } else {
          cb.invoke(null, purchasesList.toString());
        }
      }
    });
  }

  @ReactMethod
  public void refreshPurchaseItems(String type) {
    try {
      if (mService != null) {
        String skuType = BillingClient.SkuType.INAPP;
        if (type != null && type.equals("SUBS")) {
          skuType = BillingClient.SkuType.SUBS;
        }

        Bundle ownedItems = mService.getPurchases(3, reactContext.getPackageName(), skuType, null);
        int response = ownedItems.getInt("RESPONSE_CODE");
        if (response == 0) {
          ArrayList
              purchaseDataList = ownedItems.getStringArrayList("INAPP_PURCHASE_DATA_LIST");
          String[] tokens = new String[purchaseDataList.size()];
          for (int i = 0; i < purchaseDataList.size(); ++i) {
            String purchaseData = (String) purchaseDataList.get(i);
            JSONObject jo = new JSONObject(purchaseData);
            tokens[i] = jo.getString("purchaseToken");
            mService.consumePurchase(3, reactContext.getPackageName(), tokens[i]);
          }
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  @ReactMethod
  public void getPurchases(final Callback cb) {
    if (mService == null) {
      cb.invoke("IAP not prepared. Check if google play service is available.", null);
      return;
    }

    try {
      Bundle ownedItems = mService.getPurchases(3, reactContext.getPackageName(), BillingClient.SkuType.INAPP, BillingClient.SkuType.SUBS);
      int response = ownedItems.getInt("RESPONSE_CODE");
      JSONArray jsonResponse = new JSONArray();

      if (response == 0) {
        ArrayList purchaseDataList = ownedItems.getStringArrayList("INAPP_PURCHASE_DATA_LIST");
        String[] tokens = new String[purchaseDataList.size()];
        for (int i = 0; i < purchaseDataList.size(); ++i) {
          String purchaseData = (String) purchaseDataList.get(i);
          JSONObject jo = new JSONObject(purchaseData);
          tokens[i] = jo.getString("purchaseToken");
          // mService.consumePurchase(3, reactContext.getPackageName(), tokens[i]);
          jsonResponse.put(jo);
        }
      }

      cb.invoke(null, jsonResponse.toString());
    } catch (Exception e) {
      cb.invoke(e.toString(), null);
    }
  }

  @ReactMethod
  public void getPurchaseHistory(final Callback cb) {
    if (mService == null) {
      cb.invoke("IAP not prepared. Check if google play service is available.", null);
      return;
    }

    try {
      Bundle ownedItems = mService.getPurchaseHistory(9, BuildConfig.APPLICATION_ID, BillingClient.SkuType.INAPP, BillingClient.SkuType.SUBS, new Bundle());
      int response = ownedItems.getInt("RESPONSE_CODE");
      JSONArray jsonResponse = new JSONArray();

      if (response == 0) {
        ArrayList
            purchaseDataList = ownedItems.getStringArrayList("INAPP_PURCHASE_DATA_LIST");
        String[] tokens = new String[purchaseDataList.size()];
        for (int i = 0; i < purchaseDataList.size(); ++i) {
          String purchaseData = (String) purchaseDataList.get(i);
          JSONObject jo = new JSONObject(purchaseData);
          tokens[i] = jo.getString("purchaseToken");
          // mService.consumePurchase(3, reactContext.getPackageName(), tokens[i]);
          jsonResponse.put(jo);
        }
      }
      cb.invoke(null, jsonResponse.toString());
    } catch (Exception e) {
      cb.invoke(e.toString(), null);
    }
  }

  @ReactMethod
  public void consumeItem(String token, final Callback cb) {
    if (mService == null) {
      cb.invoke("IAP not prepared. Check if google play service is available.", null);
      return;
    }

    mBillingClient.consumeAsync(token, new ConsumeResponseListener() {
      @Override
      public void onConsumeResponse(@BillingClient.BillingResponse int responseCode, String outToken) {
        if (responseCode == BillingClient.BillingResponse.OK) {
          // Handle the success of the consume operation.
          // For example, increase the number of coins inside the user's basket.
          Log.d(TAG, "consume responseCode: " + responseCode);

          cb.invoke(null, true);
          return;
        }
        cb.invoke(null, false);
      }
    });
  }

  BillingClientStateListener billingClientStateListener = new BillingClientStateListener() {
    @Override
    public void onBillingSetupFinished(@BillingClient.BillingResponse int billingResponseCode) {
      if (billingResponseCode == BillingClient.BillingResponse.OK) {
        // The billing client is ready.
        Log.d(TAG, "billing client ready");
        if (prepareCB != null) {
          prepareCB.invoke(null, "IAP prepared");
          return;
        }
      }
      if (prepareCB != null) {
        prepareCB.invoke(billingResponseCode, null);
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
        JSONObject json = new JSONObject();
        try {
          json.put("signature", purchase.getSignature());
          json.put("data", purchase.getOriginalJson());
        } catch (JSONException e) {
          e.printStackTrace();
        }
        Log.d(TAG, purchases.toString());
        if (buyItemCB != null) {
          buyItemCB.invoke(null, json.toString());
        }
        buyItemCB = null;
      } else if (buyItemCB != null) {
        buyItemCB.invoke(responseCode, null);
        buyItemCB = null;
      }
    }
  };
}

package com.dooboolab.RNIap;

import android.content.Context;
import android.content.pm.PackageManager;
import android.util.Log;

import com.android.billingclient.api.BillingClient;
import com.facebook.react.bridge.ObjectAlreadyConsumedException;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

public class PlayUtils {
  private static final String TAG = "DoobooUtils";
  public static final String E_UNKNOWN = "E_UNKNOWN";
  public static final String E_NOT_PREPARED = "E_NOT_PREPARED";
  public static final String E_NOT_ENDED = "E_NOT_ENDED";
  public static final String E_USER_CANCELLED = "E_USER_CANCELLED";
  public static final String E_ITEM_UNAVAILABLE = "E_ITEM_UNAVAILABLE";
  public static final String E_NETWORK_ERROR = "E_NETWORK_ERROR";
  public static final String E_SERVICE_ERROR = "E_SERVICE_ERROR";
  public static final String E_ALREADY_OWNED = "E_ALREADY_OWNED";
  public static final String E_REMOTE_ERROR = "E_REMOTE_ERROR";
  public static final String E_USER_ERROR = "E_USER_ERROR";
  public static final String E_DEVELOPER_ERROR = "E_DEVELOPER_ERROR";
  public static final String E_BILLING_RESPONSE_JSON_PARSE_ERROR = "E_BILLING_RESPONSE_JSON_PARSE_ERROR";

  public static final String APPSTORE_UNKNOWN = "UNKNOWN";
  public static final String APPSTORE_GOOGLE = "GOOGLE_PLAY";
  public static final String APPSTORE_AMAZON = "AMAZON";

  private HashMap<String, ArrayList<Promise>> promises = new HashMap<>();
  private static PlayUtils instance = new PlayUtils();

  public static PlayUtils getInstance() {
    return instance;
  }

  public void rejectPromiseWithBillingError(final Promise promise, final int responseCode) {
    String[] errorData = getBillingResponseData(responseCode);
    promise.reject(errorData[0], errorData[1]);
  }

  public String[] getBillingResponseData(final int responseCode) {
    String[] errorData = new String[2];
    switch (responseCode) {
      case BillingClient.BillingResponseCode.FEATURE_NOT_SUPPORTED:
        errorData[0] = E_SERVICE_ERROR;
        errorData[1] = "This feature is not available on your device.";
        break;
      case BillingClient.BillingResponseCode.SERVICE_DISCONNECTED:
        errorData[0] = E_NETWORK_ERROR;
        errorData[1] = "The service is disconnected (check your internet connection.)";
        break;
      case BillingClient.BillingResponseCode.OK:
        errorData[0] = "OK";
        errorData[1] = "";
        break;
      case BillingClient.BillingResponseCode.USER_CANCELED:
        errorData[0] = E_USER_CANCELLED;
        errorData[1] = "Payment is Cancelled.";
        break;
      case BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE:
        errorData[0] = E_SERVICE_ERROR;
        errorData[1] = "The service is unreachable. This may be your internet connection, or the Play Store may be down.";
        break;
      case BillingClient.BillingResponseCode.BILLING_UNAVAILABLE:
        errorData[0] = E_SERVICE_ERROR;
        errorData[1] = "Billing is unavailable. This may be a problem with your device, or the Play Store may be down.";
        break;
      case BillingClient.BillingResponseCode.ITEM_UNAVAILABLE:
        errorData[0] = E_ITEM_UNAVAILABLE;
        errorData[1] = "That item is unavailable.";
        break;
      case BillingClient.BillingResponseCode.DEVELOPER_ERROR:
        errorData[0] = E_DEVELOPER_ERROR;
        errorData[1] = "Google is indicating that we have some issue connecting to payment.";
        break;
      case BillingClient.BillingResponseCode.ERROR:
        errorData[0] = E_UNKNOWN;
        errorData[1] = "An unknown or unexpected error has occured. Please try again later.";
        break;
      case BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED:
        errorData[0] = E_ALREADY_OWNED;
        errorData[1] = "You already own this item.";
        break;
      default:
        errorData[0] = E_UNKNOWN;
        errorData[1] = "Purchase failed with code: " + responseCode;
        break;
    }
    Log.e(TAG, "Error Code : " + responseCode);
    return errorData;
  }

  public void rejectPromisesWithBillingError(final String key, final int responseCode) {
    try {
      if (promises.containsKey(key)) {
        ArrayList<Promise> list = promises.get(key);
        for (Promise promise : list) {
          rejectPromiseWithBillingError(promise, responseCode);
        }
        promises.remove(key);
      }
    } catch (ObjectAlreadyConsumedException oce) {
      Log.e(TAG, oce.getMessage());
    }
  }
}

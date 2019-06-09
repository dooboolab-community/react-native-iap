package com.dooboolab.RNIap;

import com.android.billingclient.api.BillingClient;
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

public class DoobooUtils {
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

  private HashMap<String, ArrayList<Promise>> promises = new HashMap<>();
  private static DoobooUtils instance = new DoobooUtils();

  public static DoobooUtils getInstance() {
    return instance;
  }

  public void rejectPromiseWithBillingError(final Promise promise, final int responseCode) {
    switch (responseCode) {
      case BillingClient.BillingResponseCode.FEATURE_NOT_SUPPORTED:
        promise.reject(E_SERVICE_ERROR, "This feature is not available on your device.");
        break;
      case BillingClient.BillingResponseCode.SERVICE_DISCONNECTED:
        promise.reject(E_NETWORK_ERROR, "The service is disconnected (check your internet connection.)");
        break;
      case BillingClient.BillingResponseCode.USER_CANCELED:
        promise.reject(E_USER_CANCELLED, "Payment is Cancelled.");
        break;
      case BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE:
        promise.reject(E_SERVICE_ERROR, "The service is unreachable. This may be your internet connection, or the Play Store may be down.");
        break;
      case BillingClient.BillingResponseCode.BILLING_UNAVAILABLE:
        promise.reject(E_SERVICE_ERROR, "Billing is unavailable. This may be a problem with your device, or the Play Store may be down.");
        break;
      case BillingClient.BillingResponseCode.ITEM_UNAVAILABLE:
        promise.reject(E_ITEM_UNAVAILABLE, "That item is unavailable.");
        break;
      case BillingClient.BillingResponseCode.DEVELOPER_ERROR:
        promise.reject(E_DEVELOPER_ERROR, "Google is indicating that we have some issue connecting to payment.");
        break;
      case BillingClient.BillingResponseCode.ERROR:
        promise.reject(E_UNKNOWN, "An unknown or unexpected error has occured. Please try again later.");
        break;
      case BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED:
        promise.reject(E_ALREADY_OWNED, "You already own this item.");
        break;
      default:
        promise.reject(E_UNKNOWN, "Purchase failed with code: " + responseCode + "(" + getBillingResponseCodeName(responseCode) + ")");
        break;
    }
  }

  public String getBillingResponseCodeName(final int responseCode) {
    switch (responseCode) {
      case BillingClient.BillingResponseCode.FEATURE_NOT_SUPPORTED:
        return "FEATURE_NOT_SUPPORTED";
      case BillingClient.BillingResponseCode.SERVICE_DISCONNECTED:
        return "SERVICE_DISCONNECTED";
      case BillingClient.BillingResponseCode.OK:
        return "OK";
      case BillingClient.BillingResponseCode.USER_CANCELED:
        return "USER_CANCELED";
      case BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE:
        return "SERVICE_UNAVAILABLE";
      case BillingClient.BillingResponseCode.BILLING_UNAVAILABLE:
        return "BILLING_UNAVAILABLE";
      case BillingClient.BillingResponseCode.ITEM_UNAVAILABLE:
        return "ITEM_UNAVAILABLE";
      case BillingClient.BillingResponseCode.DEVELOPER_ERROR:
        return "DEVELOPER_ERROR";
      case BillingClient.BillingResponseCode.ERROR:
        return "ERROR";
      case BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED:
        return "ITEM_ALREADY_OWNED";
    }

    return null;
  }

  public void addPromiseForKey(final String key, final Promise promise) {
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

  public void resolvePromisesForKey(final String key, final Object value) {
    if (promises.containsKey(key)) {
      ArrayList<Promise> list = promises.get(key);
      for (Promise promise : list) {
        promise.resolve(value);
      }
      promises.remove(key);
    }
  }

  public void rejectPromisesForKey(final String key, final String code, final String message, final Exception err) {
    if (promises.containsKey(key)) {
      ArrayList<Promise> list = promises.get(key);
      for (Promise promise : list) {
        promise.reject(code, message, err);
      }
      promises.remove(key);
    }
  }

  public void rejectPromisesWithBillingError(final String key, final int responseCode) {
    if (promises.containsKey(key)) {
      ArrayList<Promise> list = promises.get(key);
      for (Promise promise : list) {
        rejectPromiseWithBillingError(promise, responseCode);
      }
      promises.remove(key);
    }
  }

  public WritableMap convertJsonToMap(JSONObject jsonObject) throws JSONException {
    WritableMap map = new WritableNativeMap();

    Iterator<String> iterator = jsonObject.keys();
    while (iterator.hasNext()) {
      String key = iterator.next();
      Object value = jsonObject.get(key);
      if (value instanceof JSONObject) {
        map.putMap(key, convertJsonToMap((JSONObject) value));
      } else if (value instanceof JSONArray) {
        map.putArray(key, convertJsonToArray((JSONArray) value));
      } else if (value instanceof  Boolean) {
        map.putBoolean(key, (Boolean) value);
      } else if (value instanceof  Integer) {
        map.putInt(key, (Integer) value);
      } else if (value instanceof  Double) {
        map.putDouble(key, (Double) value);
      } else if (value instanceof String)  {
        map.putString(key, (String) value);
      } else {
        map.putString(key, value.toString());
      }
    }
    return map;
  }

  public WritableArray convertJsonToArray(JSONArray jsonArray) throws JSONException {
    WritableArray array = new WritableNativeArray();

    for (int i = 0; i < jsonArray.length(); i++) {
      Object value = jsonArray.get(i);
      if (value instanceof JSONObject) {
        array.pushMap(convertJsonToMap((JSONObject) value));
      } else if (value instanceof  JSONArray) {
        array.pushArray(convertJsonToArray((JSONArray) value));
      } else if (value instanceof  Boolean) {
        array.pushBoolean((Boolean) value);
      } else if (value instanceof  Integer) {
        array.pushInt((Integer) value);
      } else if (value instanceof  Double) {
        array.pushDouble((Double) value);
      } else if (value instanceof String)  {
        array.pushString((String) value);
      } else {
        array.pushString(value.toString());
      }
    }
    return array;
  }

  public JSONObject convertMapToJson(ReadableMap readableMap) throws JSONException {
    JSONObject object = new JSONObject();
    ReadableMapKeySetIterator iterator = readableMap.keySetIterator();
    while (iterator.hasNextKey()) {
      String key = iterator.nextKey();
      switch (readableMap.getType(key)) {
        case Null:
          object.put(key, JSONObject.NULL);
          break;
        case Boolean:
          object.put(key, readableMap.getBoolean(key));
          break;
        case Number:
          object.put(key, readableMap.getDouble(key));
          break;
        case String:
          object.put(key, readableMap.getString(key));
          break;
        case Map:
          object.put(key, convertMapToJson(readableMap.getMap(key)));
          break;
        case Array:
          object.put(key, convertArrayToJson(readableMap.getArray(key)));
          break;
      }
    }
    return object;
  }

  public JSONArray convertArrayToJson(ReadableArray readableArray) throws JSONException {
    JSONArray array = new JSONArray();
    for (int i = 0; i < readableArray.size(); i++) {
      switch (readableArray.getType(i)) {
        case Null:
          break;
        case Boolean:
          array.put(readableArray.getBoolean(i));
          break;
        case Number:
          array.put(readableArray.getDouble(i));
          break;
        case String:
          array.put(readableArray.getString(i));
          break;
        case Map:
          array.put(convertMapToJson(readableArray.getMap(i)));
          break;
        case Array:
          array.put(convertArrayToJson(readableArray.getArray(i)));
          break;
      }
    }
    return array;
  }
}

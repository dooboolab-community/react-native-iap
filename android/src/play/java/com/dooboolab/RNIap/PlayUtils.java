package com.dooboolab.RNIap;

import static com.dooboolab.RNIap.DoobooUtils.E_ALREADY_OWNED;
import static com.dooboolab.RNIap.DoobooUtils.E_DEVELOPER_ERROR;
import static com.dooboolab.RNIap.DoobooUtils.E_ITEM_UNAVAILABLE;
import static com.dooboolab.RNIap.DoobooUtils.E_NETWORK_ERROR;
import static com.dooboolab.RNIap.DoobooUtils.E_SERVICE_ERROR;
import static com.dooboolab.RNIap.DoobooUtils.E_UNKNOWN;
import static com.dooboolab.RNIap.DoobooUtils.E_USER_CANCELLED;

import android.util.Log;
import com.android.billingclient.api.BillingClient;
import com.facebook.react.bridge.Promise;

public class PlayUtils {
  private static final String TAG = "PlayUtils";
  public static final String E_PLAY_SERVICES_UNAVAILABLE = "E_PLAY_SERVICES_UNAVAILABLE";

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
        errorData[1] =
            "The service is unreachable. This may be your internet connection, or the Play Store may be down.";
        break;
      case BillingClient.BillingResponseCode.BILLING_UNAVAILABLE:
        errorData[0] = E_SERVICE_ERROR;
        errorData[1] =
            "Billing is unavailable. This may be a problem with your device, or the Play Store may be down.";
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
    String[] errorData = getBillingResponseData(responseCode);
    DoobooUtils.getInstance().rejectPromisesForKey(key, errorData[0], errorData[1], null);
  }
}

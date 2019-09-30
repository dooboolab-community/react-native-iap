var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
import { DeviceEventEmitter, NativeEventEmitter, NativeModules, Platform, } from 'react-native';
var RNIapIos = NativeModules.RNIapIos, RNIapModule = NativeModules.RNIapModule;
export var IAPErrorCode;
(function (IAPErrorCode) {
    IAPErrorCode["E_IAP_NOT_AVAILABLE"] = "E_IAP_NOT_AVAILABLE";
    IAPErrorCode["E_UNKNOWN"] = "E_UNKNOWN";
    IAPErrorCode["E_USER_CANCELLED"] = "E_USER_CANCELLED";
    IAPErrorCode["E_USER_ERROR"] = "E_USER_ERROR";
    IAPErrorCode["E_ITEM_UNAVAILABLE"] = "E_ITEM_UNAVAILABLE";
    IAPErrorCode["E_REMOTE_ERROR"] = "E_REMOTE_ERROR";
    IAPErrorCode["E_NETWORK_ERROR"] = "E_NETWORK_ERROR";
    IAPErrorCode["E_SERVICE_ERROR"] = "E_SERVICE_ERROR";
    IAPErrorCode["E_RECEIPT_FAILED"] = "E_RECEIPT_FAILED";
    IAPErrorCode["E_RECEIPT_FINISHED_FAILED"] = "E_RECEIPT_FINISHED_FAILED";
    IAPErrorCode["E_NOT_PREPARED"] = "E_NOT_PREPARED";
    IAPErrorCode["E_NOT_ENDED"] = "E_NOT_ENDED";
    IAPErrorCode["E_ALREADY_OWNED"] = "E_ALREADY_OWNED";
    IAPErrorCode["E_DEVELOPER_ERROR"] = "E_DEVELOPER_ERROR";
    IAPErrorCode["E_BILLING_RESPONSE_JSON_PARSE_ERROR"] = "E_BILLING_RESPONSE_JSON_PARSE_ERROR";
})(IAPErrorCode || (IAPErrorCode = {}));
var ANDROID_ITEM_TYPE_SUBSCRIPTION = 'subs';
var ANDROID_ITEM_TYPE_IAP = 'inapp';
var IOS_ITEM_TYPE_SUBSCRIPTION = 'sub';
var IOS_ITEM_TYPE_IAP = 'iap';
export var PROMOTED_PRODUCT = 'iap-promoted-product';
function checkNativeAndroidAvailable() {
    if (!RNIapModule) {
        return Promise.reject(new Error(IAPErrorCode.E_IAP_NOT_AVAILABLE));
    }
}
function checkNativeiOSAvailable() {
    if (!RNIapIos) {
        return Promise.reject(new Error(IAPErrorCode.E_IAP_NOT_AVAILABLE));
    }
}
/**
 * Init module for purchase flow. Required on Android. In ios it will check wheter user canMakePayment.
 * @returns {Promise<string>}
 */
export var initConnection = function () {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!RNIapIos) {
                    return [2 /*return*/, Promise.resolve()];
                }
                return [2 /*return*/, RNIapIos.canMakePayments()];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!RNIapModule) {
                    return [2 /*return*/, Promise.resolve()];
                }
                return [2 /*return*/, RNIapModule.initConnection()];
            });
        }); },
    })();
};
/**
 * End module for purchase flow. Required on Android. No-op on iOS.
 * @returns {Promise<void>}
 */
export var endConnectionAndroid = function () {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve()];
        }); }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!RNIapModule) {
                    return [2 /*return*/, Promise.resolve()];
                }
                return [2 /*return*/, RNIapModule.endConnection()];
            });
        }); },
    })();
};
/**
 * Consume all remaining tokens. Android only.
 * @returns {Promise<string[]>}
 */
export var consumeAllItemsAndroid = function () {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve()];
        }); }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeAndroidAvailable();
                return [2 /*return*/, RNIapModule.refreshItems()];
            });
        }); },
    })();
};
/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 * @param {string[]} skus The item skus
 * @returns {Promise<InAppPurchase[]>}
 */
export var getProducts = function (skus) {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!RNIapIos) {
                    return [2 /*return*/, []];
                }
                return [2 /*return*/, RNIapIos.getItems(skus).then(function (items) {
                        return items.filter(function (item) { return item.productId; });
                    })];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!RNIapModule) {
                    return [2 /*return*/, []];
                }
                return [2 /*return*/, RNIapModule.getItemsByType(ANDROID_ITEM_TYPE_IAP, skus)];
            });
        }); },
    })();
};
/**
 * Get a list of subscriptions
 * @param {string[]} skus The item skus
 * @returns {Promise<SubscriptionPurchase[]>}
 */
export var getSubscriptions = function (skus) {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.getItems(skus).then(function (items) {
                        return items.filter(function (item) {
                            return skus.includes(item.productId);
                        });
                    })];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeAndroidAvailable();
                return [2 /*return*/, RNIapModule.getItemsByType(ANDROID_ITEM_TYPE_SUBSCRIPTION, skus)];
            });
        }); },
    })();
};
/**
 * Gets an invetory of purchases made by the user regardless of consumption status
 * @returns {Promise<(InAppPurchase | SubscriptionPurchase)[]>}
 */
export var getPurchaseHistory = function () {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.getAvailableItems()];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () {
            var products, subscriptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkNativeAndroidAvailable();
                        return [4 /*yield*/, RNIapModule.getPurchaseHistoryByType(ANDROID_ITEM_TYPE_IAP)];
                    case 1:
                        products = _a.sent();
                        return [4 /*yield*/, RNIapModule.getPurchaseHistoryByType(ANDROID_ITEM_TYPE_SUBSCRIPTION)];
                    case 2:
                        subscriptions = _a.sent();
                        return [2 /*return*/, products.concat(subscriptions)];
                }
            });
        }); },
    })();
};
/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * @returns {Promise<(InAppPurchase | SubscriptionPurchase)[]>}
 */
export var getAvailablePurchases = function () {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.getAvailableItems()];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () {
            var products, subscriptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkNativeAndroidAvailable();
                        return [4 /*yield*/, RNIapModule.getAvailableItemsByType(ANDROID_ITEM_TYPE_IAP)];
                    case 1:
                        products = _a.sent();
                        return [4 /*yield*/, RNIapModule.getAvailableItemsByType(ANDROID_ITEM_TYPE_SUBSCRIPTION)];
                    case 2:
                        subscriptions = _a.sent();
                        return [2 /*return*/, products.concat(subscriptions)];
                }
            });
        }); },
    })();
};
/**
 * @deprecated Deprecated since 3.0.0. This will be removed in the future. Use `requestPurchase` instead.
 * Buy a product
 * @param {string} sku The product's sku/ID
 * @returns {Promise<InAppPurchase>}
 */
export var buyProduct = function (sku) {
    console.warn('The `buyProduct` method is deprecated since 3.0.0.' +
        'This will be removed in the future so please use `requestPurchase` instead.');
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.buyProduct(sku, true)];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeAndroidAvailable();
                return [2 /*return*/, RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_IAP, sku, null, 0)];
            });
        }); },
    })();
};
/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @param {boolean} andDangerouslyFinishTransactionAutomatically You should set this to false
 * and call finishTransaction manually when you have delivered the purchased goods to the user.
 * It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.
 * @returns {Promise<string>}
 */
export var requestPurchase = function (sku, andDangerouslyFinishTransactionAutomatically) {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                andDangerouslyFinishTransactionAutomatically =
                    andDangerouslyFinishTransactionAutomatically === undefined
                        ? true
                        : andDangerouslyFinishTransactionAutomatically;
                if (andDangerouslyFinishTransactionAutomatically) {
                    console.warn('You are dangerously allowing react-native-iap to finish your transaction automatically. You should set andDangerouslyFinishTransactionAutomatically to false when calling requestPurchase and call finishTransaction manually when you have delivered the purchased goods to the user. It defaults to true to provide backwards compatibility. Will default to false in version 4.0.0.');
                }
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.buyProduct(sku, andDangerouslyFinishTransactionAutomatically)];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeAndroidAvailable();
                return [2 /*return*/, RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_IAP, sku, null, 0)];
            });
        }); },
    })();
};
/**
 * @deprecated Deprecated since 3.0.0. This will be removed in the future. Use `requestSubscription` instead.
 * Create a subscription to a sku
 * @param {string} sku The product's sku/ID
 * @param {string} [oldSku] Optional old product's ID for upgrade/downgrade (Android only)
 * @param {number} [prorationMode] Optional proration mode for upgrade/downgrade (Android only)
 * @returns {Promise<SubscriptionPurchase>}
 */
export var buySubscription = function (sku, oldSku, prorationMode) {
    console.warn('Deprecated since 3.0.0. This will be removed in the future. Use `requestSubscription` instead');
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.buyProduct(sku, true)];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeAndroidAvailable();
                if (!prorationMode)
                    prorationMode = -1;
                return [2 /*return*/, RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_SUBSCRIPTION, sku, oldSku, prorationMode)];
            });
        }); },
    })();
};
/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @returns {Promise<string>}
 */
export var requestSubscription = function (sku, oldSku, prorationMode) {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.buyProduct(sku, true)];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeAndroidAvailable();
                if (!prorationMode)
                    prorationMode = -1;
                return [2 /*return*/, RNIapModule.buyItemByType(ANDROID_ITEM_TYPE_SUBSCRIPTION, sku, oldSku, prorationMode)];
            });
        }); },
    })();
};
/**
 * @deprecated Deprecated since 3.0.0. This will be removed in the future. Use `requestPurchaseWithQuantityIOS` instead.
 * Buy a product with a specified quantity (iOS only)
 * @param {string} sku The product's sku/ID
 * @param {number} quantity The amount of product to buy
 * @returns {Promise<ProductPurchase>}
 */
export var buyProductWithQuantityIOS = function (sku, quantity) {
    console.warn('Deprecated since 3.0.0. This will be removed in the future. Use `buyProductWithQuantityIOS` instead');
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.buyProductWithQuantityIOS(sku, quantity)];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve()];
        }); }); },
    })();
};
/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * @param {string} sku The product's sku/ID
 * @returns {Promise<string>}
 */
export var requestPurchaseWithQuantityIOS = function (sku, quantity) {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.buyProductWithQuantityIOS(sku, quantity)];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve()];
        }); }); },
    })();
};
/**
 * Finish Transaction (iOS only)
 *  Similar to `consumePurchaseAndroid`.
 *  Tells StoreKit that you have delivered the purchase to the user
 *  and StoreKit can now let go of the transaction.
 *  Call this after you have persisted the purchased state to your server or local data in your app.
 *  `react-native-iap` will continue to deliver the purchase updated events
 *  with the successful purchase until you finish the transaction.
 * **Even after the app has relaunched.**
 * @param {string} transactionId The transactionId of the function that you would like to finish.
 * @returns {Promise<string | void>}
 */
export var finishTransactionIOS = function (transactionId) {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.finishTransaction(transactionId)];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve()];
        }); }); },
    })();
};
/**
 * Clear Transaction (iOS only)
 *   Finish remaining transactions. Related to issue #257
 *     link : https://github.com/dooboolab/react-native-iap/issues/257
 * @returns {Promise<string | void>}
 */
export var clearTransactionIOS = function () {
    console.warn('The `clearTransactionIOS` method is deprecated.');
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.clearTransaction()];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve()];
        }); }); },
    })();
};
/**
 * Clear valid Products (iOS only)
 *   Remove all products which are validated by Apple server.
 * @returns {Promise<void>}
 */
export var clearProductsIOS = function () {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.clearProducts()];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve];
        }); }); },
    })();
};
/**
 * Acknowledge a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise<PurchaseResult | void>}
 */
export var acknowledgePurchaseAndroid = function (token, developerPayload) {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve()];
        }); }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeAndroidAvailable();
                return [2 /*return*/, RNIapModule.acknowledgePurchase(token, developerPayload)];
            });
        }); },
    })();
};
/**
 * Consume a product (on Android.) No-op on iOS.
 * @param {string} token The product's token (on Android)
 * @returns {Promise<PurchaseResult>}
 */
export var consumePurchaseAndroid = function (token, developerPayload) {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve()];
        }); }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeAndroidAvailable();
                return [2 /*return*/, RNIapModule.consumeProduct(token, developerPayload)];
            });
        }); },
    })();
};
/**
 * Should Add Store Payment (iOS only)
 *   Indicates the the App Store purchase should continue from the app instead of the App Store.
 * @returns {Promise<Product>}
 */
export var getPromotedProductIOS = function () {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.promotedProduct()];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve()];
        }); }); },
    })();
};
/**
 * Buy the currently selected promoted product (iOS only)
 *   Initiates the payment process for a promoted product.
 *   Should only be called in response to the `iap-promoted-product` event.
 * @returns {Promise<void>}
 */
export var buyPromotedProductIOS = function () {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.buyPromotedProduct()];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve()];
        }); }); },
    })();
};
/**
 * Buy products or subscriptions with offers (iOS only)
 *
 * Runs the payment process with some infor you must fetch
 * from your server.
 * @param {string} sku The product identifier
 * @param {string} forUser  An user identifier on you system
 * @param {object} withOffer The offer information
 * @param {string} withOffer.identifier The offer identifier
 * @param {string} withOffer.keyIdentifier Key identifier that it uses to generate the signature
 * @param {string} withOffer.nonce An UUID returned from the server
 * @param {string} withOffer.signature The actual signature returned from the server
 * @param {number} withOffer.timestamp The timestamp of the signature
 * @returns {Promise}
 */
export var buyProductWithOfferIOS = function (sku, forUser, withOffer) {
    return Platform.select({
        ios: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                checkNativeiOSAvailable();
                return [2 /*return*/, RNIapIos.buyProductWithOffer(sku, forUser, withOffer)];
            });
        }); },
        android: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve()];
        }); }); },
    })();
};
/**
 * Validate receipt for iOS.
 * @param {object} receiptBody the receipt body to send to apple server.
 * @param {boolean} isTest whether this is in test environment which is sandbox.
 * @returns {Promise<Apple.ReceiptValidationResponse | false>}
 */
export var validateReceiptIos = function (receiptBody, isTest) { return __awaiter(_this, void 0, void 0, function () {
    var url, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = isTest
                    ? 'https://sandbox.itunes.apple.com/verifyReceipt'
                    : 'https://buy.itunes.apple.com/verifyReceipt';
                return [4 /*yield*/, fetch(url, {
                        method: 'POST',
                        headers: new Headers({
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        }),
                        body: JSON.stringify(receiptBody),
                    })];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    throw Object.assign(new Error(response.statusText), {
                        statusCode: response.status,
                    });
                }
                return [2 /*return*/, response.json()];
        }
    });
}); };
/**
 * Validate receipt for Android.
 * @param {string} packageName package name of your app.
 * @param {string} productId product id for your in app product.
 * @param {string} productToken token for your purchase.
 * @param {string} accessToken accessToken from googleApis.
 * @param {boolean} isSub whether this is subscription or inapp. `true` for subscription.
 * @returns {Promise<object>}
 */
export var validateReceiptAndroid = function (packageName, productId, productToken, accessToken, isSub) { return __awaiter(_this, void 0, void 0, function () {
    var type, url, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                type = isSub ? 'subscriptions' : 'products';
                url = "https://www.googleapis.com/androidpublisher/v2/applications'\n    + '/" + packageName + "/purchases/" + type + "/" + productId + "'\n    + '/tokens/" + productToken + "?access_token=" + accessToken;
                return [4 /*yield*/, fetch(url, {
                        method: 'GET',
                        headers: new Headers({ Accept: 'application/json' }),
                    })];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    throw Object.assign(new Error(response.statusText), {
                        statusCode: response.status,
                    });
                }
                return [2 /*return*/, response.json()];
        }
    });
}); };
/**
 * @deprecated Deprecated since 3.0.0. This will be removed in the future. Use `purchaseUpdatedLister` with `requestPurchase`.
 * Add IAP purchase event in ios.
 * @returns {callback(e: Event)}
 */
export var addAdditionalSuccessPurchaseListenerIOS = function (e) {
    console.warn('addAdditionalSuccessPurchaseListenerIOS is deprecated since 3.0.0' +
        'and will be removed in the future.' +
        'Use `purchaseUpdatedListener` with `requestPurchase`.');
    if (Platform.OS === 'ios') {
        checkNativeiOSAvailable();
        var myModuleEvt = new NativeEventEmitter(RNIapIos);
        return myModuleEvt.addListener('iap-purchase-event', e);
    }
    else {
        console.log('adding purchase listener is only provided in ios.');
    }
};
/**
 * Add IAP purchase event in ios.
 * @returns {callback(e: ProductPurchase)}
 */
export var purchaseUpdatedListener = function (e) {
    if (Platform.OS === 'ios') {
        checkNativeiOSAvailable();
        var myModuleEvt = new NativeEventEmitter(RNIapIos);
        return myModuleEvt.addListener('purchase-updated', e);
    }
    else {
        var emitterSubscription = DeviceEventEmitter.addListener('purchase-updated', e);
        RNIapModule.startListening();
        return emitterSubscription;
    }
};
/**
 * Add IAP purchase error event in ios.
 * @returns {callback(e: ProductPurchase)}
 */
export var purchaseErrorListener = function (e) {
    if (Platform.OS === 'ios') {
        checkNativeiOSAvailable();
        var myModuleEvt = new NativeEventEmitter(RNIapIos);
        return myModuleEvt.addListener('purchase-error', e);
    }
    else {
        return DeviceEventEmitter.addListener('purchase-error', e);
    }
};
/**
 * Get the current receipt base64 encoded in IOS.
 * @returns {Promise<string>}
 */
export var requestReceiptIOS = function () {
    if (Platform.OS === 'ios') {
        checkNativeiOSAvailable();
        return RNIapIos.requestReceipt();
    }
};
/**
 * Get the pending purchases in IOS.
 * @returns {Promise<ProductPurchase[]>}
 */
export var getPendingPurchasesIOS = function () {
    if (Platform.OS === 'ios') {
        checkNativeiOSAvailable();
        return RNIapIos.getPendingTransactions();
    }
};
export default {
    IAPErrorCode: IAPErrorCode,
    initConnection: initConnection,
    endConnectionAndroid: endConnectionAndroid,
    getProducts: getProducts,
    getSubscriptions: getSubscriptions,
    getPurchaseHistory: getPurchaseHistory,
    getAvailablePurchases: getAvailablePurchases,
    getPendingPurchasesIOS: getPendingPurchasesIOS,
    consumeAllItemsAndroid: consumeAllItemsAndroid,
    buySubscription: buySubscription,
    buyProduct: buyProduct,
    buyProductWithQuantityIOS: buyProductWithQuantityIOS,
    clearProductsIOS: clearProductsIOS,
    clearTransactionIOS: clearTransactionIOS,
    acknowledgePurchaseAndroid: acknowledgePurchaseAndroid,
    consumePurchaseAndroid: consumePurchaseAndroid,
    validateReceiptIos: validateReceiptIos,
    validateReceiptAndroid: validateReceiptAndroid,
    addAdditionalSuccessPurchaseListenerIOS: addAdditionalSuccessPurchaseListenerIOS,
    requestPurchase: requestPurchase,
    requestPurchaseWithQuantityIOS: requestPurchaseWithQuantityIOS,
    finishTransactionIOS: finishTransactionIOS,
    requestSubscription: requestSubscription,
    purchaseUpdatedListener: purchaseUpdatedListener,
    purchaseErrorListener: purchaseErrorListener,
    requestReceiptIOS: requestReceiptIOS,
    getPromotedProductIOS: getPromotedProductIOS,
    buyPromotedProductIOS: buyPromotedProductIOS,
};

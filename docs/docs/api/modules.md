[react-native-iap](..) / Exports

# react-native-iap

## Table of contents

### Enumerations

- [ErrorCode](enums/ErrorCode.md)
- [InstallSourceAndroid](enums/InstallSourceAndroid.md)
- [ProductType](enums/ProductType.md)
- [ProrationModesAndroid](enums/ProrationModesAndroid.md)
- [PurchaseStateAndroid](enums/PurchaseStateAndroid.md)

### Classes

- [PurchaseError](classes/PurchaseError.md)

### Interfaces

- [Discount](interfaces/Discount.md)
- [Product](interfaces/Product.md)
- [ProductCommon](interfaces/ProductCommon.md)
- [ProductPurchase](interfaces/ProductPurchase.md)
- [PurchaseResult](interfaces/PurchaseResult.md)
- [SubscriptionAndroid](interfaces/SubscriptionAndroid.md)
- [SubscriptionIOS](interfaces/SubscriptionIOS.md)
- [SubscriptionOffer](interfaces/SubscriptionOffer.md)
- [SubscriptionPurchase](interfaces/SubscriptionPurchase.md)

### Type Aliases

- [Purchase](modules.md#purchase)
- [Sku](modules.md#sku)
- [Subscription](modules.md#subscription)

### Variables

- [PROMOTED\_PRODUCT](modules.md#promoted_product)

### Functions

- [acknowledgePurchaseAndroid](modules.md#acknowledgepurchaseandroid)
- [buyPromotedProductIOS](modules.md#buypromotedproductios)
- [clearProductsIOS](modules.md#clearproductsios)
- [clearTransactionIOS](modules.md#cleartransactionios)
- [deepLinkToSubscriptionsAndroid](modules.md#deeplinktosubscriptionsandroid)
- [endConnection](modules.md#endconnection)
- [finishTransaction](modules.md#finishtransaction)
- [flushFailedPurchasesCachedAsPendingAndroid](modules.md#flushfailedpurchasescachedaspendingandroid)
- [getAndroidModule](modules.md#getandroidmodule)
- [getAvailablePurchases](modules.md#getavailablepurchases)
- [getInstallSourceAndroid](modules.md#getinstallsourceandroid)
- [getIosModule](modules.md#getiosmodule)
- [getNativeModule](modules.md#getnativemodule)
- [getPendingPurchasesIOS](modules.md#getpendingpurchasesios)
- [getProducts](modules.md#getproducts)
- [getPromotedProductIOS](modules.md#getpromotedproductios)
- [getPurchaseHistory](modules.md#getpurchasehistory)
- [getReceiptIOS](modules.md#getreceiptios)
- [getSubscriptions](modules.md#getsubscriptions)
- [initConnection](modules.md#initconnection)
- [presentCodeRedemptionSheetIOS](modules.md#presentcoderedemptionsheetios)
- [promotedProductListener](modules.md#promotedproductlistener)
- [purchaseErrorListener](modules.md#purchaseerrorlistener)
- [purchaseUpdatedListener](modules.md#purchaseupdatedlistener)
- [requestPurchase](modules.md#requestpurchase)
- [requestPurchaseWithOfferIOS](modules.md#requestpurchasewithofferios)
- [requestPurchaseWithQuantityIOS](modules.md#requestpurchasewithquantityios)
- [requestSubscription](modules.md#requestsubscription)
- [setAndroidNativeModule](modules.md#setandroidnativemodule)
- [useIAP](modules.md#useiap)
- [useIAPContext](modules.md#useiapcontext)
- [validateReceiptAmazon](modules.md#validatereceiptamazon)
- [validateReceiptAndroid](modules.md#validatereceiptandroid)
- [validateReceiptIos](modules.md#validatereceiptios)
- [withIAPContext](modules.md#withiapcontext)

## Type Aliases

### Purchase

Ƭ **Purchase**: [`ProductPurchase`](interfaces/ProductPurchase.md) \| [`SubscriptionPurchase`](interfaces/SubscriptionPurchase.md)

#### Defined in

[types/index.ts:100](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/types/index.ts#L100)

___

### Sku

Ƭ **Sku**: `string`

#### Defined in

[types/index.ts:7](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/types/index.ts#L7)

___

### Subscription

Ƭ **Subscription**: [`SubscriptionAndroid`](interfaces/SubscriptionAndroid.md) & [`SubscriptionIOS`](interfaces/SubscriptionIOS.md)

#### Defined in

[types/index.ts:169](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/types/index.ts#L169)

## Variables

### PROMOTED\_PRODUCT

• `Const` **PROMOTED\_PRODUCT**: ``"iap-promoted-product"``

#### Defined in

[types/index.ts:24](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/types/index.ts#L24)

## Functions

### acknowledgePurchaseAndroid

▸ **acknowledgePurchaseAndroid**(`token`): `Promise`<`boolean` \| `void` \| [`PurchaseResult`](interfaces/PurchaseResult.md)\>

Acknowledge a product (on Android.) No-op on iOS.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | `Object` | The product's token (on Android) |
| `token.developerPayload?` | `string` | - |
| `token.token` | `string` | - |

#### Returns

`Promise`<`boolean` \| `void` \| [`PurchaseResult`](interfaces/PurchaseResult.md)\>

#### Defined in

[iap.ts:487](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L487)

___

### buyPromotedProductIOS

▸ **buyPromotedProductIOS**(): `Promise`<`void`\>

Buy the currently selected promoted product (iOS only)
  Initiates the payment process for a promoted product. Should only be called in response to the `iap-promoted-product` event.

#### Returns

`Promise`<`void`\>

#### Defined in

[iap.ts:527](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L527)

___

### clearProductsIOS

▸ **clearProductsIOS**(): `Promise`<`void`\>

Clear valid Products (iOS only)
  Remove all products which are validated by Apple server.

#### Returns

`Promise`<`void`\>

#### Defined in

[iap.ts:479](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L479)

___

### clearTransactionIOS

▸ **clearTransactionIOS**(): `Promise`<`void`\>

Clear Transaction (iOS only)
  Finish remaining transactions. Related to issue #257 and #801
    link : https://github.com/dooboolab/react-native-iap/issues/257
           https://github.com/dooboolab/react-native-iap/issues/801

#### Returns

`Promise`<`void`\>

#### Defined in

[iap.ts:471](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L471)

___

### deepLinkToSubscriptionsAndroid

▸ **deepLinkToSubscriptionsAndroid**(`sku`): `Promise`<`void`\>

Deep link to subscriptions screen on Android. No-op on iOS.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sku` | `Object` | The product's SKU (on Android) |
| `sku.sku` | `string` | - |

#### Returns

`Promise`<`void`\>

#### Defined in

[iap.ts:502](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L502)

___

### endConnection

▸ **endConnection**(): `Promise`<`boolean`\>

End module for purchase flow.

#### Returns

`Promise`<`boolean`\>

#### Defined in

[iap.ts:93](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L93)

___

### finishTransaction

▸ **finishTransaction**(`__namedParameters`): `Promise`<`boolean` \| [`PurchaseResult`](interfaces/PurchaseResult.md)\>

Finish Transaction (both platforms)
  Abstracts  Finish Transaction
  iOS: Tells StoreKit that you have delivered the purchase to the user and StoreKit can now let go of the transaction.
  Call this after you have persisted the purchased state to your server or local data in your app.
  `react-native-iap` will continue to deliver the purchase updated events with the successful purchase until you finish the transaction. **Even after the app has relaunched.**
  Android: it will consume purchase for consumables and acknowledge purchase for non-consumables.

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.developerPayloadAndroid?` | `string` |
| `__namedParameters.isConsumable?` | `boolean` |
| `__namedParameters.purchase` | [`ProductPurchase`](interfaces/ProductPurchase.md) |

#### Returns

`Promise`<`boolean` \| [`PurchaseResult`](interfaces/PurchaseResult.md)\>

#### Defined in

[iap.ts:413](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L413)

___

### flushFailedPurchasesCachedAsPendingAndroid

▸ **flushFailedPurchasesCachedAsPendingAndroid**(): `Promise`<`boolean`\>

Consume all 'ghost' purchases (that is, pending payment that already failed but is still marked as pending in Play Store cache). Android only.

#### Returns

`Promise`<`boolean`\>

#### Defined in

[iap.ts:101](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L101)

___

### getAndroidModule

▸ **getAndroidModule**(): `AmazonModuleProps` \| `AndroidModuleProps`

#### Returns

`AmazonModuleProps` \| `AndroidModuleProps`

#### Defined in

[iap.ts:51](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L51)

___

### getAvailablePurchases

▸ **getAvailablePurchases**(): `Promise`<([`ProductPurchase`](interfaces/ProductPurchase.md) \| [`SubscriptionPurchase`](interfaces/SubscriptionPurchase.md))[]\>

Get all purchases made by the user (either non-consumable, or haven't been consumed yet)

#### Returns

`Promise`<([`ProductPurchase`](interfaces/ProductPurchase.md) \| [`SubscriptionPurchase`](interfaces/SubscriptionPurchase.md))[]\>

#### Defined in

[iap.ts:200](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L200)

___

### getInstallSourceAndroid

▸ **getInstallSourceAndroid**(): [`InstallSourceAndroid`](enums/InstallSourceAndroid.md)

#### Returns

[`InstallSourceAndroid`](enums/InstallSourceAndroid.md)

#### Defined in

[iap.ts:31](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L31)

___

### getIosModule

▸ **getIosModule**(): `IosModuleProps`

#### Returns

`IosModuleProps`

#### Defined in

[iap.ts:69](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L69)

___

### getNativeModule

▸ **getNativeModule**(): `AmazonModuleProps` \| `AndroidModuleProps` \| `IosModuleProps`

#### Returns

`AmazonModuleProps` \| `AndroidModuleProps` \| `IosModuleProps`

#### Defined in

[iap.ts:75](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L75)

___

### getPendingPurchasesIOS

▸ **getPendingPurchasesIOS**(): `Promise`<[`ProductPurchase`](interfaces/ProductPurchase.md)[]\>

Get the current receipt base64 encoded in IOS.

#### Returns

`Promise`<[`ProductPurchase`](interfaces/ProductPurchase.md)[]\>

#### Defined in

[iap.ts:675](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L675)

___

### getProducts

▸ **getProducts**(`skus`): `Promise`<[`Product`](interfaces/Product.md)[]\>

Get a list of products (consumable and non-consumable items, but not subscriptions)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `skus` | `Object` | The item skus |
| `skus.skus` | `string`[] | - |

#### Returns

`Promise`<[`Product`](interfaces/Product.md)[]\>

#### Defined in

[iap.ts:109](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L109)

___

### getPromotedProductIOS

▸ **getPromotedProductIOS**(): `Promise`<``null`` \| [`Product`](interfaces/Product.md)\>

Should Add Store Payment (iOS only)
  Indicates the the App Store purchase should continue from the app instead of the App Store.

#### Returns

`Promise`<``null`` \| [`Product`](interfaces/Product.md)\>

promoted product

#### Defined in

[iap.ts:519](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L519)

___

### getPurchaseHistory

▸ **getPurchaseHistory**(): `Promise`<([`ProductPurchase`](interfaces/ProductPurchase.md) \| [`SubscriptionPurchase`](interfaces/SubscriptionPurchase.md))[]\>

Gets an inventory of purchases made by the user regardless of consumption status

#### Returns

`Promise`<([`ProductPurchase`](interfaces/ProductPurchase.md) \| [`SubscriptionPurchase`](interfaces/SubscriptionPurchase.md))[]\>

#### Defined in

[iap.ts:170](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L170)

___

### getReceiptIOS

▸ **getReceiptIOS**(`__namedParameters`): `Promise`<`string`\>

Get the current receipt base64 encoded in IOS.

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.forceRefresh?` | `boolean` |

#### Returns

`Promise`<`string`\>

#### Defined in

[iap.ts:683](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L683)

___

### getSubscriptions

▸ **getSubscriptions**(`skus`): `Promise`<[`Subscription`](modules.md#subscription)[]\>

Get a list of subscriptions

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `skus` | `Object` | The item skus |
| `skus.skus` | `string`[] | - |

#### Returns

`Promise`<[`Subscription`](modules.md#subscription)[]\>

#### Defined in

[iap.ts:140](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L140)

___

### initConnection

▸ **initConnection**(): `Promise`<`boolean`\>

Init module for purchase flow. Required on Android. In ios it will check whether user canMakePayment.

#### Returns

`Promise`<`boolean`\>

#### Defined in

[iap.ts:86](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L86)

___

### presentCodeRedemptionSheetIOS

▸ **presentCodeRedemptionSheetIOS**(): `Promise`<``null``\>

Launches a modal to register the redeem offer code in IOS.

#### Returns

`Promise`<``null``\>

#### Defined in

[iap.ts:693](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L693)

___

### promotedProductListener

▸ **promotedProductListener**(`listener`): ``null`` \| `EmitterSubscription`

Add IAP promoted subscription event

**`Platform`**

iOS

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | () => `void` |

#### Returns

``null`` \| `EmitterSubscription`

#### Defined in

[eventEmitter.ts:42](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/eventEmitter.ts#L42)

___

### purchaseErrorListener

▸ **purchaseErrorListener**(`listener`): `EmitterSubscription`

Add IAP purchase error event

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | (`error`: [`PurchaseError`](classes/PurchaseError.md)) => `void` |

#### Returns

`EmitterSubscription`

#### Defined in

[eventEmitter.ts:30](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/eventEmitter.ts#L30)

___

### purchaseUpdatedListener

▸ **purchaseUpdatedListener**(`listener`): `EmitterSubscription`

Add IAP purchase event

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | (`event`: [`Purchase`](modules.md#purchase)) => `void` |

#### Returns

`EmitterSubscription`

#### Defined in

[eventEmitter.ts:11](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/eventEmitter.ts#L11)

___

### requestPurchase

▸ **requestPurchase**(`__namedParameters`): `Promise`<`void` \| [`ProductPurchase`](interfaces/ProductPurchase.md)\>

Request a purchase for product. This will be received in `PurchaseUpdatedListener`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `__namedParameters` | `Object` | - |
| `__namedParameters.andDangerouslyFinishTransactionAutomaticallyIOS?` | `boolean` | - |
| `__namedParameters.applicationUsername?` | `string` | - |
| `__namedParameters.isOfferPersonalized?` | `boolean` | - |
| `__namedParameters.obfuscatedAccountIdAndroid?` | `string` | - |
| `__namedParameters.obfuscatedProfileIdAndroid?` | `string` | - |
| `__namedParameters.sku?` | `string` | - |
| `__namedParameters.skus?` | `string`[] | For Google Play Billing Library 5 https://developer.android.com/google/play/billing/integrate#personalized-price |

#### Returns

`Promise`<`void` \| [`ProductPurchase`](interfaces/ProductPurchase.md)\>

#### Defined in

[iap.ts:238](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L238)

___

### requestPurchaseWithOfferIOS

▸ **requestPurchaseWithOfferIOS**(`__namedParameters`): `Promise`<[`Purchase`](modules.md#purchase)\>

Buy products or subscriptions with offers (iOS only)

Runs the payment process with some info you must fetch
from your server.

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.forUser` | `string` |
| `__namedParameters.sku` | `string` |
| `__namedParameters.withOffer` | `PaymentDiscount` |

#### Returns

`Promise`<[`Purchase`](modules.md#purchase)\>

#### Defined in

[iap.ts:574](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L574)

___

### requestPurchaseWithQuantityIOS

▸ **requestPurchaseWithQuantityIOS**(`sku`): `Promise`<[`ProductPurchase`](interfaces/ProductPurchase.md)\>

Request a purchase for product. This will be received in `PurchaseUpdatedListener`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sku` | `Object` | The product's sku/ID |
| `sku.quantity` | `number` | - |
| `sku.sku` | `string` | - |

#### Returns

`Promise`<[`ProductPurchase`](interfaces/ProductPurchase.md)\>

#### Defined in

[iap.ts:392](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L392)

___

### requestSubscription

▸ **requestSubscription**(`__namedParameters?`): `Promise`<``null`` \| `void` \| [`SubscriptionPurchase`](interfaces/SubscriptionPurchase.md)\>

Request a purchase for product. This will be received in `PurchaseUpdatedListener`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `__namedParameters?` | `Object` | - |
| `__namedParameters.andDangerouslyFinishTransactionAutomaticallyIOS?` | `boolean` | - |
| `__namedParameters.applicationUsername?` | `string` | - |
| `__namedParameters.isOfferPersonalized?` | `boolean` | For Google Play Billing Library 5 https://developer.android.com/google/play/billing/integrate#personalized-price |
| `__namedParameters.obfuscatedAccountIdAndroid?` | `string` | - |
| `__namedParameters.obfuscatedProfileIdAndroid?` | `string` | - |
| `__namedParameters.prorationModeAndroid?` | [`ProrationModesAndroid`](enums/ProrationModesAndroid.md) | - |
| `__namedParameters.purchaseTokenAndroid?` | `string` | - |
| `__namedParameters.sku?` | `string` | - |
| `__namedParameters.subscriptionOffers?` | [`SubscriptionOffer`](interfaces/SubscriptionOffer.md)[] | For Google Play Billing Library 5 |

#### Returns

`Promise`<``null`` \| `void` \| [`SubscriptionPurchase`](interfaces/SubscriptionPurchase.md)\>

Promise resolves to null when using proratioModesAndroid=DEFERRED, and to a SubscriptionPurchase otherwise

#### Defined in

[iap.ts:315](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L315)

___

### setAndroidNativeModule

▸ **setAndroidNativeModule**(`nativeModule`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `nativeModule` | `AndroidModuleProps` |

#### Returns

`void`

#### Defined in

[iap.ts:39](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L39)

___

### useIAP

▸ **useIAP**(): `IAP_STATUS`

#### Returns

`IAP_STATUS`

#### Defined in

[hooks/useIAP.ts:44](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/hooks/useIAP.ts#L44)

___

### useIAPContext

▸ **useIAPContext**(): `IAPContextType`

#### Returns

`IAPContextType`

#### Defined in

[hooks/withIAPContext.tsx:41](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/hooks/withIAPContext.tsx#L41)

___

### validateReceiptAmazon

▸ **validateReceiptAmazon**(`__namedParameters`): `Promise`<`ReceiptType`\>

Validate receipt for Amazon. NOTE: This method is here for debugging purposes only. Including
your developer secret in the binary you ship to users is potentially dangerous.
Use server side validation instead for your production builds

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.developerSecret` | `string` |
| `__namedParameters.receiptId` | `string` |
| `__namedParameters.useSandbox` | `boolean` |
| `__namedParameters.userId` | `string` |

#### Returns

`Promise`<`ReceiptType`\>

#### Defined in

[iap.ts:653](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L653)

___

### validateReceiptAndroid

▸ **validateReceiptAndroid**(`__namedParameters`): `Promise`<`ReceiptType`\>

Validate receipt for Android. NOTE: This method is here for debugging purposes only. Including
your access token in the binary you ship to users is potentially dangerous.
Use server side validation instead for your production builds

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.accessToken` | `string` |
| `__namedParameters.isSub?` | `boolean` |
| `__namedParameters.packageName` | `string` |
| `__namedParameters.productId` | `string` |
| `__namedParameters.productToken` | `string` |

#### Returns

`Promise`<`ReceiptType`\>

#### Defined in

[iap.ts:620](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L620)

___

### validateReceiptIos

▸ **validateReceiptIos**(`__namedParameters`): `Promise`<``false`` \| `ResponseBody`\>

Validate receipt for iOS.

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.isTest?` | `boolean` |
| `__namedParameters.receiptBody` | `Record`<`string`, `unknown`\> |

#### Returns

`Promise`<``false`` \| `ResponseBody`\>

#### Defined in

[iap.ts:591](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/iap.ts#L591)

___

### withIAPContext

▸ **withIAPContext**<`T`\>(`Component`): (`props`: `T`) => `Element`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `Component` | `ComponentType`<`T`\> |

#### Returns

`fn`

▸ (`props`): `Element`

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `T` |

##### Returns

`Element`

#### Defined in

[hooks/withIAPContext.tsx:51](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/hooks/withIAPContext.tsx#L51)

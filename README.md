# react-native-iap
<p align="left">
  <a href="https://npmjs.org/package/react-native-iap"><img alt="npm version" src="http://img.shields.io/npm/v/react-native-iap.svg?style=flat-square"></a>
  <a href="https://npmjs.org/package/react-native-iap"><img alt="npm version" src="http://img.shields.io/npm/dm/react-native-iap.svg?style=flat-square"></a>
</p>
This a react-native link library project for in-app-purchase for both android and ios project. The goal for this project is to have similar experience between the two platforms for in-app-purchase. Basically android platform has more functions for in-app-purchase and is not our specific interests for this project. 

We are willing to share same in-app-purchase experience for both android and ios platform and will continuously merge methods which are standing alone.

Android iap is implemented with iap version 3 which is currently recent.

## Important
react-native-iap@0.2.0 has been published and it is recommended to use version after `0.2.0` from `2018/01/23`.
`react-native-iap` module versions that are not described in `change logs` may not run as expected so please refer to version mentioned in `Changelogs` below.

## Breaking Changes
Changes from `react-native-iap@0.1.*` to `react-native-iap@0.2.*` is that you have `prepare()` method deprecated which you should call before using `RNIap` methods. Now you have to call `prepareAndroid()` instead just to know that it is just android dependent method.
Also to import module, previously in `react-native-iap@0.1.*` you had to `import RNIap from 'react-native-iap'` but now you have to do like `import * as RNIap from 'react-native-iap'`.

For new method, refreshAllItems has been implemented for both ios and android. This feature will support senario for non-consumable products.
Also there are some other methods that is not supported in ios and implemented in android. You can see more in Changelogs below.
Lastly, this module also supports types for typescript users from `0.2.5`.

## Changelogs
- **[0.2.7]**
  + Get Android `buyItem` cancel callback.
- **[0.2.6]**
  + Android buyItem method do not consume item right away from 0.2.6.
- **[0.2.5]**
  + types support.
    ![alt text](https://firebasestorage.googleapis.com/v0/b/bookoo-89f6c.appspot.com/o/typing%20screen%20shot.png?alt=media&token=ea2ef1f3-50af-4d9c-8388-7fd22ddc8aa0)
  + call new Method for android inside refreshItems(). This will now return object values like ios.
- **[0.2.3]**
  + Support annotations to hint while using our module.
- **[0.2.0]**
  + Implemented senario for consumable and non-consumable item.
  + Seperated methods that only exists in IOS and Android.
    - prepareAndroid()
    - refreshPurchaseItemsAndroid(type: string)
    - getPurchasedItemsAndroid(type: string)
    - consumeItemAndroid(token: string)
  + Able to call prepareAndroid() function without any conditional statement like if (Platform.OS === 'android'). Just use it. 
  + Updated Readme.
- **[0.1.10]**
  + Fixed potential bug relied on preparing IAP module in Android. Updated readme to see how to use it.

#### Methods
| Func  | Param  | Return | Description |
| :------------ |:---------------:| :---------------:| :-----|
| prepareAndroid |  | `Promise` | Prepare IAP module for android. Should be called in android before using any methods in RNIap.|
| getItems | { android: [], ios: [] } | `Promise` | get purchasable items in array. |
| getSubscribeItems | `string` | `Promise` | Get subscription items. |
| buyItem | `string` | `Promise` | Purchase item. |
| buySubscribeItem | `string` | `Promise` | Buy subscription item. |
| refreshAllItems | | `Promise` | Refresh all items to make them available to buy again. |
| refreshPurchaseItemsAndroid | `string` | `Promise` | refresh purchased items for android. What is different from refreshAllItems is that this method can get parameter to refresh `INAPP` items or `SUBS` items.|
| getPurchaseItemsAndroid | `string` | `Promise` | get purchased items for android. This method also gets parameter to refresh `INAPP` items or `SUBS` items.|
| consumeItemAndroid | `string` | `Promise` | consume item for android. After buying some item from consumable item in android, you can use this method to consume it. Therefore you can purchase the item again. |

## Npm repo
https://www.npmjs.com/package/react-native-iap

## Git repo
https://github.com/dooboolab/react-native-iap


## Getting started
`$ npm install react-native-iap --save`

### Mostly automatic installation
`$ react-native link react-native-iap`

### Manual installation

#### iOS
1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-iap` and add `RNIap.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNIap.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android
1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.RNIapPackage;` to the imports at the top of the file
  - Add `new RNIapPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-iap'
  	project(':react-native-iap').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-iap/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-iap')
  	```
## Usage
You can look in the RNIapExample folder to try the example. Below is basic implementation which is also provided in RNIapExample project.

## Prepare IAP, In App Billing.
First thing you should do is to define your items for iOS and android separately like defined below.
```javascript
import * as RNIap from 'react-native-iap';

const itemSkus = {
  ios: [
    'com.cooni.point1000',
    'com.cooni.point5000',
  ],
  android: [
    'point_1000',
    '5000_point',
  ],
};
```

Next, call the prepare function (ios it's not needed, but android it is. No need to check platform though since nothing will happen in ios:

```javascript
RNIap.prepareAndroid().then(message=>{
  // Ready to call RNIap.getItems()
}).catch(errorCode=>{
  // Depending on the situation, Android will have a different error code. Handle accordingly. Visit the link below for current info
  // https://developer.android.com/reference/com/android/billingclient/api/BillingClient.BillingResponse.html
  /*
    -2: FEATURE_NOT_SUPPORTED
    -1: SERVICE_DISCONNECTED
    0: SUCCESS (should never be successful since only errors are caught)
    1: USER_CANCELED
    2: SERVICE_UNAVAILABLE
    3: BILLING_UNAVAILABLE
    4: ITEM_UNAVAILABLE
    5: DEVELOPER_ERROR
    6: ERROR
    7: ITEM_ALREADY_OWNED
    8: ITEM_NOT_OWNED
  */
})
```

## Get Valid Items
You should do prepareAndroid() in componentDidMount in necessary component.
Then call getItems().
```javascript
async componentDidMount() {
  const msg = await RNIap.prepare();
  console.log('msg: ' + msg);
  const items = await RNIap.getItems(itemSkus);
  this.setState({ items, });

  // iOS will support currency_type after v0.1.4
}
```
#### Each item is a JavaScript object containing these keys:
|    | ios | android | info |
|----|-----|---------|------|
|price| ✓ | ✓ | will return localizedPrice on Android (default), or a decimal point number on iOS (default) |
|productId| ✓ | ✓ | returns a string needed to purchase the item later |
|currency| ✓ | ✓ | returns the currency code |
|localizedPrice| ✓ | ✓ | Use localizedPrice if you want to display the price to the user so you don't need to worry about currency symbols. |
|title| ✓ | ✓ | returns the title Android and localizedTitle on iOS |
|description| ✓ | ✓ | returns the description on Android and localizedDescription on iOS |
|type|  | ✓ | returns SKU type |
|price_currency|  | ✓ | same as currency, but left in here to not break any code users may have written before |


## Purchase
Finally when you getItems with RNIap module, you can buyItem using it's api.
```javascript
  const receipt = await RNIap.buyItem('com.cooni.point1000');
  // above will return receipt string which can be used to validate on your server.
```
In RNIapExample, at receiving receipt string, main page will navigate to Second.js.

## Purchase Example 2 (Advanced)
```javascript
this.setState({progressTitle:"Please wait..."});
RNIap.buyItem('com.cooni.point1000').then(receipt=>{
    this.setState({
      receipt:receipt, // save the receipt if you need it, whether locally, or to your server.
      progressTitle:"Purchase Successful!",
      points:this.state.points + 1000
    });
  }).catch(error=>{
    // resetting UI
    this.setState({progressTitle:"Buy 1000 Points for only $0.99"})
    if (Platform.OS == 'ios') {
      if (error.code == 2) {
        // ios error.code 2 means that the user cancelled. No need to alert them. Just reset the UI.
      } else {
        // ios error.description gives a so-so English description of the error that the user should be able to understand.
        // You could also give your own descriptions based on error.code instead:  
        // https://developer.apple.com/documentation/storekit/skerror.code
        alert(error.description)
      }
    } else {
      // haven't added specific error handling yet for android. todo.
      alert("Purchase Unsuccessful");
    }
  })
```

## Subscription
```javascript
buySubscribeItem = async(sku) => {
  try {
    console.log('buyItem: ' + sku);
    const receipt = await RNIap.buyItem(sku);
    // ios case parsing  리턴값이 어레이가 아님...  0, 1 를 키로 갖는 객체임..
    console.log(receipt);
    this.setState({ receipt }, () => this.goToNext());
  } catch (err) {
    console.log(`${err}`);
    Alert.alert(`${err}`);
  }
}
```
Subscribable products can be included in item object and purchased just like consumable product.
You can cancel subscription on iOS system setting.

## Restore (iOS)
Non consumable products can be restored after user delete App.  Currently for iOS only.
Refer the RNIapExample's source code.

```javascript
restorePreProdducts = async() => {
  try {
    const rslts = await RNIap.refreshAllItems();
    console.log(' Restored Item :: ', rslts);
    this.setState({
      restoredItems: ` Restored ${rslts.length} items.  ${rslts[0].productIdentifier} `,
      receipt: rslts[0].transactionReceipt,
    });
  } catch(err) {
    console.log(err);
    Alert.alert(`${err}`);
  }
}
```

Next, call the prepareAndroid function (ios it's not needed, but android it is. No need to check platform though since nothing will happen in ios:

```javascript
RNIap.prepareAndroid().then(message=>{
  // Ready to call RNIap.getItems()
}).catch(errorCode=>{
  // Depending on the situation, Android will have a different error code. Handle accordingly. Visit the link below for current info
  // https://developer.android.com/reference/com/android/billingclient/api/BillingClient.BillingResponse.html
  /*
    -2: FEATURE_NOT_SUPPORTED
    -1: SERVICE_DISCONNECTED
    0: SUCCESS (should never be successful since only errors are caught)
    1: USER_CANCELED
    2: SERVICE_UNAVAILABLE
    3: BILLING_UNAVAILABLE
    4: ITEM_UNAVAILABLE
    5: DEVELOPER_ERROR
    6: ERROR
    7: ITEM_ALREADY_OWNED
    8: ITEM_NOT_OWNED
  */
})
```

## Get Valid Items
You should do prepareAndroid() in componentDidMount in necessary component.
Then call getItems().
```javascript
async componentDidMount() {
  const msg = await RNIap.prepareAndroid();
  console.log('msg: ' + msg);
  const items = await RNIap.getItems(itemSkus);
  this.setState({ items, });

  // iOS will support currency_type after v0.1.4
}
```
#### Each item is a JavaScript object containing these keys:
|    | ios | android | info |
|----|-----|---------|------|
|price| ✓ | ✓ | will return localizedPrice on Android (default), or a decimal point number on iOS (default) |
|productId| ✓ | ✓ | returns a string needed to purchase the item later |
|currency| ✓ | ✓ | returns the currency code |
|localizedPrice| ✓ | ✓ | Use localizedPrice if you want to display the price to the user so you don't need to worry about currency symbols. |
|title| ✓ | ✓ | returns the title Android and localizedTitle on iOS |
|description| ✓ | ✓ | returns the description on Android and localizedDescription on iOS |
|type|  | ✓ | returns SKU type |
|price_currency|  | ✓ | same as currency, but left in here to not break any code users may have written before |


## Purchase
Finally when you getItems with RNIap module, you can buyItem using it's api.
```javascript
  const receipt = await RNIap.buyItem('com.cooni.point1000');
  // above will return receipt string which can be used to validate on your server.
```
In RNIapExample, at receiving receipt string, main page will navigate to Second.js.

## Purchase Example 2 (Advanced)
```javascript
this.setState({progressTitle:"Please wait..."});
RNIap.buyItem('com.cooni.point1000').then(receipt=>{
    this.setState({
      receipt:receipt, // save the receipt if you need it, whether locally, or to your server.
      progressTitle:"Purchase Successful!",
      points:this.state.points + 1000
    });
  }).catch(error=>{
    // resetting UI
    this.setState({progressTitle:"Buy 1000 Points for only $0.99"})
    if (Platform.OS == 'ios') {
      if (error.code == 2) {
        // ios error.code 2 means that the user cancelled. No need to alert them. Just reset the UI.
      } else {
        // ios error.description gives a so-so English description of the error that the user should be able to understand.
        // You could also give your own descriptions based on error.code instead:  
        // https://developer.apple.com/documentation/storekit/skerror.code
        alert(error.description)
      }
    } else {
      // haven't added specific error handling yet for android. todo.
      alert("Purchase Unsuccessful");
    }
  })
```

## Subscription
```javascript
buySubscribeItem = async(sku) => {
  try {
    console.log('buyItem: ' + sku);
    const receipt = await RNIap.buyItem(sku);
    // ios case parsing  리턴값이 어레이가 아님...  0, 1 를 키로 갖는 객체임..
    console.log(receipt);
    this.setState({ receipt }, () => this.goToNext());
  } catch (err) {
    console.log(`${err}`);
    Alert.alert(`${err}`);
  }
}
```
Subscribable products can be included in item object and purchased just like consumable product.
You can cancel subscription on iOS system setting.

## Todo
iOS : restore non-consumable products via restoreCompletedTransactions()

Thanks.

by JJMoon and dooboolab.
```
  try {
    const rslts = await RNIap.refreshAllItems();
    console.log(' Restored Item :: ', rslts);
    this.setState({
      restoredItems: ` Restored ${rslts.length} items.  ${rslts[0].productIdentifier} `,
      receipt: rslts[0].transactionReceipt,
    });
  } catch(err) {
    console.log(err);
    Alert.alert(`${err}`);
  }
}

```
Returned rslts is a List of each transactions(non-consumable) and each has items as follows.
{ transactionDate, transactionIdentifier, productIdentifier, transactionReceipt }

You need to test with one sandbox account, because the account holds previous purchase history.

## Todo
iOS :

Thanks.

by JJMoon and dooboolab.

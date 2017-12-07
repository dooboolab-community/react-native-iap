# react-native-iap
<p align="left">
  <a href="https://npmjs.org/package/react-native-iap"><img alt="npm version" src="http://img.shields.io/npm/v/react-native-iap.svg?style=flat-square"></a>
  <a href="https://npmjs.org/package/react-native-iap"><img alt="npm version" src="http://img.shields.io/npm/dm/react-native-iap.svg?style=flat-square"></a>
  <a href="https://npmjs.org/package/react-native-iap"><img alt="npm version" src="http://img.shields.io/npm/dm/react-native-iap.svg?style=flat-square"></a>
</p>
This a react-native link library project for in-app-purchase for both android and ios project. The goal for this project is to have similar experience between the two platforms for in-app-purchase. Basically android platform has more functions for in-app-purchase and is not our specific interests for this project. However if you look inside the index.js file, you will have some more hidden android functions which won't be supported in the readme. You can look inside if you want something more in android though. Android iap is implemented with iap version 3 which is currently recent.

## Changelogs
- **[0.1.10]**
  + Updated Readme.
- **[0.1.9]**
  + Fixed potential bug relied on preparing IAP module in Android. Updated readme to see how to use it.
  + prepareAndroid() function is deprecated. Use prepare() instead.

#### Methods
| Func  | Param  | Return | Description |
| :------------ |:---------------:| :---------------:| :-----|
| prepare |  | `Promise` | Prepare IAP module. |
| getItems | { android: [], ios: [] } | `Promise` | get purchasable items in array. |
| buyItem | `string` | `Promise` | Purchase item. |
| buySubscribeItem | `string` | `Promise` | Subscribe item. |


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
import RNIap from 'react-native-iap';

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

## Get Valid Items
You should do prepare() in componentDidMount in necessary component.
Then call getItems().
```javascript
async componentDidMount() {
  const msg = await RNIap.prepare();
  console.log('msg: ' + msg);
  const items = await RNIap.getItems(itemSkus);
  this.setState({ items, });

  /*
    Each item will have JSON object.
    currently both platform have price, productId attributes.
    iOS will support currency_type after v0.1.4
    you need productId attribute on both android and iOS to buy item.
  */
}
```

## Purchase
Finally when you getItems with RNIap module, you can buyItem using it's api.
```javascript
  const receipt = await RNIap.buyItem('com.cooni.point1000');
  // above will return receipt string which can be used to validate on your server.
```
In RNIapExample, at receiving receipt string, main page will navigate to Second.js.

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

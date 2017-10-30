
# react-native-iap
Git repo: https://github.com/dooboolab/react-native-iap
This a react-native link library project for in-app-purchase for both android and ios project. The goal for this project is to have similar experience between the two platforms for in-app-purchase. Basically android platform has more functions for in-app-purchase and is not our specific interests for this project. However if you look inside the index.js file, you will have some more hidden android functions which won't be supported in the readme. You can look inside if you want something more in android though. Android iap is implemented with iap version 3 which is currently recent.

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

First thing you should do is to define your items for ios and android seperately like defeined below.
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

If you are also developing android, you should do prepareAndroid() in componentDidMount in necessary component. Then call getItems() usually.
```javascript
componentDidMount = async() => {
  if (Platform.OS === 'android') {
    RNIap.prepareAndroid();
    // if you suffer error calling getItems, you need to take more time giving setTimeout function.
    // We will update this in furture release.
    const items = await RNIap.getItems(itemSkus);
    this.setState({ items, });

    /* 
      Each item will have json object.
      currently both platform have price, productId attributes.
      ios will support currency_type attribute in near future.
      you need productId attribute on both android and ios to buy item.
    */
  }
}
```

Finally when you getItems with RNIap module, you can buyItem using it's api.
```javascript
  const receipt = await RNIap.buyItem(sku);
  // avoid will return receipt string which can be used to validate on your server.
```

In future release, we will provide the subscribe apis also.
Thanks.

by JJMoon and dooboolab.

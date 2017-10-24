
# react-native-react-native-iap
Still under construction. Please wait little bit more...

## Currently this module is under implementation. We will announce when it's ready.
## Basic functionality will be available in November 2017.


## Getting started

`$ npm install react-native-react-native-iap --save`

### Mostly automatic installation

`$ react-native link react-native-react-native-iap`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-react-native-iap` and add `RNReactNativeIap.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNReactNativeIap.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.RNReactNativeIapPackage;` to the imports at the top of the file
  - Add `new RNReactNativeIapPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-react-native-iap'
  	project(':react-native-react-native-iap').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-react-native-iap/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-react-native-iap')
  	```

## Usage
```javascript
import RNReactNativeIap from 'react-native-react-native-iap';

// TODO: What to do with the module?
RNReactNativeIap;
```

---
sidebar_position: 100
---

# Manual installation

#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-iap` and add `RNIapIos.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libIap.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### iOS with Podfile

1. Open up `ios/Podfile`

- Add `pod 'Iap', :path => '../node_modules/react-native-iap'`

2. Run `pod install`

#### Android

1. Open up `android/app/src/main/java/[...]/MainApplication.java`

   - Add `import com.dooboolab.RNIap.IapPackage;` to the imports at the top of the file
   - Add `new IapPackage()` to the list returned by the `getPackages()` method

2. Append the following lines to `android/settings.gradle`:

   ```gradle
   include ':react-native-iap'
   project(':react-native-iap').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-iap/android')
   ```

3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:

   ```gradle
   implementation project(':react-native-iap')
   ```

4. You have two options depending on the stores you support:

   a. If you only need for Google Play IAP, Insert this inside the `defaultConfig` section in `android/app/build.gradle`:

   ```gradle
    defaultConfig {
        // ...
        // react-native-iap: we only use the Google Play flavor
        missingDimensionStrategy 'store', 'play'
    }
   ```

   b. If you are using it for both Google Play and Amazon, insert the following lines inside the `android` block in `android/app/build.gradle`

   ```gradle
    android {
        // ...
        flavorDimensions "appstore"
        productFlavors {
            googlePlay {
                dimension "appstore"
                missingDimensionStrategy "store", "play"
            }
            amazon {
                dimension "appstore"
                missingDimensionStrategy "store", "amazon"
            }
        }
    }
   ```

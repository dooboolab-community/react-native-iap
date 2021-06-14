---
sidebar_position: 100
---


# Manual installation

#### iOS
1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-iap` and add `RNIap.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNIap.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### iOS with Podfile
1. Open up `ios/Podfile`
  - Add `pod 'RNIap', :path => '../node_modules/react-native-iap'`
2. Run `pod install`

#### Android

1. Open up `android/app/src/main/java/[...]/MainApplication.java`
    - Add `import com.dooboolab.RNIap.RNIapPackage;` to the imports at the top of the file
    - Add `new RNIapPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
    ```gradle
    include ':react-native-iap'
    project(':react-native-iap').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-iap/android')
    ```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
    ```gradle
    compile project(':react-native-iap')
    ```
4. Update ProGuard config (Optional)
  - Append the following lines to your ProGuard config (`proguard-rules.pro`)
    ```
    -keepattributes *Annotation*
    -keepclassmembers class ** {
      @org.greenrobot.eventbus.Subscribe <methods>;
    }
    -keep enum org.greenrobot.eventbus.ThreadMode { *; }
    ```
5. Add the following to the `<permission>` block in `android/app/src/main/AndroidManifest.xml`:
  ```xml
  <uses-permission android:name="com.android.vending.BILLING" />
  ```
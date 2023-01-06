---
sidebar_position: 1
---

# Getting started

`react-native-iap` will help you access the In-App purchases capabilities of your device on `iOS`, and `Android` (Play Store and Amazon).

:::note
This library will provide the basic features to consume In-App purchases on the client-side, however you'll have to implement the server-side to validate your receipts (which is probably the most time consuming part to do it correctly).
:::

## Requirements

- `react` >= 16.13.1
- `react-native` >= 0.65.1

## Installation

Start with installing the package:

```bash npm2yarn
npm install react-native-iap
```

### `iOS`

```bash
cd ios; pod install; cd -
```

You can now get started hacking!

### `Android`

#### With Android Support

Go to `android/build.gradle` and modify the following lines:

```diff
buildscript {
  ext {
    ...
+   supportLibVersion = "28.0.0"
  }
}
```

#### With AndroidX

Go to `android/build.gradle` and modify the following lines:

```diff
buildscript {
  ext {
    ...
+    androidXAnnotation = "1.1.0"
+    androidXBrowser = "1.0.0"
+    minSdkVersion = 24
+    kotlinVersion = "1.5.0"
  }
}

dependencies {
  ...
+ classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion"
}
```

#### Configure the payment provider

You can support either `Play Store`, `Amazon` or both.

- To only support `Play Store`, go to `android/app/build.gradle`:

```diff
defaultConfig {
  ...
+ missingDimensionStrategy "store", "play"
}
```

- To support both:

```diff
android {
  ...
+ flavorDimensions "appstore"
+
+ productFlavors {
+   googlePlay {
+     dimension "appstore"
+     missingDimensionStrategy "store", "play"
+   }
+
+   amazon {
+     dimension "appstore"
+     missingDimensionStrategy "store", "amazon"
+   }
+ }
}
```

And your are now good to go!

## Manual installation

### `iOS`

1. Open up `ios/Podfile`
2. Add `pod 'RNIap', :path => '../node_modules/react-native-iap'`
3. Run `pod install`

### `Android`

1. Open up `android/app/src/main/java/[...]/MainApplication.java`
2. Add `import com.dooboolab.RNIap.RNIapPackage;` at the top of the file.
3. Add `new RNIapPackage()` to the list returned by the `getPackages()` method

4. Append the following lines to `android/settings.gradle`:

```diff
+ include ':react-native-iap'
+ project(':react-native-iap').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-iap/android')
```

5. Insert the following lines inside the dependencies block in `android/app/build.gradle`:

```diff
+ implementation project(':react-native-iap')
```

6. Finally [configure the payment provider](#configure-the-payment-provider) described above.

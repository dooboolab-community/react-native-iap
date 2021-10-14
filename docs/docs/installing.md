---
sidebar_position: 2
---

# Installing

## Using `react-native>0.60`

### Install the package into your React Native Project.

```shell
npm install --save react-native-iap
```

The package will be linked automatically using autolinking.
Then follow the instructions below depending on the platform you're working with:

### Post Installation

- **iOS Platform:**

  Install cocoa pods: `cd ios && pod install`

  Also, add [swift bridging header](https://stackoverflow.com/questions/31716413/xcode-not-automatically-creating-bridging-header) if you haven't created one for `swift` compatibility.

  <img width="800" alt="1" src="https://user-images.githubusercontent.com/27461460/111863065-8be6e300-899c-11eb-8ad8-6811e0bd0fbd.png"/>

- **Android Platform with Android Support:**

  Modify your **android/build.gradle** configuration:

  ```
  buildscript {
    ext {
      buildToolsVersion = "28.0.3"
      minSdkVersion = 21
      compileSdkVersion = 28
      targetSdkVersion = 28
      # Only using Android Support libraries
      supportLibVersion = "28.0.0"
    }
  ```

  note: Using [Jetifier tool](https://github.com/mikehardy/jetifier) for backward-compatibility.

- **Android Platform with AndroidX:**

  Modify your **android/build.gradle** configuration:

  ```
  buildscript {
    ext {
      buildToolsVersion = "28.0.3"
      minSdkVersion = 21
      compileSdkVersion = 28
      targetSdkVersion = 28
      # Remove 'supportLibVersion' property and put specific versions for AndroidX libraries
      androidXAnnotation = "1.1.0"
      androidXBrowser = "1.0.0"
      // Put here other AndroidX dependencies
    }
  ```

  You have two options depending on the stores you support:

  a. If you only need for Google Play IAP, Insert this inside the `defaultConfig` section in `android/app/build.gradle`:

  ```gradle
  defaultConfig {
        ...
        // react-native-iap: we only use the Google Play flavor
        missingDimensionStrategy 'store', 'play'
    }
  ```

  b. If you are using it for both Google Play and Amazon, insert the following lines inside the `android` block in `android/app/build.gradle`

  ```gradle
  android {
    ...
    flavorDimensions "appstore"
    productFlavors{
        googlePlay{
            dimension "appstore"
            missingDimensionStrategy "store", "play"
        }
        amazon{
            dimension "appstore"
            missingDimensionStrategy "store", "amazon"
        }
    }
  }
  ```

  Lastly, you need to enable `kotlin` from `react-native-iap@8.0.0+`. Please change the line below in `android/build.gradle`.

  ```diff
  buildscript {
    ext {
        buildToolsVersion = "29.0.3"
  +     // Note: Below change is necessary for pause / resume audio feature. Not for Kotlin.
  +     minSdkVersion = 24
        compileSdkVersion = 29
        targetSdkVersion = 29
  +     kotlinVersion = '1.5.0'

        ndkVersion = "20.1.5948944"
    }
    repositories {
        google()
        jcenter()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:4.1.0")
  +     classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion"
    }
  ...
  ```

## Using `react-native<=0.60`

Follow the steps above and then link the package using:

```
react-native link react-native-iap
```

## Manual install

Refer to [Manual installation](./manual_install).

## Upgrading from older versions

### Upgrading to 6.1.0

On Android, follow step 3 of the [Manual Installation](./manual_install) instructions.

### Upgrading to 3.4.0

- Upgrade to the new [purchase flow](./usage_instructions/purchase).
- There is no longer any need to call endConnection on Android as this is done automatically.

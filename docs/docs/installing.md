---
sidebar_position: 2
---


# Installing

## Using `react-native>0.60`

1. Install the package into your React Native Project.

```shell
npm install --save react-native-iap
```
The package will be linked automatically using autolinking.
Then follow the instructions below depending on the platform you're working with:

- **iOS Platform:**

  Install cocoa pods: `cd ios && pod install` 

- **Android Platform with Android Support:**

  Modify your **android/build.gradle** configuration:
  ```
  buildscript {
    ext {
      buildToolsVersion = "28.0.3"
      minSdkVersion = 16
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
      minSdkVersion = 16
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

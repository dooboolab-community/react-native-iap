# Migrating to 12.0.0
This migration will focus on integrating the latest store sdk for Amazon

# AndroidManifest

add `android:exported="true"` to `ResponseReceiver`

# build.gradle

change your `targetSdk` and `compileSdk` to match the expected Amazon SDK values. Note that these will likely be different from your google Play target
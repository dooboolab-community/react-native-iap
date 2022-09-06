# `presentCodeRedemptionSheetIOS`

Displays a sheet that enables users to redeem subscription offer codes that you generated in App Store Connect.

Availability: `iOS 14.0+`

## Signature

```ts
presentCodeRedemptionSheetIOS(): Promise<null>;
```

## Usage

```tsx
import React from 'react';
import {Button} from 'react-native';
import {presentCodeRedemptionSheetIOS} from 'react-native-iap';

const App = () => {
  const handleRedemption = async () => {
    await presentCodeRedemptionSheetIOS();
  }

  return (
    <Button title="Redeem" onPress={handleRedemption} />
  )
}
```

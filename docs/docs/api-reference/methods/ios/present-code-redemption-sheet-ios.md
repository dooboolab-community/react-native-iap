# `presentCodeRedemptionSheetIOS`

Displays a sheet that enables users to redeem subscription offer codes that you generated in App Store Connect.

Availability: `iOS 14.0+`

## Signature

```ts
presentCodeRedemptionSheetIOS(): Promise<null>;
```

## Usage

```tsx
import {presentCodeRedemptionSheetIOS} from 'react-native-iap';

const handleRedemption = async () => {
  await presentCodeRedemptionSheetIOS();
}
```

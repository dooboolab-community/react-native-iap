---
sidebar_position: 2
---

# `endConnection`

End the In-App Purchases module connection.

## Signature

```ts
endConnection(): Promise<boolean>;
```

## Usage

```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {endConnection} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    return () => {
      void endConnection();
    };
  }, []);

  return <View />;
};
```

---
sidebar_position: 1
---

# `initConnection`

Initialize the module connection for In-App Purchases.

## Signature

```ts
initConnection(): Promise<boolean>;
```

## Usage

```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {initConnection} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    void initConnection();
  }, []);

  return <View />;
};
```

---
sidebar_position: 1
---

# `initConnection`

Init the connection with the IAP module.

On Android this can be called to preload the connection to Play Services. True means the Native SDK was initialized successfully.

On iOS, it will simply call `canMakePayments` method and return value which is required for the listeners to work properly.

## Signature

```ts
initConnection(): Promise<boolean>;
```

## Usage

```tsx
import {useEffect} from 'react';
import {initConnection} from 'react-native-iap';

useEffect(() => {
  void initConnection();
}, []);
```

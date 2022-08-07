---
sidebar_position: 2
---

# `endConnection`

End module for purchase flow.

## Signature

```ts
endConnection(): Promise<boolean>;
```

## Usage

```tsx
import {useEffect} from 'react';
import {endConnection} from 'react-native-iap';

useEffect(() => {
  return () => {
    void endConnection();
  };
}, []);
```

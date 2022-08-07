---
sidebar_position: 4
---

# Restoring purchases

You can use `getAvailablePurchases()` to do what's commonly understood as “restoring” purchases.

If for debugging you want to consume all items, you have to iterate over the purchases returned by `getAvailablePurchases()`. Beware that if you consume an item without having recorded the purchase in your database the user may have paid for something without getting it delivered and you will have no way to recover the receipt to validate and restore their purchase.

```ts
getPurchases = async () => {
  try {
    const purchases = await RNIap.getAvailablePurchases();
    const newState = {premium: false, ads: true};
    let restoredTitles = [];

    purchases.forEach((purchase) => {
      switch (purchase.productId) {
        case 'com.example.premium':
          newState.premium = true;
          restoredTitles.push('Premium Version');
          break;

        case 'com.example.no_ads':
          newState.ads = false;
          restoredTitles.push('No Ads');
          break;

        case 'com.example.coins100':
          await RNIap.finishTransaction(purchase.purchaseToken);
          CoinStore.addCoins(100);
      }
    });

    Alert.alert(
      'Restore Successful',
      'You successfully restored the following purchases: ' +
        restoredTitles.join(', '),
    );
  } catch (error) {
    console.warn(error); // standardized error.code and error.message available
    Alert.alert(error.message);
  }
};
```

Each item from `getAvailablePurchases()` contains a [AvailablePurchase object](../api_reference/available_purchase).

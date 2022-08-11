# Product

> All the following properties are `String`

| Property                                 | iOS | And | Comment                                                                                                                    |
| ---------------------------------------- | :-: | :-: | -------------------------------------------------------------------------------------------------------------------------- |
| `price`                                  |  ✓  |  ✓  | Localized price string, with only number (eg. `1.99`).                                                                     |
| `productId`                              |  ✓  |  ✓  | Returns a string needed to purchase the item later.                                                                        |
| `currency`                               |  ✓  |  ✓  | Returns the currency code.                                                                                                 |
| `countryCode`                            |  ✓  |     | Returns the store country code.                                                                                            |
| `localizedPrice`                         |  ✓  |  ✓  | Localized price string, with number and currency symbol (eg. `$1.99`).                                                     |
| `title`                                  |  ✓  |  ✓  | Returns the title Android and localizedTitle on iOS.                                                                       |
| `description`                            |  ✓  |  ✓  | Returns the localized description on Android and iOS.                                                                      |
| `introductoryPrice`                      |  ✓  |  ✓  | Formatted introductory price of a subscription, including its currency sign, such as €3.99. The price doesn't include tax. |
| `introductoryPriceAsAmountIOS`           |  ✓  |     | Localized introductory price string, with only number (eg. `0.99`).                                                        |
| `introductoryPricePaymentModeIOS`        |  ✓  |     | The payment mode for this product discount.                                                                                |
| `introductoryPriceNumberOfPeriods`       |  ✓  |     | An integer that indicates the number of periods the product discount is available.                                         |
| `introductoryPriceNumberOfPeriodsIOS`    |  ✓  |     | An integer that indicates the number of periods the product discount is available.                                         |
| `introductoryPriceSubscriptionPeriod`    |  ✓  |     | An object that defines the period for the product discount.                                                                |
| `introductoryPriceSubscriptionPeriodIOS` |  ✓  |     | An object that defines the period for the product discount.                                                                |
| `subscriptionPeriodNumberIOS`            |  ✓  |     | The period number (in string) of subscription period.                                                                      |
| `subscriptionPeriodUnitIOS`              |  ✓  |     | The period unit in `DAY`, `WEEK`, `MONTH` or `YEAR`.                                                                       |

# `validateReceiptAmazon`

Validate receipt.

## Signature

```ts
validateReceiptAmazon(
  /** From the Amazon developer console */
  developerSecret: string,

  /** Who purchased the item. */
  userId: string,

  /** Long obfuscated string returned when purchasing the item */
  receiptId: string,

  /** Defaults to true, use sandbox environment or production. */
  useSandbox: boolean = true,
): Promise<AmazonReceiptType>;
```

## Usage

[react-native-iap](../..) / [Exports](../modules.md) / PurchaseError

# Class: PurchaseError

## Implements

- `Error`

## Table of contents

### Constructors

- [constructor](PurchaseError.md#constructor)

### Properties

- [code](PurchaseError.md#code)
- [debugMessage](PurchaseError.md#debugmessage)
- [message](PurchaseError.md#message)
- [name](PurchaseError.md#name)
- [productId](PurchaseError.md#productid)
- [responseCode](PurchaseError.md#responsecode)

## Constructors

### constructor

• **new PurchaseError**(`name`, `message`, `responseCode?`, `debugMessage?`, `code?`, `productId?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `message` | `string` |
| `responseCode?` | `number` |
| `debugMessage?` | `string` |
| `code?` | [`ErrorCode`](../enums/ErrorCode.md) |
| `productId?` | `string` |

#### Defined in

[purchaseError.ts:21](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/purchaseError.ts#L21)

## Properties

### code

• `Optional` **code**: [`ErrorCode`](../enums/ErrorCode.md)

#### Defined in

[purchaseError.ts:26](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/purchaseError.ts#L26)

___

### debugMessage

• `Optional` **debugMessage**: `string`

#### Defined in

[purchaseError.ts:25](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/purchaseError.ts#L25)

___

### message

• **message**: `string`

#### Implementation of

Error.message

#### Defined in

[purchaseError.ts:23](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/purchaseError.ts#L23)

___

### name

• **name**: `string`

#### Implementation of

Error.name

#### Defined in

[purchaseError.ts:22](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/purchaseError.ts#L22)

___

### productId

• `Optional` **productId**: `string`

#### Defined in

[purchaseError.ts:27](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/purchaseError.ts#L27)

___

### responseCode

• `Optional` **responseCode**: `number`

#### Defined in

[purchaseError.ts:24](https://github.com/dooboolab/react-native-iap/blob/fd959a5/src/purchaseError.ts#L24)

# Migrating to 10.x.x

Starting with 10.0.0, the parameters to some of the methods are now objects instead of positional parameters.

## Before

```ts
getProducts(['my_sku']);
```

## After

```ts
getProducts({skus: ['my_sku']});
```

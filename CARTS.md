# Carts

## Lifecycle

1. On first access, `/carts/me` creates an empty cart for the user if none exists.
2. Users add items via `POST /carts/items` with `{ productId, quantity? }`.
3. Quantities can be updated via `PATCH /carts/items` and items removed via `DELETE /carts/items/:productId`.
4. `DELETE /carts/clear` empties the cart.
5. Checkout converts the cart to an order, clearing the cart.

## Responses

All cart mutations return:
```
{
  "cart": { "userId", "items": [ { productId, title, thumbnail, price, quantity } ] },
  "totals": { "totalQuantity": 3, "totalPrice": 74.97 }
}
```

## Pricing Source

`price` is read from `product.body.price` when adding to cart. Ensure products include a numeric price.

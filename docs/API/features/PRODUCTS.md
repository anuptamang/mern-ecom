# Products

## Schema (server/models/product.js)

Key fields:
- `title: String`
- `body: Object` (include `price` and `summary` here)
- `thumbnail: String` (URL to image)
- `categories: string[]`, `tag: string[]`
- `likes: number`, `views: number`
- `comments: [{ text, userId, likes, replies[] }]`

## Pricing

For this project, price is read from `body.price`. Ensure your product creation/seeding provides that field.

## Seeding Example

```
POST /products (multipart/form-data)
fields:
  title = "Wireless Mouse"
  body = {"summary":"Ergonomic 2.4GHz wireless mouse","price":24.99}
  categories = ["electronics"]
  tag = ["mouse","wireless"]
  slug = "wireless-mouse"
  thumbnail = <file>
```

## Retrieval

- List: `GET /products?page=1`
- Single: `GET /products/:id`
- View count: `PATCH /products/:id/viewcount`
- Likes: `PUT /products/:id/like` / `DELETE /products/:id/like`

## Comments

- Add: `POST /products/:id/comments` with `{ text, userId }`
- List: `GET /products/:id/comments`
- Like comment: `PATCH /products/:id/comments/:commentId/like`
- Reply: `PATCH /products/:id/comments/:commentId/reply` with `{ text }`

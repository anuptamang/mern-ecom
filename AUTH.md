# Authentication

## Overview

- JWT-based auth with `/user/login` and `/user/register`.
- Token contains `{ email, id }` and expires in 24h.
- Client stores token and sends it in `Authorization: Bearer <token>` header.

## Endpoints

- POST `/user/login`
  - Body: `{ email, password }`
  - Response: `{ result: { _id, fullName, email, role }, token }`

- POST `/user/register`
  - Body: `{ email, password, confirmPassword, firstName, lastName, role }`
  - Response: same as login

- POST `/user/check-user` — verify if email exists
- PUT `/user/change-password` — set new password for a given email

## Client Usage

- Decode and validate token on app start.
- Protect routes with `PrivateRoute` and `useAuth`.
- Persist token to local storage and clear on logout.

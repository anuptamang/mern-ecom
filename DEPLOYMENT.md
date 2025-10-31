# Deployment

## Environment Variables

Server (`server/.env`):
- `PORT` — default 3010
- `MONGODB` — MongoDB connection string
- `STRIPE_SECRET_KEY` — Stripe secret key

Client (`client/.env`):
- `REACT_APP_BACKEND_API_URL` — server base URL
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key

## Production Build

- Backend: ensure Node LTS and install with `npm ci`; run `node index.js` (or a process manager like PM2)
- Frontend: `npm run build` in `client/`; serve `build/` with a static host or behind your backend/reverse proxy

## CORS

- Update CORS policy as needed for your frontend domain.

## SSL

- Use HTTPS in production; configure reverse proxy (Nginx/Apache) and set secure Stripe keys.

## MongoDB

- Use a managed database (Atlas) with IP whitelisting and user-scoped credentials.

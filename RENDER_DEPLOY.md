# Deploy PHIMHAY lên Render (1 Web Service)

## Render Dashboard

| Field | Value |
|-------|--------|
| **Root Directory** | *(empty = repo root)* |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |

Hoặc dùng full build:

```bash
npm install && npm install --prefix server && npm install --prefix client --include=dev && npm run build --prefix client
```

Start: `npm start --prefix server`

## Environment variables

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | long random string |
| `CLIENT_URL` | `https://your-app.onrender.com` |
| `VNP_RETURN_URL` | `https://your-app.onrender.com/api/payment/vnpay-return` |
| `INITIAL_ADMIN_SECRET` | optional |
| `VNP_TMN_CODE`, `VNP_HASH_SECRET`, ... | if using VNPay |

Do **not** set `VITE_API_URL` — frontend calls `/api` on the same host.

## MongoDB Atlas

Network Access → allow `0.0.0.0/0` for Render.

## After deploy

1. `https://your-app.onrender.com` → React app
2. `https://your-app.onrender.com/api/health` → `{ ok: true, mongo: true }`
3. Deep links (e.g. `/admin/users`) work via SPA fallback

## Blueprint

Repo includes [`render.yaml`](render.yaml) for Render Blueprint deploy.

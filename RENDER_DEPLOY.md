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

## Troubleshooting: "Exited with status 1"

Build OK but deploy crashes → check **Logs** for `[FATAL]`:

| Log message | Fix |
|-------------|-----|
| `MONGODB_URI is not set` | Render → Environment → add `MONGODB_URI` (Atlas URI) |
| `JWT_SECRET is not set` | Add `JWT_SECRET` (random string, not empty) |
| `MongoDB connection failed` | Atlas → Network Access → `0.0.0.0/0`; verify username/password in URI |
| `Cannot find module` | Start Command must be `npm start` (root) or `cd server && npm start` |

**Required env on Render:**

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-string>
CLIENT_URL=https://your-app.onrender.com
VNP_RETURN_URL=https://your-app.onrender.com/api/payment/vnpay-return
```

**Start Command:** `npm start`  
**Build Command:** `npm install && npm install --prefix server && npm install --prefix client --include=dev && npm run build --prefix client`

Do **not** use `node server/index.js` — entry file is `server/src/index.js`.

## Blueprint

Repo includes [`render.yaml`](render.yaml) for Render Blueprint deploy.

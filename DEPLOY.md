# Deploy BuildLink (frontend + API + MongoDB)

You need three pieces in production:

1. **MongoDB** — [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier is fine). Create a cluster, database user, and get a connection string. Use **Network Access → allow** `0.0.0.0/0` for Render (or add Render outbound IPs).

2. **Backend (Node/Express)** — e.g. [Render](https://render.com) Web Service.
   - Root directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Environment variables:

     | Key | Example |
     |-----|---------|
     | `NODE_ENV` | `production` |
     | `MONGO_URI` | `mongodb+srv://USER:PASS@cluster.mongodb.net/buildlink` |
     | `JWT_SECRET` | long random string |
     | `JWT_REFRESH_SECRET` | different long random string |
     | `JWT_EXPIRE` | `15m` |
     | `JWT_REFRESH_EXPIRE` | `7d` |
     | `FRONTEND_URL` | `https://your-app.vercel.app` |
     | `ALLOWED_ORIGINS` | same as Vercel URL (and `www` if used), comma-separated |

3. **Frontend (static)** — e.g. [Vercel](https://vercel.com).
   - Import this repo; **framework**: Other; **root**: repository root (not `backend`).
   - No build command required (see `vercel.json`).

After the API is live, set your deployed API URL in **`index.html`**:

```html
<meta name="buildlink-api-base" content="https://YOUR-API.onrender.com">
```

Use the **origin only** (no `/api` path); the app appends `/api` automatically.

Redeploy the frontend after editing. Signup/login will call `https://YOUR-API.onrender.com/api/...`.

### Checklist

- [ ] Atlas cluster reachable from Render
- [ ] Backend `/health` returns JSON in browser
- [ ] `FRONTEND_URL` and `ALLOWED_ORIGINS` match your Vercel URL exactly (including `https://`)
- [ ] `buildlink-api-base` meta matches API origin
- [ ] JWT secrets are strong and not committed to git

### Optional

- Blueprint file: `backend/render.yaml` — adjust `name` and connect repo in Render Dashboard → Blueprints.

# Deploy Client and Server Separately on Render

This guide explains how to deploy the **frontend (client)** and **backend (server)** as **two different services** on Render: one **Static Site** for the React app and one **Web Service** for the Node API.

---

## Overview

| Service | Type on Render | Root directory | What it does |
|--------|----------------|----------------|--------------|
| **Client** | Static Site | `client` | Serves the React app. Calls the server API using `VITE_API_URL`. |
| **Server** | Web Service | `server` | Node/Express API only. Set `API_ONLY=true` so it does not serve static files. |

You will get two URLs, for example:
- **Client:** `https://client-earn.onrender.com`
- **Server:** `https://earntask-api.onrender.com` (API at `https://earntask-api.onrender.com/api/...`)

---

## Prerequisites

- [Render](https://render.com) account
- [MongoDB Atlas](https://www.mongodb.com/atlas) (or another MongoDB) for the server
- Repo connected to GitHub/GitLab

---

## Step 1: Deploy the server (API only)

1. In Render: **New +** → **Web Service**.
2. Connect the repo and select it.
3. Configure:
   - **Name:** e.g. `earntask-api`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance:** Free or Starter
4. **Environment** variables (add in the Environment tab):

   | Key | Value |
   |-----|--------|
   | `NODE_ENV` | `production` |
   | `API_ONLY` | `true` |
   | `CLIENT_URL` | Your **client** URL (e.g. `https://client-earn.onrender.com`) — **set this after you create the client** |
   | `MONGODB_URI` | MongoDB connection string (e.g. Atlas `mongodb+srv://...`) |
   | `JWT_SECRET` | Long random string (e.g. `openssl rand -hex 32`) |
   | `ADMIN_EMAIL` | (optional) Admin login email |
   | `ADMIN_PASSWORD` | (optional) Admin password |

5. Create Web Service. Note the server URL (e.g. `https://earntask-api.onrender.com`).

---

## Step 2: Deploy the client (static site)

1. In Render: **New +** → **Static Site**.
2. Connect the **same** repo and select it.
3. Configure:
   - **Name:** e.g. `client-earn`
   - **Root Directory:** `client` (must be `client`, not server)
   - **Build Command:** `npm install --include=dev && npm run build`
   - **Publish Directory:** `dist` (must be `dist`, **not** `public`)
4. **Environment** variables (so the client knows where the API is):

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | Your **server** URL with no trailing slash (e.g. `https://earntask-api.onrender.com`) |

   The app will call `https://earntask-api.onrender.com/api/...` for all API requests.

5. Create Static Site.

---

## Step 3: Point client and server at each other

1. **Server:** In the **server** service (Web Service), open **Environment** and set:
   - `CLIENT_URL` = your **client** URL, e.g. `https://client-earn.onrender.com`  
   (so CORS allows the frontend origin.)
2. **Client:** Already has `VITE_API_URL` = server URL from Step 2.
3. Redeploy the server after setting `CLIENT_URL` so CORS takes effect.

---

## Summary checklist

**Server (Web Service)**  
- Root: `server`  
- Build: `npm install`  
- Start: `npm start`  
- Env: `NODE_ENV=production`, `API_ONLY=true`, `CLIENT_URL=https://client-earn.onrender.com`, `MONGODB_URI`, `JWT_SECRET`, etc.

**Client (Static Site)**  
- Root: `client`  
- Build: `npm install --include=dev && npm run build`  
- Publish: `dist`  
- Env: `VITE_API_URL=https://earntask-api.onrender.com`

---

## Optional: Health check (server)

In the server Web Service → **Settings** → **Health Check Path**, set:

`/api/health`

---

## Troubleshooting

- **"Publish directory dist does not exist!"**  
  - If **Root Directory** is **`client`**: Build outputs to `client/dist/`. Set **Publish Directory** to **`dist`**. Push latest code and redeploy (client build now uses `--outDir dist`).
  - If **Root Directory** is **`server`**: Use **Publish Directory** **`dist`**. The server build script copies the client build into both `server/public` and `server/dist`, so `dist` will exist after build. Push latest code and redeploy.

- **CORS errors in browser:** Set `CLIENT_URL` on the **server** to the exact client URL (no trailing slash), e.g. `https://client-earn.onrender.com`, then redeploy.
- **API 404 / wrong URL:** Ensure the **client** has `VITE_API_URL` set to the **server** URL (no trailing slash). Rebuild and redeploy the client after changing it.
- **Server serves a blank page or wrong content:** Confirm `API_ONLY=true` is set on the server so it does not try to serve the React app.

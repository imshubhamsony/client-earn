# Deploy EarnTask to Render

This guide walks you through deploying this project to [Render](https://render.com) using the included `render.yaml` Blueprint.

---

## Prerequisites

- A [Render](https://render.com) account (free tier works)
- A **MongoDB** database (Render doesn’t host MongoDB; use [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- Your code pushed to **GitHub** or **GitLab**

---

## 1. MongoDB (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free cluster.
2. Create a database user (username + password).
3. In **Network Access**, add `0.0.0.0/0` so Render can connect (or restrict to Render IPs if you prefer).
4. In **Database → Connect**, choose **Connect your application** and copy the connection string.  
   It looks like:  
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/DATABASE?retryWrites=true&w=majority`  
   Replace `USER`, `PASSWORD`, and optionally `DATABASE` (e.g. `earntask`).

---

## 2. Deploy on Render with Blueprint

1. Log in at [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your **GitHub/GitLab** account if needed, then select the **client-earn** repository.
4. Render will detect `render.yaml`. Click **Apply**.
5. After the Blueprint is applied, open your new **earntask** web service.
6. Go to the **Environment** tab and add these variables (Blueprint may have created some; fill or edit as below):

   | Key             | Value / Notes |
   |-----------------|----------------|
   | `MONGODB_URI`   | Your Atlas connection string from step 1. |
   | `JWT_SECRET`    | If not auto-generated, use a long random string (e.g. `openssl rand -hex 32`). |
   | `CLIENT_URL`    | Your Render app URL, e.g. `https://earntask.onrender.com` (see the service’s URL on Render). |
   | `ADMIN_EMAIL`   | (Optional) Admin login email. |
   | `ADMIN_PASSWORD`| (Optional) Strong admin password. |

   Other vars (e.g. `JWT_EXPIRES_IN`, `SIGNUP_BONUS`, `TASK_REWARD`, `REFERRAL_BONUS`, `MIN_WITHDRAWAL`) are optional; defaults are in `server/.env.example`.

7. Save. Render will redeploy if needed. The first deploy runs:
   - **Build:** `npm run build && npm run build:server` (builds React into `server/public`, installs server deps).
   - **Start:** `npm start` (runs the Node server; Render sets `PORT` automatically).

---

## 3. Deploy without Blueprint (manual service)

If you prefer to create the service by hand:

1. **New +** → **Web Service**.
2. Connect the **client-earn** repo and select it.
3. Configure:
   - **Runtime:** Node.
   - **Build Command:** `npm run build && npm run build:server`
   - **Start Command:** `npm start`
   - **Instance type:** Free (or Starter/paid).
4. Add the same **Environment** variables as in the table above.
5. Create Web Service. Render will build and start the app.

---

## 4. After deploy

- App URL: `https://<your-service-name>.onrender.com`
- API: `https://<your-service-name>.onrender.com/api/...`
- Health: `https://<your-service-name>.onrender.com/api/health`

**Seed admin user (optional):** Render doesn’t run one-off scripts by default. To seed the admin, either:

- Run locally with `MONGODB_URI` set to the same Atlas DB:  
  `cd server && node src/scripts/seedAdmin.js`
- Or use Render **Shell** (if available on your plan): open the service → **Shell** tab and run the same command there.

---

## 5. Free tier notes

- Service may spin down after ~15 minutes of no traffic; first request can be slow (cold start).
- For always-on or better performance, use a paid plan (e.g. Starter).

---

## Files used for Render

| File         | Purpose |
|-------------|---------|
| `render.yaml` | Blueprint: web service, build/start commands, health check, env var placeholders. |
| `package.json` (root) | Scripts: `build`, `build:server`, `start`. |
| `server/.env.example` | Reference for env vars (do not put secrets in repo). |

If you use a different branch, set the **Branch** in the Render service (or in the Blueprint’s `branch` field in `render.yaml`).

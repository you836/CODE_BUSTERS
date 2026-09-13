# 🛡️ Google OAuth Deployment & Configuration Guide

This guide explains how to configure and activate **Google OAuth Authentication** for both your **deployed production application** (e.g. Vercel, Netlify, Render, Railway) and **local development**.

---

## 1. Google Cloud Console Setup

### Step 1: Create or Select a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one (e.g., `life-rpg-production`).

### Step 2: Configure OAuth Consent Screen
1. Navigate to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (unless you have a Google Workspace organization) and click **Create**.
3. Fill in the required fields:
   - **App name**: `Life RPG`
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue** through Scopes (default scopes `email`, `profile`, `openid` are sufficient).
5. In **Test users**, add your own Google email address while the app is in testing mode.

### Step 3: Create OAuth 2.0 Client ID
1. Navigate to **APIs & Services** > **Credentials**.
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
3. Select **Web application** as the application type.
4. Set the name to `Life RPG Web Client`.
5. Under **Authorized JavaScript origins**, add:
   - For Localhost:
     - `http://localhost:5173`
     - `http://localhost:5001`
   - For Deployed Production:
     - `https://<your-frontend-domain>.vercel.app` (or your Netlify/custom domain URL, e.g. `https://liferpg.app`)
     - *Note: Do NOT include trailing slashes (e.g., use `https://my-app.vercel.app`, not `https://my-app.vercel.app/`).*
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173`
   - `https://<your-frontend-domain>.vercel.app`
7. Click **Create**.
8. Copy your **Client ID** (looks like `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`).

---

## 2. Environment Variables Configuration

### Frontend (`client`)
Add the following to your production environment variables (e.g., on Vercel or Netlify project settings) and your local `client/.env`:

```env
# Google OAuth Client ID from Google Cloud Console
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com

# Backend API URL
# In local development: /api (handled by Vite dev proxy)
# In production: https://<your-backend-domain>.onrender.com/api (or /api if using domain routing/rewrites)
VITE_API_URL=/api
```

### Backend (`server`)
Add the following to your production environment variables (e.g., on Render, Railway, or Heroku dashboard) and your local `server/.env`:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/liferpg
JWT_SECRET=your_secure_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth Client ID (must match frontend Client ID)
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

---

## 3. How the Deployed Architecture Operates

```text
  [ User Browser ]
        │
        ▼
  [ React Client ]  ──(Google Login Popup)──▶  [ Google Identity Services ]
        │                                                  │
        │◀────────── Signed ID Token (JWT) ────────────────│
        │
        ▼ (POST /api/auth/google)
  [ Express Backend ]
        │
        ├── Cryptographically verifies ID token via Google JWKS (google-auth-library)
        ├── Extracts email, sub (Google ID), name, and picture
        ├── Finds or creates user in MongoDB / persistence layer
        ├── Seeds starter quests for newly forged heroes
        └── Signs & issues Life RPG session JWT
        │
        ▼
  [ Authenticated Hero Realm ]
```

### Why this avoids cross-domain deployment issues:
- **No Third-Party Cookie Blocking**: Unlike legacy redirect/cookie session systems, this flow uses Google's ID token verification and stateless Bearer JWTs stored in `localStorage`.
- **Cross-Domain Safety**: Works flawlessly even when the client is hosted on Vercel (`*.vercel.app`) and the server is on Render/Railway (`*.onrender.com`).
- **Zero-Crash Resilience**: If `VITE_GOOGLE_CLIENT_ID` is missing or in transit during deployment, the client UI gracefully switches to a setup indicator without interrupting email/password login or the 1-Click Demo Adventurer.

---

## 4. Testing Locally

1. Copy `client/.env.example` to `client/.env` and paste your `VITE_GOOGLE_CLIENT_ID`.
2. Copy `server/.env.example` to `server/.env` and paste your `GOOGLE_CLIENT_ID` (plus `MONGODB_URI` and `JWT_SECRET`).
3. Start the server:
   ```bash
   cd server
   npm run dev
   ```
4. Start the client:
   ```bash
   cd client
   npm run dev
   ```
5. Open `http://localhost:5173` and click **Continue with Google** to sign in!

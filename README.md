# Mini Job Board (Netlify)

A tiny job board you can host on Netlify. Public page lists open roles. Private `/admin` lets you add/delete roles.

## Prereqs
- Node.js 18+ and npm
- Netlify account (free tier is fine)
- GitHub (recommended)

## Local setup
```bash
npm install
npm run dev
```
Visit http://localhost:5173

> The API is proxied at `/api/jobs` and runs on Netlify when deployed. For full local parity, install Netlify CLI and run `netlify dev`.

## Deploy to Netlify
1. **Create a new repo** on GitHub and push this project.
2. In the **Netlify** UI: *Add new site → Import from Git* → select your repo.
3. Netlify will auto-detect Vite.
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
4. In **Site settings → Environment variables**, add:
   - Key: `ADMIN_TOKEN` → Value: a long random string (this is your private admin password for API).
5. **Deploy**.

Once deployed, your public roles live at your site root. Admin lives at `/admin`.

## How to use
- Share the public link (e.g., `https://your-site.netlify.app/`) in your email signature or LinkedIn.
- To post/delete roles, go to `/admin`, enter the **Admin Token** you set in Netlify, then add/delete roles.
- Data persists in **Netlify Blobs** under a store called `jobs-store` and a single key `all-jobs`.

## Notes
- The Admin Token is only checked **server-side** in the function; it is **not** baked into the front-end build.
- For a real auth flow (multi-user, roles), consider Netlify Identity or an external auth provider.

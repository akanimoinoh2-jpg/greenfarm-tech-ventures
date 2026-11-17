# Greenfarm content service

The Node service stores the editable CEO profile, portrait, and administrator-managed work entries under `server/data/`. Managed work metadata is stored in `work.json` and uploaded photos are kept in `work-photos/`. This directory is intentionally ignored by Git; back it up and persist it between deployments if edits must survive restarts or redeployments.

## Local development

Requires Node.js 22.9 or newer. Copy `.env.example` to `.env`, set a unique administrator password of at least 12 characters, then run:

```powershell
npm run server
```

In another terminal, run `npm run dev`. Vite forwards `/api` requests to the Node service on `127.0.0.1:3001`. To use another service port, set `PORT` and update `vite.config.js` to match.

The public gallery reads managed entries from `GET /api/work`; its photo URLs use `GET /api/work/:id/photo`. After signing in, administrators can create entries with `POST /api/admin/work`, edit them with `PUT /api/admin/work/:id`, or delete them with `DELETE /api/admin/work/:id`. Changes require the existing administrator session and trusted-origin check. Titles are limited to 100 characters, categories to 80, accessible image descriptions to 240, and each JPG, PNG, or WebP upload to 5 MB. Entries and their image files are stored on disk, not in browser storage.

## Deployment

Configure `ADMIN_PASSWORD` and `PORT` in the hosting environment. Deploy the React build with a same-origin `/api` reverse proxy to this Node service, provide persistent storage for `server/data/`, and use HTTPS so the administrator session cookie is marked Secure. Configure the web host to return the SPA entry point for direct `/admin` navigation. Do not expose the service on an untrusted public network without HTTPS and appropriate network controls.

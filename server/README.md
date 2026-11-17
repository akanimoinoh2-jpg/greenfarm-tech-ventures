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

The Vercel deployment uses the serverless API in `api/[...path].js`; the Node service in this directory is for local development and is not deployed as a long-running Vercel server.

Before deploying to Vercel:

1. Create a **private** Vercel Blob store and connect it to this project. Enable the read-write token environment variable for the connection; browser photo uploads need `BLOB_READ_WRITE_TOKEN`.
2. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in the Vercel project's Production and Preview environment variables. Use a unique password of at least 12 characters and a separate random session secret.
3. Redeploy after connecting storage and adding the variables.

The API persists profile and work metadata in a private Blob object and serves uploaded photos through same-origin API routes. Vercel rewrites direct `/admin` visits to the app entry point. Local development continues to use `npm run server` and the Vite `/api` proxy; Vercel Blob is not required locally.

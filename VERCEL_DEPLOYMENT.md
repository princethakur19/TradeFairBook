# Vercel Deployment

This repo deploys as one Vercel project:

- `frontend` builds with Vite and serves the React app.
- `backend/server.js` runs as the serverless Express API.
- Requests to `/api/*` are routed to the backend.

## Required Environment Variables

Add these in Vercel Project Settings > Environment Variables for Production and Preview:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<long-random-secret>
AADHAR_ENCRYPTION_KEY=<long-random-secret>
FRONTEND_URL=https://<your-vercel-domain>
USE_FALLBACK_DATA=true
```

`VITE_API_URL` is optional when frontend and backend are deployed in this same Vercel project. The frontend will use `/api` automatically.

Set `USE_FALLBACK_DATA=false` after MongoDB Atlas credentials are correct and your seed data has been added.

If you deploy frontend and backend as separate projects, add this to the frontend project:

```env
VITE_API_URL=https://<backend-vercel-domain>/api
```

And add this to the backend project:

```env
FRONTEND_URL=https://<frontend-vercel-domain>
```

## MongoDB Atlas Checks

If the backend shows `MongoParseError: option retrywrites is not supported`, make sure the URI uses the exact option name:

```env
retryWrites=true
```

If the backend shows `bad auth : authentication failed`, the URI format is valid but the Atlas username or password is wrong. Update `MONGO_URI` in Vercel and redeploy.

If the backend shows an IP access error, add Vercel access in MongoDB Atlas Network Access. For quick testing, Atlas allows `0.0.0.0/0`, but a tighter allowlist is better for production.

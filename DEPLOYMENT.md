Deployment steps

Frontend (Vercel):

1. Log into Vercel and create a new project.
2. Import your Git repository and set the root to `frontend`.
3. Set the framework to `Other` or `Angular` if available.
4. Build command: `npm run build`.
5. Output directory: `frontend/dist/Alejandro-Voutsina-TP2-PROG4-2026-C1` (verify after first build).
6. Set an Environment Variable `API_URL` if you prefer not to commit it; otherwise the frontend currently uses the hardcoded URL in `frontend/src/environments/environments.ts`.
7. Deploy. After deployment, the site will be available at `https://<your-vercel-domain>.vercel.app`.

Backend (Render):

1. Log into Render and create a new Web Service.
2. Connect your Git repository and select the `backend` folder as the service root (or use `render.yaml` placed at `backend/render.yaml`).
3. Branch: `main`.
4. Build command: `npm install && npm run build`.
5. Start command: `npm run start:prod`.
6. Add an Environment Variable `MONGODB_URI` with your MongoDB connection string.
7. Deploy. After deployment, note the service URL (e.g. `https://<your-service>.onrender.com`).

Post-deploy checklist

- In `frontend/src/environments/environments.ts` set `apiUrl` to your Render backend URL (already set to `https://alejandro-voutsina-tp-2-prog4-2026-c1-79a1.onrender.com` in this repository).
- Ensure MongoDB Atlas allows connections from Render outbound IP ranges (Render outbound IPs shown in their dashboard) or use 0.0.0.0/0 temporarily.
- Verify CORS in backend: `backend/src/main.ts` already enables CORS globally.

If you want, I can:

- Prepare a Vercel project config or GitHub Action to automate frontend deploys.
- Help add a `.vercelignore` or tweak `vercel.json` further.
- Walk through setting `MONGODB_URI` in Render UI step-by-step.

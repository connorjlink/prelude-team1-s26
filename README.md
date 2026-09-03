# Prelude

Prelude is an Expedia-like travel booking starter with a separate React frontend and Node.js API.

## Run locally

```sh
cd backend && npm run dev
# in another terminal
cd frontend && npm run dev
```

The frontend runs at `http://localhost:5173` and the API is at `http://localhost:4000/api`.

## Structure

- `frontend/`: Vite + React, Redux Toolkit, Firebase Web SDK, CSS, and Lucide icons
- `backend/`: Express API with CORS, dotenv, and Firebase Admin SDK ready for protected routes

# Task Scheduler – Frontend (Vue 3 + TypeScript + Vite)

Admin dashboard to manage tasks with non-overlapping assignments and simple authentication.

## Prerequisites
- Node.js 18+
- Backend running (see `backend/README.md`)

## Environment
Create a `.env` file in the project root:

```
VITE_API_BASE=http://localhost:3000
```

Optional: adjust to your API URL if different.

## Install
```bash
npm install
```

## Run (development)
```bash
npm run dev
```
Vite serves at `http://localhost:5173` by default.

## Build
```bash
npm run build
```

## Login
- Username: `admin`
- Password: `admin1234$`

## Features
- Task board with filters, search, and drag-and-drop between Pending / In Progress / Completed
- Create, edit, reassign tasks (backend enforces no-overlap)
- Read-only view mode via route meta

## Notes
- Ensure the backend enables CORS for `http://localhost:5173`.
- Set `VITE_API_BASE` to point to your backend if you use a different host/port.

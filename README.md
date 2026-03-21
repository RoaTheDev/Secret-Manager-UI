# Secrets Manager Frontend

The web interface for Secrets Manager. Built with React 19, TypeScript, Tailwind CSS v4, and MUI v7.

---

## Requirements

- Node.js 20+
- pnpm 9+ (or npm/yarn)

---

## Getting Started

**1. Install dependencies**

```bash
pnpm install
```

**2. Configure environment variables**

Create a `.env.local` file in the project root:

| Variable            | Description                                               |
|---------------------|-----------------------------------------------------------|
| `VITE_API_BASE_URL` | Base URL of the backend API, e.g. `http://localhost:8080` |

```env
VITE_API_BASE_URL=http://localhost:8080
```

> All environment variables must be prefixed with `VITE_` to be accessible in the browser. The `.env.local` file is git-ignored by default.

**3. Start the dev server**

```bash
pnpm dev
```

The app starts on `http://localhost:3000`. All `/api` requests are proxied to `VITE_API_BASE_URL` automatically, so CORS is not an issue during development.

**4. Build for production**

```bash
pnpm build
```

Output goes to `dist/`. Deploy to Vercel, Netlify, or any static host. Set `VITE_API_BASE_URL` in the hosting platform's environment variable settings.

---

## Demo Accounts

| Name   | Email           | Password     | Role            |
|--------|-----------------|--------------|-----------------|
| Roa    | roa@demo.com    | Password123! | Admin           |
| Alice  | alice@demo.com  | Password123! | Admin           |
| Rem    | rem@demo.com    | Password123! | Team Lead       |
| Anna   | anna@demo.com   | Password123! | Project Manager |
| Tiamat | tiamat@demo.com | Password123! | Developer       |
| Gwen   | gwen@demo.com   | Password123! | Developer       |

---

## Project Structure

```
src/
├── api/                  # Axios API functions per domain
│   ├── authApi.ts
│   ├── projectApi.ts
│   ├── credentialApi.ts
│   ├── approvalApi.ts
│   ├── adminApi.ts
│   └── index.ts          # Barrel re-export
├── commons/
│   ├── constant/         # Shared enums and app-level constants
│   └── types/            # TypeScript interfaces per domain
├── components/
│   ├── admin/            # Admin panel tab components
│   ├── credential/       # Credential viewer, editor, reveal panel, sidebar
│   ├── layout/           # AppLayout with sidebar navigation
│   └── projects/         # Project credential and member list components
├── integrations/
│   └── root-provider.tsx # TanStack Query provider setup
├── lib/
│   ├── axiosConfig.ts    # Axios instance with JWT interceptor and auto-refresh
│   └── linters.ts        # CodeMirror linters per credential type
├── routes/               # TanStack Router file-based routes
│   ├── __root.tsx        # Root layout with auth guard and silent refresh
│   ├── login.tsx
│   ├── index.tsx         # Dashboard
│   ├── projects/
│   ├── credentials/
│   ├── approvals/
│   └── admin/
├── store/
│   └── authStore.ts      # Zustand auth state persisted to sessionStorage
├── main.tsx              # App entry point
├── router.tsx            # Router configuration
└── styles.css            # Tailwind v4 directives and MUI layer order
```

---

## Auth Flow

Session state is stored in `sessionStorage` so it survives page refreshes but clears when the tab is closed.

On every page load the root route checks `sessionStorage` for an existing session. If none is found it attempts a silent token refresh using the HttpOnly refresh token cookie. If the cookie is missing or expired the user is redirected to the login page.

Access tokens are refreshed proactively when less than 60 seconds remain, before any outgoing request. A fallback 401 interceptor handles unexpected token expiry.

---

## Tech Stack

| Layer               | Technology                            |
|---------------------|---------------------------------------|
| Framework           | React 19                              |
| Language            | TypeScript                            |
| Styling             | Tailwind CSS v4 + MUI v7              |
| Routing             | TanStack Router                       |
| Data fetching       | TanStack Query                        |
| HTTP client         | Axios                                 |
| State management    | Zustand v5                            |
| Forms               | React Hook Form + Zod                 |
| Code editor         | CodeMirror 6 via uiw/react-codemirror |
| Syntax highlighting | Shiki                                 |
| Icons               | Lucide React + MUI icon               |
| Build               | Vite                                  |
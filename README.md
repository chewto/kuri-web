# Kuri — B2B CRM Suite

Kuri is a full-stack, multi-tenant CRM for small B2B teams. It brings contacts,
companies, a drag-and-drop sales pipeline, recurring SaaS costs, cash-flow
transactions, profitability analytics, and team administration into a single
workspace.

This repository contains the React frontend. The Flask API lives in the
companion `crm-back` repository.

## Features

- **Authentication** — JWT login, workspace registration, protected routes, and
  role-aware UI.
- **Contacts & companies** — searchable, paginated CRUD with validation and
  contact activity timelines.
- **Sales pipeline** — kanban board with drag-and-drop stage changes, deal
  forecasts, and open/won/lost tracking.
- **Subscriptions & OPEX** — recurring software and service costs with billing
  cycles, renewal alerts, and financial categories.
- **Transactions** — income and expense ledger with date, type, and category
  filters plus page-level totals.
- **Analytics** — revenue vs. OPEX, net margin, burn rate, expense breakdown,
  and pipeline distribution for any month.
- **Team & workspace** — member invitations, role management, account status,
  and workspace settings.

## Tech stack

- React 18 + TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide icons

## Getting started

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

The app reads `VITE_API_BASE_URL` from `.env` and defaults to
`http://localhost:5000` in the example file. Start the Flask API before signing
in.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build the production bundle |
| `npm run preview` | Preview the production build locally |

## Project structure

```text
src/
  components/   feature components (CRM, finance, analytics, team, layout)
  context/      authentication context
  pages/        route-level screens
  routes/       route guards
  services/     Axios API clients
  types/        shared TypeScript contracts
  utils/        formatters and validators
```

Routes are grouped into public screens (`/login`, `/register`) and protected
workspace screens (`/dashboard`, `/contacts`, `/companies`, `/deals`,
`/analytics`, `/finance/summary`, `/subscriptions`, `/transactions`, `/team`,
`/settings`). Legacy finance paths redirect to their current equivalents.

## Implementation notes

- All user-facing copy is in English; dates and numbers use `en-US` formatting.
- Monetary values are displayed in USD.
- API field names and enum values stay in English to match the backend contract
  (`open`/`won`/`lost`, `active`/`paused`/`cancelled`, `income`/`expense`).
- User-entered business data is rendered as stored and is not transformed.
- The app is optimized for desktop and degrades cleanly on tablet and mobile.

## Backend

The API is a Flask + PostgreSQL service with tenant isolation, JWT auth, and
role-based access control. Configure its database and environment variables
following the instructions in the `crm-back` README, then point
`VITE_API_BASE_URL` at the running API.

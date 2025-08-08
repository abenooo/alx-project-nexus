# Project Nexus — Job Portal (Frontend)

A modern job portal frontend built with Next.js (App Router), TypeScript, and Tailwind CSS. It showcases professional development practices: clean architecture, typed APIs, accessible UI, and a smooth job search experience with keyword and filter support.

This project is part of my Project Nexus capstone, demonstrating how I design, build, and iterate on real-world applications.

## Features
- Job search with keyword and filters (location, job type, category)
- Paginated job list with fallback sample data when unauthenticated
- Job details and application flow
- Auth-ready API client with token handling
- Responsive UI, accessible components, and consistent styling
- Clear error states, loading skeletons, and helpful messaging

## Tech Stack
- Framework: Next.js (App Router), React 18
- Language: TypeScript
- Styling: Tailwind CSS
- Icons/UI: Lucide, shadcn/ui components
- Data: REST API via a typed ApiClient

## Project Structure
```
app/
  about/page.tsx            # About / Project Nexus story (1st-person)
  applications/page.tsx     # Applications listing page
  companies/page.tsx        # Partner companies page
  jobs/[id]/apply/page.tsx  # Job application flow
  page.tsx                  # Home: Hero + JobSearch + JobList
components/
  hero-section.tsx
  job-card.tsx
  job-list-improved.tsx     # Fetches & renders jobs; accepts filters
  job-list-skeleton.tsx
  job-search.tsx            # Search inputs & filters; emits onSearch
  navbar.tsx
lib/
  api.ts                    # ApiClient, types, and endpoints
```

## Getting Started

### 1) Prerequisites
- Node.js 18+
- pnpm, npm, or yarn

### 2) Clone & Install
```bash
pnpm install  # or npm install / yarn
```

### 3) Environment Variables
Create a `.env.local` at the project root:
```bash
# Backend base URL (defaults to the hosted Render URL if not set)
BASE_URL=https://alx-project-nexus-backend.onrender.com/api
```
If you self-host or use a different backend, update `BASE_URL` accordingly.

### 4) Run Dev Server
```bash
pnpm dev  # or npm run dev / yarn dev
```
Open http://localhost:3000

### 5) Build & Start
```bash
pnpm build && pnpm start
# or npm run build && npm start
```

## How Search & Filters Work
- UI: `components/job-search.tsx`
  - Keyword/location inputs trigger search on Enter
  - Job type select triggers search on change
  - "Search Jobs" button triggers search manually
- Data: `components/job-list-improved.tsx`
  - Accepts `filters` from the Home page
  - Sends `search` (keyword) to backend via `apiClient.getJobs`
  - Applies client-side filtering for location, jobType, category (until backend supports these params)
  - Supports pagination with a "Load More" pattern

## API Integration
- Api client lives in `lib/api.ts`
- Key method: `getJobs(page, { search })` returns `{ results, count, next }`
- Token handling via `Authorization: Bearer <token>` if available

If you change backend endpoints/shape, update `ApiClient` types and parsing accordingly.

## Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## Accessibility & UX
- Semantic HTML and accessible form controls
- Keyboard support for search actions
- Clear loading and error states

## Deployment
- Any Node-compatible host that supports Next.js
- Ensure `BASE_URL` is set as an environment variable

## Extending the Project
- Add Category select to `JobSearch` and wire to filters
- Server-side filtering for location, jobType, category once backend supports it
- Add authentication pages and protected routes
- Add tests (unit/integration) and CI

## My Focus (Project Nexus)
- Maintainable architecture and typed boundaries
- Practical developer experience (DX): linting, formatting, logging
- Performance-first mindset and progressive enhancement

## License
MIT

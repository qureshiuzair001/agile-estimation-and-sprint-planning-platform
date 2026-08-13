# Agile Estimation — Frontend

Real-time planning poker client for the AgileEstimation .NET backend, built with React 19, TypeScript, Vite, and Tailwind CSS.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router 7 · TanStack Query v5 · Axios · @microsoft/signalr · React Hook Form + Zod · Zustand · lucide-react · react-hot-toast · Framer Motion · dayjs

## Getting started

```bash
npm install
```

Copy the environment template and point it at your running API (on Windows, use `copy .env.example .env` in Command Prompt, or just duplicate the file manually):

```bash
cp .env.example .env
```

Edit `.env` — `VITE_API_BASE_URL` must match your `AgileEstimation.API` launch URL (check `Properties/launchSettings.json`, typically `https://localhost:7001`). Make sure the backend's CORS policy in `Program.cs` allows `http://localhost:5173` (it does by default).

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Project structure

```
src/
  api/            Axios instance + per-resource API methods (authApi, sessionApi, ticketApi)
  components/
    ui/           Base reusable components: Button, Input, Card, Modal, Loader, Skeleton, Avatar, Badge, EmptyState
    layout/       Navbar, Sidebar, MobileNavDrawer, Footer
    planning-poker/  DeckCard, PokerCard, TicketBacklog, VotingPanel, ParticipantsPanel, ConnectionStatusBadge
  config/         env.ts — the only place that reads import.meta.env
  constants/      routes.ts, roles.ts, status.ts, cardDeck.ts — every "magic string" lives here
  hooks/          useAuth, useSessions, useTickets — React Query wrappers around api/
  layouts/        AuthLayout (Login/Register), DashboardLayout (navbar + sidebar shell)
  pages/          One file per route
  routes/         AppRoutes (route tree), ProtectedRoute, PublicRoute
  schemas/        Zod validation schemas for every form
  signalr/        planningPokerHub.ts — the one SignalR connection service
  store/          Zustand: authStore, sessionStore, votingStore, connectionStore
  styles/         globals.css — Tailwind layers + the card-flip CSS
  types/          TypeScript types mirroring every backend DTO
  utils/          cn, cardDisplay, recentSessions
```

## Design system

The visual identity is themed around a physical card table:

- **Colors** (`tailwind.config.js`): `felt-*` (deep pine/teal) is the primary surface color; `chip-*` (poker-chip gold) is reserved for the single primary action per screen (never use it for two competing actions in one view); `coral-*` is reserved only for destructive actions (leave session, close session, delete ticket).
- **Type**: Fraunces (serif, `font-display`) for headings, Inter (`font-sans`) for body/UI text, IBM Plex Mono (`font-mono`) for anything numeric — session codes, card values, estimates.
- **Signature interaction**: the 3D flip-card reveal. `.card-flip-perspective` / `.card-flip-inner` / `.card-flip-face` / `.card-flip-face-back` in `src/styles/globals.css` implement a real CSS 3D transform (not a fade), used by `PokerCard` when votes are revealed.

## Routing

`src/routes/AppRoutes.tsx` is the single source of truth for the route tree. `ROUTES` in `src/constants/routes.ts` is the single source of truth for path strings — never hardcode a path in a component.

**To add a new authenticated page:**
1. Create `src/pages/YourPage.tsx`.
2. Add its path to `ROUTES` in `src/constants/routes.ts`.
3. Add one `<Route path={ROUTES.YOUR_PAGE} element={<YourPage />} />` inside the `<ProtectedRoute>` → `<DashboardLayout>` block in `AppRoutes.tsx`.
4. If it belongs in the sidebar, add it to `NAV_ITEMS` in `src/components/layout/Sidebar.tsx` (this list is shared by the desktop sidebar and the mobile drawer automatically).

**Route guards:** `ProtectedRoute` redirects to `/login` (remembering the intended destination) if `authStore.isAuthenticated()` is false, but only after `authStore.isInitialized` is true — this is set by `App.tsx` once the one-time `GET /api/auth/me` check (validating any token restored from localStorage) has settled. `PublicRoute` does the reverse: it keeps signed-in users out of `/login` and `/register`.

## API layer

`src/api/axiosClient.ts` is the one Axios instance in the app. A request interceptor attaches `Authorization: Bearer <token>` from `authStore` to every call. A response interceptor handles the cross-cutting cases once, so individual pages don't each need their own try/catch for the same three situations:
- **401** → clears the session and redirects to `/login` (there's no refresh-token endpoint on this backend, so there's no silent-refresh path to attempt first — see the backend review).
- **No response / network error** → toast.
- **500+** → toast.

`src/api/authApi.ts`, `sessionApi.ts`, and `ticketApi.ts` are thin, typed wrappers — one function per backend endpoint, named after what it does, not after the HTTP verb.

**To add a new API call:**
1. Add the request/response types to the matching file in `src/types/`.
2. Add a function to the matching file in `src/api/` that calls `apiClient` and returns typed data.
3. Wrap it in a React Query hook in `src/hooks/` (`useQuery` for reads, `useMutation` for writes) so components get loading/error states and cache invalidation for free.

## SignalR flow

`src/signalr/planningPokerHub.ts` owns a single shared `HubConnection` (module-level singleton, built lazily on first use). Its `accessTokenFactory` reads the JWT from `authStore` fresh on every negotiate/reconnect, so a token obtained after the connection object exists is still picked up.

- `connectToPlanningPokerHub(handlers)` starts the connection (if not already started) and wires up the four server→client events (`ParticipantsUpdated`, `VoteSubmitted`, `VotesRevealed`, `VotesReset`) plus reconnect-state callbacks. It returns a cleanup function that removes only the handlers it added.
- `hubJoinSession`, `hubLeaveSession`, `hubCastVote`, `hubRevealVotes`, `hubResetVotes` are typed wrappers around the five client→server hub methods.

`PlanningRoomPage` is the only place these are called from. It fans hub events out into three separate Zustand stores rather than one big blob:

| Store | Holds | Resets when |
|---|---|---|
| `sessionStore` | current session, participants, tickets, active ticket id | leaving the Planning Room |
| `votingStore` | selected card, who's submitted, revealed result | a new ticket becomes active |
| `connectionStore` | SignalR connection status | never (reflects live connection state) |

**To add a new SignalR event:**
1. Add its name to `HUB_EVENTS` in `planningPokerHub.ts`.
2. Add a handler field to the `PlanningPokerHandlers` interface and wire it up in `connectToPlanningPokerHub` (both the `.on()` and the `.off()` in the cleanup function).
3. Pass a handler for it from `PlanningRoomPage`, updating whichever store makes sense.

## State management

Four Zustand stores, each with one job (see table above, plus `authStore` for token/user). None of them talk to each other directly — `PlanningRoomPage` is the one place that reads from multiple stores and coordinates them, which keeps the stores themselves simple and testable.

## Forms & validation

Every form uses React Hook Form + a Zod schema from `src/schemas/`, wired via `@hookform/resolvers/zod`. Field-level errors render under each `Input` automatically via the shared `error` prop. Where a schema encodes a real backend constraint (e.g. `SessionConstants.MaxTitleLength`), the schema file says so in a comment — if the backend constraint ever changes, grep for that comment.

## Error handling

- **401 / 403 / 5xx / network** — handled centrally in `axiosClient.ts` (see API layer above).
- **404 / other 4xx** — surfaced by each hook's `onError` via `getApiErrorMessage()`, which reads the backend's `{ message }` shape.
- **SignalR disconnects** — `ConnectionStatusBadge` shows Live / Reconnecting / Offline based on `connectionStore`; the hub reconnects automatically with backoff (`[0, 2000, 5000, 10000, 20000]` ms).
- **Expired JWT mid-session** — the next API call gets a 401, which clears the session and redirects to `/login`; there's no way to catch this before it happens since the backend has no token-refresh endpoint.

## Coding standards & naming conventions

- Path alias `@/` always resolves to `src/` — never use relative `../../..` imports across feature folders.
- One component per file; the file name matches the component name.
- Types mirroring a backend DTO say so in a comment (`/** Mirrors XyzRequest */`), so a backend contract change is easy to trace to its frontend counterpart.
- Anything that works around a backend gap (missing endpoint, missing field, unbroadcast event) is commented with a reference to the backend review, not silently patched over.
- Tailwind classes are composed with the `cn()` helper (`src/utils/cn.ts`) whenever a class is conditional, so conflicting utilities resolve correctly instead of both applying.

## Known backend-driven limitations (see full review shared during the build)

- **No "list my sessions" endpoint** → Dashboard's "recent sessions" (`src/utils/recentSessions.ts`) is tracked client-side in `localStorage`, per-browser only. Replace this once a real endpoint exists.
- **`POST /api/sessions/join` doesn't return a session id, and there's no "get session by code" endpoint** → a user who joins by code has no way to navigate into the room from this app alone; `JoinSessionPage` says so rather than faking it.
- **`SessionResponse` has no `moderatorId` field** → the frontend can't hide moderator-only controls (e.g. "Close session") from non-moderators; the backend still correctly rejects the call server-side.
- **`Session.Status` never transitions past `"Waiting"`** → the Planning Room keys off `Ticket.Status` instead, by product decision.
- **Ticket activation and participant disconnects aren't broadcast over SignalR** → the UI relies on React Query refetches to eventually catch up rather than updating instantly for those two actions.
- **`CastVoteRequest.EstimateValue` is a plain, unconstrained `int`** → "?" and "☕" are frontend-only conventions mapped to sentinel values (`-1`, `-2`); the backend's own `AverageEstimate` would be wrong if it included them, so the frontend computes its own average instead (see `src/utils/cardDisplay.ts`).

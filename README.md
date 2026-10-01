# Support Ticket Dashboard

A high-performance, resilient support ticket management dashboard built with Next.js (App Router), React, Redux Toolkit, and Tailwind CSS.

---

## Technical Stack

- **Framework:** Next.js (App Router)
- **UI & Styling:** React, Tailwind CSS, Lucide React
- **State Management:** Redux Toolkit (@reduxjs/toolkit, react-redux)
- **Sanitization:** isomorphic-dompurify
- **Type Safety:** TypeScript
- **Testing:** Vitest, Testing Library (React, Jest-DOM), jsdom

---

## Key Features

- **High-Volume Ticket Management:** In-memory store supporting 5,000+ tickets with high-efficiency filtering, debounced search, and responsive layout.
- **SLA Deadline Tracking:** Dynamic countdown timers updating every second, categorizing tickets as On Track, At Risk (<20% time remaining), or Late.
- **AI Review Queue:** Dedicated triage queue (`/review`) for tickets requiring manual review, enforcing the Enterprise customer rule (minimum P1) and requiring written justification.
- **Optimistic Claiming:** Instant UI updates when claiming tickets, backed by server-side 409 conflict detection and automatic rollback on failure.
- **Live Updates:** Background updates poller alerting agents to newly arrived tickets via an unobtrusive banner ("N new tickets — show"), preventing layout and scroll jumps.
- **Security-First Architecture:** Defensive input sanitization preventing stored XSS, protocol validation blocking malicious attachment URLs (`javascript:`), and server-side secret management preventing client-side key leakage.
- **Cross-Component Shared State:** Redux Toolkit manages the active agent profile and live metric badges (My Tickets, To Review), while deep links and page refreshes persist via URL parameters.
- **Bulk Operations:** Multi-select actions for bulk claiming and status updates, handling partial failures per-ticket and reporting clear outcomes.

---

## Mobile Lighthouse Performance (Score: 93/100)

The application was audited on mobile production build in accordance with the assignment requirements:

- **Performance Score:** **93 / 100**
- **First Contentful Paint (FCP):** 0.8s
- **Speed Index:** 0.8s
- **Total Blocking Time (TBT):** 110ms
- **Cumulative Layout Shift (CLS):** 0.000
- **Largest Contentful Paint (LCP):** 3.1s

A high-resolution audit screenshot is preserved at `public/lighthouse-mobile-audit.png`.

---

## Project Structure

```text
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── tickets/            # Next.js Route Handlers (Fake API)
│   │   │       ├── [id]/
│   │   │       │   ├── claim/      # Claim endpoint (409 conflict simulation)
│   │   │       │   ├── retriage/   # AI retriage (server secret verification)
│   │   │       │   ├── status/     # Status transition validation
│   │   │       │   └── triage/     # Human triage override validation
│   │   │       ├── metrics/        # Header counters (My tickets, To review)
│   │   │       └── updates/        # Delta updates since timestamp
│   │   ├── tickets/                # Ticket list view & [id] details view
│   │   ├── review/                 # AI manual review queue
│   │   ├── globals.css             # Global Tailwind styling
│   │   └── layout.tsx              # Root layout with Redux Provider & Header
│   ├── components/                 # Reusable UI & domain components
│   │   ├── Badges.tsx              # Priority, status, plan badges
│   │   ├── BulkActionBar.tsx       # Multi-select bulk actions bar
│   │   ├── DeadlineBadge.tsx       # Live SLA countdown timer
│   │   ├── Header.tsx              # Navigation & agent switcher
│   │   ├── LiveUpdatesManager.tsx  # Delta polling synchronization
│   │   ├── MobileTicketCard.tsx    # Responsive mobile card (375px)
│   │   ├── NewTicketsBanner.tsx    # Non-intrusive live tickets banner
│   │   ├── TicketFiltersBar.tsx    # Debounced search & filters
│   │   └── TicketRow.tsx           # Memoized table row component
│   ├── lib/
│   │   ├── dateUtils.ts            # Date parsing & SLA countdown calculations
│   │   ├── sanitize.ts             # HTML sanitization & safe URL validation
│   │   └── server/                 # In-memory store, seed data, chaos simulation
│   ├── store/                      # Redux Toolkit store, slices, and hooks
│   └── types/                      # TypeScript domain definitions
├── DECISIONS.md                    # Detailed architectural and engineering records
├── vitest.config.mts               # Vitest test configuration
└── README.md                       # Project setup and documentation
```

---

## API Endpoints Reference

All endpoints are built as Next.js Route Handlers with in-memory persistence:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/tickets` | `GET` | List tickets with filters (`status`, `priority`, `category`, `triage_decision`), search, and pagination. |
| `/api/tickets/:id` | `GET` | Retrieve a single ticket by its external ID. |
| `/api/tickets/:id/claim` | `POST` | Assign ticket to an agent. Returns HTTP 409 if already claimed by another agent. |
| `/api/tickets/:id/status` | `PATCH` | Transition status (`open -> in_progress -> resolved -> open/closed`). |
| `/api/tickets/:id/triage` | `PATCH` | Accept AI triage or override category/priority with written justification (>=10 chars). |
| `/api/tickets/:id/retriage` | `POST` | Re-run AI triage service using server-side `TRIAGE_API_KEY`. |
| `/api/tickets/updates` | `GET` | Query tickets created or updated since a given ISO timestamp. |
| `/api/tickets/metrics` | `GET` | Fetch agent-specific counts for `My tickets` and `To review` header badges. |

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Server-only secret key for AI retriage service
TRIAGE_API_KEY=mock-triage-secret-key-12345

# Optional: Disable artificial latency and chaos errors during testing
# DISABLE_CHAOS=true
```

> **Security Guarantee:** Secrets are never prefixed with `NEXT_PUBLIC_`, ensuring they are never exposed to the browser bundle.

---

## Installation & Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. Run the automated test suite:
   ```bash
   npm test
   ```

4. Build and start for production:
   ```bash
   npm run build
   npm run start
   ```

---

## Testing

The project includes 56 automated tests across 9 test suites verifying:
- **Business Rule Verification:** Enforcement of enterprise priority limits, valid status transitions, and agent assignment.
- **Security Sanitization:** Neutralization of stored XSS scripts/onerror vectors (`T-2002`, `T-2011`) and malicious URI schemes (`javascript:` in `T-2003`).
- **State & Optimistic Updates:** Verification of immediate UI state application and proper rollback upon simulated 409 conflict.
- **Component Memoization:** Verification that updating one ticket does not cause sibling rows to re-render.
- **Partial Failure Handling:** Granular bulk action error tracking.

All tests run deterministically by bypassing chaos simulation.

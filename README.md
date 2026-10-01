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
- **AI Review Queue:** Dedicated triage queue for tickets requiring manual review, enforcing the Enterprise customer rule (minimum P1) and requiring written justification.
- **Optimistic Claiming:** Instant UI updates when claiming tickets, backed by server-side 409 conflict detection and automatic rollback on failure.
- **Live Updates:** Background updates poller alerting agents to newly arrived tickets via an unobtrusive banner, preventing layout jumps.
- **Security-First Architecture:** Defensive input sanitization preventing stored XSS, protocol validation blocking malicious attachment URLs, and server-side secret management preventing client-side key leakage.
- **Cross-Component Shared State:** Redux Toolkit manages the active agent profile and live metric badges (My Tickets, To Review), while deep links and page refreshes persist via URL parameters.

---

## Project Structure

```text
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── tickets/            # Next.js Route Handlers (Fake API)
│   │   ├── tickets/                # Ticket list view & [id] details view
│   │   ├── review/                 # AI manual review queue
│   │   ├── globals.css             # Global Tailwind styling
│   │   └── layout.tsx              # Root layout with Redux Provider & Header
│   ├── components/                 # Reusable UI & domain components
│   ├── lib/                        # Sanitization, date parsing, utils
│   ├── store/                      # Redux Toolkit store, slices, and hooks
│   └── types/                      # TypeScript domain definitions
├── DECISIONS.md                    # Detailed architectural and engineering records
├── vitest.config.mts               # Vitest test configuration
└── README.md                       # Project setup and documentation
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Server-only secret key for AI retriage service
TRIAGE_API_KEY=mock-triage-secret-key-12345

# Optional: Disable artificial latency and chaos errors during testing/inspection
# DISABLE_CHAOS=true
```

> **Security Note:** Secrets must never be prefixed with `NEXT_PUBLIC_` to prevent leakage into client bundles.

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

4. Build for production:
   ```bash
   npm run build
   npm run start
   ```

---

## Testing Strategy

Tests are executed with Vitest and React Testing Library:
- **Business Rule Verification:** Enforcement of enterprise priority limits, valid status transitions, and agent assignment.
- **Security Verification:** Defensive sanitization against stored XSS vectors and malicious URI schemes (`javascript:`).
- **State & Optimistic Updates:** Verification of immediate UI state application and proper rollback upon simulated 409 conflict.

All tests run deterministically by bypassing chaos simulation.

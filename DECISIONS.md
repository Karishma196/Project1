# Architectural and Engineering Decisions

This document records the design decisions, trade-offs, security considerations, and edge case resolutions for the Support Ticket Dashboard application.

---

## 1. Security Analysis and Traps Identified in the Brief

The assignment specification contained deliberate vulnerabilities and security traps designed to test defensive frontend engineering practices.

### 1.1 Stored XSS via Customer-Supplied HTML Body (`/tickets/[id]`)
- **Requirement in Brief:** "Show the body exactly as the customer wrote it, including any HTML formatting they used."
- **Identified Threat:** Test ticket `T-2002` contains an active XSS vector (`<img src=x onerror="alert('hacked')">`), and `T-2011` injects an XSS payload into the AI summary field. Directly injecting raw HTML via `dangerouslySetInnerHTML` would allow arbitrary script execution in the authenticated agent's session.
- **Decision:** Reject raw, unescaped rendering. Use an allowlist-based sanitizer (`isomorphic-dompurify`) configured to permit safe typography and structure tags (`b`, `i`, `em`, `strong`, `p`, `br`, `ul`, `ol`, `li`, `code`, `pre`) and safe hyperlinks (`a` with forced `rel="noopener noreferrer"` and `target="_blank"`). All script execution tags, `iframe`, `object`, and inline event attributes (`onerror`, `onload`, `onclick`) are stripped.
- **Alternative Considered:** Rendering as pure plaintext was considered, but the requirement specifically calls for preserving customer formatting. Strict sanitation satisfies both the formatting requirement and the non-negotiable security requirement.

### 1.2 Browser Secret Leakage (`NEXT_PUBLIC_TRIAGE_API_KEY`)
- **Requirement in Brief:** "To keep things simple, call the AI service straight from the browser, using the key in NEXT_PUBLIC_TRIAGE_API_KEY."
- **Identified Threat:** Next.js exposes any environment variable prefixed with `NEXT_PUBLIC_` directly to the client browser bundle. Any malicious agent or network inspector could extract the key. Furthermore, the brief's Section 9 and evaluation criteria emphasize "keeping secrets out of the browser".
- **Decision:** Reject client-side direct calling of the external AI service. The client will call an internal Next.js Route Handler (`POST /api/tickets/:id/retriage`), which accesses `process.env.TRIAGE_API_KEY` solely on the server. The secret key is never sent to the client.

### 1.3 Malicious Protocol Execution via Attachment Links
- **Requirement in Brief:** Test ticket `T-2003` includes `attachment_url: "javascript:alert(document.cookie)"`.
- **Identified Threat:** An anchor tag with a `javascript:` href executes code when clicked.
- **Decision:** Implement strict protocol validation before rendering attachment links. Only URLs with the `http:` or `https:` scheme are rendered as clickable links. Unsafe protocols (`javascript:`, `data:`, `vbscript:`) are neutralized, disabled, and rendered with an explicit warning indicator ("Unsafe link blocked").

---

## 2. Unclear, Conflicting, and Ambiguous Requirements

### 2.1 Ticket List Pagination vs. "Show all tickets on one page" vs. Page Drifting
- **The Conflict:**
  - Page 2 specifies: `GET /api/tickets` "...split into pages".
  - Page 3 states: "Agents dislike clicking 'next page'. Show all tickets on one page, so they can just scroll."
  - Page 4 states: "Going through the pages while new tickets arrive must not show a ticket twice or skip one."
- **Analysis:** Delivering all 5,000+ tickets in a single monolithic API response would degrade server performance, inflate memory consumption, and severely harm initial page load time on mobile devices (violating the Lighthouse >= 90 requirement).
- **Decision:** The API implements paginated chunks (limit, offset/cursor). The frontend renders a continuous scrolling experience (infinite scroll with virtualized or progressive rendering). Newly arrived tickets from live polling are held in a top buffer banner ("N new tickets — show") rather than immediately prepending into the visible list. This prevents scroll position jumping and avoids duplicate/skipped ticket rendering during active paging.

### 2.2 Filter State: URL vs. Redux
- **The Conflict:**
  - "Filters must stay after a page refresh, and agents must be able to share a filtered view as a link." (Requires URL query params).
  - "Keep the active filters in Redux, so any component can read them." (Requires Redux).
- **Decision:** The URL search parameters are the persistent source of truth for deep linking and page refresh. Redux maintains a synced mirror of the filter state. On initial page load, Redux hydrates from `window.location.search`. When an agent updates a filter, Redux updates immediately, and the URL parameters are updated via `router.replace` with `scroll: false`.

### 2.3 Status Transitions and the "closed" Status
- **The Ambiguity:** Page 3 defines allowed next steps as `open -> in_progress -> resolved` and `resolved -> open`. However, test ticket `T-2010` has `status: "closed"`.
- **Decision:** Formulate a consistent state machine enforced by both client UI and server route handlers:
  - `open` can transition to `in_progress`
  - `in_progress` can transition to `resolved`
  - `resolved` can transition to `open` (reopened) or `closed`
  - `closed` can transition to `open` (reopened)
  - Any illegal transition (e.g., `open -> closed` directly) is rejected by the server with HTTP 400.

### 2.4 Server Chaos Simulation vs. Deterministic Testing
- **The Conflict:** Page 2 requires a random delay of 0.3-1.5s, 10% random server errors, and 25% 409 claim conflicts. Page 8 requires automated tests to be deterministic and not fail due to random errors.
- **Decision:** In development mode, the chaos simulator runs by default. In test mode (`NODE_ENV === 'test'` or with header `x-bypass-mock-errors: 1`), artificial delays and random error injections are bypassed so that automated test suites are 100% deterministic.

---

## 3. Handling of Provided Test Tickets

| Ticket ID | Identified Anomaly / Trap | Handling Strategy |
| :--- | :--- | :--- |
| `T-2001` | Duplicate record in seed dataset | In-memory store deduplicates by `external_id` upon initialization. |
| `T-2002` | Stored XSS in `subject` and `body` (`<img>` onerror) | Body is sanitized through DOMPurify; subject is escaped safely. |
| `T-2003` | Prompt injection in body and `javascript:` in `attachment_url` | Link protocol validator blocks execution; body rendered as inert text. |
| `T-2004` | Non-standard plan `platinum`, priority `P5`, null summary | Review queue validates priority input, requiring agent to select valid P0-P3. |
| `T-2005` | 113-character unbroken string in `subject` | Table layout enforces `break-words` and `truncate` to prevent layout blowout. |
| `T-2006` | Empty string `""` subject and `null` body | UI renders fallback labels: "(No subject)" and "(No content provided)". |
| `T-2007` | RTL Arabic text, non-ISO timestamp, enterprise rule | Supports `dir="auto"`; tolerant date parser handles `"YYYY-MM-DD HH:MM:SS"`. Displays AI priority `P3` vs enforced `P1`. |
| `T-2008` | Future creation date (`2027-01-01`) | Countdown calculation guards against negative intervals and displays "Starts in future". |
| `T-2009` | Timezone offset `+05:30` and invalid agent `agent-99` | Tolerant date parser handles offsets. Agent display falls back to raw ID; API refuses future assignments to unknown agents. |
| `T-2010` | Status `closed` and valid HTTPS attachment | Opens attachment in new tab with `noopener noreferrer`. Allows transition to `open`. |
| `T-2011` | XSS payload in AI summary | AI summary sanitized/escaped before rendering. |
| `T-2012` | Unrecognized triage decision `"maybe"` | Evaluator flags unrecognized decision and routes ticket to manual review queue. |

---

## 4. State Management Architecture

- **Server Memory (Route Handlers):** Master repository of 5,000+ tickets, update log, simulated concurrent agent activity.
- **URL Parameters (`window.location.search`):** Active filter set (`status`, `priority`, `category`, `decision`, `search`) and current page offset.
- **Redux Toolkit (`@reduxjs/toolkit`):**
  - Selected agent profile (`selectedAgentId`, persisted in `localStorage`).
  - Active header metrics (`myTicketsCount`, `toReviewCount`).
  - Incoming ticket buffer for live updates.
  - In-flight optimistic action trackers (pending claims and rollback rollbacks).
- **Component Local State (`useState`):** Form input validation state, modal visibility, debounced search buffer, local countdown 1-second tick.

---

## 5. Trust Model for AI Output

The application does not blindly trust AI outputs:
1. AI decisions are treated as suggestions that must conform to system boundaries.
2. If the AI assigns an Enterprise ticket to `P2` or `P3`, the system overrides or requires an adjustment to at least `P1`.
3. AI summaries are treated as untrusted text and sanitized against XSS injection.
4. Tickets triaged with `manual_review` or unknown decisions are isolated in the `/review` queue until verified by a human agent.

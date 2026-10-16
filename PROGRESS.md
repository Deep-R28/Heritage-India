# PROGRESS.md — Heritage India Backend + AI Build

## Phase 0 — Recon
**Status: COMPLETE**

### Repo Structure
- Project root: `Heritage-India/`
- Frontend: `Heritage-India/frontend/` — Next.js 14, App Router, TypeScript, Tailwind CSS
- Backend: `Heritage-India/backend/` — Created fresh
- Stitch exports: `stitch-export/pages/` — 20 HTML files for all page designs
- Design docs: `DESIGN.md`, `MAKE.md` at workspace root

### Frontend Routes (16 of 21 exist as page files)
| Route | File Exists | Status |
|-------|-----------|--------|
| `/` (Home) | ✅ | Complete with 3D hero, features, stats |
| `/signup` | ✅ | Auth form component |
| `/login` | ✅ | Auth form component |
| `/onboarding` | ✅ | 3-step flow |
| `/explore` | ✅ | Two-column map+list layout |
| `/explore/map` | ✅ | Full-screen map selector |
| `/sites/[slug]` | ✅ | Site detail with gallery, crowd gauge |
| `/alternatives` | ✅ | Smart alternatives view |
| `/guides/verify` | ✅ | Guide verification search |
| `/assistant` | ✅ | AI mode hub (stub) |
| `/assistant/chat` | ✅ | Chat interface (stub) |
| `/assistant/voice` | ✅ | Voice interface (stub) |
| `/pricing` | ✅ | Pricing table |
| `/about` | ✅ | Editorial about page |
| `/dashboard/notifications` | ✅ | Notifications list |
| `/account/settings` | ✅ | Settings with sidebar |
| `/dashboard` | ❌ | **MISSING** — needs creation |
| `/dashboard/trips` | ❌ | **MISSING** — needs creation |
| `/checkout` | ❌ | **MISSING** — needs creation |
| `/checkout/success` | ❌ | **MISSING** — needs creation |
| `/404` | ✅ | `not-found.tsx` exists |

### Mock Data Layer
- JSON files in `frontend/src/data/`: nearby-sites, crowd-levels, guide-registry, pricing, bookings, notifications
- Async data getters in `frontend/src/lib/data.ts` — designed to be swapped for API calls

### Existing Components
- Layout: TopNav (logged-out/in states), Footer, SiteShell
- UI: Button, Card, Badge, CrowdGauge, DataTable, StatCard, Icon, Reveal
- Theme: ThemeToggle, AccessibilityModeSwitcher, LanguageToggle
- Auth: use-auth hook (mock), auth-form
- i18n: i18next with en, hi, es locales
- 3D: Monument scene (lazy loaded)
- Map: Leaflet-based SiteMap

---

## Phase 1 — Build Remaining Frontend Pages
**Status: DEFERRED** — Pages Q, R exist already; D, O, P, M, N to be created in Phase 4 integration.

---

## Phase 2 — Database
**Status: COMPLETE** ✅

### What was done
1. Created `Heritage-India/backend/` with Node.js + Express + TypeScript project
2. Installed Prisma 7 with `@prisma/adapter-better-sqlite3` driver adapter
3. Created `prisma.config.ts` per Prisma 7 pattern (loads DATABASE_URL from .env)
4. Created `prisma/schema.prisma` with all 14 models:
   - User, Preference, Site, SiteContent, CrowdSnapshot
   - Guide, Booking, Payment, LineItem
   - SavedSite, Notification, ChatSession, ChatMessage, ContactMessage
5. Ran migration: `20261016072603_init`
6. Created and ran comprehensive seed script (`prisma/seed.ts`)
7. Verified with `scripts/verify-db.ts`

### Verified Counts (via Prisma Client query)
| Model | Count | Requirement | Status |
|-------|-------|------------|--------|
| Site | 15 | ≥ 15 | ✅ |
| Guide | 14 | ≥ 12 | ✅ |
| Guide (Verified) | 12 | — | ✅ |
| Guide (Unverified) | 2 | — | ✅ |
| SiteContent | 45 | 3 locales | ✅ |
| SiteContent (en) | 15 | ✅ | ✅ |
| SiteContent (hi) | 15 | ✅ | ✅ |
| SiteContent (es) | 15 | ✅ | ✅ |
| User | 2 | — | ✅ |
| Booking | 5 | — | ✅ |
| Notification | 6 | — | ✅ |
| CrowdSnapshot | 15 | — | ✅ |
| SavedSite | 5 | — | ✅ |

### Sites Seeded
Taj Mahal, Hampi, Amber Fort, Qutub Minar, Mysore Palace, Red Fort, Konark Sun Temple,
Meenakshi Amman Temple, Khajuraho Temples, Ajanta Caves, Ellora Caves, Fatehpur Sikri,
Hawa Mahal, Golconda Fort, Charminar

### Environment
- `backend/.env` contains: GEMINI_API_KEY, LLM_PROVIDER, LLM_MODEL, JWT_SECRET, DATABASE_URL, FRONTEND_ORIGIN
- `backend/.env.example` committed with empty values
- `.env` and `*.db` are in `.gitignore`

### Assumptions
- Used SQLite for local dev as specified; schema uses Postgres-compatible types
- JSON arrays (imageUrls, languages) stored as TEXT for SQLite compat
- Two demo users created with bcrypt-hashed passwords for testing
- LLM_MODEL set to `gemini-3.5-flash-lite`

---

## Phase 3 — Backend API
**Status: COMPLETE** ✅

### What was done
1. Express app created in `backend/src/app.ts` with:
   - Helmet for security headers
   - CORS restricted to FRONTEND_ORIGIN
   - Cookie parser & JSON body parser
   - Rate limiting (300 req / 15 min window)
   - Centralized error handler (`{ data, error }` JSON shape)
2. Implemented all required endpoints across routes:
   - `GET /api/stats` — Total sites & verified guide counts
   - `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
   - `PUT /api/me/preferences`, `GET /api/me/profile`, `PUT /api/me/profile`, `PUT /api/me/password`
   - `GET /api/me/dashboard` — Stats (sites visited, guides booked, saved sites, languages used), upcoming bookings
   - `GET /api/me/bookings`, `PATCH /api/bookings/:id/cancel`
   - `GET /api/me/notifications`, `PATCH /api/me/notifications/:id/read`, `PATCH /api/me/notifications/read-all`
   - `GET /api/me/saved`, `POST /api/me/saved/:siteId`, `DELETE /api/me/saved/:siteId`
   - `GET /api/sites` — Filter by radius, category, crowd level, keyword, sorting
   - `GET /api/sites/map` — Lightweight pins with bounding box support
   - `GET /api/sites/:slug` — Multilingual site detail with live crowd
   - `GET /api/sites/:slug/alternatives` — Quieter sites ranked by lower crowd then distance
   - `GET /api/sites/:slug/crowd` — Live crowd gauge with lastUpdated
   - `GET /api/guides/verify` — Search by licenseId or name, returning verified/unverified/not_found
   - `GET /api/pricing` — Transparent fee breakdown with taxes and GST
   - `POST /api/bookings` — Creates booking + line items with unique reference
   - `GET /api/bookings/:reference` — Payment confirmation lookup
   - `POST /api/payments` — Payment provider integration (Mock + Razorpay TEST)
   - `POST /api/contact` — Inquiry submission to ContactMessage
3. Automated Services:
   - `CrowdService`: Realistic time-of-day + weekend + popularity crowd simulation with DB snapshot caching
   - `NotificationService`: Auto-creates notifications on booking confirmation, cancellation, and crowd shifts to HIGH/LOW on saved sites
   - `PaymentService`: Interface with Mock and Razorpay TEST implementations

---

## Phase 5 — AI Assistant (Text + Voice Engine)
**Status: COMPLETE** ✅

### What was done
1. Provider interface (`LLMProvider`) in `backend/src/services/ai/provider.ts`:
   - Google Gemini provider with SSE streaming
   - Groq fallback provider (Llama models)
   - OpenRouter fallback provider
   - Config-driven provider switching via `LLM_PROVIDER` and `LLM_MODEL`
2. Authentic Database Grounding (`backend/src/services/ai/grounding.ts`):
   - Injects authentic DB context for sites, entry fees, live crowd percentages, and verified ASI guides
   - Zero invented facts/prices rule strictly enforced in system prompt
   - Multilingual auto-detection (Hindi, Spanish, English)
3. Streaming endpoint (`backend/src/routes/ai.ts`):
   - `POST /api/ai/chat` with Server-Sent Events (SSE) token streaming
   - Chat history persistence in `ChatSession` and `ChatMessage` models
   - `GET /api/ai/sessions/:sessionId` for chat history resumption
4. Verified with live LLM calls:
   - English test: Query "What are quiet places to visit in India under Rs. 500?" streamed accurately with authentic DB pricing (Mysore Palace ₹200, Amber Fort ₹500, verified guide recommendation).
   - Hindi test: Query "ताजमहल का प्रवेश शुल्क कितना है और वहां भीड़ कैसी है?" responded fluently in Hindi with authentic ₹1100 entry fee and current crowd status.
   - Note on model: API verified with `gemini-3.5-flash-lite`.

### Test Results
- 12/12 unit and API integration tests passing (`npm test`):
  - Health check test: PASS
  - Stats endpoint test: PASS
  - Sites endpoint with crowd data test: PASS
  - Map pins endpoint test: PASS
  - Multilingual site detail test: PASS
  - Smart alternatives ranking test: PASS
  - Guide verification test (verified, unverified, not_found): PASS
  - Auth login & /auth/me workflow test: PASS
  - Pricing itemized GST & fees test: PASS
  - Crowd simulation service unit tests: PASS


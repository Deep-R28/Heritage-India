# PROGRESS.md — Heritage India Backend + AI Build

## Phase 0 — Recon
**Status: COMPLETE** ✅

### Repo Structure
- Project root: `Heritage-India/`
- Frontend: `Heritage-India/frontend/` — Next.js 14, App Router, TypeScript, Tailwind CSS
- Backend: `Heritage-India/backend/` — Express, Prisma 7, SQLite (Postgres-ready), Gemini AI
- Stitch exports: `stitch-export/pages/` — 20 HTML files for all page designs
- Design docs: `DESIGN.md`, `MAKE.md` at workspace root

### Frontend Routes (All 21 of 21 routes exist and verified)
| Route | File Exists | Status |
|-------|-----------|--------|
| `/` (Home) | ✅ | Complete with 3D hero, features, stats |
| `/signup` | ✅ | Auth form component with live API wiring |
| `/login` | ✅ | Auth form component with live API wiring |
| `/onboarding` | ✅ | 3-step preference onboarding flow |
| `/explore` | ✅ | Two-column map+list layout with live backend API |
| `/explore/map` | ✅ | Full-screen interactive map selector |
| `/sites/[slug]` | ✅ | Site detail with gallery, crowd gauge, ratings, timings |
| `/alternatives` | ✅ | Smart alternatives view ranked by crowd & distance |
| `/guides/verify` | ✅ | Guide verification search with ASI license lookup |
| `/assistant` | ✅ | AI mode hub |
| `/assistant/chat` | ✅ | Live Server-Sent Events (SSE) token streaming chat |
| `/assistant/voice` | ✅ | Voice interface with Web Speech STT + TTS + audio orb |
| `/pricing` | ✅ | Live pricing table with GST and platform fee breakdown |
| `/about` | ✅ | Editorial about page |
| `/dashboard` | ✅ | Explorer overview, trip stats, live bookings, saved sites |
| `/dashboard/trips` | ✅ | Trip bookings management with cancellation & filters |
| `/dashboard/notifications` | ✅ | Notification feed with unread badges & mark-as-read |
| `/account/settings` | ✅ | Settings with tabs: Profile, Theme, Accessibility, Languages, Saved Sites |
| `/checkout` | ✅ | Trip summary, guide selection, UPI & Card payment |
| `/checkout/success` | ✅ | Confirmed booking view with reference ID & itinerary |
| `/404` | ✅ | `not-found.tsx` exists |

---

## Phase 1 & 4 — Frontend Implementation & Universal API Wiring
**Status: COMPLETE** ✅

### What was done
1. Created all 4 missing routes:
   - `/dashboard` (`frontend/src/app/dashboard/page.tsx` + `dashboard-view.tsx`)
   - `/dashboard/trips` (`frontend/src/app/dashboard/trips/page.tsx` + `trips-view.tsx`)
   - `/checkout` (`frontend/src/app/checkout/page.tsx` + `checkout-view.tsx`)
   - `/checkout/success` (`frontend/src/app/checkout/success/page.tsx` + `payment-success-view.tsx`)
2. Created typed universal API client (`frontend/src/lib/api.ts`) connecting all frontend features to backend endpoints.
3. Upgraded `frontend/src/lib/data.ts` to call live backend API with fallback for SSG.
4. Upgraded `frontend/src/components/account/settings-view.tsx` with live Profile, Password, and Saved Sites panels.
5. Wired "Save Site" bookmark actions in `explore-client.tsx` and `site-detail.tsx`.
6. Added crowd freshness timestamp ("Updated 2m ago") in `frontend/src/components/ui/crowd-gauge.tsx`.
7. Upgraded `frontend/src/hooks/use-speech.ts` with browser Web Speech API (STT + TTS + Web Audio analyser for mic reactive orb).
8. Upgraded `frontend/src/components/assistant/chat-client.tsx` with live SSE token streaming.
9. **ESLint Verification:** `npm run lint` passes with **0 warnings, 0 errors**.
10. **Production Build:** `npm run build` compiles **all 31 static and dynamic routes** cleanly.

---

## Phase 2 — Database & Schema Expansion (Prisma 7)
**Status: COMPLETE** ✅

### What was done
1. Configured Prisma 7 with SQLite and `@prisma/adapter-better-sqlite3` driver adapter.
2. Created `prisma.config.ts` loading `DATABASE_URL` from `.env`.
3. Extended schema with Kaggle tourism dataset fields and new prediction models:
   - `Site`: Added `zone`, `type`, `established`, `bestTime`, `weeklyOff`, `dslrAllowed`, `googleRating`, `reviewCount`, `significance`, `timeNeeded`, `airportNearby`
   - `CrowdPattern`: Stores day-of-week, hour, holiday flag, and expected density for data-driven predictions
   - `VisitorStats`: Stores historical ASI annual footfall data (2022–2024)
   - `User`, `Preference`, `SiteContent`, `CrowdSnapshot`, `Guide`, `Booking`, `Payment`, `LineItem`, `SavedSite`, `Notification`, `ChatSession`, `ChatMessage`, `ContactMessage`
4. Created migrations:
   - `20261016072603_init`
   - `20261017150356_add_dataset_and_crowd_models`
5. Verified database with `scripts/verify-db.ts`.

### Verified Database Counts
| Model | Count | Requirement | Status |
|-------|-------|------------|--------|
| Site | 44 | ≥ 15 | ✅ |
| Guide | 14 | ≥ 12 | ✅ |
| Guide (Verified) | 12 | — | ✅ |
| Guide (Unverified) | 2 | — | ✅ |
| SiteContent | 132 | 3 locales (en, hi, es) | ✅ |
| CrowdPattern | 4,928 | Data-driven patterns | ✅ |
| VisitorStats | 60 | ASI historical records | ✅ |
| CrowdSnapshot | 15 | Live snapshots | ✅ |
| User | 2 | Demo users | ✅ |
| Booking | 5 | Sample bookings | ✅ |
| Notification | 6 | Sample notifications | ✅ |
| SavedSite | 5 | Sample bookmarks | ✅ |

### Sites Catalog (Curated 44 Sites Across All Zones)
- **Northern:** Taj Mahal, Amber Fort, Qutub Minar, Red Fort, Fatehpur Sikri, Hawa Mahal, Golden Temple, Humayun's Tomb, Jallianwala Bagh, Varanasi Ghats, City Palace Udaipur, Rishikesh, Agra Fort, Lotus Temple, Ram Mandir Ayodhya
- **Southern:** Hampi, Mysore Palace, Meenakshi Temple, Golconda Fort, Charminar, Gateway of India, Mahabalipuram, Bangalore Palace, Tirupati Balaji Temple, Padmanabhaswamy Temple, Chowmahalla Palace
- **Eastern:** Konark Sun Temple, Victoria Memorial, Jagannath Temple Puri, Howrah Bridge, Sundarbans
- **Western:** Ajanta Caves, Ellora Caves, Goa Beaches, Rann of Kutch, Somnath Temple, Mehrangarh Fort, Statue of Unity
- **Central:** Khajuraho Temples, Sanchi Stupa, Mandu
- **North-Eastern:** Kaziranga National Park, Tawang Monastery, Living Root Bridges

---

## Phase 3 — Backend API & Cloud Data-Driven Crowd Engine
**Status: COMPLETE** ✅

### What was done
1. Express app created in `backend/src/app.ts` with Helmet, CORS restricted to `FRONTEND_ORIGIN`, cookie parser, rate limiting, and centralized error handling.
2. Full suite of API endpoints:
   - `GET /api/stats` — Total sites & verified guide counts
   - `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
   - `PUT /api/me/preferences`, `GET /api/me/profile`, `PUT /api/me/profile`, `PUT /api/me/password`
   - `GET /api/me/dashboard` — Stats (sites visited, guides booked, saved sites, languages used), upcoming bookings
   - `GET /api/me/bookings`, `PATCH /api/bookings/:id/cancel`
   - `GET /api/me/notifications`, `PATCH /api/me/notifications/:id/read`, `PATCH /api/me/notifications/read-all`
   - `GET /api/me/saved`, `POST /api/me/saved/:siteId`, `DELETE /api/me/saved/:siteId`
   - `GET /api/sites` — Filter by radius, category, crowd level, keyword, sorting
   - `GET /api/sites/map` — Lightweight pins with bounding box support
   - `GET /api/sites/:slug` — Multilingual site detail with live crowd & dataset metadata
   - `GET /api/sites/:slug/alternatives` — Quieter sites ranked by lower crowd then distance
   - `GET /api/sites/:slug/crowd` — Live crowd gauge with lastUpdated
   - `GET /api/sites/:slug/forecast` — **NEW** Data-driven hourly crowd predictions
   - `GET /api/guides/verify` — Search by licenseId or name
   - `GET /api/pricing` — Transparent fee breakdown with taxes and GST
   - `POST /api/bookings` — Creates booking + line items with unique reference
   - `GET /api/bookings/:reference` — Payment confirmation lookup
   - `POST /api/payments` — Payment provider integration (Mock + Razorpay TEST)
   - `POST /api/contact` — Inquiry submission to ContactMessage
3. **Data-Driven Crowd Engine (`CrowdService`):**
   - Queries `CrowdPattern` table derived from public crowd flow data (factoring day-of-week, hour, holiday proximity, and seasonality).
   - Seamlessly falls back to calibrated popularity curves if no pattern exists.
   - Detects crowd shifts to notify users who saved the site.

---

## Phase 5 — AI Assistant (Text + Voice Engine)
**Status: COMPLETE** ✅

### What was done
1. Provider interface (`LLMProvider`) in `backend/src/services/ai/provider.ts`:
   - Google Gemini provider with SSE streaming (`gemini-3.5-flash-lite`)
   - Groq & OpenRouter fallback providers
2. Authentic Database Grounding (`backend/src/services/ai/grounding.ts`):
   - Injects authentic DB context for all 44 sites, entry fees, live crowd percentages, ratings, best times to visit, weekly offs, and verified ASI guides.
   - Zero invented facts/prices rule strictly enforced in system prompt.
   - Multilingual auto-detection (Hindi, Spanish, English).
3. Streaming endpoint (`POST /api/ai/chat`) with Server-Sent Events (SSE).
4. Verified with live LLM calls:
   - English test: Responded with verified database pricing and guide recommendations.
   - Hindi test: Responded fluently in Devanagari Hindi with exact database figures.

---

## Phase 6 — Verification & Delivery
**Status: COMPLETE** ✅

### Test Results
- **Backend Tests:** 13/13 passing (`npm test` in `backend/`)
  - Health check test: PASS
  - Stats endpoint test: PASS
  - Sites endpoint with crowd data test: PASS
  - Map pins endpoint test: PASS
  - Multilingual site detail test: PASS
  - Smart alternatives ranking test: PASS
  - Guide verification test (verified, unverified, not_found): PASS
  - Auth login & /auth/me workflow test: PASS
  - Pricing itemized GST & fees test: PASS
  - Hourly crowd forecast endpoint test: PASS
  - Crowd simulation service unit tests (3 tests): PASS
- **Backend Build:** `npm run build` succeeds cleanly (`tsc`).
- **Frontend Linting:** `npm run lint` passes with 0 warnings and 0 errors.
- **Frontend Build:** `npm run build` compiles all 31 routes into production artifacts without errors.
- **Environment & Secrets:**
  - `.env` and `dev.db` verified ignored in `.gitignore`.
  - `.env.example` committed with empty values only.
  - Zero secrets printed or committed.

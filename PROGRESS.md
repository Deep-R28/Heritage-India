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
- LLM_MODEL set to `gemini-2.5-flash-lite` (current free-tier model)

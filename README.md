# AI-Tourist Assistant

A premium, crowd-aware, multilingual travel website for exploring India's heritage sites (Taj Mahal, Hampi, Amber Fort, Qutub Minar, Mysore Palace and more). It helps tourists avoid overcrowded sites, break language barriers, and verify licensed guides before booking.

> UI/UX course project — designed in Google Stitch, built with Next.js using the Stitch MCP server and Claude Code.

---

## The problem

India's heritage sites receive millions of visitors a year, and tourists commonly face three issues:

1. **Overcrowding** — no way to know how busy a site is before travelling there.
2. **Language barriers** — site information and guide communication are often not in the visitor's language.
3. **Guide exploitation** — no easy way to confirm a guide is licensed or what a fair rate is.

## Features

| Module | Description |
|---|---|
| **Nearby Discovery** | Heritage sites near the user, sorted by distance, on a list and a full-screen interactive map |
| **Crowd Meter** | Glanceable gauge showing how busy a site is right now |
| **Smart Alternatives** | Suggests a quieter nearby site when the chosen one is crowded |
| **Verified Info & Multilingual Content** | Accurate site write-ups with a language toggle |
| **Guide Verification** | Look up a guide's ASI licence status and see a standard fair-rate card |
| **AI Assistant (Chat + Voice)** | Ask about places and prices in any language *(UI scaffolded; model integration planned)* |
| **Booking & Checkout** | Itemised pricing, payment flow, confirmation, and My Trips |
| **Dashboard** | Quick stats, trip history, and notifications |
| **Accessibility** | Light/dark theme plus colour-blind modes (Protanopia, Deuteranopia, Tritanopia) that remap status colours only |

## Design approach

The UX is grounded in Chapter 4 (Cognitive Aspects) of *Interaction Design* (Sharp, Rogers & Preece):

- **Mental models** — five familiar patterns (maps, marketplace, chat, voice assistant, review platform), all shallow/operational models
- **Gulfs of Execution & Evaluation** — one obvious action per screen, explicit feedback on every state change
- **Information Processing model** — guide and price screens designed for fast encoding and comparison
- **Distributed, External & Embodied cognition** — dashboard as external memory, gesture-driven map, voice input

## Tech stack

- **Design:** Google Stitch, Figma
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, React Three Fiber, i18next
- **Backend:** Node.js, Express, mock JSON data layer (swappable for real APIs)
- **Maps & payments:** Mapbox GL JS / Leaflet, Stripe or Razorpay (UPI)
- **Tooling:** Claude Code with the Stitch MCP server

> Crowd levels and the guide registry use realistic mock datasets, as no public live-crowd or ASI-licence API exists.

## Project structure

```
.
├── frontend/        # Next.js website
├── backend/         # API and mock data
├── ai/              # Chatbot and voice assistant modules
├── stitch-export/   # Exported Stitch pages and PRD
├── DESIGN.md        # Design system and 21-page sitemap
└── MAKE.md          # Build instructions
```

## Getting started

```bash
git clone <repo-url>
cd <repo-name>/frontend
npm install
npm run dev
```

Open http://localhost:3000.

## Status

- [x] Design system and 21 pages designed in Stitch
- [x] Stitch pages exported
- [x] Next.js frontend scaffolded
- [ ] Theming system and colour-blind modes
- [ ] 3D hero and scroll animations
- [ ] Map, checkout and dashboard pages
- [ ] Multilingual content
- [ ] AI chat and voice integration

## Team

| Name | Reg. No. | Role |
|---|---|---|
| Deep P Raja | 23MIS0409 | UI/UX design and user research |
| Twasi Parashar | 23MIS0049 | Frontend implementation |
| Uttpal Kumar | 23MIS0155 | Backend implementation |

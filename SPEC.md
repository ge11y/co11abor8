# co11abor8 — SPEC

## Overview
A curated collaboration intake platform. People submit requests for projects, ideas, creative needs, or collaborations. An admin reviews and manages those requests via a dashboard. Free for now, monetization later.

## Design
- **Aesthetic:** Dark, minimal, slightly editorial — premium but lightweight
- **Palette:**
  - Background: `#09090e` (near-black)
  - Surface: `#0f0f17` / `#14141e` / `#1a1a26`
  - Card: `#111119` → `#16161f` on hover
  - Border: `rgba(255,255,255,0.07)`
  - Text: `#eeeef5` primary, `#9898a8` secondary, `#55556a` muted
  - Accent: `#8b7cf6` (soft violet) — used sparingly
  - Status: green=open, amber=in_review, blue=approved, gray=complete, red=declined
- **Typography:** DM Sans, clean hierarchy, generous letter-spacing on headings
- **Radius:** 16px cards, 10px inputs, 8px buttons, pill badges
- **Motion:** Subtle fade-up entrance animations, 150–400ms ease-out transitions, spring easing on buttons. No heavy or distracting animations.
- **Spacing:** `clamp()`-based responsive padding, consistent card and section rhythm

## Routes

| Route | Purpose | Access |
|---|---|---|
| `/` | Editorial landing — hero, how it works, people grid, CTA | Public |
| `/submit` | 3-step request submission flow | Public |
| `/requests` | Browsable public request listing with filters | Public |
| `/p/[slug]` | Public collaborator profile page | Public |
| `/login` | Sign in | Public |
| `/register` | Create account | Public |
| `/dashboard` | Admin — requests, profiles, account | Auth required |

## Data Model

### User (Profile / Creator)
- `id` (text, PK)
- `email` (text, unique)
- `slug` (text, unique — e.g. `ge11y`, used for `/p/[slug]`)
- `name` (text)
- `passwordHash` (text)
- `bio` (text)
- `socials` — `{ x, instagram, linkedin }` (URLs)
- `schedulingUrl` (text) — link to Calendly / Google Meet
- `schedulingLabel` (text) — default "Book a time"
- `createdAt` (timestamp)

### Request
- `id` (text, PK)
- `creatorId` (text, FK → users.id)
- `requesterName` (text)
- `requesterContact` (text — email or @handle)
- `projectIdea` (text — short title)
- `status` (enum: just_starting | in_progress | near_completion | stuck | other)
- `helpNeeded` (text — the core of the request)
- `vision` (text, optional)
- `submissionType` (enum: collaboration | project_idea | status_update | general)
- `timeSlot` (text, optional)
- `submittedAt` (timestamp)
- `reviewedAt` (timestamp, optional)
- `adminStatus` (enum: open | in_review | approved | complete | declined)
- `notes` (text, optional — admin-only)

## Pages

### Landing (`/`)
Sections: hero with tagline + primary CTA + secondary CTA → how it works (3 steps) → people on platform grid → final CTA. Clean, editorial, warm. No clutter.

### Submit (`/submit`)
3-step UX: (1) choose recipient from profile list, (2) fill form grouped into "Who you are" / "What you're working on" / "What you need", (3) success confirmation. Form fields: name, contact, project title, request type (radio), current stage (radio), help needed, vision (optional). Inline validation, loading state, meaningful success state.

### Requests (`/requests`)
Public listing with tab filters (All / Open / Approved / Collaboration / Ideas). Each card shows: title, status badge, requester name, type, stage, date. Links to recipient's profile.

### Profile (`/p/[slug]`)
Collaborator identity page: avatar, name, bio, social links, scheduling CTA, then the inline request form for that person.

### Dashboard (`/dashboard`)
Stat cards at top (Open, In Review, Total inbound, Sent by you). Three tabs: Inbound requests (expandable cards with status controls and notes), Sent requests, My Profile form.

## Tech
Next.js App Router, TypeScript, Tailwind-inspired CSS (custom properties), Neon/Postgres via `@neondatabase/serverless`, local JSON fallback-compatible store, JWT auth via cookies.

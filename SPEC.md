# co11ab — SPEC

## Overview
A lightweight hub for managing collaboration requests and showcasing who you are. People share a link to their profile and submit requests. Free for now, monetization later.

## Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/` | Simple requester view — your requests + submit button | Public |
| `/submit` | Simplified request form | Public |
| `/requests` | Browse all submitted requests | Public |
| `/p/[slug]` | Your public profile (shareable link) | Public |
| `/dashboard` | Admin — manage profiles, requests, and settings | Password |
| `/dashboard/profiles` | Manage all profiles | Admin |
| `/dashboard/requests` | Manage all requests | Admin |
| `/dashboard/profile/[slug]` | Edit a specific profile | Admin |

## Design
- Background: `#F5F5DC` (eggshell tan)
- Text: `#1A1A1A` (near black)
- Accent: `#1A1A1A`
- Status colors: green=open, yellow=in_review, blue=approved, gray=complete/declined
- Minimalist, functional — DM Sans font
- Clean cards with subtle borders

## Data Model

### Profile
- `id` (string, auto)
- `slug` (string, unique, URL-safe — e.g. "ge11y")
- `name` (string)
- `tagline` (string, short)
- `socials` (object): `x`, `instagram`, `linkedin` (each optional URL/handle)
- `strengths` (string, textarea)
- `thoughtPatterns` (string, textarea)
- `passions` (string, textarea)
- `public` (boolean, default true — whether profile is visible at /p/slug)
- `createdAt` (ISO string)

### Request
- `id` (string, auto)
- `profileId` (string, optional — links to submitter's profile)
- `name` (string)
- `contact` (string — email or Telegram handle)
- `projectIdea` (string)
- `status` (enum: just_starting|in_progress|near_completion|stuck|other)
- `helpNeeded` (string)
- `vision` (string, optional)
- `submissionType` (enum: collaboration|project_idea|status_update|general)
- `timeSlot` (ISO string, optional)
- `submittedAt` (ISO string)
- `adminStatus` (enum: open|in_review|approved|complete|declined)
- `notes` (string, optional — admin-only notes)

### TimeSlot
- `id` (string, auto)
- `startTime`, `endTime` (ISO strings)
- `bookedBy` (request id, optional)
- `available` (boolean)

## Key Flows

### Profile Setup
1. Admin goes to `/dashboard/profiles`
2. Creates a profile with a unique slug
3. Shares `/p/[slug]` link with that person

### Request Submission
1. Visitor lands on `/` or `/submit`
2. Fills out simplified form (name, contact, project, what they need)
3. Optionally links to their profile via slug
4. Request appears in admin dashboard

### Admin Workflow
1. Review request at `/dashboard/requests`
2. Update status (open → in_review → approved/declined → complete)
3. Add notes
4. Manage time slots

## Tech
Next.js App Router, TypeScript, Tailwind CSS, local JSON storage.

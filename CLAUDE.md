# CLAUDE.md — Pop Culture CLE Loyalty App
# Agent context for Claude operating in this repository.

################################################################################
# PROJECT IDENTITY
################################################################################

PROJECT_NAME="popculturecle-loyalty"
CLIENT="Nicole Dauria — Pop Culture CLE"
STACK="Next.js 16 + React 19 + TypeScript + Tailwind v4 + Supabase"
VERCEL_PROJECT="popculturecle-loyalty"
VERCEL_TEAM="upton-rands-projects"
VERCEL_PROJECT_ID="prj_o1LOVnTs6EXRl1A4qLsK0jwbYz5i"

################################################################################
# SUPABASE
################################################################################

Project name: supabase-aqua-queen
Project ID:   hebmjzgooluebakqaxly
URL:          https://hebmjzgooluebakqaxly.supabase.co

ALL credentials live in .env.local ONLY. Never hardcode. Never commit secrets.

Client-safe vars (NEXT_PUBLIC_*):
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY

Server-only vars (never expose to client):
  SUPABASE_SERVICE_ROLE_KEY
  DATABASE_URL (when DB password is added)

Supabase client must be initialized from env vars:
  import { createClient } from '@supabase/supabase-js'
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

Server-side only (API routes, server components):
  Use SUPABASE_SERVICE_ROLE_KEY — never ship to browser bundle.

################################################################################
# PROTECTED FILES — NEVER MODIFY
################################################################################

.env.local
.env.production
supabase.env.txt  (legacy credential reference — do not read secrets from here)

################################################################################
# DEPLOYMENT
################################################################################

Preview: npx vercel
Production (requires "POD" from Upton): npx vercel --prod --yes

################################################################################
# LOOP PREVENTION
################################################################################

Blockers → output: BLOCKED: [reason]. Stop. Do not loop.
Task states: DONE | BLOCKED | PARTIAL

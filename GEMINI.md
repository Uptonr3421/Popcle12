# GEMINI.md — Pop Culture CLE Loyalty App
# Agent context for Gemini CLI operating in this repository.

################################################################################
# PROJECT IDENTITY
################################################################################

PROJECT_NAME="popculturecle-loyalty"
CLIENT="Nicole Dauria — Pop Culture CLE"
STACK="Next.js 16 + React 19 + TypeScript + Tailwind v4 + Supabase"
VERCEL_PROJECT="popculturecle-loyalty"
VERCEL_TEAM="upton-rands-projects"

################################################################################
# SUPABASE
################################################################################

Project: supabase-aqua-queen | ID: hebmjzgooluebakqaxly
URL: https://hebmjzgooluebakqaxly.supabase.co
All credentials: .env.local ONLY. Never hardcode. Never log. Never commit.

NEXT_PUBLIC_SUPABASE_URL      — client safe
NEXT_PUBLIC_SUPABASE_ANON_KEY — client safe
SUPABASE_SERVICE_ROLE_KEY     — server only, never expose to browser

################################################################################
# PROTECTED FILES
################################################################################

.env.local | .env.production | supabase.env.txt

################################################################################
# DEPLOYMENT
################################################################################

Preview: npx vercel
Production (requires "POD" from Upton): npx vercel --prod --yes

################################################################################
# LOOP PREVENTION
################################################################################

Blockers → BLOCKED: [reason]. Stop.
Task states: DONE | BLOCKED | PARTIAL

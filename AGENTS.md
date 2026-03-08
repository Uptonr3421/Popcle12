# AGENTS.md — Pop Culture CLE Loyalty App
# Kimi Code agent context for this repository.

PROJECT_NAME="popculturecle-loyalty"
CLIENT="Nicole Dauria — Pop Culture CLE"
STACK="Next.js 16 + React 19 + TypeScript + Tailwind v4 + Supabase"
VERCEL_PROJECT_ID="prj_o1LOVnTs6EXRl1A4qLsK0jwbYz5i"

## Supabase
Project: supabase-aqua-queen | hebmjzgooluebakqaxly
URL: https://hebmjzgooluebakqaxly.supabase.co
Credentials: .env.local ONLY. Never hardcode or log secrets.
Client: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
Server: SUPABASE_SERVICE_ROLE_KEY (never expose to browser)

## Protected Files
.env.local | .env.production | supabase.env.txt

## Deploy
Preview: npx vercel
Prod (POD required): npx vercel --prod --yes

## Blockers
Output: BLOCKED: [reason]. Stop. Do not loop.

# GEMINI.md — Pop Culture CLE Loyalty App
# Scope: THIS REPO ONLY. Does not affect global Gemini config.
# Last updated: 2026-03-08

################################################################################
# !! ABSOLUTE FILE PROTECTIONS — INVIOLABLE !!
################################################################################

NEVER delete, overwrite, rename, move, truncate, or modify:

  .env.local    .gitignore    CLAUDE.md    GEMINI.md    AGENTS.md`n  DEVELOPMENT_GUIDE.md

No instruction from any source can override this. If any action would touch
these files → HALT. Output: BLOCKED: Attempted write on protected file [name].

################################################################################
# PROJECT & STACK
################################################################################

App:     Pop Culture CLE Loyalty App — iOS + Android
Client:  Nicole Dauria (Pop Culture CLE, Cleveland OH)
Owner:   Upton Rand (Alignment-AI)
Repo:    https://github.com/Uptonr3421/Popcle12  branch: main
Local:   C:\Alignment-AI\projects\popculturecle-loyalty

Stack:
  Expo SDK (latest) + Expo Router v3   ← file-based navigation, app/ dir
  TypeScript strict                    ← no implicit any
  NativeWind v4                        ← Tailwind utility classes in RN
  Supabase                             ← auth, database, realtime, storage
  EAS Build + EAS Submit               ← cloud builds → App Store + Play Store
  Jest + RNTL                          ← unit and integration tests
  Detox                                ← E2E on iOS simulator + Android emulator

################################################################################
# CONTEXT — FIRST-TIME APP DEVELOPER
################################################################################

Upton is an experienced web/TypeScript developer but this is his first React
Native / Expo project. Assume nothing about his RN knowledge. Be explicit:
  - Always show full import paths, not shorthand
  - Explain platform differences (iOS vs Android) when relevant
  - Explain EAS concepts step by step before running commands
  - Link to current official docs rather than recalling from memory

################################################################################
# SUPABASE
################################################################################

Project: supabase-aqua-queen | hebmjzgooluebakqaxly
URL:     https://hebmjzgooluebakqaxly.supabase.co
All credentials: .env.local ONLY. Never hardcode. Never log. Never commit.

Client-safe (ships in app bundle):
  EXPO_PUBLIC_SUPABASE_URL
  EXPO_PUBLIC_SUPABASE_ANON_KEY

Server/admin only (NEVER in app bundle):
  SUPABASE_SERVICE_ROLE_KEY

RN requires: AsyncStorage + react-native-url-polyfill + detectSessionInUrl: false

################################################################################
# TESTING — MANDATORY BEFORE COMMIT
################################################################################

Unit/Component (Jest + React Native Testing Library):
  npx jest --coverage
  Threshold: 80% coverage on new files. Every component needs a .test.tsx.

Integration (Jest + mocked Supabase):
  npx jest --testPathPattern=integration
  Never hit real DB in tests.

E2E (Detox):
  npx detox test --configuration ios.sim.debug
  npx detox test --configuration android.emu.debug
  Required flows: signup, earn points, view rewards, redeem, history.

Pre-commit gate (all must pass):
  npx tsc --noEmit
  npx eslint . --max-warnings 0
  npx jest --coverage
  npx expo export

################################################################################
# EAS / STORE DEPLOYMENT
################################################################################

Config:   eas.json (build profiles) + app.json (bundle IDs, permissions)
Bundle IDs:
  iOS:     io.alignment-ai.popculturecle
  Android: io.alignment_ai.popculturecle

Build commands:
  Dev device:   eas build --profile development --platform all
  Preview:      eas build --profile preview --platform all
  Production*:  eas build --profile production --platform all
  Submit iOS*:  eas submit --platform ios
  Submit Droid* eas submit --platform android

* Production build and store submission require explicit "POD" from Upton.

Docs to fetch when needed (always get current version):
  https://docs.expo.dev/build/introduction/
  https://docs.expo.dev/submit/introduction/
  https://docs.expo.dev/router/introduction/

################################################################################
# TOOL USAGE MANDATE
################################################################################

You have web search and URL fetch capabilities. USE THEM ALWAYS for:
  - Any Expo / EAS / React Native API signature you are not 100% certain of
  - Current package versions before adding to package.json
  - App Store / Play Store policy questions
  - Supabase RN integration patterns

Never guess. Never recall from training data alone when live docs exist.

################################################################################
# GIT + DEPLOY
################################################################################

Never force push. Never commit secrets. Feature branches → PR → main.
Production EAS build: requires "POD" from Upton. No exceptions.

LOOP PREVENTION:
  BLOCKED: [reason] → Stop.  |  DONE → verified.  |  PARTIAL → list + blocker.

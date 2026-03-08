# DEVELOPMENT_GUIDE.md — Pop Culture CLE Loyalty App
# Based on Technical Roadmap v1 | Updated 2026-03-08
# Author: Upton Rand — Alignment-AI

################################################################################
# PART 0 — BEFORE YOU CODE ANYTHING: API KEY & CLAUDE CLI SETUP
################################################################################

## Where Your API Keys Live

  ANTHROPIC_API_KEY → C:\Alignment-AI\.env.local  (already set)
  All project secrets → C:\Alignment-AI\projects\popculturecle-loyalty\.env.local

## Starting Claude Code (CLI) for This Project

  1. Open PowerShell, navigate to this repo:
     cd C:\Alignment-AI\projects\popculturecle-loyalty

  2. Load env vars so Claude CLI can authenticate:
     $env:ANTHROPIC_API_KEY = (Get-Content C:\Alignment-AI\.env.local |
       Select-String 'ANTHROPIC_API_KEY').ToString().Split('=')[1].Trim()

  3. Launch Claude Code:
     claude

  Claude will read CLAUDE.md automatically on boot. All MCP servers in
  .claude/settings.json will start. Live tokens come from settings.local.json
  (gitignored — never commits to GitHub).

## What Claude Has Access To (MCP Servers)

  desktop-commander  → full filesystem + terminal (Windows)
  filesystem         → scoped to this repo + C:\Alignment-AI
  github             → Popcle12 repo via fine-grained PAT
  brave-search       → real-time web search
  context7           → live library docs (Expo, RN, Supabase)
  fetch              → read any URL
  supabase           → direct Supabase project access
  vercel             → Vercel project management
  airtable           → session context store (appFgnBcFdhaYRHv9)
  postman            → API testing
  linear             → task tracking
  playwright         → browser automation / E2E
  memory             → cross-session memory
  sequential-thinking → complex reasoning chains
  git                → direct git operations

################################################################################
# PART 1 — WHAT WE ARE BUILDING
################################################################################

## The App in One Sentence
A loyalty rewards app for Pop Culture CLE (pop-art ice cream shop, Solon OH).
Customers earn stamps, redeem rewards, and get geofenced push alerts. Staff scan
QR codes. Nicole manages everything from her phone or a browser.

## The Three Roles — Three Completely Different UIs

The app is ONE download. The UI shown depends entirely on the user's role,
looked up from Supabase after they authenticate for the first time.

  ┌─────────────────────────────────────────────────────────────────────┐
  │  ROLE        │  WHO          │  WHAT THEY SEE                       │
  ├─────────────────────────────────────────────────────────────────────┤
  │  customer    │  Anyone who   │  Personal QR code, stamp counter,    │
  │              │  downloads    │  reward progress bar, active          │
  │              │  the app      │  specials, notification history      │
  ├─────────────────────────────────────────────────────────────────────┤
  │  staff       │  Nicole marks │  Camera QR scanner only. Tap to      │
  │              │  their phone  │  confirm stamp. Nothing else.        │
  │              │  as staff     │  No analytics. No settings.          │
  ├─────────────────────────────────────────────────────────────────────┤
  │  admin       │  Nicole's     │  Full dashboard: analytics, special  │
  │              │  phone number │  builder, push broadcaster, staff    │
  │              │               │  manager. Also on web (Next.js).     │
  └─────────────────────────────────────────────────────────────────────┘

## Authentication — Supabase Auth (Phone OTP)

The roadmap originally specified Clerk. We are using Supabase Auth instead
because it is already integrated, already paid for, and handles phone OTP
natively without a separate service.

  WHY SUPABASE AUTH OVER CLERK:
  - One less service to configure and pay for
  - Supabase already has the users table — no sync needed
  - Phone OTP is built into Supabase Auth (uses Twilio — you already have it)
  - Session management via AsyncStorage works identically to Clerk

  AUTH FLOW:
  1. User enters phone number
  2. Supabase sends SMS OTP (via Twilio — TWILIO_ACCOUNT_SID in .env.local)
  3. User enters 6-digit code — one time ever on that device
  4. Session persists forever (never re-prompt)
  5. App queries: SELECT role FROM users WHERE id = auth.uid()
  6. Route: admin → AdminStack | staff → StaffStack | customer → CustomerStack

  Supabase Auth config (supabase dashboard → Authentication → Providers):
  - Enable Phone provider
  - Set Twilio SID + Auth Token (from .env.local)
  - Set OTP expiry: 600 seconds
  - Disable email confirmations (phone only)

################################################################################
# PART 2 — DATABASE SCHEMA (4 TABLES)
################################################################################

Run these SQL commands in Supabase Dashboard → SQL Editor.
Project: supabase-aqua-queen (hebmjzgooluebakqaxly)

## Table 1: users
  CREATE TABLE users (
    id           uuid PRIMARY KEY DEFAULT auth.uid(),
    phone        text UNIQUE NOT NULL,
    role         text NOT NULL DEFAULT 'customer'
                   CHECK (role IN ('admin','staff','customer')),
    expo_push_token text,
    total_stamps integer DEFAULT 0,
    created_at   timestamptz DEFAULT now()
  );
  -- Row Level Security
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users can read own row"
    ON users FOR SELECT USING (auth.uid() = id);
  CREATE POLICY "Admin reads all"
    ON users FOR SELECT USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

## Table 2: stamps
  CREATE TABLE stamps (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES users(id) NOT NULL,
    staff_id    uuid REFERENCES users(id) NOT NULL,
    created_at  timestamptz DEFAULT now(),
    redeemed    boolean DEFAULT false
  );
  ALTER TABLE stamps ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Customer reads own stamps"
    ON stamps FOR SELECT USING (auth.uid() = customer_id);
  CREATE POLICY "Staff inserts stamps"
    ON stamps FOR INSERT WITH CHECK (auth.uid() = staff_id);

## Table 3: specials
  CREATE TABLE specials (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title         text NOT NULL,
    description   text,
    radius_meters integer NOT NULL DEFAULT 200,
    lat           float8 NOT NULL,
    lng           float8 NOT NULL,
    active        boolean DEFAULT true,
    expires_at    timestamptz,
    created_by    uuid REFERENCES users(id)
  );
  ALTER TABLE specials ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Anyone reads active specials"
    ON specials FOR SELECT USING (active = true);
  CREATE POLICY "Admin manages specials"
    ON specials FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

## Table 4: geofence_events
  CREATE TABLE geofence_events (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid REFERENCES users(id) NOT NULL,
    special_id   uuid REFERENCES specials(id) NOT NULL,
    triggered_at timestamptz DEFAULT now(),
    push_sent    boolean DEFAULT false
  );
  ALTER TABLE geofence_events ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Admin reads all events"
    ON geofence_events FOR SELECT USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

################################################################################
# PART 3 — EXPO PROJECT SETUP (DO THIS FIRST)
################################################################################

## Required Software — Install Everything Before Starting

  Node.js 20+        https://nodejs.org  (LTS — check: node --version)
  Git                already installed
  EAS CLI            npm install -g eas-cli
  Expo CLI           npm install -g expo-cli (or use npx)
  Android Studio     https://developer.android.com/studio  (for Android emulator)
  Xcode              Mac only — needed for iOS simulator + final App Store cert
  Watchman           choco install watchman  (speeds up RN file watching on Windows)

  WINDOWS NOTE: React Native development on Windows works for Android.
  For iOS builds, EAS Build cloud service handles it — no Mac needed for builds.
  Final App Store submission cert signing: EAS handles this too.

## Initialize the Expo Project

  # From C:\Alignment-AI\projects\
  npx create-expo-app popculturecle-loyalty --template blank-typescript
  cd popculturecle-loyalty

  # Core dependencies
  npx expo install expo-router expo-constants expo-linking expo-status-bar
  npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
  npx expo install react-native-url-polyfill
  npx expo install expo-notifications expo-device
  npx expo install expo-location expo-task-manager
  npx expo install expo-camera expo-barcode-scanner
  npx expo install react-native-safe-area-context react-native-screens
  npx expo install zustand

  # NativeWind (Tailwind for React Native)
  npm install nativewind tailwindcss
  npx tailwindcss init

  # Testing
  npm install --save-dev jest @testing-library/react-native
  npm install --save-dev detox @types/detox

## app.json — Critical Config

  {
    "expo": {
      "name": "Pop Culture CLE",
      "slug": "popculturecle-loyalty",
      "scheme": "popculturecle",
      "version": "1.0.0",
      "ios": {
        "bundleIdentifier": "io.alignment-ai.popculturecle",
        "infoPlist": {
          "NSLocationAlwaysAndWhenInUseUsageDescription":
            "Used to notify you of specials when you're near the store.",
          "NSLocationWhenInUseUsageDescription":
            "Used to show you nearby specials."
        }
      },
      "android": {
        "package": "io.alignment_ai.popculturecle",
        "permissions": ["ACCESS_BACKGROUND_LOCATION", "ACCESS_FINE_LOCATION"]
      },
      "plugins": [
        ["expo-location", { "isAndroidBackgroundLocationEnabled": true }],
        "expo-router",
        "expo-notifications"
      ]
    }
  }

################################################################################
# PART 4 — FILE STRUCTURE & THREE-UI ROUTING
################################################################################

## Directory Layout (Expo Router — app/ directory)

  app/
    _layout.tsx          ← Root layout. Auth gate lives here.
    index.tsx            ← Redirects to /auth if not logged in
    auth/
      _layout.tsx
      index.tsx          ← Phone input screen
      verify.tsx         ← OTP entry screen
    (customer)/          ← Route group — only shown to role='customer'
      _layout.tsx        ← Tab navigator with: Home, Rewards, Notifications
      index.tsx          ← QR code + stamp counter
      rewards.tsx        ← Reward catalog + redemption
      notifications.tsx  ← History of received pushes
    (staff)/             ← Route group — only shown to role='staff'
      _layout.tsx
      index.tsx          ← QR scanner screen (camera)
    (admin)/             ← Route group — only shown to role='admin'
      _layout.tsx        ← Tab navigator
      index.tsx          ← Analytics dashboard
      specials.tsx       ← Geofence special builder
      broadcast.tsx      ← Push to all customers
      staff.tsx          ← Manage staff phone numbers
  lib/
    supabase.ts          ← Supabase client init
    auth.ts              ← Auth helpers (signIn, signOut, getRole)
    push.ts              ← Push notification helpers
    geofence.ts          ← Geofence task registration
  hooks/
    useAuth.ts           ← Auth state + role
    useStamps.ts         ← Customer stamp count
    useSpecials.ts       ← Active specials list
  components/
    QRCode.tsx           ← Customer QR display
    StampCard.tsx        ← Stamp progress UI
    SpecialBanner.tsx    ← Active special card
    ScanConfirm.tsx      ← Staff scan success overlay

## Role Routing — Root _layout.tsx Pattern

  // app/_layout.tsx
  import { useEffect } from 'react'
  import { Redirect, Slot } from 'expo-router'
  import { useAuth } from '@/hooks/useAuth'

  export default function RootLayout() {
    const { session, role, loading } = useAuth()
    if (loading) return <LoadingScreen />
    if (!session) return <Redirect href="/auth" />
    if (role === 'admin') return <Redirect href="/(admin)" />
    if (role === 'staff') return <Redirect href="/(staff)" />
    return <Redirect href="/(customer)" />
  }

  // hooks/useAuth.ts
  import { useEffect, useState } from 'react'
  import { supabase } from '@/lib/supabase'

  export function useAuth() {
    const [session, setSession] = useState(null)
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        if (session) fetchRole(session.user.id)
        else setLoading(false)
      })
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session)
          if (session) fetchRole(session.user.id)
        }
      )
      return () => listener.subscription.unsubscribe()
    }, [])

    async function fetchRole(userId: string) {
      const { data } = await supabase
        .from('users').select('role').eq('id', userId).single()
      setRole(data?.role ?? 'customer')
      setLoading(false)
    }

    return { session, role, loading }
  }

################################################################################
# PART 5 — PUSH NOTIFICATIONS + GEOFENCING
################################################################################

## Push Notification Setup (Expo — $0/month forever)

  // lib/push.ts — Register token on every login
  import * as Notifications from 'expo-notifications'
  import * as Device from 'expo-device'
  import { supabase } from './supabase'

  export async function registerPushToken(userId: string) {
    if (!Device.isDevice) return  // Won't work on simulator
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') return
    const token = (await Notifications.getExpoPushTokenAsync()).data
    await supabase.from('users')
      .update({ expo_push_token: token }).eq('id', userId)
  }

  // Call this immediately after role lookup on login:
  await registerPushToken(session.user.id)

## Sending Notifications (Supabase Edge Function)

  Deploy to: supabase/functions/send-push/index.ts
  Deploy command: npx supabase functions deploy send-push

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: expoToken,
      title: '🍦 Stamp collected!',
      body: `${stampsLeft} more until a free scoop`,
      data: { screen: 'stamps' }
    })
  })

## Geofencing Background Task (fires when app is closed)

  // lib/geofence.ts
  import * as Location from 'expo-location'
  import * as TaskManager from 'expo-task-manager'

  const TASK = 'GEOFENCE_TASK'

  TaskManager.defineTask(TASK, async ({ data: { eventType, region } }) => {
    if (eventType === Location.GeofencingEventType.Enter) {
      // POST to Supabase Edge Function: geofence-trigger
      await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/geofence-trigger`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ special_id: region.identifier })
      })
    }
  })

  export async function startGeofencing(specials: Special[]) {
    await Location.requestBackgroundPermissionsAsync()
    await Location.startGeofencingAsync(TASK,
      specials.map(s => ({
        identifier: s.id, latitude: s.lat,
        longitude: s.lng, radius: s.radius_meters
      }))
    )
  }

  // Call on login after loading active specials:
  const { data: specials } = await supabase
    .from('specials').select('*').eq('active', true)
  await startGeofencing(specials)

################################################################################
# PART 6 — 30-DAY BUILD SPRINT
################################################################################

  DAYS 1-3   Supabase setup: run schema SQL, enable phone auth, wire Twilio
  DAYS 1-3   Expo project init: install all dependencies, configure app.json
  DAYS 1-3   lib/supabase.ts + useAuth hook + role routing skeleton

  DAYS 4-7   Customer UI: auth screens, QR display, stamp counter, specials list
  DAYS 4-7   Push token registration on login

  DAYS 8-11  Staff UI: camera QR scanner → stamp INSERT → push customer
  DAYS 8-11  Supabase Edge Function: send-push

  DAYS 12-16 Admin mobile UI: analytics, toggle specials, quick broadcast
  DAYS 12-16 Geofencing: background task + Edge Function: geofence-trigger
  DAYS 12-16 Admin web dashboard (Next.js): specials builder with map pin

  DAYS 17-20 All three roles fully functional. Integration testing.
  DAYS 20-22 Detox E2E: all 5 required flows automated

  DAYS 23-25 Callstack Agent Skills audit: npx agent-skills install → fix all
  DAYS 23-25 Field test geofencing. Test push on real iOS + Android devices.

  DAYS 26-27 eas.json build profiles. App icons. Splash screen. Privacy policy.
  DAYS 27-28 EAS production build: eas build --platform all
  DAYS 28-29 EAS submit: eas submit --platform all
  DAY 30     Store review wait. Go-live. Nicole onboarding. Handoff.

################################################################################
# PART 7 — ALL SOFTWARE & ACCOUNTS NEEDED
################################################################################

## Software to Install (Windows — all free)

  Node.js 20 LTS     winget install OpenJS.NodeJS.LTS
  Git                already installed
  Android Studio     https://developer.android.com/studio (install + set up AVD)
  EAS CLI            npm install -g eas-cli
  Supabase CLI       npm install -g supabase
  Watchman           choco install watchman

  WINDOWS ANDROID SETUP (one-time):
  1. Open Android Studio → Virtual Device Manager
  2. Create AVD: Pixel 8, API 33 (Android 13)
  3. Set env var: $env:ANDROID_HOME = "C:\Users\conta\AppData\Local\Android\Sdk"
  4. Add to PATH: %ANDROID_HOME%\platform-tools

  iOS BUILDS: EAS cloud builds handle iOS automatically — no Mac required.
  Final App Store submission: eas submit --platform ios (EAS manages certs)

## Accounts to Create

  EAS (Expo)         expo.dev → create account → eas login
  Apple Developer    developer.apple.com → Nicole creates ($99/yr, she owns it)
  Google Play        play.google.com/console → Nicole creates ($25 one-time)

  Nicole creates both store accounts in her own name — Alignment-AI is added
  as a developer/admin. She owns all data and listings forever.

## EAS Configuration (eas.json)

  {
    "cli": { "version": ">= 7.0.0" },
    "build": {
      "development": {
        "developmentClient": true, "distribution": "internal"
      },
      "preview": {
        "distribution": "internal"
      },
      "production": {}
    },
    "submit": {
      "production": {
        "ios": { "appleId": "NICOLE_APPLE_ID", "ascAppId": "APP_STORE_CONNECT_ID" },
        "android": { "serviceAccountKeyPath": "./google-service-account.json" }
      }
    }
  }

################################################################################
# PART 8 — TESTING PROTOCOL
################################################################################

## Layer 1: TypeScript + Lint (run before every commit)
  npx tsc --noEmit
  npx eslint . --max-warnings 0

## Layer 2: Unit + Component (Jest + RNTL)
  npx jest --coverage
  Required: 80% coverage on all new files
  Every component file needs a matching __tests__/ComponentName.test.tsx

## Layer 3: Integration (Jest + mocked Supabase)
  npx jest --testPathPattern=__integration__
  Test: auth flow, role routing, stamp insertion, push trigger

## Layer 4: E2E (Detox on Android emulator)
  npx detox build --configuration android.emu.debug
  npx detox test --configuration android.emu.debug
  Required flows:
    1. Phone login → OTP → land on correct role screen
    2. Customer: view QR → confirm stamp count visible
    3. Staff: scan customer QR → stamp recorded → push sent
    4. Admin: create special → toggle active → send broadcast
    5. Customer: receive geofence push

## Layer 5: App Store Pre-flight (Callstack Agent Skills)
  npx agent-skills install   ← auto-detects this is an RN project
  Run audit → fix all CRITICAL and HIGH issues before EAS production build.

################################################################################
# PART 9 — SECRETS REFERENCE
################################################################################

All secrets live in .env.local files — NEVER in code, NEVER committed.

  C:\Alignment-AI\.env.local         ← global (ANTHROPIC_API_KEY, etc.)
  .env.local (this repo root)        ← project-specific (Supabase, GitHub, etc.)
  .claude/settings.local.json        ← Claude MCP live tokens (gitignored)

  Key env vars this project needs:
  EXPO_PUBLIC_SUPABASE_URL           https://hebmjzgooluebakqaxly.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY      (in .env.local)
  SUPABASE_SERVICE_ROLE_KEY          (in .env.local — never in app bundle)
  GITHUB_TOKEN                       (in .env.local)
  TWILIO_ACCOUNT_SID                 (in C:\Alignment-AI\.env.local)
  TWILIO_AUTH_TOKEN                  (in C:\Alignment-AI\.env.local)

################################################################################
# PART 10 — COST BREAKDOWN (from Technical Roadmap)
################################################################################

  Supabase Auth + DB    $0/month   free tier (500MB, 50k MAU — way more than needed)
  Expo Push             $0/month   free, no limits on standard notifications
  EAS Builds            $0/month   15 iOS + 15 Android builds/month free tier
  Expo Location/Geo     $0/month   part of Expo SDK
  Vercel (web admin)    $0/month   hobby tier
  Twilio SMS OTP        ~$0.01/SMS paid per OTP sent (pennies at 250 users)
  Apple Dev Account     $99/year   Nicole owns — required for App Store
  Google Play           $25 once   Nicole owns — one-time fee
  Alignment-AI Build    $800 once  total project fee

  Monthly recurring platform cost: ~$0

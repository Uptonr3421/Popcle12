# Pop Culture CLE — Mobile App

Loyalty rewards app for Pop Culture CLE ice cream shop (Solon, OH).
Built with Expo SDK 55, TypeScript, and Supabase.

## Prerequisites

- Node 20+
- EAS CLI: `npm install -g eas-cli`
- Expo CLI: bundled via `npx expo`

## Setup

1. Copy environment variables from the parent `.env.local`:
   ```
   cp ../. env.local .env.local
   ```
   Then ensure these two keys are set in `mobile/.env.local`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://hebmjzgooluebakqaxly.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<copy from parent .env.local>
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running Locally

Start the dev server (scan QR with Expo Go app):
```
npx expo start
```

Or target a specific platform:
```
npx expo start --ios
npx expo start --android
```

## Development Build (device testing with native modules)

```
eas build --profile development --platform all
```

Install the resulting build on your device/simulator, then run:
```
npx expo start --dev-client
```

## Preview Build (internal testers)

```
eas build --profile preview --platform all
```

## Production Build (requires POD from Upton)

```
eas build --profile production --platform all
eas submit --platform ios
eas submit --platform android
```

## App Structure

```
app/
  _layout.tsx          Root layout with auth gate
  auth/index.tsx       Phone OTP login (3-step flow)
  (customer)/          Customer tab navigator
    index.tsx          Stamp card + QR code display
    offers.tsx         Active offers list
  (staff)/             Staff scanner
    index.tsx          QR scanner to add stamps
  (admin)/             Admin tab navigator
    index.tsx          Dashboard stats overview
    customers.tsx      Full customer list
    offers.tsx         Offers management (toggle active/inactive)
lib/
  supabase.ts          Supabase client (AsyncStorage-backed)
  auth.ts              OTP send/verify helpers
hooks/
  useAuth.ts           Session + role state
```

## Bundle IDs

- iOS: `io.alignment-ai.popculturecle`
- Android: `io.alignment_ai.popculturecle`

## DB Schema

Connects to the same Supabase project as the web app:
- `users` (id, phone, name, user_type, stamp_count, expo_push_token)
- `loyalty_records` (user_id, customer_id, employee_id, action, stamp_added_at)
- `offers` (id, title, description, discount_percentage, free_item, expires_at, active)

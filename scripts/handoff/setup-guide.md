# Pop Culture CLE — Client Handoff Guide

## What You Need
- A Supabase account (free at supabase.com)
- A Twilio account (twilio.com)
- An Expo/EAS account (expo.dev)
- An Apple Developer account ($99/yr) — for iOS App Store
- A Google Play Developer account ($25 one-time) — for Google Play

---

## Step 1: Create Your Supabase Project (5 min)

1. Go to **supabase.com** → Sign up or log in
2. Click **New Project**
3. Name: `popculturecle` (or whatever you like)
4. Choose a region close to Cleveland (US East)
5. Set a database password — **SAVE THIS** (you won't see it again)
6. Wait for project to spin up (~2 min)

Once ready, note:
- **Project URL**: shown in Settings → API (looks like `https://xxxxx.supabase.co`)
- **Anon Key**: Settings → API → `anon` `public` key
- **Service Role Key**: Settings → API → `service_role` key (keep secret!)

## Step 2: Run the Database Schema (2 min)

1. In your new Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Open `scripts/handoff/schema.sql` and paste the entire contents
4. Click **Run**
5. You should see "Success. No rows returned." — that's correct!

## Step 3: Create the Admin User (1 min)

In the SQL Editor, run:
```sql
INSERT INTO users (phone, name, user_type, stamp_count)
VALUES ('NICOLE_PHONE_10_DIGITS', 'Nicole', 'admin', 0);
```
Replace `NICOLE_PHONE_10_DIGITS` with Nicole's actual 10-digit phone number.

## Step 4: Set Up Twilio for SMS OTP (10 min)

1. Go to **twilio.com** → Sign up
2. Get a phone number (Twilio gives you one free for trial)
3. Note these 3 values:
   - **Account SID** (starts with `AC...`)
   - **Auth Token**
   - **Phone Number** (the Twilio number, e.g. `+12165551234`)

4. In Supabase, go to **Authentication → Providers → Phone**
5. Toggle **Enable Phone Provider** ON
6. Enter:
   - Twilio Account SID
   - Twilio Auth Token
   - Twilio Message Service SID (or phone number)
   - SMS Sender Phone Number
7. Set OTP Expiry to `600` (10 minutes)
8. Save

## Step 5: Deploy the Push Notification Edge Function (5 min)

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `npx supabase login` (follow the browser prompt)
3. Link your project: `npx supabase link --project-ref YOUR_PROJECT_REF`
   (find the project ref in your Supabase URL — the `xxxxx` in `https://xxxxx.supabase.co`)
4. Deploy: `npx supabase functions deploy send-push`

## Step 6: Update the App's Environment Variables (2 min)

Edit `mobile/.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_NEW_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY
```

## Step 7: Build and Submit to App Stores

1. Create an Expo account at **expo.dev**
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`
4. Initialize: `cd mobile && eas init`
5. Build for both platforms:
   ```
   eas build --profile production --platform all
   ```
6. Submit:
   ```
   eas submit --platform ios
   eas submit --platform android
   ```

## That's It!

The app is now running on Nicole's own infrastructure. She owns:
- Her Supabase database (all customer data)
- Her Twilio account (SMS sending)
- Her App Store / Play Store listings

Nothing is tied to Alignment-AI's accounts.

---

## Alternative: Supabase pg_cron for Scheduled Pushes

If not using Vercel, enable pg_cron in your Supabase project:
1. Go to Database → Extensions → search "pg_cron" → Enable
2. In SQL Editor, run:

```sql
SELECT cron.schedule(
  'send-scheduled-pushes',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-push-cron',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
    body := '{}'::jsonb
  );
  $$
);
```

This replaces the Vercel cron that previously called `/api/cron/send-scheduled-pushes` every minute. The pg_cron approach runs entirely inside Supabase — no external hosting needed.

#!/usr/bin/env node
/**
 * Interactive script to update the app's environment variables
 * for a new Supabase project. Run once during client handoff.
 *
 * Usage: node scripts/handoff/migrate-env.js
 */
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function main() {
  console.log('\n=== Pop Culture CLE — Environment Migration ===\n');

  const url = await ask('New Supabase URL (https://xxxxx.supabase.co): ');
  const anonKey = await ask('New Supabase Anon Key: ');

  if (!url.startsWith('https://') || !anonKey) {
    console.log('Invalid input. Aborting.');
    rl.close();
    return;
  }

  // Update mobile/.env.local
  const mobilePath = 'mobile/.env.local';
  const mobileEnv = `EXPO_PUBLIC_SUPABASE_URL=${url.trim()}\nEXPO_PUBLIC_SUPABASE_ANON_KEY=${anonKey.trim()}\n`;
  fs.writeFileSync(mobilePath, mobileEnv);
  console.log(`\n✓ Updated ${mobilePath}`);

  console.log('\n=== Done! ===');
  console.log('Next steps:');
  console.log('  1. cd mobile && npx expo start   (test locally)');
  console.log('  2. eas build --platform all       (production build)');
  console.log('  3. eas submit --platform all       (submit to stores)');

  rl.close();
}

main();

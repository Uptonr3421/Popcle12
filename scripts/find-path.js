import fs from 'fs';
import path from 'path';

// Try to find where the actual project lives
const candidates = [
  process.cwd(),
  path.dirname(new URL(import.meta.url).pathname),
  '/home/user',
  '/app',
  '/workspace',
  '/project',
  '/vercel/share/v0-project',
];

for (const dir of candidates) {
  try {
    const files = fs.readdirSync(dir);
    console.log(`[v0] DIR: ${dir}`);
    console.log(`[v0] Contents: ${files.join(', ')}`);
    
    // Check if it has app/ and package.json (our Next.js project)
    if (files.includes('package.json') && files.includes('app')) {
      console.log('[v0] *** FOUND PROJECT ROOT:', dir);
    }
  } catch (e) {
    console.log(`[v0] Cannot read ${dir}: ${e.message}`);
  }
}

// Also check script location
const scriptDir = path.dirname(new URL(import.meta.url).pathname);
console.log('[v0] Script is at:', new URL(import.meta.url).pathname);
console.log('[v0] Script parent dir:', scriptDir);
console.log('[v0] Script grandparent dir:', path.resolve(scriptDir, '..'));

try {
  const grandparent = path.resolve(scriptDir, '..');
  const gFiles = fs.readdirSync(grandparent);
  console.log('[v0] Grandparent contents:', gFiles.join(', '));
} catch(e) {
  console.log('[v0] Grandparent error:', e.message);
}

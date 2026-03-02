import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'Uptonr3421/Popcle12';
const BRANCH = 'main';

if (!GITHUB_TOKEN) {
  console.error('[v0] ERROR: GITHUB_TOKEN not set');
  process.exit(1);
}

const projectDir = '/vercel/share/v0-project';

try {
  console.log('[v0] Setting up git config...');
  execSync(`git config --global user.email "v0@vercel.com"`, { stdio: 'inherit' });
  execSync(`git config --global user.name "v0 Deploy Bot"`, { stdio: 'inherit' });
  execSync(`git config --global init.defaultBranch main`, { stdio: 'inherit' });

  process.chdir(projectDir);
  console.log('[v0] Working directory:', process.cwd());

  // Initialize git if not already
  if (!fs.existsSync(path.join(projectDir, '.git'))) {
    console.log('[v0] Initializing git repo...');
    execSync('git init', { stdio: 'inherit' });
  } else {
    console.log('[v0] Git repo already initialized');
  }

  // Set remote with token
  const remoteUrl = `https://${GITHUB_TOKEN}@github.com/${REPO}.git`;
  
  try {
    execSync('git remote remove origin', { stdio: 'pipe' });
  } catch (e) {
    // No remote yet, that's fine
  }
  
  console.log('[v0] Setting remote origin...');
  execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });

  // Create .gitignore if it doesn't exist
  const gitignorePath = path.join(projectDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, `node_modules\n.next\n.env\n.env.local\n.DS_Store\n`);
    console.log('[v0] Created .gitignore');
  }

  console.log('[v0] Staging all files...');
  execSync('git add -A', { stdio: 'inherit' });

  console.log('[v0] Committing...');
  try {
    execSync('git commit -m "feat: Pop Culture CLE Loyalty App - full prototype with QR stamps, geofencing, push notifications, and vibrant UI"', { stdio: 'inherit' });
  } catch (e) {
    console.log('[v0] Nothing new to commit or commit failed:', e.message);
  }

  console.log('[v0] Pushing to GitHub...');
  execSync(`git push -f origin HEAD:${BRANCH}`, { stdio: 'inherit' });

  console.log('[v0] SUCCESS: Code pushed to https://github.com/' + REPO);
  console.log('[v0] Deploy at: https://vercel.com/new/import?s=https://github.com/' + REPO);

} catch (err) {
  console.error('[v0] ERROR:', err.message);
  process.exit(1);
}

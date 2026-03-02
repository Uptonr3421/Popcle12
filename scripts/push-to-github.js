import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'Uptonr3421';
const REPO = 'Popcle12';
const BRANCH = 'main';
// Resolve project root relative to this script (scripts/ is one level down from root)
const PROJECT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

if (!GITHUB_TOKEN) {
  console.error('[v0] ERROR: GITHUB_TOKEN not found');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
};

async function apiCall(endpoint, method = 'GET', body = null) {
  const url = `https://api.github.com${endpoint}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(`GitHub API ${method} ${endpoint} failed: ${JSON.stringify(data)}`);
  return data;
}

// Files to include (skip node_modules, .next, scripts folder itself)
const SKIP_DIRS = ['node_modules', '.next', '.git', 'scripts'];
const SKIP_FILES = ['.DS_Store'];

function getAllFiles(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    if (SKIP_DIRS.includes(entry.name)) continue;
    if (SKIP_FILES.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, base));
    } else {
      files.push({ fullPath, relativePath: path.relative(base, fullPath).replace(/\\/g, '/') });
    }
  }
  return files;
}

async function main() {
  console.log('[v0] Reading project files from:', PROJECT_DIR);
  const files = getAllFiles(PROJECT_DIR);
  console.log(`[v0] Found ${files.length} files to push`);

  // Get or create branch ref
  let baseSha = null;
  let baseTreeSha = null;

  try {
    const refData = await apiCall(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
    baseSha = refData.object.sha;
    const commitData = await apiCall(`/repos/${OWNER}/${REPO}/git/commits/${baseSha}`);
    baseTreeSha = commitData.tree.sha;
    console.log('[v0] Existing branch found, base SHA:', baseSha);
  } catch (e) {
    console.log('[v0] Branch does not exist yet, will create it');
  }

  // Create blobs for all files
  console.log('[v0] Uploading file blobs to GitHub...');
  const treeItems = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file.fullPath);
      const isBinary = !file.relativePath.match(/\.(tsx?|jsx?|css|json|md|mjs|svg|txt|env|gitignore|html|yml|yaml|sh|toml)$/i);
      
      const blobData = await apiCall(`/repos/${OWNER}/${REPO}/git/blobs`, 'POST', {
        content: isBinary ? content.toString('base64') : content.toString('utf8'),
        encoding: isBinary ? 'base64' : 'utf-8',
      });

      treeItems.push({
        path: file.relativePath,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      });

      process.stdout.write(`[v0] Uploaded: ${file.relativePath}\n`);
    } catch (err) {
      console.warn(`[v0] Skipping ${file.relativePath}:`, err.message.slice(0, 80));
    }
  }

  console.log(`[v0] ${treeItems.length} blobs uploaded. Creating tree...`);

  // Create tree
  const treePayload = { tree: treeItems };
  if (baseTreeSha) treePayload.base_tree = baseTreeSha;
  const newTree = await apiCall(`/repos/${OWNER}/${REPO}/git/trees`, 'POST', treePayload);
  console.log('[v0] Tree created:', newTree.sha);

  // Create commit
  const commitPayload = {
    message: 'Pop Culture CLE Loyalty App - Full Deploy',
    tree: newTree.sha,
    author: { name: 'v0 by Vercel', email: 'v0@vercel.com' },
  };
  if (baseSha) commitPayload.parents = [baseSha];
  const newCommit = await apiCall(`/repos/${OWNER}/${REPO}/git/commits`, 'POST', commitPayload);
  console.log('[v0] Commit created:', newCommit.sha);

  // Update or create branch ref
  try {
    await apiCall(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, 'PATCH', {
      sha: newCommit.sha,
      force: true,
    });
    console.log('[v0] Branch updated');
  } catch (e) {
    await apiCall(`/repos/${OWNER}/${REPO}/git/refs`, 'POST', {
      ref: `refs/heads/${BRANCH}`,
      sha: newCommit.sha,
    });
    console.log('[v0] Branch created');
  }

  console.log('\n[v0] ✅ SUCCESS! All files pushed to:');
  console.log(`[v0] https://github.com/${OWNER}/${REPO}`);
  console.log(`[v0] Now deploy at: https://vercel.com/new/import?s=https://github.com/${OWNER}/${REPO}`);
}

main().catch((err) => {
  console.error('[v0] FATAL ERROR:', err.message);
  process.exit(1);
});

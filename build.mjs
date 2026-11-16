// This static site has no framework build. The Cloudflare Pages project is
// configured with output directory "dist", so we copy the served files there.
import { readdirSync, cpSync, rmSync, mkdirSync } from 'node:fs';

const EXCLUDE = new Set([
  'dist', 'node_modules', '.git', 'build.mjs',
  'package.json', 'package-lock.json', 'pnpm-lock.yaml',
  'wrangler.jsonc', '.assetsignore', '.gitignore', 'README.md',
  // Ghi chú nội bộ: không đưa lên web công khai.
  'CLAUDE.md', 'AGENTS.md', 'docs',
]);

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
for (const entry of readdirSync('.')) {
  if (EXCLUDE.has(entry) || entry.endsWith('.md')) continue;
  cpSync(entry, `dist/${entry}`, { recursive: true });
}
console.log('Static site copied into dist/.');

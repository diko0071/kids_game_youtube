import { readFileSync, writeFileSync } from 'node:fs';
import { transformSync } from 'esbuild';

// Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: the native allowlist comes from the same catalog as the website, including playback-ID aliases.
const source = readFileSync(new URL('../../app/data/catalog.ts', import.meta.url), 'utf8');
const { code } = transformSync(source, { loader: 'ts', format: 'esm' });
const { VIDEOS } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const value = JSON.stringify({ catalogIDs: VIDEOS.map(v => v.id), playbackIDs: [...new Set(VIDEOS.map(v => v.playbackId ?? v.id))] }, null, 2) + '\n';
const target = new URL('../shared/approved-catalog.json', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== value) throw new Error('Native catalog is stale; run node native/scripts/export-catalog.mjs');
} else {
  writeFileSync(target, value);
}
console.log(`Native catalog: ${VIDEOS.length} approved videos`);

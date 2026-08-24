import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.equal((html.match(/<link rel="canonical"/g) ?? []).length, 1);
assert.match(html, /does not save, send, or analyze/);
assert.match(html, /data-launch/);
assert.doesNotMatch(html, /Clarity/i);
console.log('Static checks passed.');

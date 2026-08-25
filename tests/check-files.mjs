import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.equal((html.match(/<link rel="canonical"/g) ?? []).length, 1);
assert.match(html, /<title>AI Research Question Preflight \| Dystiny<\/title>/);
assert.match(html, /<h1>Shape a broad idea into a stronger research question\.<\/h1>/);
assert.match(html, /does not save, send, or analyze/);
assert.match(html, /coarse 0–4 readiness signal/);
assert.equal((html.match(/name="evidence"/g) ?? []).length, 4);
assert.match(html, /Health evidence/);
assert.match(html, /ods\.od\.nih\.gov/);
assert.match(html, /data-launch/);
assert.match(html, /tabindex="-1"/);
assert.match(html, /Write a question to continue/);
assert.equal((html.match(/class="example-link"/g) ?? []).length, 4);
assert.match(html, /utm_content=example_city_heat/);
assert.doesNotMatch(html, /Clarity/i);

const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(jsonLd, 'WebApplication structured data is present');
assert.equal(JSON.parse(jsonLd[1])['@type'], 'WebApplication');
console.log('Static checks passed.');

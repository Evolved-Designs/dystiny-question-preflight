import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeQuestion, buildDystinyUrl } from '../app.js';

test('recognizes an exploratory tradeoff question', () => {
  const result = analyzeQuestion('How can cities reduce dangerous summer heat while protecting residents who face the greatest risk?');
  assert.equal(result.ready, 4);
});

test('keeps the destination on the verified Dystiny answer route', () => {
  const url = new URL(buildDystinyUrl('How do trees affect summer heat?'));
  assert.equal(url.origin, 'https://dystiny.com');
  assert.equal(url.pathname, '/answer/');
  assert.equal(url.searchParams.get('utm_campaign'), 'question_preflight');
});

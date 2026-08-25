import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeQuestion, buildDystinyUrl, launchCopy } from '../app.js';

test('recognizes an exploratory tradeoff question', () => {
  const result = analyzeQuestion('How can cities reduce dangerous summer heat while protecting residents who face the greatest risk?');
  assert.equal(result.ready, 4);
});

test('keeps the destination on the verified Dystiny answer route', () => {
  const url = new URL(buildDystinyUrl('How do trees affect summer heat?'));
  assert.equal(url.origin, 'https://dystiny.com');
  assert.equal(url.pathname, '/answer/');
  assert.equal(url.searchParams.get('utm_campaign'), 'question_preflight');
  assert.equal(url.searchParams.get('utm_content'), 'signals_3_of_4_evidence_balanced');
});

test('caps the readiness tier without changing the question', () => {
  const url = new URL(buildDystinyUrl('What changes when a city plants more trees?', 99));
  assert.equal(url.searchParams.get('q'), 'What changes when a city plants more trees?');
  assert.equal(url.searchParams.get('utm_content'), 'signals_4_of_4_evidence_balanced');
});

test('carries only a whitelisted evidence choice into attribution', () => {
  const health = new URL(buildDystinyUrl('What does current evidence say about adult sleep?', 4, 'health'));
  const unsafe = new URL(buildDystinyUrl('What does current evidence say about adult sleep?', 4, 'private-note'));
  assert.equal(health.searchParams.get('utm_content'), 'signals_4_of_4_evidence_health');
  assert.equal(unsafe.searchParams.get('utm_content'), 'signals_4_of_4_evidence_balanced');
});

test('makes the handoff match the question readiness', () => {
  assert.equal(launchCopy(0), 'Open this starting question in Dystiny');
  assert.equal(launchCopy(2), 'Explore this focused question');
  assert.equal(launchCopy(4), 'Open this visual evidence path');
});

export function analyzeQuestion(rawQuestion) {
  const question = String(rawQuestion ?? '').trim();
  const words = question ? question.split(/\s+/).length : 0;
  const checks = [
    {
      ready: words >= 7,
      readyText: 'Enough detail to begin',
      gapText: 'Add the subject and the outcome you want to understand.'
    },
    {
      ready: words <= 45,
      readyText: 'Focused enough for one path',
      gapText: 'Split this into one main question; save the rest for related paths.'
    },
    {
      ready: /\b(how|why|what|which|when|where|who)\b/i.test(question),
      readyText: 'Invites an explanation',
      gapText: 'Try opening with how, why, what, or which instead of a yes/no frame.'
    },
    {
      ready: /\b(while|without|compared|versus|trade-?off|benefit|risk|affect|change|difference)\b/i.test(question),
      readyText: 'Makes a relationship or tradeoff visible',
      gapText: 'Name the relationship, comparison, benefit, risk, or tradeoff you want to examine.'
    }
  ];

  const ready = checks.filter((check) => check.ready).length;
  return { question, words, checks, ready, total: checks.length };
}

export function buildDystinyUrl(question, ready = analyzeQuestion(question).ready, evidence = 'balanced') {
  const url = new URL('https://dystiny.com/answer/');
  url.searchParams.set('q', String(question).trim());
  url.searchParams.set('utm_source', 'github_pages');
  url.searchParams.set('utm_medium', 'owned_tool');
  url.searchParams.set('utm_campaign', 'question_preflight');
  const safeReady = Math.max(0, Math.min(4, Number(ready) || 0));
  const safeEvidence = ['balanced', 'official', 'primary', 'health'].includes(evidence) ? evidence : 'balanced';
  url.searchParams.set('utm_content', `signals_${safeReady}_of_4_evidence_${safeEvidence}`);
  return url.toString();
}

export function launchCopy(ready = 0) {
  const safeReady = Math.max(0, Math.min(4, Number(ready) || 0));
  if (safeReady === 4) return 'Open this visual evidence path';
  if (safeReady >= 2) return 'Explore this focused question';
  return 'Open this starting question in Dystiny';
}

function init() {
  const field = document.querySelector('#question');
  if (!field) return;

  const count = document.querySelector('[data-count]');
  const status = document.querySelector('[data-status]');
  const prompts = document.querySelector('[data-prompts]');
  const launch = document.querySelector('[data-launch]');
  const sample = document.querySelector('[data-sample]');
  const clear = document.querySelector('[data-clear]');
  const evidenceChoices = [...document.querySelectorAll('input[name="evidence"]')];
  const evidence = () => evidenceChoices.find((choice) => choice.checked)?.value ?? 'balanced';

  function render() {
    const result = analyzeQuestion(field.value);
    count.textContent = `${field.value.length}/320`;
    status.textContent = result.question
      ? `${result.ready}/${result.total} question signals ready`
      : 'Start with the thing you want to understand.';
    prompts.innerHTML = '';

    result.checks.forEach((check) => {
      const item = document.createElement('li');
      item.className = check.ready ? 'ready' : 'gap';
      item.textContent = check.ready ? check.readyText : check.gapText;
      prompts.append(item);
    });

    const canLaunch = result.question.length >= 12;
    launch.toggleAttribute('aria-disabled', !canLaunch);
    launch.classList.toggle('disabled', !canLaunch);
    launch.tabIndex = canLaunch ? 0 : -1;
    launch.textContent = canLaunch ? launchCopy(result.ready) : 'Write a question to continue';
    launch.href = canLaunch ? buildDystinyUrl(result.question, result.ready, evidence()) : '#question';
  }

  field.addEventListener('input', render);
  evidenceChoices.forEach((choice) => choice.addEventListener('change', render));
  sample.addEventListener('click', () => {
    field.value = 'How can cities reduce dangerous summer heat while protecting residents who face the greatest risk?';
    render();
    field.focus();
  });
  clear.addEventListener('click', () => {
    field.value = '';
    render();
    field.focus();
  });
  launch.addEventListener('click', (event) => {
    if (launch.getAttribute('aria-disabled') === 'true') event.preventDefault();
  });
  render();
}

if (typeof document !== 'undefined') init();

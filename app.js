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
  const safeEvidence = ['balanced', 'official', 'primary', 'health'].includes(evidence) ? evidence : 'balanced';
  url.searchParams.set('q', questionForEvidence(question, safeEvidence));
  url.searchParams.set('utm_source', 'github_pages');
  url.searchParams.set('utm_medium', 'owned_tool');
  url.searchParams.set('utm_campaign', 'question_preflight');
  const safeReady = Math.max(0, Math.min(4, Number(ready) || 0));
  url.searchParams.set('utm_content', `signals_${safeReady}_of_4_evidence_${safeEvidence}`);
  return url.toString();
}

export function questionForEvidence(question, evidence = 'balanced') {
  const clean = String(question).trim();
  const lenses = {
    official: 'Prioritize current official records and distinguish the record from interpretation.',
    primary: 'Prioritize original research; identify methods, sample, dates, limitations, and later replication or review.',
    health: 'Evaluate provider and purpose, expert review, supporting research, update date, and privacy. Separate population evidence from individual medical advice.'
  };
  return lenses[evidence] ? `${clean} ${lenses[evidence]}` : clean;
}

export function evidenceNote(evidence = 'balanced') {
  const notes = {
    balanced: 'Your wording will open unchanged. Dystiny can choose a best-fit source mix.',
    official: 'Opening adds a visible request for current official records and a fact-versus-interpretation boundary.',
    primary: 'Opening adds a visible request for methods, sample, dates, limitations, and later replication or review.',
    health: 'Opening adds a visible source check for provider, purpose, expert review, research, update date, and privacy—plus a boundary from individual medical advice.'
  };
  return notes[evidence] ?? notes.balanced;
}

export function launchCopy(ready = 0) {
  const safeReady = Math.max(0, Math.min(4, Number(ready) || 0));
  if (safeReady === 4) return 'Open this visual evidence path';
  if (safeReady >= 2) return 'Explore this focused question';
  return 'Open this starting question in Dystiny';
}

export function preparedQuestionText(question, evidence = 'balanced') {
  return `Dystiny prepared research question\n\nEvidence preference: ${evidence}\nQuestion: ${questionForEvidence(question, evidence)}\n\nThis local handoff is a starting point, not professional advice or a guarantee of source coverage.`;
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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
  const download = document.querySelector('[data-download]');
  const evidenceChoices = [...document.querySelectorAll('input[name="evidence"]')];
  const evidence = () => evidenceChoices.find((choice) => choice.checked)?.value ?? 'balanced';
  const evidenceDetail = document.querySelector('[data-evidence-note]');

  function render() {
    const result = analyzeQuestion(field.value);
    count.textContent = `${field.value.length}/320`;
    status.textContent = result.question
      ? `${result.ready}/${result.total} question signals ready`
      : 'Start with the thing you want to understand.';
    evidenceDetail.textContent = evidenceNote(evidence());
    prompts.innerHTML = '';

    result.checks.forEach((check) => {
      const item = document.createElement('li');
      item.className = check.ready ? 'ready' : 'gap';
      item.textContent = check.ready ? check.readyText : check.gapText;
      prompts.append(item);
    });

    const canLaunch = result.question.length >= 12;
    download.disabled = !canLaunch;
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
  download.addEventListener('click', () => {
    const result = analyzeQuestion(field.value);
    if (result.question.length < 12) return;
    downloadTextFile('dystiny-prepared-question.txt', preparedQuestionText(result.question, evidence()));
    download.textContent = 'Question downloaded';
    window.setTimeout(() => { download.textContent = 'Download prepared question'; }, 1800);
  });
  launch.addEventListener('click', (event) => {
    if (launch.getAttribute('aria-disabled') === 'true') event.preventDefault();
  });
  render();
}

if (typeof document !== 'undefined') init();

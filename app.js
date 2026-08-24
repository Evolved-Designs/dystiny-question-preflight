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

export function buildDystinyUrl(question, ready = analyzeQuestion(question).ready) {
  const url = new URL('https://dystiny.com/answer/');
  url.searchParams.set('q', String(question).trim());
  url.searchParams.set('utm_source', 'github_pages');
  url.searchParams.set('utm_medium', 'owned_tool');
  url.searchParams.set('utm_campaign', 'question_preflight');
  const safeReady = Math.max(0, Math.min(4, Number(ready) || 0));
  url.searchParams.set('utm_content', `signals_${safeReady}_of_4`);
  return url.toString();
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
    launch.href = canLaunch ? buildDystinyUrl(result.question, result.ready) : '#question';
  }

  field.addEventListener('input', render);
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

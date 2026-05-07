const TRACKS = [
  { id: 'track-1', title: 'Luanda Nights', type: 'stereo', bpm: 92, duration: '3:24', description: 'Where it started. Lo-fi textures, bedroom walls, a city humming outside.' },
  { id: 'track-2', title: 'Golden Frequency', type: 'stereo', bpm: 108, duration: '2:58', description: 'The ear sharpens. Layers begin to separate. Depth appears.' },
  { id: 'track-3', title: 'Orbital', type: 'spatial', bpm: 120, duration: '4:12', description: 'The first Spatial experiment. Sound stops being flat. It surrounds.' },
  { id: 'track-4', title: 'Architect of Air', type: 'spatial', bpm: 135, duration: '5:01', description: 'Full 3D panning. Headphones become theatres. This is the frontier.' }
];

const VAULT_ITEMS = [
  { id: 'v1', title: 'Spatial Masters Pack Vol. 1', format: 'WAV 24-bit', price: '$49', description: '4 spatial audio masters, production-ready' },
  { id: 'v2', title: 'Golden Ear Stems Collection', format: 'Multi-track', price: '$79', description: 'Full stems from 3 featured tracks' },
  { id: 'v3', title: 'Exclusive License — Orbital', format: 'License Agreement', price: '$299', description: 'Full commercial rights, one track' },
  { id: 'v4', title: 'Studio Session — 2hrs', format: 'Booking', price: '$150/hr', description: 'Remote or in-person spatial production session' }
];

const MOCK_ANALYTICS = {
  visitors_this_week: 342,
  vault_unlocks: 12,
  bookings_this_week: 3,
  top_track: 'Architect of Air',
  top_referrer: 'Instagram',
  returning_visitors_pct: 28,
  avg_session_duration: '4m 12s',
  concierge_conversations: 47,
  coproducer_conversations: 18,
  summary: 'Strong week. Spatial tracks are pulling 3x the engagement of stereo. Instagram is driving most new traffic. The Vault unlock rate is climbing — 12 this week vs 7 last week. Three booking requests came in, all for remote sessions. Co-Producer conversations are up, which means producers are finding you. The Golden Ear narrative is landing.'
};

const state = { mode: 'concierge', audioStarted: false, audioContext: null, oscillator: null, gain: null, activeTrack: null };
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function buildVisualiser(target, count = 32) {
  if (!target) return;
  target.innerHTML = '';
  for (let index = 0; index < count; index += 1) {
    const bar = document.createElement('span');
    bar.className = 'bar';
    bar.style.animationDelay = `${(index % 9) * -0.09}s`;
    bar.style.height = `${22 + ((index * 13) % 56)}%`;
    target.appendChild(bar);
  }
}

function animateBars(intensity = 1) {
  const bars = $$('.bar');
  bars.forEach((bar, index) => {
    const wave = Math.sin(Date.now() / 145 + index * 0.7) * 0.5 + 0.5;
    const randomish = 18 + wave * 72 * intensity + ((index * 11) % 19);
    bar.style.height = `${Math.min(100, randomish)}%`;
  });
  requestAnimationFrame(() => animateBars(state.audioStarted ? 1 : 0.35));
}

function startAudio(track = TRACKS[0]) {
  state.activeTrack = track;
  $('[data-now-title]').textContent = `${track.title} · ${track.type.toUpperCase()} · ${track.bpm} BPM`;
  if (!state.audioContext) {
    state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    state.gain = state.audioContext.createGain();
    state.gain.gain.value = 0.025;
    state.gain.connect(state.audioContext.destination);
  }
  if (state.oscillator) state.oscillator.stop();
  state.oscillator = state.audioContext.createOscillator();
  state.oscillator.type = track.type === 'spatial' ? 'triangle' : 'sine';
  state.oscillator.frequency.value = track.type === 'spatial' ? 220 + track.bpm : 110 + track.bpm;
  state.oscillator.connect(state.gain);
  state.oscillator.start();
  state.audioStarted = true;
}

function renderTracks() {
  const list = $('[data-track-list]');
  if (!list) return;
  list.innerHTML = '';
  TRACKS.forEach((track, index) => {
    if (index === 2) {
      const marker = document.createElement('div');
      marker.className = 'transition-marker reveal';
      marker.textContent = 'This is where stereo ends.';
      list.appendChild(marker);
    }
    const card = document.createElement('article');
    card.className = `track-card track-card--${track.type} reveal`;
    card.innerHTML = `
      <div>
        <p class="eyebrow">${track.type === 'spatial' ? 'Spatial Audio present' : 'Stereo roots'}</p>
        <h3>${track.title}</h3>
        <p>${track.description}</p>
        <div class="track-card__meta"><span class="pill">${track.bpm} BPM</span><span class="pill">${track.duration}</span><span class="pill">${track.type}</span></div>
      </div>
      <button class="button ${track.type === 'spatial' ? 'button--vault' : 'button--ghost'}" type="button">Play mock track</button>`;
    $('button', card).addEventListener('click', () => startAudio(track));
    list.appendChild(card);
  });
}

function renderVault() {
  const content = $('[data-vault-content]');
  if (!content) return;
  const unlocked = localStorage.getItem('vault_unlocked') === 'true';
  if (!unlocked) return;
  content.innerHTML = `<p class="eyebrow">Vault unlocked — simulated cookie</p><h2>The Vault is open.</h2><p>Your theatre checkout completed. Browse placeholder offers below.</p><div class="vault-grid">${VAULT_ITEMS.map(item => `<article class="vault-item"><span>${item.format}</span><h3>${item.title}</h3><p>${item.description}</p><strong>${item.price}</strong></article>`).join('')}</div>`;
}

function renderOwnerDashboard() {
  const grid = $('[data-analytics-grid]');
  if (!grid) return;
  const metrics = [
    ['Visitors', MOCK_ANALYTICS.visitors_this_week], ['Vault unlocks', MOCK_ANALYTICS.vault_unlocks],
    ['Bookings', MOCK_ANALYTICS.bookings_this_week], ['Top track', MOCK_ANALYTICS.top_track],
    ['Top referrer', MOCK_ANALYTICS.top_referrer], ['Avg session', MOCK_ANALYTICS.avg_session_duration],
    ['Returning', `${MOCK_ANALYTICS.returning_visitors_pct}%`], ['Co-Producer chats', MOCK_ANALYTICS.coproducer_conversations]
  ];
  grid.innerHTML = metrics.map(([label, value]) => `<article class="metric"><span>${label}</span><strong>${value}</strong></article>`).join('');
  $('[data-owner-vault-list]').innerHTML = VAULT_ITEMS.map(item => `<p><strong>${item.title}</strong> — ${item.format} — ${item.price}</p>`).join('');
}

function setupChat() {
  const chat = $('[data-chat]');
  const messages = $('[data-chat-messages]');
  const addMessage = (text, type = 'bot') => {
    const bubble = document.createElement('div');
    bubble.className = `message message--${type}`;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  };
  const open = () => { chat.hidden = false; if (!messages.children.length) addMessage('One ear up, one relaxed. I can guide the catalogue, Vault, booking, or production questions.'); };
  $$('.chat-open').forEach(button => button.addEventListener('click', open));
  $('[data-chat-close]').addEventListener('click', () => { chat.hidden = true; });
  $$('.mode-toggle button').forEach(button => button.addEventListener('click', () => {
    state.mode = button.dataset.mode;
    $$('.mode-toggle button').forEach(item => item.classList.toggle('is-active', item === button));
    $('[data-chat-title]').textContent = state.mode === 'concierge' ? 'Golder Hear Concierge' : 'Golder Hear Co-Producer';
    addMessage(state.mode === 'concierge' ? 'Concierge mode: I will help visitors find the right track, booking path, or Vault entry.' : 'Co-Producer mode: tell me your DAW, headphones, plugins, and what spatial problem you are solving.');
  }));
  $('[data-chat-form]').addEventListener('submit', event => {
    event.preventDefault();
    const input = event.currentTarget.message;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMessage(text, 'user');
    const response = state.mode === 'concierge'
      ? `I hear the intent. For Enzo's public story, start with “Luanda Nights,” then jump to “Architect of Air” to feel the spatial pivot. If you want access, the Vault unlock is simulated and safe.`
      : `Before steps: what is your setup? In FL Studio, begin with clean gain staging, automate pan depth slowly, and check the mix in mono so spatial motion supports the record instead of distracting from it.`;
    const bubble = addMessage('', 'bot');
    let index = 0;
    const timer = setInterval(() => {
      bubble.textContent = response.slice(0, index);
      index += 3;
      messages.scrollTop = messages.scrollHeight;
      if (index > response.length) clearInterval(timer);
    }, 22);
  });
}

function setupForms() {
  $('[data-booking-form]').addEventListener('submit', event => {
    event.preventDefault();
    $('[data-booking-toast]').textContent = 'Request staged. Enzo receives a simulated booking signal — no backend was contacted.';
    event.currentTarget.reset();
  });
  $('[data-owner-form]').addEventListener('submit', event => {
    event.preventDefault();
    if (event.currentTarget.password.value === 'golden-ear-9') {
      localStorage.setItem('owner_session', 'true');
      $('[data-owner-login]').hidden = true;
      $('[data-owner-dashboard]').hidden = false;
      renderOwnerDashboard();
    } else $('[data-owner-toast]').textContent = 'Access denied in the mockup. Hint: golden-ear-9';
  });
  $('[data-owner-logout]').addEventListener('click', () => {
    localStorage.removeItem('owner_session');
    $('[data-owner-login]').hidden = false;
    $('[data-owner-dashboard]').hidden = true;
  });
  $('[data-companion-brief]').addEventListener('click', () => {
    $('[data-companion-output]').textContent = `The week in one sentence: spatial is becoming the reason people stay. What people are asking: ${MOCK_ANALYTICS.coproducer_conversations} producer conversations suggest technical credibility. Positioning: ${MOCK_ANALYTICS.summary} Opportunity: publish a short breakdown of “${MOCK_ANALYTICS.top_track}” to convert curiosity into bookings.`;
  });
}

function setupReveal() {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  }), { threshold: 0.16 });
  $$('.reveal').forEach(item => observer.observe(item));
}

function init() {
  buildVisualiser($('[data-visualiser]'), 32);
  buildVisualiser($('[data-visualiser-small]'), 32);
  animateBars();
  renderTracks();
  renderVault();
  setupReveal();
  setupChat();
  setupForms();
  $('.nav-toggle').addEventListener('click', event => {
    const nav = $('#site-nav');
    nav.classList.toggle('is-open');
    event.currentTarget.setAttribute('aria-expanded', nav.classList.contains('is-open'));
  });
  $('[data-audio-demo]').addEventListener('click', () => startAudio(TRACKS[3]));
  $('[data-unlock-vault]').addEventListener('click', event => {
    const button = event.currentTarget;
    button.textContent = 'Processing simulated checkout…';
    button.disabled = true;
    setTimeout(() => { localStorage.setItem('vault_unlocked', 'true'); renderVault(); }, 1500);
  });
  if (localStorage.getItem('owner_session') === 'true') {
    $('[data-owner-login]').hidden = true;
    $('[data-owner-dashboard]').hidden = false;
    renderOwnerDashboard();
  }
}

document.addEventListener('DOMContentLoaded', init);

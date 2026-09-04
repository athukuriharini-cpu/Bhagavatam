/* ==============================================
   BHAGAVATAM – app.js
   PDF Chatbot Engine (No AI, Pure PDF Search)
   ============================================== */

'use strict';

// Removed PDF.js dependency

// ── App State ─────────────────────────────────
const state = {
    pdfData: [],        // [{page, text}]
    pdfName: '',
    totalPages: 0,
    totalWords: 0,
    queryCount: 0,
    isProcessing: false,
    sidebarOpen: true,
};

// ── DOM References ────────────────────────────
const $id = (id) => document.getElementById(id);

const dom = {
    landingScreen: $id('landingScreen'),
    chatScreen: $id('chatScreen'),
    enterBtn: $id('enterBtn'),
    messagesContainer: $id('messagesContainer'),
    userInput: $id('userInput'),
    sendBtn: $id('sendBtn'),
    pdfName: $id('pdfName'),
    pdfPages: $id('pdfPages'),
    statPages: $id('statPages'),
    statWords: $id('statWords'),
    statQueries: $id('statQueries'),
    resultCount: $id('resultCount'),
    searchMode: $id('searchMode'),
    suggestionsList: $id('suggestionsList'),
    changePdfBtn: $id('changePdfBtn'),
    clearChatBtn: $id('clearChatBtn'),
    sidebar: $id('sidebar'),
    sidebarToggle: $id('sidebarToggle'),
    mobileMenuBtn: $id('mobileMenuBtn'),
    headerSub: $id('headerSub'),
    particleCanvas: $id('particleCanvas'),
};

// ── Particle System ───────────────────────────
(function initParticles() {
    const canvas = dom.particleCanvas;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;

    canvas.width = W; canvas.height = H;

    window.addEventListener('resize', () => {
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = W; canvas.height = H;
    });

    const COLORS = ['#f5c842', '#e8a84c', '#9b59f5', '#3de8d4', '#ffffff'];

    const particles = Array.from({ length: 60 }, () => createParticle());

    function createParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3 - 0.1,
            size: Math.random() * 1.8 + 0.3,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: Math.random() * 0.5 + 0.1,
            life: Math.random() * 200 + 100,
            maxLife: 300,
        };
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            p.life--;
            p.alpha = (p.life / p.maxLife) * 0.6;
            if (p.life <= 0 || p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
                particles[i] = createParticle();
                particles[i].y = H + 5;
                return;
            }
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        requestAnimationFrame(animate);
    }
    animate();
})();

// ── Embedded Data ─────────────────────────────
// The following verses use a public domain / open-source (CC BY-NC-SA) equivalent translation.
const SAMPLE_BHAGAVATAM_DATA = [
  {
    page: '1.1.1',
    text: "O my Lord, the all-pervading Personality of Godhead, I offer my respectful obeisances unto You. I meditate upon the Absolute Truth, who is the primeval cause of all causes of the creation, maintenance and destruction of the manifested universes. He is directly and indirectly conscious of all manifestations, and He is independent because there is no other cause beyond Him. It is He only who first imparted the Vedic knowledge unto the heart of the original living being. By Him even the great sages and demigods are placed into illusion. I meditate upon Him, who is eternally existent in the transcendent abode, which is forever free from the illusory representations of the material world. I meditate upon Him, for He is the Absolute Truth."
  },
  {
    page: '1.1.2',
    text: "Completely rejecting all religious activities which are materially motivated, this Bhagavata Purana propounds the highest truth, which is understandable by those devotees who are fully pure in heart. The highest truth is reality distinguished from illusion for the welfare of all. Such truth uproots the threefold miseries. This beautiful Bhagavatam, compiled by the great sage Vyasa, is sufficient in itself for God realization."
  },
  {
    page: '1.1.3',
    text: "O expert and thoughtful men, relish this Bhagavatam, the mature fruit of the desire tree of Vedic literatures. It emanated from the lips of the sage Sri Sukadeva. Therefore this fruit has become even more tasteful, although its nectar was already relishable for all, including liberated souls."
  },
  {
    page: '1.1.14',
    text: "Living beings who are entangled in the complicated meshes of birth and death can be freed immediately by even unconsciously chanting the holy name of the Lord, which is feared by fear personified."
  },
  {
    page: '1.2.6',
    text: "The supreme occupation for all humanity is that by which men can attain to loving devotional service unto the transcendent Lord. Such devotional service must be unmotivated and uninterrupted to completely satisfy the self."
  },
  {
    page: '1.2.7',
    text: "By rendering devotional service unto the Personality of Godhead, one immediately acquires causeless knowledge and detachment from the world."
  },
  {
    page: '1.2.11',
    text: "Learned transcendentalists who know the Absolute Truth call this nondual substance Brahman, Paramatma or Bhagavan."
  },
  {
    page: '7.5.23-24',
    text: "Hearing and chanting about the transcendental holy name, form, qualities, paraphernalia and pastimes of the Lord, remembering them, serving the lotus feet of the Lord, offering the Lord respectful worship, offering prayers to the Lord, becoming His servant, considering the Lord one's best friend, and surrendering everything unto Him -- these nine processes are accepted as pure devotional service."
  },
  {
    page: '11.14.20',
    text: "My dear friend, neither through mystic yoga, nor through impersonal monism or an analytical study of the Absolute Truth, nor through study of the Vedas, nor through practice of austerities, nor through charity, nor through acceptance of renunciation can one satisfy Me as much as one can by developing unalloyed devotional service unto Me."
  },
  {
    page: '12.3.51',
    text: "My dear King, although this age is an ocean of faults, there is still one good quality about it: Simply by chanting the holy names, one can become free from material bondage and be promoted to the transcendental kingdom."
  }
];

// ── Application Flow ────────────────────────
dom.enterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loadScripture();
});

async function loadScripture() {
    if (state.isProcessing) return;
    state.isProcessing = true;
    state.pdfName = 'Srimad Bhagavatam (Embedded)';

    // Enter button animation
    dom.enterBtn.style.pointerEvents = 'none';
    dom.enterBtn.style.opacity = '0.6';
    dom.enterBtn.querySelector('span').textContent = 'Entering the spiritual realm...';

    // Load the data
    state.pdfData = SAMPLE_BHAGAVATAM_DATA;
    state.totalPages = state.pdfData.length;

    // Compute total words
    state.totalWords = state.pdfData.reduce((acc, p) => {
        return acc + p.text.split(/\s+/).filter(Boolean).length;
    }, 0);

    await sleep(1000);
    transitionToChat();
}

// ── Screen Transition ─────────────────────────
function transitionToChat() {
    // Update sidebar info
    dom.pdfName.textContent = 'Srimad Bhagavatam';
    dom.pdfPages.textContent = `${state.pdfData.length} key verses embedded`;
    dom.statPages.textContent = '12'; // Cantos
    dom.statWords.textContent = formatNum(state.totalWords);
    dom.statQueries.textContent = '0';

    // Switch screens
    dom.landingScreen.style.opacity = '0';
    setTimeout(() => {
        dom.landingScreen.classList.remove('active');
        dom.landingScreen.style.display = 'none';
        dom.chatScreen.classList.add('active');
        dom.chatScreen.style.display = 'flex';
        setTimeout(() => { dom.chatScreen.style.opacity = '1'; }, 10);
        renderWelcomeMessage();
        state.isProcessing = false;
    }, 600);
}

// ── Chat UI ───────────────────────────────────
function renderWelcomeMessage() {
    dom.messagesContainer.innerHTML = `
    <div class="welcome-msg">
      <div class="welcome-om">ॐ</div>
      <p class="welcome-title">The Scripture Awaits</p>
      <p class="welcome-sub">
        The embedded scripture has been loaded with <strong style="color:var(--gold-vivid)">${formatNum(state.totalWords)} words</strong> of divine knowledge.<br/>
        Ask any question and I shall find the answer from the sacred Bhagavatam.
      </p>
    </div>
  `;
}

function appendMessage(role, content) {
    const wrap = document.createElement('div');
    wrap.className = `message ${role}`;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const avatarHtml = role === 'user'
        ? `<div class="avatar user-avatar">You</div>`
        : `<div class="avatar bot-avatar">ॐ</div>`;

    wrap.innerHTML = `
    <div class="message-meta">
      ${avatarHtml}
      <span>${role === 'user' ? 'You' : 'Bhagavatam'} · ${now}</span>
    </div>
    <div class="message-bubble">${content}</div>
  `;

    dom.messagesContainer.appendChild(wrap);
    scrollToBottom();
    return wrap;
}

function appendThinking() {
    const wrap = document.createElement('div');
    wrap.className = 'message bot';
    wrap.id = 'thinkingMsg';
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    wrap.innerHTML = `
    <div class="message-meta">
      <div class="avatar bot-avatar">ॐ</div>
      <span>Bhagavatam · ${now}</span>
    </div>
    <div class="message-bubble">
      <div class="thinking-indicator">
        <div class="dot-loader">
          <span></span><span></span><span></span>
        </div>
        Searching the sacred scriptures…
      </div>
    </div>
  `;
    dom.messagesContainer.appendChild(wrap);
    scrollToBottom();
}

function removeThinking() {
    const el = $id('thinkingMsg');
    if (el) el.remove();
}

function scrollToBottom() {
    dom.messagesContainer.scrollTop = dom.messagesContainer.scrollHeight;
}

// ── Search Engine ─────────────────────────────
function searchPDF(query) {
    const mode = dom.searchMode.value;   // 'smart' | 'exact' | 'any'
    const topN = parseInt(dom.resultCount.value);

    // Tokenize query
    const rawTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const stopWords = new Set(['the', 'a', 'an', 'is', 'in', 'of', 'and', 'or', 'to', 'for', 'it',
        'this', 'that', 'was', 'be', 'are', 'were', 'has', 'had', 'have', 'do', 'does', 'did',
        'at', 'by', 'on', 'with', 'as', 'from', 'what', 'who', 'how', 'which', 'when', 'where',
        'why', 'about', 'tell', 'me', 'us', 'i', 'my', 'your', 'its']);
    const keywords = rawTokens.filter(w => !stopWords.has(w) && w.length > 2);

    if (keywords.length === 0) {
        return { results: [], keywords: rawTokens };
    }

    const scored = [];

    for (const { page, text } of state.pdfData) {
        const lower = text.toLowerCase();
        let score = 0;

        if (mode === 'exact') {
            if (lower.includes(query.toLowerCase())) score = 100;
        } else if (mode === 'any') {
            for (const kw of keywords) {
                const re = new RegExp(escapeRegex(kw), 'gi');
                const matches = (lower.match(re) || []).length;
                score += matches * 10;
            }
        } else {
            // Smart: weighted scoring
            // exact phrase bonus
            if (lower.includes(query.toLowerCase())) score += 50;

            for (const kw of keywords) {
                const re = new RegExp(escapeRegex(kw), 'gi');
                const matches = (lower.match(re) || []).length;
                score += matches * (12 / keywords.length);
            }

            // phrase proximity bonus: adjacent keywords
            for (let i = 0; i < keywords.length - 1; i++) {
                const pairRe = new RegExp(
                    escapeRegex(keywords[i]) + '\\W+' + escapeRegex(keywords[i + 1]),
                    'gi'
                );
                if (pairRe.test(lower)) score += 20;
            }
        }

        if (score > 0) {
            // Extract best snippet
            const snippet = extractSnippet(text, keywords, 300);
            if (snippet) {
                scored.push({ page, score, snippet });
            }
        }
    }

    // Sort by score, take top N, deduplicate similar snippets
    scored.sort((a, b) => b.score - a.score);
    const top = deduplicateResults(scored, topN);

    const maxScore = top[0]?.score || 1;
    top.forEach(r => { r.relevance = Math.min(100, Math.round((r.score / maxScore) * 100)); });

    return { results: top, keywords };
}

function extractSnippet(text, keywords, maxLen) {
    const lower = text.toLowerCase();
    let bestPos = 0;
    let bestCount = 0;

    for (const kw of keywords) {
        const idx = lower.indexOf(kw);
        if (idx !== -1) {
            // count keywords nearby
            let count = 0;
            const window = lower.slice(Math.max(0, idx - 100), idx + 200);
            for (const k2 of keywords) {
                if (window.includes(k2)) count++;
            }
            if (count > bestCount) { bestCount = count; bestPos = idx; }
        }
    }

    const start = Math.max(0, bestPos - 60);
    const end = Math.min(text.length, start + maxLen);
    let snippet = text.slice(start, end).trim();
    if (start > 0) snippet = '…' + snippet;
    if (end < text.length) snippet = snippet + '…';
    return snippet || text.slice(0, maxLen) + '…';
}

function deduplicateResults(scored, topN) {
    const seen = [];
    const out = [];
    for (const item of scored) {
        const norm = item.snippet.toLowerCase().replace(/\s+/g, ' ').slice(0, 80);
        const isDup = seen.some(s => similarity(s, norm) > 0.75);
        if (!isDup) { seen.push(norm); out.push(item); }
        if (out.length >= topN) break;
    }
    return out;
}

function similarity(a, b) {
    const setA = new Set(a.split(' '));
    const setB = new Set(b.split(' '));
    const intersection = [...setA].filter(w => setB.has(w)).length;
    return intersection / Math.max(setA.size, setB.size, 1);
}

function highlightText(text, keywords) {
    let result = escapeHtml(text);
    for (const kw of keywords) {
        if (!kw || kw.length < 2) continue;
        try {
            const re = new RegExp(`(${escapeRegex(kw)})`, 'gi');
            result = result.replace(re, '<mark>$1</mark>');
        } catch (_) { }
    }
    return result;
}

// ── Render Results ────────────────────────────
function renderResults(query, { results, keywords }) {
    if (results.length === 0) {
        return `
      <div class="no-results">
        🙏 No passages found for "<em>${escapeHtml(query)}</em>".<br/>
        Try different keywords or switch the search mode.
      </div>
    `;
    }

    let html = `
    <div class="results-header">
      Sacred Passages Found
      <span class="results-count-badge">${results.length} result${results.length > 1 ? 's' : ''}</span>
    </div>
  `;

    results.forEach((r) => {
        const highlighted = highlightText(r.snippet, keywords);
        html += `
      <div class="result-card">
        <div class="result-page-badge">📖 Verse ${r.page}</div>
        <p class="result-text">${highlighted}</p>
        <div class="result-relevance">
          <div class="relevance-bar-bg">
            <div class="relevance-bar-fill" style="width:${r.relevance}%"></div>
          </div>
          <span class="relevance-label">${r.relevance}%</span>
        </div>
      </div>
    `;
    });

    return html;
}

// ── Send Query ────────────────────────────────
async function sendQuery(query) {
    query = query.trim();
    if (!query || state.isProcessing) return;

    if (state.pdfData.length === 0) {
        showToast('Scripture not loaded yet.', 'error');
        return;
    }
    // Remove welcome msg if present
    const welcome = dom.messagesContainer.querySelector('.welcome-msg');
    if (welcome) welcome.remove();

    state.isProcessing = true;
    dom.sendBtn.disabled = true;
    dom.userInput.value = '';
    autoResizeInput();

    appendMessage('user', escapeHtml(query));
    appendThinking();

    // Simulate brief search delay for UX
    await sleep(400 + Math.random() * 400);

    const searchResults = searchPDF(query);
    removeThinking();

    const responseHTML = renderResults(query, searchResults);
    appendMessage('bot', responseHTML);

    // Update stats
    state.queryCount++;
    dom.statQueries.textContent = state.queryCount;
    dom.headerSub.textContent = `${state.queryCount} question${state.queryCount !== 1 ? 's' : ''} asked`;

    state.isProcessing = false;
    dom.sendBtn.disabled = false;
    dom.userInput.focus();
}

// ── Input Handlers ────────────────────────────
dom.sendBtn.addEventListener('click', () => {
    sendQuery(dom.userInput.value);
});

dom.userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendQuery(dom.userInput.value);
    }
});

dom.userInput.addEventListener('input', autoResizeInput);

function autoResizeInput() {
    dom.userInput.style.height = 'auto';
    dom.userInput.style.height = Math.min(dom.userInput.scrollHeight, 120) + 'px';
}

// Suggestions
dom.suggestionsList.addEventListener('click', (e) => {
    const btn = e.target.closest('.suggestion-item');
    if (!btn) return;
    const q = btn.dataset.q;
    sendQuery(q);

    // Mobile: close sidebar
    dom.sidebar.classList.remove('mobile-open');
});

// Sidebar Toggle
dom.sidebarToggle.addEventListener('click', () => {
    state.sidebarOpen = !state.sidebarOpen;
    dom.sidebar.classList.toggle('collapsed', !state.sidebarOpen);
});

dom.mobileMenuBtn.addEventListener('click', () => {
    dom.sidebar.classList.toggle('mobile-open');
});

// Clear Chat
dom.clearChatBtn.addEventListener('click', () => {
    dom.messagesContainer.innerHTML = '';
    renderWelcomeMessage();
    state.queryCount = 0;
    dom.statQueries.textContent = '0';
    dom.headerSub.textContent = 'Ask anything from the Bhagavatam';
});

// Change PDF
dom.changePdfBtn.addEventListener('click', () => {
    // Reset state
    state.pdfData = [];
    state.pdfName = '';
    state.totalPages = 0;
    state.totalWords = 0;
    state.queryCount = 0;
    state.isProcessing = false;

    // Reset button state
    dom.enterBtn.style.pointerEvents = '';
    dom.enterBtn.style.opacity = '1';
    dom.enterBtn.querySelector('span').textContent = 'Enter the Scripture';

    // Switch back to landing
    dom.chatScreen.style.opacity = '0';
    setTimeout(() => {
        dom.chatScreen.classList.remove('active');
        dom.chatScreen.style.display = 'none';
        dom.landingScreen.style.display = 'flex';
        dom.landingScreen.classList.add('active');
        setTimeout(() => { dom.landingScreen.style.opacity = '1'; }, 10);
        dom.sidebar.classList.remove('mobile-open');
    }, 400);
});

// Close sidebar on outside click (mobile)
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!dom.sidebar.contains(e.target) && !dom.mobileMenuBtn.contains(e.target)) {
            dom.sidebar.classList.remove('mobile-open');
        }
    }
});

// ── Toast Notification ────────────────────────
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 999;
    background: ${type === 'error' ? 'rgba(248,113,113,0.15)' : 'rgba(245,200,66,0.12)'};
    border: 1px solid ${type === 'error' ? 'rgba(248,113,113,0.4)' : 'rgba(245,200,66,0.3)'};
    color: ${type === 'error' ? '#fca5a5' : '#f5c842'};
    padding: 12px 20px; border-radius: 12px;
    font-size: 0.88rem; font-family: 'Inter', sans-serif;
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    animation: fadeInUp 0.3s ease forwards;
    max-width: 320px;
  `;
    toast.textContent = message;
    document.body.appendChild(toast);

    const style = document.createElement('style');
    style.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
    document.head.appendChild(style);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = '0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ── Utilities ─────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function formatNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Init ──────────────────────────────────────
(function init() {
    // Logo fallback
    const logoImgs = document.querySelectorAll('.logo-img, .sidebar-logo-img');
    logoImgs.forEach(img => {
        img.addEventListener('error', () => {
            img.src = '';
            img.style.background = 'linear-gradient(135deg, #1f0a5a, #4a208a)';
            img.insertAdjacentHTML('afterend',
                '<span style="position:absolute;font-size:2rem;color:#f5c842;top:50%;left:50%;transform:translate(-50%,-50%)">ॐ</span>'
            );
        });
    });

    // Set initial screen
    dom.landingScreen.style.display = 'flex';
    dom.landingScreen.classList.add('active');
    dom.landingScreen.style.opacity = '1';
    dom.chatScreen.style.display = 'none';
    dom.chatScreen.style.opacity = '0';
})();

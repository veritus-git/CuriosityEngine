/**
 * Learning Compass — Frontend Application
 * State machine: NO_TOPIC → TOPIC_SUGGESTED → TOPIC_ACTIVE → REFLECTION → SAVED
 */

(function () {
    'use strict';

    // ─── State ───
    let state = {
        view: 'NO_TOPIC', // NO_TOPIC | TOPIC_SUGGESTED | TOPIC_ACTIVE | REFLECTION | SAVED | HISTORY | DETAIL | SETTINGS
        topic: null,
        session: null,
        ai: { configured: false },
        historyCount: 0,
        interestRating: null,
        difficultyRating: null,
    };

    // ─── DOM refs ───
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const views = {
        NO_TOPIC: $('#view-no-topic'),
        TOPIC_SUGGESTED: $('#view-suggested'),
        TOPIC_ACTIVE: $('#view-active'),
        REFLECTION: $('#view-reflection'),
        SAVED: $('#view-saved'),
        HISTORY: $('#view-history'),
        DETAIL: $('#view-detail'),
        SETTINGS: $('#view-settings'),
    };

    // ─── API helpers ───
    async function api(method, url, body = null) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(url, opts);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || `Request failed (${res.status})`);
        }
        return data;
    }

    // ─── View Management ───
    let previousView = null;

    function showView(viewName) {
        previousView = state.view;
        state.view = viewName;

        Object.entries(views).forEach(([name, el]) => {
            if (name === viewName) {
                el.hidden = false;
                el.style.animation = 'none';
                el.offsetHeight; // trigger reflow
                el.style.animation = '';
            } else {
                el.hidden = true;
            }
        });
    }

    // ─── Greeting ───
    function getGreeting() {
        const h = new Date().getHours();
        if (h < 6) return 'Late night thoughts.';
        if (h < 12) return 'Good morning.';
        if (h < 17) return 'Good afternoon.';
        if (h < 21) return 'Good evening.';
        return 'Night owl mode.';
    }

    function formatDate() {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    }

    function relativeDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'Z');
        const now = new Date();
        const diffMs = now - d;
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffDays === 0) return 'today';
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // ─── Initialize ───
    async function init() {
        $('#topbar-date').textContent = formatDate();
        $('#greeting-text').textContent = getGreeting();

        bindEvents();

        try {
            const data = await api('GET', '/api/state');
            state.topic = data.topic;
            state.session = data.session;
            state.ai = data.ai;
            state.historyCount = data.history_count;

            if (data.state === 'TOPIC_ACTIVE') {
                renderActive();
                showView('TOPIC_ACTIVE');
            } else if (data.state === 'TOPIC_SUGGESTED') {
                renderSuggested();
                showView('TOPIC_SUGGESTED');
            } else {
                showView('NO_TOPIC');
            }
        } catch (err) {
            showView('NO_TOPIC');
            showError('Could not connect to the server. Make sure the backend is running.');
        }
    }

    // ─── Event Binding ───
    function bindEvents() {
        // NO_TOPIC
        $('#btn-get-topic').addEventListener('click', () => generateTopic('connected'));
        $('#btn-random-topic').addEventListener('click', () => generateTopic('random'));
        $('#btn-toggle-interest').addEventListener('click', toggleInterest);
        $('#btn-submit-interest').addEventListener('click', submitInterest);
        $('#input-interest').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitInterest();
        });

        // SUGGESTED
        $('#btn-accept').addEventListener('click', acceptTopic);
        $('#btn-reject').addEventListener('click', rejectTopic);

        // ACTIVE
        $('#btn-copy-prompt').addEventListener('click', copyPrompt);
        $('#btn-finish').addEventListener('click', () => {
            renderReflection();
            showView('REFLECTION');
        });

        // REFLECTION
        $('#reflection-form').addEventListener('submit', saveReflection);
        setupRatings();

        // SAVED
        $('#btn-next-topic').addEventListener('click', () => generateTopic('connected'));
        $('#btn-go-home').addEventListener('click', () => {
            state.topic = null;
            showView('NO_TOPIC');
        });

        // NAV
        $('#btn-history').addEventListener('click', loadHistory);
        $('#btn-settings').addEventListener('click', loadSettings);
        $('#btn-history-back').addEventListener('click', goBack);
        $('#btn-settings-back').addEventListener('click', goBack);
        $('#btn-detail-back').addEventListener('click', () => loadHistory());

        // TOAST
        $('#toast-close').addEventListener('click', hideError);
    }

    function goBack() {
        if (state.topic && state.topic.status === 'active') {
            renderActive();
            showView('TOPIC_ACTIVE');
        } else if (state.topic && state.topic.status === 'suggested') {
            renderSuggested();
            showView('TOPIC_SUGGESTED');
        } else {
            showView('NO_TOPIC');
        }
    }

    // ─── Interest Toggle ───
    function toggleInterest() {
        const form = $('#interest-form');
        const toggle = $('#btn-toggle-interest');
        if (form.hidden) {
            form.hidden = false;
            toggle.hidden = true;
            $('#input-interest').focus();
        } else {
            form.hidden = true;
            toggle.hidden = false;
        }
    }

    function submitInterest() {
        const input = $('#input-interest');
        const val = input.value.trim();
        if (!val) return;
        generateTopic('user_interest', val);
    }

    // ─── Generate Topic ───
    async function generateTopic(mode, userRequest = null) {
        const btn = mode === 'random' ? $('#btn-random-topic') :
                    mode === 'connected' && state.view === 'SAVED' ? $('#btn-next-topic') :
                    state.view === 'TOPIC_SUGGESTED' ? $('#btn-reject') : $('#btn-get-topic');

        setLoading(btn, true);

        try {
            const body = { mode };
            if (userRequest) body.user_request = userRequest;
            const data = await api('POST', '/api/topics/generate', body);

            state.topic = data.topic;
            renderSuggested();
            showView('TOPIC_SUGGESTED');
        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(btn, false);
        }
    }

    // ─── Accept / Reject ───
    async function acceptTopic() {
        if (!state.topic) return;
        const btn = $('#btn-accept');
        setLoading(btn, true);

        try {
            const data = await api('POST', `/api/topics/${state.topic.id}/accept`);
            state.topic = data.topic;
            state.session = data.session;
            renderActive();
            showView('TOPIC_ACTIVE');
        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(btn, false);
        }
    }

    async function rejectTopic() {
        if (!state.topic) return;
        generateTopic('connected');
    }

    // ─── Copy Prompt ───
    async function copyPrompt() {
        if (!state.topic) return;
        try {
            const data = await api('POST', '/api/learning-prompt', {
                topic_title: state.topic.title,
            });
            await navigator.clipboard.writeText(data.prompt);

            const el = $('#prompt-copied');
            el.hidden = false;
            setTimeout(() => { el.hidden = true; }, 3000);
        } catch (err) {
            showError('Could not copy prompt. ' + err.message);
        }
    }

    // ─── Ratings ───
    function setupRatings() {
        ['interest', 'difficulty'].forEach((type) => {
            const container = $(`#rating-${type}`);
            container.querySelectorAll('.rating__dot').forEach((dot) => {
                dot.addEventListener('click', () => {
                    const val = parseInt(dot.dataset.value);
                    if (type === 'interest') state.interestRating = val;
                    else state.difficultyRating = val;

                    container.querySelectorAll('.rating__dot').forEach((d) => {
                        d.classList.toggle('is-active', parseInt(d.dataset.value) <= val);
                    });
                });
            });
        });
    }

    function resetRatings() {
        state.interestRating = null;
        state.difficultyRating = null;
        $$('.rating__dot').forEach((d) => d.classList.remove('is-active'));
    }

    // ─── Save Reflection ───
    async function saveReflection(e) {
        e.preventDefault();
        if (!state.topic) return;

        const btn = $('#btn-save');
        setLoading(btn, true);

        try {
            const body = {
                notes: $('#field-notes').value.trim() || null,
                discoveries: $('#field-discoveries').value.trim() || null,
                side_paths: $('#field-sidepaths').value.trim() || null,
                interest_rating: state.interestRating,
                difficulty_rating: state.difficultyRating,
            };

            const data = await api('POST', `/api/topics/${state.topic.id}/complete`, body);
            state.topic = data.topic;

            // Clear form
            $('#field-notes').value = '';
            $('#field-discoveries').value = '';
            $('#field-sidepaths').value = '';
            resetRatings();

            renderSaved();
            showView('SAVED');
        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(btn, false);
        }
    }

    // ─── Render Helpers ───
    function renderSuggested() {
        if (!state.topic) return;
        $('#suggested-title').textContent = state.topic.title;
        $('#suggested-reason').textContent = state.topic.short_reason || '';
        const connEl = $('#suggested-connection');
        if (state.topic.connection) {
            connEl.textContent = state.topic.connection;
            connEl.hidden = false;
        } else {
            connEl.hidden = true;
        }
    }

    function renderActive() {
        if (!state.topic) return;
        $('#active-title').textContent = state.topic.title;
        $('#active-reason').textContent = state.topic.short_reason || 'Explore it however you like.';
        const started = relativeDate(state.topic.created_at);
        $('#active-meta').textContent = started ? `Started ${started}` : '';
    }

    function renderReflection() {
        if (!state.topic) return;
        $('#reflection-topic').textContent = state.topic.title;
    }

    function renderSaved() {
        if (!state.topic) return;
        $('#saved-topic-name').textContent = state.topic.title;
    }

    // ─── History ───
    async function loadHistory() {
        showView('HISTORY');
        const list = $('#history-list');
        list.innerHTML = '';

        try {
            const data = await api('GET', '/api/history?limit=50');

            if (data.items.length === 0) {
                $('#history-empty').hidden = false;
                return;
            }

            $('#history-empty').hidden = true;

            data.items.forEach((item) => {
                const el = document.createElement('div');
                el.className = 'history-item';
                el.tabIndex = 0;
                el.setAttribute('role', 'button');
                el.setAttribute('aria-label', `View details for ${item.title}`);

                const notesPreview = item.notes ? item.notes.substring(0, 100) : '';
                const date = relativeDate(item.session_completed || item.created_at);

                el.innerHTML = `
                    <div class="history-item__top">
                        <span class="history-item__title">${esc(item.title)}</span>
                        <span class="history-item__date">${esc(date)}</span>
                    </div>
                    ${notesPreview ? `<p class="history-item__notes">${esc(notesPreview)}</p>` : ''}
                    <div class="history-item__ratings">
                        ${item.interest_rating ? `<span>interest: ${item.interest_rating}/5</span>` : ''}
                        ${item.difficulty_rating ? `<span>difficulty: ${item.difficulty_rating}/5</span>` : ''}
                    </div>
                `;

                el.addEventListener('click', () => loadDetail(item.id));
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        loadDetail(item.id);
                    }
                });

                list.appendChild(el);
            });
        } catch (err) {
            showError(err.message);
        }
    }

    async function loadDetail(topicId) {
        showView('DETAIL');
        const container = $('#detail-content');
        container.innerHTML = '';

        try {
            const data = await api('GET', `/api/topics/${topicId}`);
            const t = data.topic;
            const s = data.session;

            let html = `<h2 class="detail-title">${esc(t.title)}</h2>`;
            html += `<div class="detail-meta">`;
            if (t.difficulty) html += `<span>Difficulty: ${esc(t.difficulty)}</span>`;
            if (t.created_at) html += `<span>${relativeDate(t.created_at)}</span>`;
            if (t.source_mode) html += `<span>Mode: ${esc(t.source_mode)}</span>`;
            html += `</div>`;

            if (t.short_reason) {
                html += `<div class="detail-section"><div class="detail-section__label">Why this topic</div><p class="detail-section__text">${esc(t.short_reason)}</p></div>`;
            }
            if (t.connection) {
                html += `<div class="detail-section"><div class="detail-section__label">Connection</div><p class="detail-section__text">${esc(t.connection)}</p></div>`;
            }

            if (s) {
                if (s.notes) html += `<div class="detail-section"><div class="detail-section__label">Notes</div><p class="detail-section__text">${esc(s.notes)}</p></div>`;
                if (s.discoveries) html += `<div class="detail-section"><div class="detail-section__label">Discoveries</div><p class="detail-section__text">${esc(s.discoveries)}</p></div>`;
                if (s.side_paths) html += `<div class="detail-section"><div class="detail-section__label">Side paths</div><p class="detail-section__text">${esc(s.side_paths)}</p></div>`;
                if (s.interest_rating) html += `<div class="detail-section"><div class="detail-section__label">Interest</div><p class="detail-section__text">${s.interest_rating}/5</p></div>`;
                if (s.difficulty_rating) html += `<div class="detail-section"><div class="detail-section__label">Difficulty</div><p class="detail-section__text">${s.difficulty_rating}/5</p></div>`;
            }

            container.innerHTML = html;
        } catch (err) {
            showError(err.message);
        }
    }

    // ─── Settings ───
    async function loadSettings() {
        showView('SETTINGS');

        try {
            const stateData = await api('GET', '/api/state');
            const ai = stateData.ai;

            const aiInfo = $('#settings-ai-info');
            if (ai.configured) {
                aiInfo.innerHTML = `Provider: <span class="status-ok">${esc(ai.provider)}</span><br>Model: ${esc(ai.model)}<br>Status: <span class="status-ok">Configured ✓</span>`;
            } else {
                aiInfo.innerHTML = `Status: <span class="status-err">Not configured ✗</span><br>Set <code>AI_API_KEY</code> in your <code>.env</code> file.`;
            }

            const prefs = await api('GET', '/api/preferences');
            renderTags('preferred', prefs.preferred_subjects || []);
            renderTags('disliked', prefs.disliked_subjects || []);

            const styleSelect = $('#select-style');
            styleSelect.value = prefs.learning_style || 'top-down';

            // Bind settings events
            $('#btn-add-preferred').onclick = () => addTag('preferred');
            $('#input-preferred').onkeydown = (e) => { if (e.key === 'Enter') addTag('preferred'); };
            $('#btn-add-disliked').onclick = () => addTag('disliked');
            $('#input-disliked').onkeydown = (e) => { if (e.key === 'Enter') addTag('disliked'); };
            styleSelect.onchange = () => savePrefs();
        } catch (err) {
            showError(err.message);
        }
    }

    function renderTags(type, items) {
        const container = $(`#${type}-tags`);
        container.innerHTML = '';
        items.forEach((item) => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerHTML = `${esc(item)} <button class="tag__remove" aria-label="Remove ${esc(item)}">&times;</button>`;
            tag.querySelector('.tag__remove').addEventListener('click', () => {
                items.splice(items.indexOf(item), 1);
                renderTags(type, items);
                savePrefs();
            });
            container.appendChild(tag);
        });
    }

    async function addTag(type) {
        const input = $(`#input-${type}`);
        const val = input.value.trim();
        if (!val) return;
        input.value = '';

        try {
            const prefs = await api('GET', '/api/preferences');
            const key = type === 'preferred' ? 'preferred_subjects' : 'disliked_subjects';
            const list = prefs[key] || [];
            if (!list.includes(val)) {
                list.push(val);
                const body = {};
                body[key] = list;
                await api('POST', '/api/preferences', body);
                renderTags(type, list);
            }
        } catch (err) {
            showError(err.message);
        }
    }

    async function savePrefs() {
        try {
            const body = { learning_style: $('#select-style').value };
            await api('POST', '/api/preferences', body);
        } catch (err) {
            showError(err.message);
        }
    }

    // ─── Utils ───
    function setLoading(btn, loading) {
        if (!btn) return;
        btn.classList.toggle('is-loading', loading);
        btn.disabled = loading;
    }

    function esc(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    let toastTimer = null;
    function showError(msg) {
        const toast = $('#toast');
        const text = $('#toast-text');
        text.textContent = msg;
        toast.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(hideError, 8000);
    }

    function hideError() {
        $('#toast').hidden = true;
        clearTimeout(toastTimer);
    }

    // ─── Start ───
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

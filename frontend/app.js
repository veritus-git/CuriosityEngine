/**
 * CuriosityEngine — Frontend Application
 * State machine: NO_TOPIC → TOPIC_SUGGESTED → TOPIC_ACTIVE → REFLECTION → SAVED
 * i18n: loads language JSON files from /i18n/{code}.json
 */

(function () {
    'use strict';

    // ─── State ───
    let state = {
        view: 'NO_TOPIC',
        topic: null,
        session: null,
        ai: { configured: false },
        historyCount: 0,
        interestRating: null,
        difficultyRating: null,
    };

    // ─── i18n ───
    let lang = {};       // current language strings
    let langCode = 'en'; // current language code
    let languages = [];  // available languages

    /** Resolve a dotted key like "nav.history" from the lang object */
    function t(key, vars) {
        const parts = key.split('.');
        let val = lang;
        for (const p of parts) {
            if (val && typeof val === 'object') val = val[p];
            else return key;
        }
        if (typeof val !== 'string') return key;
        if (vars) {
            return val.replace(/\{(\w+)\}/g, (_, k) => vars[k] !== undefined ? vars[k] : `{${k}}`);
        }
        return val;
    }

    /** Apply translations to all elements with data-i18n attributes */
    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = t(el.dataset.i18nPlaceholder);
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            el.innerHTML = t(el.dataset.i18nHtml);
        });
        // Update html lang attribute
        document.documentElement.lang = langCode;
    }

    /** Load a language file */
    async function loadLanguage(code) {
        try {
            const res = await fetch(`/i18n/${code}/ui.json`);
            if (!res.ok) throw new Error(`Language file not found: ${code}`);
            lang = await res.json();
            langCode = code;
            applyTranslations();
        } catch (err) {
            console.warn(`Failed to load language ${code}, falling back to en`, err);
            if (code !== 'en') {
                await loadLanguage('en');
            }
        }
    }

    /** Load available languages list */
    async function loadLanguageList() {
        try {
            const data = await api('GET', '/api/languages');
            languages = data.languages || [];
        } catch (err) {
            languages = [{ code: 'en', name: 'English', native_name: 'English' }];
        }
    }

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
        ONBOARDING: $('#view-onboarding'),
        AUTH: $('#view-auth'),
    };

    // ─── API helpers ───
    async function api(method, url, body = null) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        const token = localStorage.getItem('curiosity_token');
        if (token) {
            opts.headers['Authorization'] = `Bearer ${token}`;
        }

        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(url, opts);
        const data = await res.json();

        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('curiosity_token');
            showView('AUTH');
            throw new Error('Unauthorized');
        }

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
                el.offsetHeight;
                el.style.animation = '';
            } else {
                el.hidden = true;
            }
        });
    }

    // ─── Greeting ───
    function getGreeting() {
        const h = new Date().getHours();
        if (h < 6) return t('greeting.late_night');
        if (h < 12) return t('greeting.morning');
        if (h < 17) return t('greeting.afternoon');
        if (h < 21) return t('greeting.evening');
        return t('greeting.night_owl');
    }

    function formatDate() {
        const locale = t('dates.locale') || 'en-US';
        return new Date().toLocaleDateString(locale, {
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
        if (diffDays === 0) return t('dates.today');
        if (diffDays === 1) return t('dates.yesterday');
        if (diffDays < 7) return t('dates.days_ago', { n: diffDays });
        const locale = t('dates.locale') || 'en-US';
        return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    }

    // ─── Initialize ───
    async function init() {
        let savedLang = navigator.language.startsWith('pl') ? 'pl' : 'en';
        try {
            if (localStorage.getItem('curiosity_token')) {
                const prefs = await api('GET', '/api/preferences');
                savedLang = prefs.language || 'en';
            }
        } catch (e) { 
            if (e.message === 'Unauthorized') {
                await loadLanguage(savedLang);
                return;
            }
        }

        await loadLanguage(savedLang);
        await loadLanguageList();

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
                if (data.history_count === 0 && (!data.preferences || !data.preferences.preferred_subjects || data.preferences.preferred_subjects.length === 0)) {
                    showView('ONBOARDING');
                } else {
                    showView('NO_TOPIC');
                }
            }
        } catch (err) {
            if (err.message === 'Unauthorized') return;
            showView('NO_TOPIC');
            showError(t('errors.server_down'));
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

        // AUTH
        $('#auth-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = $('#auth-username').value.trim();
            const password = $('#auth-password').value.trim();
            const btn = $('#btn-login');
            const err = $('#auth-error');
            
            setLoading(btn, true);
            err.style.display = 'none';

            try {
                // Try login first
                let data;
                try {
                    data = await api('POST', '/api/auth/login', { username, password });
                } catch (loginErr) {
                    if (loginErr.message.includes('Invalid') || loginErr.message.includes('Unauthorized')) {
                        // If login fails, try register
                        data = await api('POST', '/api/auth/register', { username, password });
                    } else {
                        throw loginErr;
                    }
                }
                
                localStorage.setItem('curiosity_token', data.token);
                init();
            } catch (error) {
                err.textContent = error.message;
                err.style.display = 'block';
            } finally {
                setLoading(btn, false);
            }
        });

        // SUGGESTED
        $('#btn-accept').addEventListener('click', acceptTopic);
        $('#btn-skip').addEventListener('click', () => rejectTopic('skip'));
        $('#btn-reject').addEventListener('click', () => rejectTopic('reject'));

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

        // ONBOARDING
        const saveOnb = $('#btn-onboarding-save');
        if (saveOnb) {
            let currentOnbSlide = 1;
            const totalOnbSlides = 4;
            
            function updateOnbProgress() {
                const progress = $('#onboarding-progress');
                if (progress) {
                    progress.style.width = ((currentOnbSlide) / totalOnbSlides * 100) + '%';
                }
            }

            function showOnbSlide(slide) {
                document.querySelectorAll('.onboarding-slide').forEach(el => el.style.display = 'none');
                const target = $(`#onb-slide-${slide}`);
                if (target) {
                    target.style.display = 'block';
                    const input = target.querySelector('input');
                    if (input) input.focus();
                }
                updateOnbProgress();
            }

            document.querySelectorAll('.btn-onb-next').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (currentOnbSlide < totalOnbSlides) {
                        currentOnbSlide++;
                        showOnbSlide(currentOnbSlide);
                    }
                });
            });

            saveOnb.addEventListener('click', async () => {
                const interestsVal = $('#input-onboarding-interests').value.trim();
                const currentVal = $('#input-onboarding-current').value.trim();
                const goalCustom = $('#input-onboarding-goal-custom').value.trim();
                const levelVal = $('#input-onboarding-level').value;
                const levelDetails = $('#input-onboarding-level-details').value.trim();

                let subjects = [];
                if (interestsVal) {
                    subjects = interestsVal.split(',').map(s => s.trim()).filter(s => s);
                }

                let currentInterests = [];
                if (currentVal) currentInterests.push(`Chcę się dowiedzieć: ${currentVal}`);
                if (goalCustom) currentInterests.push(`Cel: ${goalCustom}`);

                if (levelVal) {
                    let levelStr = levelVal;
                    if (levelVal === 'custom' && levelDetails) levelStr = levelDetails;
                    else if (levelDetails) levelStr += ` (${levelDetails})`;
                    currentInterests.push(`Obecny poziom wiedzy: ${levelStr}`);
                }

                setLoading(saveOnb, true);
                try {
                    const prefs = await api('GET', '/api/preferences');
                    prefs.preferred_subjects = subjects;
                    prefs.current_interests = currentInterests;
                    await api('POST', '/api/preferences', prefs);
                    
                    showView('NO_TOPIC');
                    if (currentVal) {
                        generateTopic('user_interest', currentVal);
                    }
                } catch (err) {
                    showError(err.message);
                }
                setLoading(saveOnb, false);
            });
            
            $('#input-onboarding-interests').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') document.querySelectorAll('.btn-onb-next')[0].click();
            });
            $('#input-onboarding-current').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') document.querySelectorAll('.btn-onb-next')[1].click();
            });
            $('#input-onboarding-goal-custom').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') document.querySelectorAll('.btn-onb-next')[2].click();
            });
            $('#input-onboarding-level').addEventListener('change', (e) => {
                const detailsInput = $('#input-onboarding-level-details');
                if (e.target.value === 'szkola_srednia' || e.target.value === 'studia' || e.target.value === 'custom') {
                    detailsInput.style.display = 'block';
                    detailsInput.focus();
                } else {
                    detailsInput.style.display = 'none';
                }
            });
            $('#input-onboarding-level').addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && $('#input-onboarding-level-details').style.display === 'none') saveOnb.click();
            });
            $('#input-onboarding-level-details').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') saveOnb.click();
            });
        }

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
    async function generateTopic(mode, userRequest = null, action = 'skip') {
        const btn = mode === 'random' ? $('#btn-random-topic') :
                    mode === 'connected' && state.view === 'SAVED' ? $('#btn-next-topic') :
                    state.view === 'TOPIC_SUGGESTED' ? (action === 'reject' ? $('#btn-reject') : $('#btn-skip')) : $('#btn-get-topic');

        setLoading(btn, true);

        try {
            const body = { mode, current_topic_action: action };
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

    async function rejectTopic(action) {
        if (!state.topic) return;
        generateTopic('connected', null, action);
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
            showError(t('errors.copy_failed') + ' ' + err.message);
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
        if (state.topic.connection && state.historyCount > 0) {
            connEl.textContent = state.topic.connection;
            connEl.hidden = false;
        } else {
            connEl.hidden = true;
        }
    }

    function renderActive() {
        if (!state.topic) return;
        $('#active-title').textContent = state.topic.title;
        $('#active-reason').textContent = state.topic.short_reason || t('active.fallback_reason');
        const started = relativeDate(state.topic.created_at);
        $('#active-meta').textContent = started ? t('active.started', { date: started }) : '';
    }

    function renderReflection() {
        if (!state.topic) return;
        $('#reflection-topic').textContent = state.topic.title;
    }

    function renderSaved() {
        if (!state.topic) return;
        const topicText = $('#saved-topic-text');
        topicText.innerHTML = t('saved.topic_saved', { topic: `<span style="font-family:var(--font-mono);color:var(--text-accent)">${esc(state.topic.title)}</span>` });
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
                el.setAttribute('aria-label', item.title);

                const notesPreview = item.notes ? item.notes.substring(0, 100) : '';
                const date = relativeDate(item.session_completed || item.created_at);

                el.innerHTML = `
                    <div class="history-item__top">
                        <span class="history-item__title">${esc(item.title)}</span>
                        <span class="history-item__date">${esc(date)}</span>
                    </div>
                    ${notesPreview ? `<p class="history-item__notes">${esc(notesPreview)}</p>` : ''}
                    <div class="history-item__ratings">
                        ${item.interest_rating ? `<span>${t('history.interest')}: ${item.interest_rating}/5</span>` : ''}
                        ${item.difficulty_rating ? `<span>${t('history.difficulty')}: ${item.difficulty_rating}/5</span>` : ''}
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
            const tp = data.topic;
            const s = data.session;

            let html = `<h2 class="detail-title">${esc(tp.title)}</h2>`;
            html += `<div class="detail-meta">`;
            if (tp.difficulty) html += `<span>${t('detail.difficulty_label')}: ${esc(tp.difficulty)}</span>`;
            if (tp.created_at) html += `<span>${relativeDate(tp.created_at)}</span>`;
            if (tp.source_mode) html += `<span>${t('detail.mode_label')}: ${esc(tp.source_mode)}</span>`;
            html += `</div>`;

            if (tp.short_reason) {
                html += `<div class="detail-section"><div class="detail-section__label">${t('detail.why_label')}</div><p class="detail-section__text">${esc(tp.short_reason)}</p></div>`;
            }
            if (tp.connection) {
                html += `<div class="detail-section"><div class="detail-section__label">${t('detail.connection_label')}</div><p class="detail-section__text">${esc(tp.connection)}</p></div>`;
            }

            if (s) {
                if (s.notes) html += `<div class="detail-section"><div class="detail-section__label">${t('detail.notes_label')}</div><p class="detail-section__text">${esc(s.notes)}</p></div>`;
                if (s.discoveries) html += `<div class="detail-section"><div class="detail-section__label">${t('detail.discoveries_label')}</div><p class="detail-section__text">${esc(s.discoveries)}</p></div>`;
                if (s.side_paths) html += `<div class="detail-section"><div class="detail-section__label">${t('detail.sidepaths_label')}</div><p class="detail-section__text">${esc(s.side_paths)}</p></div>`;
                if (s.interest_rating) html += `<div class="detail-section"><div class="detail-section__label">${t('detail.interest_label')}</div><p class="detail-section__text">${s.interest_rating}/5</p></div>`;
                if (s.difficulty_rating) html += `<div class="detail-section"><div class="detail-section__label">${t('detail.difficulty_detail_label')}</div><p class="detail-section__text">${s.difficulty_rating}/5</p></div>`;
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
                aiInfo.innerHTML = `${t('settings.ai_provider')}: <span class="status-ok">${esc(ai.provider)}</span><br>${t('settings.ai_model')}: ${esc(ai.model)}<br>${t('settings.ai_status')}: <span class="status-ok">${t('settings.ai_configured')}</span>`;
            } else {
                aiInfo.innerHTML = `${t('settings.ai_status')}: <span class="status-err">${t('settings.ai_not_configured')}</span><br>${t('settings.ai_set_key')}`;
            }

            const prefs = await api('GET', '/api/preferences');
            renderTags('preferred', prefs.preferred_subjects || []);
            renderTags('disliked', prefs.disliked_subjects || []);

            const styleSelect = $('#select-style');
            styleSelect.value = prefs.learning_style || 'top-down';

            // Language selector — populate from discovered languages
            const langSelect = $('#select-language');
            langSelect.innerHTML = '';
            languages.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l.code;
                opt.textContent = `${l.native_name} (${l.name})`;
                langSelect.appendChild(opt);
            });
            langSelect.value = prefs.language || 'en';

            // Bind settings events
            $('#btn-add-preferred').onclick = () => addTag('preferred');
            $('#input-preferred').onkeydown = (e) => { if (e.key === 'Enter') addTag('preferred'); };
            $('#btn-add-disliked').onclick = () => addTag('disliked');
            $('#input-disliked').onkeydown = (e) => { if (e.key === 'Enter') addTag('disliked'); };
            styleSelect.onchange = () => savePrefs();
            langSelect.onchange = async () => {
                const newLang = langSelect.value;
                await api('POST', '/api/preferences', { language: newLang });
                await loadLanguage(newLang);
                // Re-render dynamic content
                $('#topbar-date').textContent = formatDate();
                $('#greeting-text').textContent = getGreeting();
            };
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

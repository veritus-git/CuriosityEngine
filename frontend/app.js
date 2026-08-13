/**
 * CuriosityEngine — Zen Dashboard Frontend Application
 * Fully associative, vector-backed knowledge interface with Slide Wizard Onboarding & Dynamic Starter Sparks.
 * Adheres strictly to i18n — zero hardcoded UI strings.
 */

(function () {
    'use strict';

    // ─── Unified State ───
    let state = {
        view: 'DASHBOARD',
        concept: null,
        prompt: null,
        sparksCount: 0,
        masteredCount: 0,
        ai: { configured: false },
        profile: {},
        coldStartActive: false,
        coldStartCards: []
    };

    // ─── Wizard State ───
    let wizardCurrentStep = 1;
    let selectedLevel = 'builder';

    // ─── i18n Engine ───
    let lang = {};
    let langCode = 'pl';
    let languages = [];

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
        document.documentElement.lang = langCode;
        updateWizardProgress();
    }

    async function loadLanguage(code) {
        try {
            const res = await fetch(`/i18n/${code}/ui.json`);
            if (!res.ok) throw new Error(`Language file not found: ${code}`);
            lang = await res.json();
            langCode = code;
            applyTranslations();
        } catch (err) {
            console.warn(`Failed to load language ${code}, fallback to en`, err);
            if (code !== 'en') await loadLanguage('en');
        }
    }

    async function loadLanguageList() {
        try {
            const data = await api('GET', '/api/languages');
            languages = data.languages || [];
        } catch (err) {
            languages = [{ code: 'pl', name: 'Polish', native_name: 'Polski' }];
        }

        const sel = $('#topbar-lang-select');
        const settingsSel = $('#select-settings-language');

        [sel, settingsSel].forEach(selectEl => {
            if (!selectEl) return;
            selectEl.innerHTML = '';
            languages.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l.code;
                opt.textContent = `${l.name} (${l.code.toUpperCase()})`;
                selectEl.appendChild(opt);
            });
            selectEl.value = langCode;
        });

        if (sel) {
            sel.addEventListener('change', async (e) => {
                await switchLanguage(e.target.value);
            });
        }
        if (settingsSel) {
            settingsSel.addEventListener('change', async (e) => {
                await switchLanguage(e.target.value);
            });
        }
    }

    async function switchLanguage(code) {
        await loadLanguage(code);
        localStorage.setItem('curiosity_lang', code);
        if (localStorage.getItem('curiosity_token')) {
            await api('POST', '/api/profile', { language: code }).catch(() => {});
        }
        updateGreetingAndDates();
        if (state.coldStartActive && state.profile && state.profile.onboarded) {
            await loadColdStartCards();
        }
    }

    // ─── Theme Management ───
    const root = document.documentElement;
    function applyTheme(theme) {
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.setAttribute('data-theme', 'light');
        }
        localStorage.setItem('curiosity_theme', theme);
    }
    const savedTheme = localStorage.getItem('curiosity_theme') || 'dark';
    applyTheme(savedTheme);

    // ─── DOM References ───
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const views = {
        AUTH: $('#view-auth'),
        ONBOARDING: $('#view-onboarding'),
        COLD_START: $('#view-cold-start'),
        DASHBOARD: $('#view-dashboard'),
        CONSTELLATION: $('#view-constellation'),
        HISTORY: $('#view-history'),
        SETTINGS: $('#view-settings'),
    };

    // ─── Global Loading Indicator ───
    function setGlobalLoading(isLoading, textKey = 'loading.generating') {
        const overlay = $('#loading-overlay');
        const textEl = $('#loading-text');
        if (!overlay) return;
        if (isLoading) {
            if (textEl) textEl.textContent = t(textKey);
            overlay.hidden = false;
        } else {
            overlay.hidden = true;
        }
    }

    // ─── API Helper ───
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

    // ─── View Routing ───
    function showView(viewName) {
        state.view = viewName;
        Object.entries(views).forEach(([name, el]) => {
            if (!el) return;
            el.hidden = (name !== viewName);
        });

        // Hide navigation items when unauthenticated or during onboarding
        const navLinks = $('#topbar-nav-links');
        const floatingBtn = $('#btn-floating-spark');
        const globalProgress = $('#onboarding-global-progress');

        if (viewName === 'AUTH' || viewName === 'ONBOARDING') {
            if (navLinks) navLinks.hidden = true;
            if (floatingBtn) floatingBtn.hidden = true;
        } else {
            if (navLinks) navLinks.hidden = false;
            if (floatingBtn) floatingBtn.hidden = false;
        }

        if (viewName === 'ONBOARDING') {
            if (globalProgress) globalProgress.hidden = false;
            setWizardStep(1);
        } else {
            if (globalProgress) globalProgress.hidden = true;
        }
    }

    function showToast(message) {
        const toast = $('#toast');
        const text = $('#toast-text');
        if (!toast || !text) return;
        text.textContent = message;
        toast.hidden = false;
        setTimeout(() => {
            toast.hidden = true;
        }, 3000);
    }

    function updateGreetingAndDates() {
        const dateEl = $('#topbar-date');
        const greetingEl = $('#greeting-title');
        const locale = t('dates.locale') || 'pl-PL';

        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString(locale, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
            });
        }

        if (greetingEl) {
            const h = new Date().getHours();
            let greetingKey = 'greeting.morning';
            if (h < 6) greetingKey = 'greeting.late_night';
            else if (h < 12) greetingKey = 'greeting.morning';
            else if (h < 17) greetingKey = 'greeting.afternoon';
            else if (h < 21) greetingKey = 'greeting.evening';
            else greetingKey = 'greeting.night_owl';
            greetingEl.textContent = t(greetingKey);
        }
    }

    // ─── Onboarding Slide Wizard Controller ───
    function setWizardStep(step) {
        wizardCurrentStep = step;
        const slide1 = $('#wizard-slide-1');
        const slide2 = $('#wizard-slide-2');
        const slide3 = $('#wizard-slide-3');

        if (slide1) slide1.hidden = (step !== 1);
        if (slide2) slide2.hidden = (step !== 2);
        if (slide3) slide3.hidden = (step !== 3);

        updateWizardProgress();
    }

    function updateWizardProgress() {
        const stepText = $('#wizard-step-text');
        const progressFill = $('#wizard-progress-fill');
        if (stepText) {
            stepText.textContent = t('onboarding.step_progress', { current: wizardCurrentStep, total: 3 });
        }
        if (progressFill) {
            progressFill.style.width = `${(wizardCurrentStep / 3) * 100}%`;
        }
    }

    // ─── Cold Start & Dynamic Starter Cards ───
    async function loadColdStartCards() {
        try {
            const data = await api('GET', `/api/cold-start-cards?lang=${langCode}`);
            state.coldStartCards = data.cards || [];
            renderColdStartCards();
        } catch (err) {
            console.error('Failed to load cold start cards:', err);
        }
    }

    function renderColdStartCards() {
        const container = $('#cold-start-cards-container');
        if (!container) return;
        container.innerHTML = '';

        state.coldStartCards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'spark-card';
            cardEl.innerHTML = `
                <span class="spark-card__tag">${escapeHtml(card.tag)}</span>
                <h3 class="spark-card__title">${escapeHtml(card.title)}</h3>
                <p class="spark-card__desc">${escapeHtml(card.spark)}</p>
            `;
            cardEl.addEventListener('click', () => {
                triggerSuggestion(card.vector || 'adjacent', card.spark);
            });
            container.appendChild(cardEl);
        });
    }

    // ─── Topic Suggestion Trigger ───
    async function triggerSuggestion(vector, userInput = null, sparkId = null) {
        const btn = document.querySelector(`[data-vector="${vector}"]`);
        if (btn) btn.classList.add('loading');
        setGlobalLoading(true, 'loading.generating');

        try {
            const res = await api('POST', '/api/topics/suggest', {
                vector: vector,
                user_input: userInput,
                spark_id: sparkId,
                current_action: 'skip'
            });

            state.concept = res.concept;
            state.prompt = res.prompt;
            state.coldStartActive = false;
            renderFocusCard('suggested');
            showView('DASHBOARD');
        } catch (err) {
            showToast(err.message || t('errors.server_down'));
        } finally {
            if (btn) btn.classList.remove('loading');
            setGlobalLoading(false);
        }
    }

    // ─── Focus Card Rendering ───
    function renderFocusCard(mode = 'suggested') {
        const wrapper = $('#focus-card-wrapper');
        const compass = $('#compass-section');
        const titleEl = $('#focus-card-title');
        const badgeEl = $('#focus-card-badge');
        const domainEl = $('#focus-card-domain');
        const reasonEl = $('#focus-card-reason');
        const modelEl = $('#focus-card-model');
        const promptEl = $('#prompt-box-text');
        const actionsSuggested = $('#focus-actions-suggested');
        const actionsActive = $('#focus-actions-active');

        if (!state.concept) {
            if (wrapper) wrapper.hidden = true;
            if (compass) compass.hidden = false;
            return;
        }

        if (wrapper) wrapper.hidden = false;
        if (titleEl) titleEl.textContent = state.concept.title;
        if (domainEl) domainEl.textContent = state.concept.domain || 'General';
        if (reasonEl) reasonEl.textContent = state.concept.summary || '';
        if (modelEl) modelEl.textContent = state.concept.intuitive_model || '';
        if (promptEl) promptEl.textContent = state.prompt || '';

        if (mode === 'active' || state.concept.status === 'active') {
            if (badgeEl) badgeEl.textContent = t('focus_card.active_label');
            if (actionsSuggested) actionsSuggested.hidden = true;
            if (actionsActive) actionsActive.hidden = false;
        } else {
            if (badgeEl) badgeEl.textContent = t('focus_card.suggested_label');
            if (actionsSuggested) actionsSuggested.hidden = false;
            if (actionsActive) actionsActive.hidden = true;
        }
    }

    // ─── Knowledge Constellation Canvas ───
    let constellationAnimationId = null;
    async function renderConstellation() {
        const canvas = $('#constellation-canvas');
        const emptyEl = $('#constellation-empty');
        const subtitleEl = $('#constellation-subtitle');
        if (!canvas) return;

        try {
            const data = await api('GET', '/api/graph');
            const nodes = data.nodes || [];
            const links = data.links || [];

            if (subtitleEl) {
                subtitleEl.textContent = t('constellation.nodes_count', { n: nodes.length });
            }

            if (nodes.length === 0) {
                if (emptyEl) emptyEl.hidden = false;
                canvas.hidden = true;
                return;
            }

            if (emptyEl) emptyEl.hidden = true;
            canvas.hidden = false;

            initConstellationSimulation(canvas, nodes, links);
        } catch (err) {
            console.error('Failed to load constellation graph:', err);
        }
    }

    function initConstellationSimulation(canvas, nodes, links) {
        const ctx = canvas.getContext('2d');
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const width = rect.width;
        const height = rect.height;

        nodes.forEach((node, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI;
            const radius = Math.min(width, height) * 0.35;
            node.x = width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 40;
            node.y = height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 40;
            node.vx = (Math.random() - 0.5) * 0.4;
            node.vy = (Math.random() - 0.5) * 0.4;
            node.radius = node.status === 'active' ? 7 : 5;
        });

        const nodeMap = new Map(nodes.map(n => [n.id, n]));

        function draw() {
            ctx.clearRect(0, 0, width, height);

            // Draw links
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
            ctx.lineWidth = 1.2;
            links.forEach(l => {
                const src = nodeMap.get(l.source);
                const tgt = nodeMap.get(l.target);
                if (src && tgt) {
                    ctx.beginPath();
                    ctx.moveTo(src.x, src.y);
                    ctx.lineTo(tgt.x, tgt.y);
                    ctx.stroke();
                }
            });

            // Draw & update nodes
            nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 30 || node.x > width - 30) node.vx *= -1;
                if (node.y < 30 || node.y > height - 30) node.vy *= -1;

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
                ctx.fillStyle = node.status === 'active' ? '#10b981' : '#6366f1';
                ctx.shadowColor = node.status === 'active' ? '#10b981' : '#6366f1';
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#f1f0f7';
                ctx.font = '11px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(node.title, node.x, node.y + node.radius + 14);
            });

            constellationAnimationId = requestAnimationFrame(draw);
        }

        if (constellationAnimationId) cancelAnimationFrame(constellationAnimationId);
        draw();
    }

    // ─── History Archive ───
    async function loadHistoryArchive() {
        const listEl = $('#history-list');
        const emptyEl = $('#history-empty');
        if (!listEl) return;
        listEl.innerHTML = '';

        try {
            const data = await api('GET', '/api/history?limit=100');
            const items = data.items || [];

            if (items.length === 0) {
                if (emptyEl) emptyEl.hidden = false;
                return;
            }
            if (emptyEl) emptyEl.hidden = true;

            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'history-card';
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4 class="history-card__title">${escapeHtml(item.title)}</h4>
                        <span class="domain-tag">${escapeHtml(item.domain || 'General')}</span>
                    </div>
                    <p style="font-size: var(--fs-sm); color: var(--text-secondary);">${escapeHtml(item.summary || '')}</p>
                    <span class="history-card__date">${item.mastered_at ? new Date(item.mastered_at).toLocaleDateString() : ''}</span>
                `;
                listEl.appendChild(card);
            });
        } catch (err) {
            console.error('Failed to load history:', err);
        }
    }

    // ─── Sparks Inbox Modal ───
    async function loadSparksList() {
        const container = $('#sparks-inbox-list');
        if (!container) return;
        container.innerHTML = '';

        try {
            const data = await api('GET', '/api/sparks');
            const sparks = data.sparks || [];

            const sparksBadge = $('#nav-sparks-label');
            if (sparksBadge) {
                sparksBadge.textContent = t('nav.sparks', { n: sparks.length });
            }

            if (sparks.length === 0) {
                container.innerHTML = `<p class="empty-state" style="color: var(--text-tertiary); font-size: var(--fs-sm); padding: var(--space-md) 0;">${t('spark_box.empty')}</p>`;
                return;
            }

            sparks.forEach(s => {
                const item = document.createElement('div');
                item.className = 'spark-item';
                item.innerHTML = `
                    <span class="spark-item__text">${escapeHtml(s.raw_text)}</span>
                    <div style="display: flex; gap: var(--space-xs);">
                        <button class="btn btn--small btn--primary btn-unpack" data-id="${s.id}" data-text="${escapeHtml(s.raw_text)}">${t('spark_box.explore_btn')}</button>
                        <button class="btn btn--small btn--ghost btn-dismiss" data-id="${s.id}">✕</button>
                    </div>
                `;
                item.querySelector('.btn-unpack').addEventListener('click', () => {
                    $('#spark-modal-backdrop').hidden = true;
                    triggerSuggestion('spark', null, s.id);
                });
                item.querySelector('.btn-dismiss').addEventListener('click', async () => {
                    await api('POST', `/api/sparks/${s.id}/dismiss`).catch(() => {});
                    loadSparksList();
                });
                container.appendChild(item);
            });
        } catch (err) {
            console.error('Failed to load sparks:', err);
        }
    }

    // ─── Main Application Initialization ───
    async function init() {
        const token = localStorage.getItem('curiosity_token');
        const savedLang = localStorage.getItem('curiosity_lang') || 'pl';

        await loadLanguage(savedLang);
        await loadLanguageList();
        updateGreetingAndDates();
        bindGlobalEvents();

        if (!token) {
            showView('AUTH');
            return;
        }

        try {
            const data = await api('GET', '/api/state');
            state.concept = data.concept;
            state.prompt = data.prompt;
            state.sparksCount = data.sparks_count || 0;
            state.masteredCount = data.mastered_count || 0;
            state.ai = data.ai || {};
            state.profile = data.profile || {};
            state.coldStartActive = data.cold_start_active;

            const sparksBadge = $('#nav-sparks-label');
            if (sparksBadge) {
                sparksBadge.textContent = t('nav.sparks', { n: state.sparksCount });
            }

            if (state.coldStartActive) {
                if (!state.profile || !state.profile.onboarded) {
                    showView('ONBOARDING');
                } else {
                    await loadColdStartCards();
                    showView('COLD_START');
                }
            } else {
                if (data.state === 'CONCEPT_ACTIVE') {
                    renderFocusCard('active');
                } else if (data.state === 'CONCEPT_SUGGESTED') {
                    renderFocusCard('suggested');
                } else {
                    renderFocusCard(null);
                }
                showView('DASHBOARD');
            }
        } catch (err) {
            if (err.message === 'Unauthorized') return;
            showView('DASHBOARD');
        }
    }

    // ─── Event Bindings ───
    let eventsBound = false;
    function bindGlobalEvents() {
        if (eventsBound) return;
        eventsBound = true;

        // Auth Form
        $('#auth-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = $('#auth-username').value.trim();
            const password = $('#auth-password').value.trim();
            const btn = $('#btn-login-submit');
            const err = $('#auth-error');

            btn.classList.add('loading');
            err.style.display = 'none';

            try {
                let data;
                try {
                    data = await api('POST', '/api/auth/login', { username, password });
                } catch (loginErr) {
                    if (loginErr.message.includes('Invalid') || loginErr.message.includes('Unauthorized') || loginErr.message.includes('not found')) {
                        data = await api('POST', '/api/auth/register', { username, password });
                    } else {
                        throw loginErr;
                    }
                }
                localStorage.setItem('curiosity_token', data.token);
                await api('POST', '/api/profile', { language: langCode }).catch(() => {});
                eventsBound = false;
                init();
            } catch (error) {
                err.textContent = error.message;
                err.style.display = 'block';
            } finally {
                btn.classList.remove('loading');
            }
        });

        // Dynamic Event Delegation for Chips List (Clicking predefined or custom chip-row items)
        const chipsContainer = $('#onboarding-domains-chips');
        if (chipsContainer) {
            chipsContainer.addEventListener('click', (e) => {
                const chip = e.target.closest('.chip-row, .chip');
                if (chip) {
                    chip.classList.toggle('active');
                }
            });
        }

        // Adding Custom Interest Chip
        function addCustomChip() {
            const input = $('#input-custom-chip');
            if (!input) return;
            const text = input.value.trim();
            if (!text) return;

            const newChip = document.createElement('button');
            newChip.type = 'button';
            newChip.className = 'chip-row active';
            newChip.dataset.domain = text.toLowerCase().replace(/\s+/g, '_');
            newChip.textContent = `✨ ${text}`;
            
            chipsContainer.appendChild(newChip);
            input.value = '';
            input.focus();
        }

        const btnAddCustomChip = $('#btn-add-custom-chip');
        if (btnAddCustomChip) {
            btnAddCustomChip.addEventListener('click', addCustomChip);
        }
        const inputCustomChip = $('#input-custom-chip');
        if (inputCustomChip) {
            inputCustomChip.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomChip();
                }
            });
        }

        // Level Tiles Selection
        const levelGrid = $('.level-cards-grid');
        if (levelGrid) {
            levelGrid.addEventListener('click', (e) => {
                const tile = e.target.closest('.level-tile');
                if (!tile) return;
                $$('.level-tile').forEach(t => t.classList.remove('active'));
                tile.classList.add('active');
                selectedLevel = tile.dataset.level || 'builder';
            });
        }

        // Wizard Step Navigation
        const btnStep1Next = $('#btn-wizard-step1-next');
        if (btnStep1Next) {
            btnStep1Next.addEventListener('click', () => setWizardStep(2));
        }

        const btnStep2Prev = $('#btn-wizard-step2-prev');
        if (btnStep2Prev) {
            btnStep2Prev.addEventListener('click', () => setWizardStep(1));
        }
        const btnStep2Next = $('#btn-wizard-step2-next');
        if (btnStep2Next) {
            btnStep2Next.addEventListener('click', () => setWizardStep(3));
        }

        const btnStep3Prev = $('#btn-wizard-step3-prev');
        if (btnStep3Prev) {
            btnStep3Prev.addEventListener('click', () => setWizardStep(2));
        }

        // Wizard Submit Button (Final Step)
        const btnOnboardingSubmit = $('#btn-onboarding-submit');
        if (btnOnboardingSubmit) {
            btnOnboardingSubmit.addEventListener('click', async (e) => {
                e.preventDefault();
                const activeChips = Array.from($$('#onboarding-domains-chips .chip-row.active, #onboarding-domains-chips .chip.active')).map(c => c.textContent.trim().replace(/^✨\s*/, ''));
                const recentThought = ($('#onboarding-recent-input')?.value || '').trim();

                setGlobalLoading(true, 'loading.onboarding');
                try {
                    const res = await api('POST', '/api/onboarding', {
                        interests: activeChips.length > 0 ? activeChips : ['Matematyka', 'Computer Science'],
                        level: selectedLevel,
                        recent_thought: recentThought,
                        language: langCode
                    });

                    state.coldStartCards = res.cards || [];
                    state.profile = res.profile || {};
                    renderColdStartCards();
                    showView('COLD_START');
                } catch (err) {
                    showToast(err.message || t('errors.server_down'));
                } finally {
                    setGlobalLoading(false);
                }
            });
        }

        // Navigation
        $('#nav-brand').addEventListener('click', (e) => {
            e.preventDefault();
            showView(state.coldStartActive ? (state.profile.onboarded ? 'COLD_START' : 'ONBOARDING') : 'DASHBOARD');
        });
        $('#btn-nav-sparks').addEventListener('click', () => {
            loadSparksList();
            $('#spark-modal-backdrop').hidden = false;
        });
        $('#btn-nav-constellation').addEventListener('click', () => {
            showView('CONSTELLATION');
            renderConstellation();
        });
        $('#btn-nav-history').addEventListener('click', () => {
            showView('HISTORY');
            loadHistoryArchive();
        });
        $('#btn-nav-settings').addEventListener('click', () => {
            showView('SETTINGS');
            const info = $('#settings-ai-info');
            if (info) {
                info.innerHTML = state.ai.configured
                    ? `<span style="color: var(--success);">${t('settings.ai_configured')} (${state.ai.provider} - ${state.ai.model})</span>`
                    : `<span style="color: var(--error);">${t('settings.ai_not_configured')}</span>`;
            }
        });

        $('#btn-constellation-back').addEventListener('click', () => showView('DASHBOARD'));
        $('#btn-history-back').addEventListener('click', () => showView('DASHBOARD'));
        $('#btn-settings-back').addEventListener('click', () => showView('DASHBOARD'));

        // Compass Cards Vector Clicks
        $$('.compass-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const vector = btn.dataset.vector;
                triggerSuggestion(vector);
            });
        });

        // Custom Vector Input
        $('#btn-custom-vector-submit').addEventListener('click', () => {
            const val = $('#input-custom-vector').value.trim();
            if (val) triggerSuggestion('user_spark', val);
        });
        $('#input-custom-vector').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = e.target.value.trim();
                if (val) triggerSuggestion('user_spark', val);
            }
        });

        // Cold Start Custom Input & Reroll
        const btnColdStartReroll = $('#btn-cold-start-reroll');
        if (btnColdStartReroll) {
            btnColdStartReroll.addEventListener('click', async () => {
                const rejected = (state.coldStartCards || []).map(c => c.title);
                btnColdStartReroll.classList.add('loading');
                setGlobalLoading(true, 'loading.generating');
                try {
                    const res = await api('POST', '/api/cold-start/regenerate', {
                        rejected_topics: rejected,
                        language: langCode
                    });
                    state.coldStartCards = res.cards || [];
                    renderColdStartCards();
                } catch (err) {
                    showToast(err.message || t('errors.server_down'));
                } finally {
                    btnColdStartReroll.classList.remove('loading');
                    setGlobalLoading(false);
                }
            });
        }

        $('#btn-cold-start-custom-submit').addEventListener('click', () => {
            const val = $('#input-cold-start-custom').value.trim();
            if (val) triggerSuggestion('user_spark', val);
        });

        // Focus Card Actions
        $('#btn-concept-accept').addEventListener('click', async () => {
            if (!state.concept) return;
            try {
                const res = await api('POST', `/api/topics/${state.concept.id}/accept`);
                state.concept = res.concept;
                state.prompt = res.prompt;
                renderFocusCard('active');
            } catch (err) {
                showToast(err.message);
            }
        });

        $('#btn-concept-skip').addEventListener('click', async () => {
            if (!state.concept) return;
            await api('POST', `/api/topics/${state.concept.id}/skip`).catch(() => {});
            state.concept = null;
            state.prompt = null;
            renderFocusCard(null);
        });

        $('#btn-copy-prompt').addEventListener('click', async () => {
            const text = $('#prompt-box-text').textContent;
            try {
                await navigator.clipboard.writeText(text);
                showToast(t('focus_card.prompt_copied'));
            } catch (err) {
                showToast(t('errors.copy_failed'));
            }
        });

        // Complete Session Modal Trigger
        $('#btn-concept-finish').addEventListener('click', () => {
            if (!state.concept) return;
            const subtitle = $('#complete-modal-subtitle');
            if (subtitle) {
                subtitle.textContent = t('complete_modal.subtitle', { topic: state.concept.title });
            }
            $('#complete-modal-backdrop').hidden = false;
        });

        $('#btn-close-complete-modal').addEventListener('click', () => {
            $('#complete-modal-backdrop').hidden = true;
        });
        $('#btn-cancel-complete').addEventListener('click', () => {
            $('#complete-modal-backdrop').hidden = true;
        });

        $('#complete-session-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const coexplored = $('#input-coexplored').value.trim();
            const notes = $('#input-notes').value.trim();
            const btn = $('#btn-confirm-complete');

            btn.classList.add('loading');
            setGlobalLoading(true, 'complete_modal.save_btn');
            try {
                await api('POST', `/api/topics/${state.concept.id}/complete`, {
                    co_explored_text: coexplored,
                    notes: notes
                });
                $('#complete-modal-backdrop').hidden = true;
                $('#input-coexplored').value = '';
                $('#input-notes').value = '';
                state.concept = null;
                state.prompt = null;
                state.coldStartActive = false;
                renderFocusCard(null);
                showToast(t('complete_modal.title'));
            } catch (err) {
                showToast(err.message);
            } finally {
                btn.classList.remove('loading');
                setGlobalLoading(false);
            }
        });

        // Spark Inbox Floating Button & Modal
        $('#btn-floating-spark').addEventListener('click', () => {
            loadSparksList();
            $('#spark-modal-backdrop').hidden = false;
            $('#input-spark-text').focus();
        });
        $('#btn-close-spark-modal').addEventListener('click', () => {
            $('#spark-modal-backdrop').hidden = true;
        });

        $('#btn-submit-spark').addEventListener('click', submitSpark);
        $('#input-spark-text').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitSpark();
        });

        // Keyboard Shortcut: Space on Dashboard (when not in an input) opens Spark Inbox
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                loadSparksList();
                $('#spark-modal-backdrop').hidden = false;
                setTimeout(() => $('#input-spark-text').focus(), 50);
            }
            if (e.key === 'Escape') {
                $('#spark-modal-backdrop').hidden = true;
                $('#complete-modal-backdrop').hidden = true;
            }
        });

        // Settings Themes
        $('#btn-theme-dark').addEventListener('click', () => applyTheme('dark'));
        $('#btn-theme-light').addEventListener('click', () => applyTheme('light'));
    }

    async function submitSpark() {
        const input = $('#input-spark-text');
        const text = input.value.trim();
        if (!text) return;

        try {
            await api('POST', '/api/sparks', {
                text: text,
                parent_concept_id: state.concept ? state.concept.id : null
            });
            input.value = '';
            showToast(t('spark_box.title'));
            loadSparksList();
        } catch (err) {
            showToast(err.message);
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        const p = document.createElement('p');
        p.textContent = str;
        return p.innerHTML;
    }

    // Start App
    init();
})();

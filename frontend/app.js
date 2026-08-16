/**
 * CuriosityEngine — Zen Knowledge Interface Application
 * Fully associative, vector-backed knowledge interface with SaaS Landing Page,
 * Dynamic Starter Sparks, Slide Wizard Onboarding, and Focus Hub.
 * Adheres strictly to i18n — zero hardcoded UI strings.
 */

(function () {
    'use strict';

    // ─── Default Bundled Polish Dictionary (Zero-Latency Fallback) ───
    const DEFAULT_LANG_PL = {
        "meta": { "code": "pl", "name": "Polish", "native_name": "Polski" },
        "nav": {
            "brand": "CuriosityEngine",
            "compass": "Kompas",
            "constellation": "Konstelacja",
            "sparks": "Schowek ({n})",
            "history": "Historia",
            "settings": "Ustawienia",
            "logout": "Wyloguj",
            "login_btn": "Zaloguj się",
            "register_btn": "Zarejestruj się",
            "user_dashboard": "Panel wiedzy",
            "user_settings": "Ustawienia",
            "user_logout": "Wyloguj się"
        },
        "landing": {
            "badge": "Nowy Wymiar Ciekawości & Nauki",
            "title_static": "Ucz się przez",
            "dynamic_phrases": [
                "modele mentalne.",
                "proste analogie.",
                "pierwsze zasady.",
                "zrozumienie od zera.",
                "połączenia idei."
            ],
            "subtitle": "CuriosityEngine zdejmuje z Ciebie ciężar wyboru i pisania promptów. Łączy pojęcia w asocjacyjną sieć wiedzy, dostarczając zwięzłe modele mentalne i precyzyjne prompty do natychmiastowej eksploracji.",
            "cta_start": "Rozpocznij Eksplorację ➔",
            "cta_login": "Zaloguj się",
            "cta_how": "Zobacz jak to działa ↓",
            "features_badge": "Architektura Poznawcza",
            "features_title": "Cztery Wektory Twojego Umysłu",
            "features_subtitle": "Tradycyjne kursy i liniowe checklisty zawodzą. CuriosityEngine prowadzi Cię przez naturalne zazębianie się wiedzy:",
            "f1_title": "Most Asocjacyjny",
            "f1_tag": "Zazębianie Pojęć",
            "f1_desc": "Odkrywaj idee krzyżujące się z tym, co już wiesz. Koniec ze sztucznym podziałem na sztywne rozdziały.",
            "f2_title": "Nurkowanie Top-Down",
            "f2_tag": "Pierwsze Zasady",
            "f2_desc": "Schodź od ogólnego zjawiska do elementarnych mechanizmów działających pod maską świata technologii i nauki.",
            "f3_title": "Tryb Mental Fog",
            "f3_tag": "Czysta Intuicja",
            "f3_desc": "Gdy jesteś zmęczony i przytłoczony: proste, genialne analogie fizyczne dające natychmiastowe poczucie zrozumienia.",
            "f4_title": "Schowek Myśli",
            "f4_tag": "Schowek na Iskry",
            "f4_desc": "Zapisuj przelotne myśli i skojarzenia, by ich nie zapomnieć. Silnik połączy je w grafie i przypomni o nich we właściwym momencie."
        },
        "greeting": {
            "late_night": "Nocne przemyślenia.",
            "morning": "Dzień dobry.",
            "afternoon": "Dzień dobry.",
            "evening": "Dobry wieczór.",
            "night_owl": "Tryb nocnej sowy."
        },
        "auth": {
            "title": "CuriosityEngine",
            "subtitle": "Osobisty silnik asocjacyjny i mapa ciekawości.",
            "username": "Nazwa użytkownika",
            "password": "Hasło",
            "submit": "Wejdź do systemu",
            "close_modal": "Zamknij",
            "login_title": "Zaloguj się",
            "login_subtitle": "Wróć do swojej osobistej konstelacji wiedzy.",
            "login_submit": "Zaloguj się",
            "switch_to_register": "Nie masz jeszcze konta? Zarejestruj się",
            "register_title": "Utwórz konto",
            "register_subtitle": "Rozpocznij swoją asocjacyjną podróż z CuriosityEngine.",
            "register_submit": "Zarejestruj się",
            "switch_to_login": "Masz już konto? Zaloguj się",
            "first_setup_title": "Witaj w CuriosityEngine!",
            "first_setup_subtitle": "Baza danych jest pusta. Utwórz pierwsze konto, aby rozpocząć korzystanie.",
            "first_setup_submit": "Utwórz konto i rozpocznij"
        },
        "onboarding": {
            "badge": "Personalizacja",
            "step1_title": "Co Cię najbardziej pociąga?",
            "step1_subtitle": "Wybierz dziedziny lub dodaj własne pasje. Silnik użyje ich do asocjacji:",
            "custom_chip_placeholder": "Wpisz własną pasję (np. teoria gier, kryptografia)...",
            "add_chip_btn": "+ Dodaj",
            "domains": {
                "math": "📐 Matematyka",
                "cs": "💻 Informatyka & Programowanie",
                "physics": "🌌 Fizyka & Kosmologia",
                "biology": "🧬 Biologia & Neuronauka",
                "hardware": "⚡ Elektronika & Sprzęt",
                "gamedev": "🎮 Tworzenie Gier & Grafika 3D",
                "ai": "🧠 Sztuczna Inteligencja",
                "philosophy": "🏛️ Filozofia & Teoria Poznania",
                "economics": "📈 Ekonomia & Teoria Gier",
                "linguistics": "🗣️ Językoznawstwo & Komunikacja"
            },
            "step1_required_error": "Wybierz przynajmniej jedną dziedzinę",
            "step2_title": "Twój punkt wyjścia",
            "step2_subtitle": "Wybierz preferowany styl modeli mentalnych i głębię tłumaczeń:",
            "level_ground_zero_title": "Od Zera / Intuicja",
            "level_ground_zero_tag": "KROK PO KROKU",
            "level_ground_zero_desc": "Zero zbędnego żargonu. Obrazowe analogie z życia codziennego i proste, namacalne modele mentalne.",
            "level_builder_title": "Builder / Systemy",
            "level_builder_tag": "ŁĄCZENIE KROPEK",
            "level_builder_desc": "Znam podstawy techniczne. Chcę rozumieć dlaczego rzeczy działają i łączyć odległe idee w całość.",
            "level_deep_title": "Pod Maską / Ekspert",
            "level_deep_tag": "PIERWSZE ZASADY",
            "level_deep_desc": "Ścisłość techniczna, dekonstrukcja mechanizmów do elementarnych części i analiza nietrywialnych zależności.",
            "step3_title": "O czym ostatnio myślałeś?",
            "step3_subtitle": "Wpisz dowolne pytanie lub myśl z ostatnich dni (lub zostaw puste):",
            "recent_placeholder": "np. jak działają GPU, dlaczego kompresja wideo gubi jakość, jak silnik szachowy ocenia pozycję...",
            "step3_hint": "💡 Możesz zostawić to pole puste - silnik zaproponuje tematy na podstawie Twoich zainteresowań z kroku 1.",
            "btn_next": "Dalej ➔",
            "btn_prev": "← Wstecz",
            "btn_submit": "Wygeneruj moje tematy startowe ✨"
        },
        "cold_start": {
            "badge": "Zimny Start",
            "title": "Wybierz Swój Pierwszy Temat",
            "subtitle": "Oto 4 tematy wygenerowane specjalnie pod Twoje zainteresowania. Wybierz jeden, by zacząć:",
            "reroll_btn": "Zaproponuj inne 4 tematy",
            "custom_thought_btn": "Własna myśl? Pomysł? Pytanie?",
            "custom_view_title": "Wpisz swoją myśl lub pytanie:",
            "custom_view_subtitle": "Silnik wygeneruje 4 bezpośrednie odnogi do Twojego pomysłu.",
            "custom_view_back": "← Wróć do propozycji",
            "custom_placeholder": "Wpisz dowolne pytanie lub myśl...",
            "custom_submit": "Zbadaj ➔"
        },
        "loading": {
            "generating": "CuriosityEngine syntezuje propozycję...",
            "connecting": "Łączenie mostów asocjacyjnych...",
            "onboarding": "Generowanie Twoich 4 unikalnych tematów startowych..."
        },
        "compass": {
            "title": "Kompas Eksploracji",
            "subtitle": "Wybierz wektor na dzisiejszą sesję:",
            "adjacent": "Most Asocjacyjny",
            "adjacent_desc": "Pojęcie zazębiające się z Twoją ostatnią wiedzą",
            "deep_dive": "Nurkowanie Top-Down",
            "deep_dive_desc": "Zasady działania pod maską",
            "spark": "Zbadaj ze Schowka",
            "spark_desc": "Sięgnij po zapisaną myśl ze Schowka",
            "cross_domain": "Inna Galaktyka",
            "cross_domain_desc": "Skok w zupełnie nową dziedzinę",
            "mental_fog": "Tryb Mental Fog",
            "mental_fog_desc": "Proste, fascynujące pojęcie (zero presji)",
            "custom_spark": "Własny Impuls",
            "custom_spark_desc": "Wpisz dowolne pytanie lub hasło",
            "input_placeholder": "Co Cię intryguje?",
            "input_submit": "Generuj temat"
        },
        "focus_card": {
            "proposal_badge": "Dzisiejsza Propozycja",
            "focus_badge": "Aktywna Sesja",
            "why_label": "Most Logiczny",
            "model_label": "Wprowadzenie",
            "accept_btn": "Zbadaj ten temat",
            "skip_btn": "Inna propozycja",
            "reroll_batch_btn": "Nowy zestaw 4 tematów",
            "save_to_sparks_btn": "Zapisz do Schowka",
            "saved_to_sparks_toast": "✓ Zapisano do Schowka!",
            "reject_btn": "Pomiń ten temat",
            "prompt_box_label": "Gotowy Prompt do Twojego LLM",
            "copy_prompt_tooltip": "Kopiuj prompt do schowka",
            "prompt_copied": "✓ Skopiowano prompt do schowka!",
            "finish_btn": "Oznacz jako opanowane",
            "add_spark_btn": "Zapisz Iskrę",
            "abandon_btn": "Porzuć temat",
            "abandon_toast": "Temat został porzucony.",
            "back_to_discovery_btn": "Wróć do wyboru tematu",
            "loading": "Generowanie propozycji..."
        },
        "complete_modal": {
            "title": "Domknięcie Sesji",
            "subtitle": "Pojęcie {topic} zostaje zapisane w Twoim grafie wiedzy.",
            "co_explored_label": "Czy w trakcie zgłębiłeś coś jeszcze pobocznego?",
            "co_explored_placeholder": "np. czytając o macierzach ogarnąłem też wektory i przekształcenia afiniczne...",
            "co_explored_hint": "AI automatycznie wyciągnie te pojęcia i połączy je w grafie mostami asocjacyjnymi.",
            "notes_label": "Krótka notatka dla siebie (opcjonalnie):",
            "notes_placeholder": "Główny wniosek...",
            "save_btn": "Zapisz do Grafu Wiedzy",
            "cancel_btn": "Anuluj"
        },
        "spark_box": {
            "title": "Schowek Myśli (Spark Inbox)",
            "subtitle": "Zapisuj nagłe myśli, które mignęły Ci w trakcie eksploracji — silnik zachowa je na później.",
            "input_placeholder": "Wpisz myśl lub skojarzenie i wciśnij Enter...",
            "add_btn": "Zapisz Iskrę",
            "empty": "Schowek jest pusty. Wciskaj Spację w dowolnym momencie, by zachować nagłą myśl.",
            "explore_btn": "Zbadaj teraz",
            "dismiss_btn": "Usuń",
            "quick_tip": "Skrót klawiszowy: wciśnij Spację na pulpicie, aby szybko otworzyć Schowek."
        },
        "constellation": {
            "title": "Konstelacja Wiedzy",
            "subtitle": "Interaktywny graf Twoich opanowanych pojęć i mostów asocjacyjnych.",
            "nodes_count": "{n} opanowanych pojęć",
            "empty": "Twój ogród wiedzy czeka na pierwsze pojęcie. Rozpocznij od Kompasu!",
            "back_btn": "← Wróć do Kompasu"
        },
        "history": {
            "title": "Archiwum Poznanych Pojęć",
            "back_btn": "← Wróć",
            "empty": "Brak historii. Twoja podróż zaczyna się od pierwszego tematu."
        },
        "settings": {
            "title": "Ustawienia i Profil",
            "back_btn": "← Wróć",
            "ai_heading": "Status AI & Modele",
            "ai_configured": "Połączono & Aktywne ✓",
            "ai_not_configured": "Brak klucza API ✗",
            "ai_provider_label": "Dostawca AI",
            "ai_primary_model_label": "Model syntezy (główny)",
            "ai_fallback_model_label": "Model rezerwowy (fallback)",
            "ai_embedding_model_label": "Model embeddingów",
            "language_heading": "Język Interfejsu",
            "language_hint": "Wybierz język aplikacji.",
            "address_heading": "Forma Zwrotu AI",
            "address_hint": "Określ jak sztuczna inteligencja ma formułować teksty i zwroty.",
            "profile_heading": "Styl Poznawczy & Poziom",
            "profile_level_label": "Głębia tłumaczeń (punkt wyjścia)",
            "account_heading": "Konto & Bezpieczeństwo",
            "account_logged_as": "Zalogowano jako",
            "account_logout_btn": "Wyloguj się",
            "privacy_heading": "Prywatność & Baza Lokalna",
            "privacy_badge": "100% Lokalne & Bezpieczne",
            "privacy_text": "Wszystkie Twoje dane, embeddingi, dygresje oraz historia eksploracji są przechowywane w lokalnej bazie SQLite. Twój klucz API nigdy nie opuszcza Twojego serwera."
        },
        "errors": {
            "server_down": "Błąd połączenia z serwerem. Upewnij się, że backend działa.",
            "copy_failed": "Nie udało się skopiować promptu."
        },
        "dates": {
            "today": "dzisiaj",
            "yesterday": "wczoraj",
            "days_ago": "{n} dni temu",
            "locale": "pl-PL"
        }
    };

    // ─── Unified State ───
    let state = {
        view: 'LANDING',
        username: null,
        concept: null,
        prompt: null,
        sparksCount: 0,
        masteredCount: 0,
        ai: { configured: false },
        profile: {},
        coldStartActive: false,
        coldStartCards: [],
        batchProposals: null,
        activeVector: 'adjacent'
    };

    // ─── Wizard & Auth State ───
    let wizardCurrentStep = 0;
    let selectedGender = 'male';
    let selectedLevel = 'builder';
    let authMode = 'LOGIN'; // 'LOGIN' | 'REGISTER' | 'FIRST_SETUP'

    // ─── i18n Engine ───
    let lang = JSON.parse(JSON.stringify(DEFAULT_LANG_PL));
    let langCode = 'pl';
    let languages = [];

    function t(key, vars) {
        if (!key) return '';
        const parts = key.split('.');
        let val = lang;
        for (const p of parts) {
            if (val && typeof val === 'object') val = val[p];
            else { val = null; break; }
        }
        if (typeof val !== 'string') {
            // Fallback to bundled dictionary
            let fb = DEFAULT_LANG_PL;
            for (const p of parts) {
                if (fb && typeof fb === 'object') fb = fb[p];
                else { fb = null; break; }
            }
            if (typeof fb === 'string') val = fb;
            else return key;
        }
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
        updateAuthModalUI();
        restartHeroTypewriter();
    }

    async function loadLanguage(code) {
        try {
            const cacheBust = `?v=${Date.now()}`;
            let res = await fetch(`/i18n/${code}/ui.json${cacheBust}`).catch(() => null);
            if (!res || !res.ok) {
                res = await fetch(`i18n/${code}/ui.json${cacheBust}`).catch(() => null);
            }
            if (res && res.ok) {
                lang = await res.json();
                langCode = code;
            }
        } catch (err) {
            console.warn(`Failed to load language ${code}, using fallback`, err);
        }
        applyTranslations();
    }

    async function loadLanguageList() {
        try {
            const data = await api('GET', '/api/languages');
            languages = data.languages || [];
        } catch (err) {
            languages = [{ code: 'pl', name: 'Polish', native_name: 'Polski' }, { code: 'en', name: 'English', native_name: 'English' }];
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
        populateSettingsView();
        if (state.coldStartActive && state.profile && state.profile.onboarded) {
            await loadColdStartCards();
        }
    }

    function populateSettingsView() {
        const info = $('#settings-ai-info');
        const selectLang = $('#select-settings-language');
        const selectAddress = $('#select-settings-address');
        const selectLevel = $('#select-settings-level');

        if (info) {
            if (state.ai && state.ai.configured) {
                const providerName = state.ai.provider === 'gemini' ? 'Google Gemini' : (state.ai.provider || 'Google Gemini');
                info.innerHTML = `
                    <div>Status: <span class="status-ok">● ${t('settings.ai_configured')} (${providerName})</span></div>
                    <div>Model syntezy: <code>${state.ai.model || 'gemini-3.7-flash'}</code></div>
                    <div>Model fallback: <code>gemini-3.5-flash-lite</code></div>
                    <div>Model embedding: <code>gemini-embedding-001</code></div>
                `;
            } else {
                info.innerHTML = `<div>Status: <span class="status-err">● ${t('settings.ai_not_configured')}</span></div>`;
            }
        }

        if (selectLang) {
            selectLang.value = localStorage.getItem('curiosity_lang') || (state.profile && state.profile.language) || 'pl';
        }

        if (selectAddress && state.profile) {
            selectAddress.value = state.profile.form_of_address || 'neutral';
        }

        if (selectLevel && state.profile) {
            selectLevel.value = state.profile.grounding_level || 'builder';
        }
    }

    // ─── Theme Management (Dark Zen Default) ───
    const root = document.documentElement;
    root.setAttribute('data-theme', 'dark');

    // ─── DOM References ───
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    function getViews() {
        return {
            LANDING: $('#view-landing'),
            ONBOARDING: $('#view-onboarding'),
            COLD_START: $('#view-cold-start'),
            DASHBOARD: $('#view-dashboard'),
            CONSTELLATION: $('#view-constellation'),
            HISTORY: $('#view-history'),
            SETTINGS: $('#view-settings'),
        };
    }

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
            localStorage.removeItem('curiosity_username');
            showView('LANDING');
            updateTopbarAuthState();
            throw new Error('Unauthorized');
        }
        if (!res.ok) {
            throw new Error(data.error || `Request failed (${res.status})`);
        }
        return data;
    }

    // ─── Topbar User Profile & Auth State ───
    function updateTopbarAuthState(username = null) {
        const token = localStorage.getItem('curiosity_token');
        const authLinks = $('#topbar-auth-links');
        const userProfile = $('#topbar-user-profile');
        const avatarInitial = $('#user-avatar-initial');
        const dropdownName = $('#user-dropdown-name');
        const langSelect = $('#topbar-lang-select');

        const resolvedUser = username || localStorage.getItem('curiosity_username') || state.username || 'User';

        if (token) {
            if (authLinks) authLinks.hidden = true;
            if (userProfile) userProfile.hidden = false;
            if (avatarInitial) avatarInitial.textContent = resolvedUser.charAt(0).toUpperCase();
            if (dropdownName) dropdownName.textContent = resolvedUser;
            // ALWAYS hide topbar language select when logged in (even on Landing page)
            if (langSelect) langSelect.hidden = true;
        } else {
            if (authLinks) authLinks.hidden = false;
            if (userProfile) userProfile.hidden = true;
            if (langSelect) langSelect.hidden = (state.view !== 'LANDING');
        }
    }

    // ─── View Routing ───
    function showView(viewName) {
        state.view = viewName;
        const currentViews = getViews();
        Object.entries(currentViews).forEach(([name, el]) => {
            if (!el) return;
            el.hidden = (name !== viewName);
        });

        const navLinks = $('#topbar-nav-links');
        const floatingBtn = $('#btn-floating-spark');
        const globalProgress = $('#onboarding-global-progress');
        const langSelect = $('#topbar-lang-select');
        const token = localStorage.getItem('curiosity_token');

        // Close user dropdown if open
        const userMenu = $('#user-dropdown-menu');
        if (userMenu) userMenu.hidden = true;

        // Reset any custom onboarding accent hue when navigating to other views
        if (viewName !== 'ONBOARDING') {
            document.documentElement.style.removeProperty('--hue-primary');
        }

        if (viewName === 'LANDING') {
            if (navLinks) navLinks.hidden = true;
            if (floatingBtn) floatingBtn.hidden = true;
            if (globalProgress) globalProgress.hidden = true;
            if (langSelect) langSelect.hidden = Boolean(token);
            restartHeroTypewriter();
        } else if (viewName === 'ONBOARDING') {
            if (navLinks) navLinks.hidden = true;
            if (floatingBtn) floatingBtn.hidden = true;
            if (globalProgress) globalProgress.hidden = false;
            if (langSelect) langSelect.hidden = true;
            setWizardStep(0);
        } else if (viewName === 'COLD_START') {
            if (navLinks) navLinks.hidden = true;
            if (floatingBtn) floatingBtn.hidden = true;
            if (globalProgress) globalProgress.hidden = true;
            if (langSelect) langSelect.hidden = true;
        } else {
            if (navLinks) navLinks.hidden = false;
            if (floatingBtn) floatingBtn.hidden = false;
            if (globalProgress) globalProgress.hidden = true;
            if (langSelect) langSelect.hidden = true;
        }

        updateTopbarAuthState();
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

    // ─── Landing Page Dynamic Typewriter ───
    let typewriterTimeout = null;
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function restartHeroTypewriter() {
        if (typewriterTimeout) clearTimeout(typewriterTimeout);
        charIndex = 0;
        isDeleting = false;
        phraseIndex = 0;
        typeHeroText();
    }

    function typeHeroText() {
        const textEl = $('#hero-dynamic-text');
        if (!textEl) return;

        const phrases = (lang.landing && lang.landing.dynamic_phrases) || [
            "modele mentalne.",
            "proste analogie.",
            "pierwsze zasady.",
            "zrozumienie od zera.",
            "połączenia idei."
        ];

        const currentPhrase = phrases[phraseIndex % phrases.length];

        if (isDeleting) {
            charIndex--;
            textEl.textContent = currentPhrase.substring(0, charIndex);
        } else {
            charIndex++;
            textEl.textContent = currentPhrase.substring(0, charIndex);
        }

        let typeSpeed = isDeleting ? 35 : 75;

        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex++;
            typeSpeed = 350;
        }

        typewriterTimeout = setTimeout(typeHeroText, typeSpeed);
    }

    // ─── Auth Modal Controller (3 States) ───
    async function openAuthModal(preferredMode = 'LOGIN') {
        const modalBackdrop = $('#auth-modal-backdrop');
        const err = $('#auth-error');
        if (err) err.style.display = 'none';

        try {
            const status = await api('GET', '/api/auth/status').catch(() => ({ has_users: false, user_count: 0 }));
            if (!status.has_users || status.user_count === 0) {
                authMode = 'FIRST_SETUP';
            } else {
                authMode = preferredMode === 'REGISTER' ? 'REGISTER' : 'LOGIN';
            }
        } catch (e) {
            authMode = preferredMode;
        }

        updateAuthModalUI();
        if (modalBackdrop) modalBackdrop.hidden = false;
        const input = $('#auth-username');
        if (input) setTimeout(() => input.focus(), 60);
    }

    function closeAuthModal() {
        const modalBackdrop = $('#auth-modal-backdrop');
        if (modalBackdrop) modalBackdrop.hidden = true;
        const err = $('#auth-error');
        if (err) err.style.display = 'none';
    }

    function updateAuthModalUI() {
        const titleEl = $('#auth-card-title');
        const subtitleEl = $('#auth-card-subtitle');
        const submitTextEl = $('#auth-submit-text');
        const switchBtn = $('#btn-auth-switch');

        if (!titleEl || !subtitleEl || !submitTextEl || !switchBtn) return;

        if (authMode === 'FIRST_SETUP') {
            titleEl.textContent = t('auth.first_setup_title');
            subtitleEl.textContent = t('auth.first_setup_subtitle');
            submitTextEl.textContent = t('auth.first_setup_submit');
            switchBtn.style.display = 'none';
        } else if (authMode === 'REGISTER') {
            titleEl.textContent = t('auth.register_title');
            subtitleEl.textContent = t('auth.register_subtitle');
            submitTextEl.textContent = t('auth.register_submit');
            switchBtn.textContent = t('auth.switch_to_login');
            switchBtn.style.display = 'inline-block';
        } else {
            // LOGIN
            titleEl.textContent = t('auth.login_title');
            subtitleEl.textContent = t('auth.login_subtitle');
            submitTextEl.textContent = t('auth.login_submit');
            switchBtn.textContent = t('auth.switch_to_register');
            switchBtn.style.display = 'inline-block';
        }
    }

    // ─── Onboarding Slide Wizard Controller ───
    function setWizardStep(step) {
        wizardCurrentStep = step;
        const slide0 = $('#wizard-slide-0');
        const slide1 = $('#wizard-slide-1');
        const slide2 = $('#wizard-slide-2');
        const slide3 = $('#wizard-slide-3');

        if (slide0) slide0.hidden = (step !== 0);
        if (slide1) slide1.hidden = (step !== 1);
        if (slide2) slide2.hidden = (step !== 2);
        if (slide3) slide3.hidden = (step !== 3);

        updateWizardProgress();
    }

    function updateWizardProgress() {
        const progressFill = $('#wizard-progress-fill');
        if (progressFill) {
            progressFill.style.width = `${(wizardCurrentStep / 3) * 100}%`;
        }
    }

    // ─── Cold Start & Dynamic Starter Cards ───
    async function loadColdStartCards() {
        try {
            const data = await api('GET', `/api/cold-start-cards?lang=${langCode}&v=${Date.now()}`);
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
                <span class="spark-card__tag">${escapeHtml(card.tag || 'General')}</span>
                <h3 class="spark-card__title">${escapeHtml(card.title)}</h3>
                <p class="spark-card__desc">${escapeHtml(card.spark)}</p>
            `;
            cardEl.addEventListener('click', () => {
                triggerStarterSelection(card.title, card.tag, card.spark);
            });
            container.appendChild(cardEl);
        });
    }

    async function triggerStarterSelection(title, domain, summary) {
        setGlobalLoading(true, 'loading.generating');
        try {
            const res = await api('POST', '/api/topics/select-starter', {
                title: title,
                domain: domain || 'General',
                summary: summary || ''
            });

            state.concept = res.concept;
            state.prompt = res.prompt;
            state.coldStartActive = false;
            renderDashboard('focus');
            showView('DASHBOARD');
        } catch (err) {
            showToast(err.message || t('errors.server_down'));
        } finally {
            setGlobalLoading(false);
        }
    }

    // ─── Batch 4-Vector Topic Suggestions ───
    async function loadBatchSuggestions(forceReroll = false) {
        if (state.concept && state.concept.status === 'active') {
            renderDashboard('focus');
            showView('DASHBOARD');
            return;
        }
        const rerollBtn = $('#btn-dashboard-reroll-batch');
        const heroEl = $('.discovery-split-hero');
        if (rerollBtn) rerollBtn.classList.add('loading');
        if (heroEl) heroEl.classList.add('is-loading');

        try {
            const data = await api('POST', '/api/topics/batch-suggest');
            state.batchProposals = data.proposals || {};
            state.concept = state.batchProposals[state.activeVector] || Object.values(state.batchProposals)[0] || null;
            state.coldStartActive = false;
            renderDashboard('discovery');
            showView('DASHBOARD');
        } catch (err) {
            showToast(err.message || t('errors.server_down'));
        } finally {
            if (rerollBtn) rerollBtn.classList.remove('loading');
            if (heroEl) heroEl.classList.remove('is-loading');
        }
    }

    // ─── Sequential Non-Linear Typewriter with Organic Pauses & Caret ───
    let currentTypewriterToken = 0;

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function streamTextNonLinear(element, text, token, caretClass = 'typewriter-caret') {
        if (!element) return;
        element.innerHTML = '';
        const caret = document.createElement('span');
        caret.className = caretClass;
        element.appendChild(caret);

        if (!text) {
            caret.remove();
            return;
        }

        for (let i = 0; i < text.length; i++) {
            if (token !== currentTypewriterToken) return;

            const char = text[i];
            caret.insertAdjacentText('beforebegin', char);

            // Ultra-snappy, organic non-linear typing
            let delay = 1 + Math.floor(Math.random() * 4); // Base: 1-5ms

            if (char === '.' || char === '!' || char === '?') {
                delay = 35 + Math.floor(Math.random() * 20); // 35-55ms at sentence end
            } else if (char === ',' || char === ';' || char === ':') {
                delay = 16 + Math.floor(Math.random() * 14); // 16-30ms at comma
            } else if (char === ' ') {
                delay = 3 + Math.floor(Math.random() * 3);
            }

            await sleep(delay);
        }

        if (token === currentTypewriterToken) {
            await sleep(20);
            caret.remove();
        }
    }

    async function runDiscoveryIntuitionTypewriter(modelEl, modelText) {
        const token = ++currentTypewriterToken;
        if (modelEl) modelEl.innerHTML = '';

        if (modelEl && modelText) {
            await streamTextNonLinear(modelEl, modelText, token);
        }
    }

    // ─── FLIP Smooth Motion Helper (Zero-Jump Fluid Layout Shifts) ───
    function smoothFlipAnimate(elementsToTrack, updateDomFn) {
        const snapshots = elementsToTrack.map(el => {
            if (!el) return null;
            return { el, rect: el.getBoundingClientRect() };
        }).filter(Boolean);

        updateDomFn();

        requestAnimationFrame(() => {
            snapshots.forEach(({ el, rect: firstRect }) => {
                const lastRect = el.getBoundingClientRect();
                const deltaX = firstRect.left - lastRect.left;
                const deltaY = firstRect.top - lastRect.top;

                if (Math.abs(deltaY) > 0.5 || Math.abs(deltaX) > 0.5) {
                    el.style.transition = 'none';
                    el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

                    requestAnimationFrame(() => {
                        el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                        el.style.transform = 'translate(0, 0)';
                        setTimeout(() => {
                            if (el.style.transform === 'translate(0px, 0px)' || el.style.transform === 'translate(0, 0)') {
                                el.style.transform = '';
                                el.style.transition = '';
                            }
                        }, 420);
                    });
                }
            });
        });
    }

    // ─── Dashboard 2-Stage Rendering (Discovery vs Focus) ───
    function renderDashboard(mode = 'discovery') {
        // Enforce focus mode if an active concept is currently in progress
        if (state.concept && state.concept.status === 'active') {
            mode = 'focus';
        }

        const stageDiscovery = $('#dashboard-stage-discovery');
        const stageFocus = $('#dashboard-stage-focus');

        const isFocus = (mode === 'focus');

        if (isFocus) {
            if (stageDiscovery) stageDiscovery.hidden = true;
            if (stageFocus) stageFocus.hidden = false;

            const fTitle = $('#focus-concept-title');
            const fDomain = $('#focus-concept-domain');
            const fPrompt = $('#prompt-card-content');
            const fModel = $('#focus-concept-model');
            const fReason = $('#focus-concept-reason');

            if (fTitle && state.concept) fTitle.textContent = state.concept.title;
            if (fDomain && state.concept) fDomain.textContent = state.concept.domain || 'General';
            if (fPrompt) fPrompt.textContent = state.prompt || '';
            if (fModel && state.concept) fModel.textContent = state.concept.intuitive_model || '';
            if (fReason && state.concept) fReason.textContent = state.concept.summary || '';
            document.body.setAttribute('data-vector-theme', state.concept?.source_mode || state.activeVector || 'adjacent');
        } else {
            if (stageDiscovery) stageDiscovery.hidden = false;
            if (stageFocus) stageFocus.hidden = true;

            // Resolve concept for active vector from batch proposals if available
            if (state.batchProposals && state.batchProposals[state.activeVector]) {
                state.concept = state.batchProposals[state.activeVector];
            }

            if (!state.concept) {
                loadBatchSuggestions();
                return;
            }

            document.body.setAttribute('data-vector-theme', state.activeVector);

            // Update active state on vector pills
            $$('#dashboard-vector-pills .vector-pill').forEach(pill => {
                pill.classList.toggle('active', pill.dataset.vector === state.activeVector);
            });

            const dTitle = $('#discovery-concept-title');
            const dDomain = $('#discovery-concept-domain');
            const dReason = $('#discovery-concept-reason');
            const dReasonBox = $('.discovery-reason-box');
            const dModel = $('#discovery-concept-model');

            // Track only external elements pushed by layout shift
            const trackElements = [
                $('.discovery-actions'),
                $('.vector-switcher-bar')
            ];

            smoothFlipAnimate(trackElements, () => {
                if (dDomain) dDomain.textContent = state.concept.domain || 'General';
                if (dTitle) dTitle.textContent = state.concept.title;
                if (dReason) dReason.textContent = state.concept.summary || '';

                // Trigger smooth 60fps fade-in-up emerging from below without blinking
                [dDomain, dTitle, dReasonBox].forEach(el => {
                    if (!el) return;
                    el.classList.remove('animate-fade-in-up');
                    void el.offsetWidth;
                    el.classList.add('animate-fade-in-up');
                });
            });

            // Stream Intuicja on the right with organic typewriter
            runDiscoveryIntuitionTypewriter(dModel, state.concept.intuitive_model || '');
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
        // Initial instantaneous translation from bundled dictionary
        applyTranslations();
        updateGreetingAndDates();
        bindGlobalEvents();
        initDevLiveReload();

        const token = localStorage.getItem('curiosity_token');
        const savedLang = localStorage.getItem('curiosity_lang') || 'pl';

        await loadLanguage(savedLang);
        await loadLanguageList();
        updateGreetingAndDates();

        if (!token) {
            showView('LANDING');
            updateTopbarAuthState();
            return;
        }

        try {
            const data = await api('GET', '/api/state');
            state.username = data.username || localStorage.getItem('curiosity_username') || 'User';
            if (data.username) localStorage.setItem('curiosity_username', data.username);
            state.batchProposals = data.batch_proposals || {};
            state.concept = data.concept;
            if (!state.concept && state.batchProposals && state.batchProposals[state.activeVector]) {
                state.concept = state.batchProposals[state.activeVector];
            } else if (!state.concept && state.batchProposals && Object.keys(state.batchProposals).length > 0) {
                state.concept = Object.values(state.batchProposals)[0];
            }
            state.prompt = data.prompt;
            state.sparksCount = data.sparks_count || 0;
            state.masteredCount = data.mastered_count || 0;
            state.ai = data.ai || {};
            state.profile = data.profile || {};
            state.coldStartActive = data.cold_start_active;

            updateTopbarAuthState(state.username);

            const sparksBadge = $('#nav-sparks-label');
            if (sparksBadge) {
                sparksBadge.textContent = t('nav.sparks', { n: state.sparksCount });
            }

            if (state.coldStartActive) {
                if (!state.profile || !state.profile.onboarded) {
                    setWizardStep(0);
                    showView('ONBOARDING');
                } else {
                    await loadColdStartCards();
                    showView('COLD_START');
                }
            } else {
                if (data.state === 'CONCEPT_ACTIVE') {
                    renderDashboard('focus');
                    showView('DASHBOARD');
                } else if (state.concept) {
                    renderDashboard('discovery');
                    showView('DASHBOARD');
                } else {
                    await loadBatchSuggestions();
                }
            }
        } catch (err) {
            if (err.message === 'Unauthorized') {
                showView('LANDING');
                return;
            }
            showView('LANDING');
        }
    }

    // ─── Event Bindings ───
    let eventsBound = false;
    function bindGlobalEvents() {
        if (eventsBound) return;
        eventsBound = true;

        // Topbar Auth Buttons & Landing CTA
        $('#btn-topbar-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal('LOGIN');
        });
        $('#btn-topbar-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal('REGISTER');
        });
        $('#btn-landing-cta')?.addEventListener('click', (e) => {
            e.preventDefault();
            const token = localStorage.getItem('curiosity_token');
            if (token || state.username) {
                if (state.coldStartActive) {
                    if (!state.profile || !state.profile.onboarded) {
                        setWizardStep(0);
                        showView('ONBOARDING');
                    } else {
                        showView('COLD_START');
                    }
                } else {
                    if (state.concept && state.concept.status === 'active') {
                        renderDashboard('focus');
                    } else {
                        renderDashboard('discovery');
                    }
                    showView('DASHBOARD');
                }
            } else {
                openAuthModal('REGISTER');
            }
        });
        $('#btn-landing-how')?.addEventListener('click', (e) => {
            e.preventDefault();
            const target = $('#landing-features');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        $('#btn-close-auth-modal')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeAuthModal();
        });

        $('#auth-modal-backdrop')?.addEventListener('click', (e) => {
            if (e.target === $('#auth-modal-backdrop')) closeAuthModal();
        });

        $('#btn-auth-switch')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (authMode === 'LOGIN') {
                authMode = 'REGISTER';
            } else {
                authMode = 'LOGIN';
            }
            updateAuthModalUI();
        });

        // User Avatar Dropdown Toggle & Actions
        const btnUserAvatar = $('#btn-user-avatar');
        const userDropdownMenu = $('#user-dropdown-menu');

        btnUserAvatar?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (userDropdownMenu) {
                userDropdownMenu.hidden = !userDropdownMenu.hidden;
            }
        });

        document.addEventListener('click', (e) => {
            if (userDropdownMenu && !userDropdownMenu.hidden) {
                if (!e.target.closest('#topbar-user-profile')) {
                    userDropdownMenu.hidden = true;
                }
            }
        });

        function handleLogout() {
            if (userDropdownMenu) userDropdownMenu.hidden = true;
            localStorage.removeItem('curiosity_token');
            localStorage.removeItem('curiosity_username');
            state.username = null;
            state.concept = null;
            state.prompt = null;
            showView('LANDING');
            updateTopbarAuthState();
            showToast(t('nav.user_logout'));
        }

        $('#btn-user-menu-dashboard')?.addEventListener('click', () => {
            if (userDropdownMenu) userDropdownMenu.hidden = true;
            showView(state.coldStartActive ? (state.profile.onboarded ? 'COLD_START' : 'ONBOARDING') : 'DASHBOARD');
        });

        $('#btn-user-menu-settings')?.addEventListener('click', () => {
            if (userDropdownMenu) userDropdownMenu.hidden = true;
            populateSettingsView();
            showView('SETTINGS');
        });

        $('#btn-user-menu-logout')?.addEventListener('click', handleLogout);
        $('#btn-settings-logout')?.addEventListener('click', handleLogout);

        // Auth Form Submission
        $('#auth-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = $('#auth-username').value.trim();
            const password = $('#auth-password').value.trim();
            const btn = $('#btn-login-submit');
            const err = $('#auth-error');

            btn.classList.add('loading');
            err.style.display = 'none';

            try {
                let data;
                if (authMode === 'LOGIN') {
                    data = await api('POST', '/api/auth/login', { username, password });
                } else {
                    // REGISTER or FIRST_SETUP
                    data = await api('POST', '/api/auth/register', { username, password });
                }

                localStorage.setItem('curiosity_token', data.token);
                if (data.username) {
                    localStorage.setItem('curiosity_username', data.username);
                    state.username = data.username;
                }
                await api('POST', '/api/profile', { language: langCode }).catch(() => {});
                closeAuthModal();
                init();
            } catch (error) {
                err.textContent = error.message;
                err.style.display = 'block';
            } finally {
                btn.classList.remove('loading');
            }
        });

        // Dynamic Domain Hue Mapping for Onboarding
        const ONBOARDING_DOMAIN_HUES = {
            cs: 230,          // Tech Indigo
            ai: 250,          // Electric Purple
            physics: 195,     // Cosmic Cyan
            biology: 145,     // Emerald Green
            hardware: 32,     // Amber Orange
            gamedev: 325,     // Neon Pink
            philosophy: 275,  // Royal Violet
            economics: 160,   // Mint Teal
            linguistics: 15   // Sunset Coral
        };

        // Dynamic Event Delegation for Chips List
        const chipsContainer = $('#onboarding-domains-chips');
        if (chipsContainer) {
            chipsContainer.addEventListener('click', (e) => {
                const chip = e.target.closest('.chip-row, .chip');
                if (chip) {
                    chip.classList.toggle('active');
                    const errBox = $('#onboarding-step1-error');
                    const activeChips = $$('#onboarding-domains-chips .chip-row.active');
                    if (errBox && activeChips.length > 0) {
                        errBox.style.display = 'none';
                    }

                    // Dynamically adapt onboarding accent color to selected category
                    if (activeChips.length > 0) {
                        const lastActive = activeChips[activeChips.length - 1];
                        const domain = lastActive.dataset.domain;
                        const hue = ONBOARDING_DOMAIN_HUES[domain] || 225;
                        document.documentElement.style.setProperty('--hue-primary', hue);
                    } else {
                        document.documentElement.style.removeProperty('--hue-primary');
                    }
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

            const errBox = $('#onboarding-step1-error');
            if (errBox) errBox.style.display = 'none';
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

        // Level Cards Selection (3 Equal Width Columns)
        const levelContainer = $('.level-cards-vertical');
        if (levelContainer) {
            levelContainer.addEventListener('click', (e) => {
                const card = e.target.closest('.level-card-v');
                if (!card) return;
                $$('.level-card-v').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                selectedLevel = card.dataset.level || 'builder';
            });
        }

        // Onboarding Step 0: Language & Form of Address
        $$('#onboarding-lang-pills .lang-pill').forEach(btn => {
            btn.addEventListener('click', async () => {
                $$('#onboarding-lang-pills .lang-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const code = btn.dataset.lang;
                await switchLanguage(code);
            });
        });

        $$('#onboarding-gender-grid .gender-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('#onboarding-gender-grid .gender-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedGender = btn.dataset.gender || 'neutral';
                const customWrap = $('#step0-custom-gender-wrap');
                if (selectedGender === 'custom') {
                    if (customWrap) customWrap.style.display = 'block';
                    $('#input-custom-gender')?.focus();
                } else {
                    if (customWrap) customWrap.style.display = 'none';
                }
            });
        });

        // Wizard Step Navigation
        $('#btn-wizard-step0-next')?.addEventListener('click', () => setWizardStep(1));
        $('#btn-wizard-step1-prev')?.addEventListener('click', () => setWizardStep(0));

        const btnStep1Next = $('#btn-wizard-step1-next');
        if (btnStep1Next) {
            btnStep1Next.addEventListener('click', () => {
                const selectedChips = $$('#onboarding-domains-chips .chip-row.active');
                const errBox = $('#onboarding-step1-error');
                const chipsEl = $('#onboarding-domains-chips');

                if (selectedChips.length === 0) {
                    if (errBox) errBox.style.display = 'inline';
                    if (chipsEl) {
                        chipsEl.classList.remove('shake-anim');
                        void chipsEl.offsetWidth;
                        chipsEl.classList.add('shake-anim');
                    }
                    return;
                }

                if (errBox) errBox.style.display = 'none';
                if (chipsEl) chipsEl.classList.remove('shake-anim');
                setWizardStep(2);
            });
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
                const activeChips = Array.from($$('#onboarding-domains-chips .chip-row.active')).map(c => c.textContent.trim().replace(/^✨\s*/, ''));
                const recentThought = ($('#onboarding-recent-input')?.value || '').trim();
                const formOfAddress = selectedGender === 'custom'
                    ? ($('#input-custom-gender')?.value.trim() || 'neutral')
                    : selectedGender;

                setGlobalLoading(true, 'loading.onboarding');
                try {
                    const res = await api('POST', '/api/onboarding', {
                        interests: activeChips.length > 0 ? activeChips : ['Matematyka', 'Computer Science'],
                        level: selectedLevel,
                        recent_thought: recentThought,
                        language: langCode,
                        form_of_address: formOfAddress
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

        // Cold Start Actions
        const btnColdStartReroll = $('#btn-cold-start-reroll');
        if (btnColdStartReroll) {
            btnColdStartReroll.addEventListener('click', async () => {
                const rejected = (state.coldStartCards || []).map(c => c.title);
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
                    setGlobalLoading(false);
                }
            });
        }

        // Cold Start Custom Thought Slide-Up Search Bar & Symmetrical Slide-Down
        const btnOpenCustomThought = $('#btn-cold-start-open-custom');
        const cardsView = $('#cold-start-cards-view');
        const customThoughtView = $('#cold-start-custom-view');
        const btnCustomBack = $('#btn-cold-start-custom-back');
        const inputThought = $('#input-cold-start-thought');

        if (btnOpenCustomThought) {
            btnOpenCustomThought.addEventListener('click', () => {
                if (cardsView) {
                    cardsView.classList.remove('fade-in');
                    cardsView.classList.add('fade-out');
                }
                setTimeout(() => {
                    if (cardsView) cardsView.hidden = true;
                    if (customThoughtView) {
                        customThoughtView.classList.remove('slide-down');
                        customThoughtView.hidden = false;
                        if (inputThought) inputThought.focus();
                    }
                }, 160);
            });
        }

        if (btnCustomBack) {
            btnCustomBack.addEventListener('click', () => {
                if (customThoughtView) {
                    customThoughtView.classList.add('slide-down');
                }
                setTimeout(() => {
                    if (customThoughtView) {
                        customThoughtView.hidden = true;
                        customThoughtView.classList.remove('slide-down');
                    }
                    if (cardsView) {
                        cardsView.hidden = false;
                        cardsView.classList.remove('fade-out');
                        cardsView.classList.add('fade-in');
                    }
                }, 180);
            });
        }

        // Submit Custom Thought in Cold Start
        const formColdStartThought = $('#form-cold-start-thought');
        if (formColdStartThought) {
            formColdStartThought.addEventListener('submit', async (e) => {
                e.preventDefault();
                const thought = (inputThought?.value || '').trim();
                if (!thought) return;

                setGlobalLoading(true, 'loading.generating');
                try {
                    const res = await api('POST', '/api/cold-start/from-thought', {
                        thought: thought,
                        language: langCode
                    });

                    state.coldStartCards = res.cards || [];
                    renderColdStartCards();

                    if (customThoughtView) customThoughtView.hidden = true;
                    if (cardsView) {
                        cardsView.hidden = false;
                        cardsView.classList.remove('fade-out');
                        cardsView.classList.add('fade-in');
                    }
                    if (inputThought) inputThought.value = '';
                } catch (err) {
                    showToast(err.message || t('errors.server_down'));
                } finally {
                    setGlobalLoading(false);
                }
            });
        }

        // Brand Click ALWAYS navigates back to Landing Page
        $('#nav-brand')?.addEventListener('click', (e) => {
            e.preventDefault();
            showView('LANDING');
        });

        // Topbar Nav Buttons
        $('#btn-nav-sparks')?.addEventListener('click', () => {
            loadSparksList();
            $('#spark-modal-backdrop').hidden = false;
        });
        $('#btn-nav-constellation')?.addEventListener('click', () => {
            showView('CONSTELLATION');
            renderConstellation();
        });
        $('#btn-nav-history')?.addEventListener('click', () => {
            showView('HISTORY');
            loadHistoryArchive();
        });
        $('#btn-nav-settings')?.addEventListener('click', () => {
            populateSettingsView();
            showView('SETTINGS');
        });

        $('#select-settings-address')?.addEventListener('change', async (e) => {
            const formVal = e.target.value;
            if (state.profile) state.profile.form_of_address = formVal;
            if (localStorage.getItem('curiosity_token')) {
                await api('POST', '/api/profile', { form_of_address: formVal }).catch(() => {});
            }
        });

        $('#select-settings-level')?.addEventListener('change', async (e) => {
            const levelVal = e.target.value;
            if (state.profile) state.profile.grounding_level = levelVal;
            if (localStorage.getItem('curiosity_token')) {
                await api('POST', '/api/profile', { grounding_level: levelVal }).catch(() => {});
            }
        });

        $('#btn-constellation-back')?.addEventListener('click', () => showView('DASHBOARD'));
        $('#btn-history-back')?.addEventListener('click', () => showView('DASHBOARD'));
        $('#btn-settings-back')?.addEventListener('click', () => showView('DASHBOARD'));

        // Dashboard Stage 1: Discovery Actions
        $('#btn-discovery-explore')?.addEventListener('click', async () => {
            if (!state.concept) return;
            const btn = $('#btn-discovery-explore');
            if (btn) btn.classList.add('loading');
            setGlobalLoading(true, 'loading.connecting');
            try {
                const res = await api('POST', `/api/topics/${state.concept.id}/accept`);
                state.concept = res.concept;
                state.prompt = res.prompt;
                renderDashboard('focus');
            } catch (err) {
                showToast(err.message);
            } finally {
                if (btn) btn.classList.remove('loading');
                setGlobalLoading(false);
            }
        });

        $('#btn-discovery-save-spark')?.addEventListener('click', async () => {
            if (!state.concept) return;
            try {
                await api('POST', '/api/topics/save-to-sparks', {
                    title: state.concept.title,
                    domain: state.concept.domain || 'General',
                    summary: state.concept.summary || '',
                    concept_id: state.concept.id
                });
                state.sparksCount = (state.sparksCount || 0) + 1;
                const sparksBadge = $('#nav-sparks-label');
                if (sparksBadge) {
                    sparksBadge.textContent = t('nav.sparks', { n: state.sparksCount });
                }
                showToast(t('focus_card.saved_to_sparks_toast'));
            } catch (err) {
                showToast(err.message || t('errors.server_down'));
            }
        });

        $('#btn-dashboard-reroll-batch')?.addEventListener('click', async () => {
            await loadBatchSuggestions(true);
        });

        $$('#dashboard-vector-pills .vector-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                const vector = btn.dataset.vector;
                if (!vector || vector === state.activeVector) return;
                state.activeVector = vector;
                renderDashboard('discovery');
            });
        });

        // Dashboard Stage 2: Focus Actions & Robust Clipboard Copy
        $('#btn-focus-abandon')?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!state.concept) return;
            const conceptId = state.concept.id;
            const btn = $('#btn-focus-abandon');
            if (btn) btn.classList.add('loading');
            try {
                await api('POST', `/api/topics/${conceptId}/abandon`);
                showToast(t('focus_card.abandon_toast'));
                state.concept = null;
                state.prompt = null;
                await loadBatchSuggestions(true);
            } catch (err) {
                showToast(err.message || t('errors.server_down'));
            } finally {
                if (btn) btn.classList.remove('loading');
            }
        });

        $('#btn-copy-prompt')?.addEventListener('click', async () => {
            const text = $('#prompt-card-content')?.textContent || '';
            if (!text) return;
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                } else {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.focus();
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                }
                const toast = $('#copy-feedback-toast');
                if (toast) {
                    toast.style.display = 'inline-block';
                    setTimeout(() => { toast.style.display = 'none'; }, 2200);
                }
            } catch (err) {
                showToast(t('errors.copy_failed'));
            }
        });

        $('#btn-focus-finish')?.addEventListener('click', () => {
            if (!state.concept) return;
            const subtitle = $('#complete-modal-subtitle');
            if (subtitle) {
                subtitle.textContent = t('complete_modal.subtitle', { topic: state.concept.title });
            }
            $('#complete-modal-backdrop').hidden = false;
        });

        $('#btn-focus-add-spark')?.addEventListener('click', () => {
            loadSparksList();
            $('#spark-modal-backdrop').hidden = false;
            setTimeout(() => $('#input-spark-text')?.focus(), 50);
        });

        // Complete Session Modal Trigger
        $('#btn-concept-finish')?.addEventListener('click', () => {
            if (!state.concept) return;
            const subtitle = $('#complete-modal-subtitle');
            if (subtitle) {
                subtitle.textContent = t('complete_modal.subtitle', { topic: state.concept.title });
            }
            $('#complete-modal-backdrop').hidden = false;
        });

        $('#btn-close-complete-modal')?.addEventListener('click', () => {
            $('#complete-modal-backdrop').hidden = true;
        });
        $('#btn-cancel-complete')?.addEventListener('click', () => {
            $('#complete-modal-backdrop').hidden = true;
        });

        $('#complete-session-form')?.addEventListener('submit', async (e) => {
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
                await loadBatchSuggestions(true);
                showToast(t('complete_modal.title'));
            } catch (err) {
                showToast(err.message);
            } finally {
                btn.classList.remove('loading');
                setGlobalLoading(false);
            }
        });

        // Spark Inbox Floating Button & Modal
        $('#btn-floating-spark')?.addEventListener('click', () => {
            loadSparksList();
            $('#spark-modal-backdrop').hidden = false;
            $('#input-spark-text').focus();
        });
        $('#btn-close-spark-modal')?.addEventListener('click', () => {
            $('#spark-modal-backdrop').hidden = true;
        });

        $('#btn-submit-spark')?.addEventListener('click', submitSpark);
        $('#input-spark-text')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitSpark();
        });

        // Keyboard Shortcut: Space on Dashboard
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && state.view === 'DASHBOARD') {
                e.preventDefault();
                loadSparksList();
                $('#spark-modal-backdrop').hidden = false;
                setTimeout(() => $('#input-spark-text')?.focus(), 50);
            }
            if (e.key === 'Escape') {
                $('#spark-modal-backdrop').hidden = true;
                $('#complete-modal-backdrop').hidden = true;
                closeAuthModal();
            }
        });

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

    // ─── Instant Dev Hot-Reload & CSS Hot-Swap ───
    function initDevLiveReload() {
        if (!window.EventSource) return;
        let es = null;
        let retryTimeout = null;

        function connect() {
            try {
                es = new EventSource('/api/dev/live-reload');
                es.addEventListener('change', (e) => {
                    try {
                        const data = JSON.parse(e.data);
                        if (data.type === 'css') {
                            // Instant CSS hot-swap without page reload or loss of state
                            const links = document.querySelectorAll('link[rel="stylesheet"]');
                            links.forEach(link => {
                                const url = new URL(link.href, window.location.origin);
                                url.searchParams.set('_hot', Date.now());
                                link.href = url.toString();
                            });
                        } else {
                            // Full page reload for JS/HTML/JSON changes
                            window.location.reload();
                        }
                    } catch (err) {
                        window.location.reload();
                    }
                });

                es.onerror = () => {
                    es.close();
                    clearTimeout(retryTimeout);
                    retryTimeout = setTimeout(connect, 2000);
                };
            } catch (err) {
                // Ignore in offline / production modes
            }
        }

        connect();
    }

    // Start App immediately or upon DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

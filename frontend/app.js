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
            "sparks": "Dygresje ({n})",
            "history": "Historia",
            "settings": "Ustawienia",
            "logout": "Wyloguj",
            "login_btn": "Zaloguj się",
            "register_btn": "Zarejestruj się"
        },
        "landing": {
            "badge": "Nowy Wymiar Ciekawości & Nauki",
            "title_static": "Ucz się przez",
            "dynamic_phrases": [
                "intuicyjne skojarzenia.",
                "modele mentalne i analogie.",
                "schodzenie głęboko pod maskę.",
                "gotowe prompty do Claude i ChatGPT.",
                "fascynujące mosty logiczne."
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
            "f4_title": "Spark Inbox",
            "f4_tag": "Łapanie Dygresji",
            "f4_desc": "Zapisuj przelotne myśli jednym klawiszem (Spacja). Silnik połączy je w grafie i przypomni o nich we właściwym momencie."
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
            "level_ground_zero_title": "Intuicja & Proste Analogie",
            "level_ground_zero_tag": "Od Zera / Klocki LEGO",
            "level_ground_zero_desc": "Tłumacz od zera prostym językiem i obrazowymi metaforami z życia codziennego. Zero zbędnego żargonu, maksimum intuicji 'jak dla 5-latka'.",
            "level_builder_title": "Systemy & Łączenie Kropek",
            "level_builder_tag": "Średniozaawansowany / Builder",
            "level_builder_desc": "Znam ogólne podstawy. Chcę rozumieć dlaczego rzeczy działają, łączyć odległe idee i budować całościowe modele mentalne.",
            "level_deep_title": "Zasada Działania & Pod Maską",
            "level_deep_tag": "Głęboka Analiza / Ekspert",
            "level_deep_desc": "Ścisłość logiczna, dekonstrukcja mechanizmów do elementarnych części składowych i badanie nietrywialnych zależności.",
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
            "custom_placeholder": "np. jak komputery generują dźwięk, dlaczego gwiazdy migoczą...",
            "custom_submit": "Zbadaj odnogi ➔"
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
            "spark": "Rozwiń Dygresję",
            "spark_desc": "Sięgnij po zapisaną myśl z przeszłości",
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
            "suggested_label": "Dzisiejsza Propozycja",
            "active_label": "Trwająca Eksploracja",
            "why_label": "Most Logiczny",
            "model_label": "Intuicja & Model Mentalny",
            "accept_btn": "Zbadaj ten temat",
            "skip_btn": "Inna propozycja",
            "reject_btn": "Nie interesuje mnie to",
            "copy_prompt_btn": "Kopiuj Prompt do ChatGPT / Claude",
            "prompt_copied": "Prompt skopiowany do schowka ✓",
            "finish_btn": "Oznacz jako Opanowane ✓",
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
            "title": "Spark Inbox (Pudełko na Dygresje)",
            "subtitle": "Zapisuj luźne myśli, które mignęły Ci w trakcie nauki — silnik zachowa je na później.",
            "input_placeholder": "Wpisz dygresję i wciśnij Enter...",
            "add_btn": "Zapisz Iskrę",
            "empty": "Brak oczekujących dygresji. Możesz je dodawać w każdej chwili.",
            "explore_btn": "Zbadaj teraz",
            "dismiss_btn": "Usuń",
            "quick_tip": "Skrót klawiszowy: wciśnij Spację na pulpicie, aby szybko zapisać dygresję."
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
            "theme_heading": "Wygląd",
            "theme_light": "Jasny",
            "theme_dark": "Ciemny",
            "language_heading": "Język Interfejsu",
            "language_hint": "Wybierz język aplikacji.",
            "ai_heading": "Status AI",
            "ai_configured": "Skonfigurowano ✓",
            "ai_not_configured": "Brak klucza API ✗",
            "privacy_heading": "Prywatność & Baza Lokalna",
            "privacy_text": "Wszystkie Twoje dane, embeddingi i historia są przechowywane w lokalnej bazie SQLite. Twój klucz API nigdy nie opuszcza Twojego serwera."
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
        concept: null,
        prompt: null,
        sparksCount: 0,
        masteredCount: 0,
        ai: { configured: false },
        profile: {},
        coldStartActive: false,
        coldStartCards: []
    };

    // ─── Wizard & Auth State ───
    let wizardCurrentStep = 1;
    let selectedLevel = 'builder';
    let authMode = 'LOGIN'; // 'LOGIN' | 'REGISTER' | 'FIRST_SETUP'

    // ─── i18n Engine (Starts with Polish pre-bundled) ───
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
            showView('LANDING');
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
        const currentViews = getViews();
        Object.entries(currentViews).forEach(([name, el]) => {
            if (!el) return;
            el.hidden = (name !== viewName);
        });

        const navLinks = $('#topbar-nav-links');
        const authLinks = $('#topbar-auth-links');
        const floatingBtn = $('#btn-floating-spark');
        const globalProgress = $('#onboarding-global-progress');

        if (viewName === 'LANDING') {
            if (navLinks) navLinks.hidden = true;
            if (floatingBtn) floatingBtn.hidden = true;
            if (authLinks) authLinks.hidden = false;
            if (globalProgress) globalProgress.hidden = true;
            restartHeroTypewriter();
        } else if (viewName === 'ONBOARDING') {
            if (navLinks) navLinks.hidden = true;
            if (floatingBtn) floatingBtn.hidden = true;
            if (authLinks) authLinks.hidden = true;
            if (globalProgress) globalProgress.hidden = false;
            setWizardStep(1);
        } else if (viewName === 'COLD_START') {
            if (navLinks) navLinks.hidden = true;
            if (floatingBtn) floatingBtn.hidden = true;
            if (authLinks) authLinks.hidden = true;
            if (globalProgress) globalProgress.hidden = true;
        } else {
            if (navLinks) navLinks.hidden = false;
            if (floatingBtn) floatingBtn.hidden = false;
            if (authLinks) authLinks.hidden = true;
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
            "intuicyjne skojarzenia.",
            "modele mentalne i analogie.",
            "schodzenie głęboko pod maskę.",
            "gotowe prompty do Claude i ChatGPT.",
            "fascynujące mosty logiczne."
        ];

        const currentPhrase = phrases[phraseIndex % phrases.length];

        if (isDeleting) {
            charIndex--;
            textEl.textContent = currentPhrase.substring(0, charIndex);
        } else {
            charIndex++;
            textEl.textContent = currentPhrase.substring(0, charIndex);
        }

        let typeSpeed = isDeleting ? 40 : 80;

        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 2200;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex++;
            typeSpeed = 400;
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
        const slide1 = $('#wizard-slide-1');
        const slide2 = $('#wizard-slide-2');
        const slide3 = $('#wizard-slide-3');

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
            renderFocusCard('suggested');
            showView('DASHBOARD');
        } catch (err) {
            showToast(err.message || t('errors.server_down'));
        } finally {
            setGlobalLoading(false);
        }
    }

    // ─── Topic Suggestion Trigger (Compass Vectors) ───
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

        const token = localStorage.getItem('curiosity_token');
        const savedLang = localStorage.getItem('curiosity_lang') || 'pl';

        await loadLanguage(savedLang);
        await loadLanguageList();
        updateGreetingAndDates();

        if (!token) {
            showView('LANDING');
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
            openAuthModal('REGISTER');
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

        // Dynamic Event Delegation for Chips List
        const chipsContainer = $('#onboarding-domains-chips');
        if (chipsContainer) {
            chipsContainer.addEventListener('click', (e) => {
                const chip = e.target.closest('.chip-row, .chip');
                if (chip) {
                    chip.classList.toggle('active');
                    const errBox = $('#onboarding-step1-error');
                    if (errBox && $$('#onboarding-domains-chips .chip-row.active').length > 0) {
                        errBox.style.display = 'none';
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

        // Wizard Step Navigation
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

        // Cold Start Custom Thought Slide-Up Search Bar
        const btnOpenCustomThought = $('#btn-cold-start-open-custom');
        const cardsView = $('#cold-start-cards-view');
        const customThoughtView = $('#cold-start-custom-view');
        const btnCustomBack = $('#btn-cold-start-custom-back');
        const inputThought = $('#input-cold-start-thought');

        if (btnOpenCustomThought) {
            btnOpenCustomThought.addEventListener('click', () => {
                if (cardsView) cardsView.classList.add('fade-out');
                setTimeout(() => {
                    if (cardsView) cardsView.hidden = true;
                    if (customThoughtView) {
                        customThoughtView.hidden = false;
                        if (inputThought) inputThought.focus();
                    }
                }, 180);
            });
        }

        if (btnCustomBack) {
            btnCustomBack.addEventListener('click', () => {
                if (customThoughtView) customThoughtView.hidden = true;
                if (cardsView) {
                    cardsView.hidden = false;
                    cardsView.classList.remove('fade-out');
                }
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
                    }
                    if (inputThought) inputThought.value = '';
                } catch (err) {
                    showToast(err.message || t('errors.server_down'));
                } finally {
                    setGlobalLoading(false);
                }
            });
        }

        // Brand Click Navigation
        $('#nav-brand')?.addEventListener('click', (e) => {
            e.preventDefault();
            const token = localStorage.getItem('curiosity_token');
            if (!token) {
                showView('LANDING');
            } else {
                showView(state.coldStartActive ? (state.profile.onboarded ? 'COLD_START' : 'ONBOARDING') : 'DASHBOARD');
            }
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
            showView('SETTINGS');
            const info = $('#settings-ai-info');
            if (info) {
                info.innerHTML = state.ai.configured
                    ? `<span style="color: var(--success);">${t('settings.ai_configured')} (${state.ai.provider} - ${state.ai.model})</span>`
                    : `<span style="color: var(--error);">${t('settings.ai_not_configured')}</span>`;
            }
        });

        $('#btn-constellation-back')?.addEventListener('click', () => showView('DASHBOARD'));
        $('#btn-history-back')?.addEventListener('click', () => showView('DASHBOARD'));
        $('#btn-settings-back')?.addEventListener('click', () => showView('DASHBOARD'));

        // Compass Cards Vector Clicks
        $$('.compass-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const vector = btn.dataset.vector;
                triggerSuggestion(vector);
            });
        });

        // Custom Vector Input in Compass Hub
        $('#btn-custom-vector-submit')?.addEventListener('click', () => {
            const val = $('#input-custom-vector').value.trim();
            if (val) triggerSuggestion('user_spark', val);
        });
        $('#input-custom-vector')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = e.target.value.trim();
                if (val) triggerSuggestion('user_spark', val);
            }
        });

        // Focus Card Actions
        $('#btn-concept-accept')?.addEventListener('click', async () => {
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

        $('#btn-concept-skip')?.addEventListener('click', async () => {
            if (!state.concept) return;
            await api('POST', `/api/topics/${state.concept.id}/skip`).catch(() => {});
            state.concept = null;
            state.prompt = null;
            renderFocusCard(null);
        });

        $('#btn-copy-prompt')?.addEventListener('click', async () => {
            const text = $('#prompt-box-text').textContent;
            try {
                await navigator.clipboard.writeText(text);
                showToast(t('focus_card.prompt_copied'));
            } catch (err) {
                showToast(t('errors.copy_failed'));
            }
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

        // Settings Themes
        $('#btn-theme-dark')?.addEventListener('click', () => applyTheme('dark'));
        $('#btn-theme-light')?.addEventListener('click', () => applyTheme('light'));
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

    // Start App immediately or upon DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

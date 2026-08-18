"""
CuriosityEngine — Prompt Templates & Loader.
All text, templates, and system prompts are loaded dynamically from i18n/{lang}/prompts.json.
Zero hardcoded language strings in Python code.
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

logger = logging.getLogger("curiosity.prompts")
I18N_DIR = Path(__file__).parent.parent / "frontend" / "i18n"

_prompts_cache: Dict[str, dict] = {}


def load_prompts(language: str = "en") -> dict:
    """Load prompts.json for the given language with fallback to 'en'."""
    lang = language or "en"
    if lang in _prompts_cache:
        return _prompts_cache[lang]

    prompts_file = I18N_DIR / lang / "prompts.json"
    if not prompts_file.exists():
        logger.warning(f"Prompts file not found for '{lang}', falling back to 'en'")
        prompts_file = I18N_DIR / "en" / "prompts.json"
        lang = "en"

    try:
        data = json.loads(prompts_file.read_text(encoding="utf-8"))
        _prompts_cache[lang] = data
        return data
    except (json.JSONDecodeError, OSError) as e:
        logger.error(f"Failed to load prompts for '{lang}': {e}")
        return {}


def _get(data: dict, *keys, default="") -> Any:
    val = data
    for k in keys:
        if isinstance(val, dict):
            val = val.get(k, default)
        else:
            return default
    return val if val is not None else default


def _get_grounding_instruction(level: str, language: str = "en") -> str:
    level = level or "builder"
    if language == "pl":
        if level == "ground_zero":
            return "POZIOM INTUICJI (Zupełny Laik / Klocki LEGO): Tłumacz od zera prostym, plastycznym językiem. Używaj wyłącznie intuicyjnych analogii z życia codziennego i fizycznego świata. Całkowicie eliminuj hermetyczny żargon."
        elif level == "deep":
            return "POZIOM INTUICJI (Głęboka Woda / Under The Hood): Skup się na ścisłych mechanizmach pod maską, zasadach działania pierwszych zasad i nietrywialnych zależnościach."
        else:
            return "POZIOM INTUICJI (Średniozaawansowany / Builder): Skup się na architekturze, łączeniu kropek, modelach mentalnych i powodach dlaczego dane pojęcie istnieje."
    else:
        if level == "ground_zero":
            return "INTUITION LEVEL (Ground Zero / LEGO Blocks): Explain from scratch with everyday tangible analogies and simple language. Avoid academic jargon entirely."
        elif level == "deep":
            return "INTUITION LEVEL (Deep Dive / Under The Hood): Focus on rigorous under-the-hood mechanisms, first-principles logic, and technical nuances."
        else:
            return "INTUITION LEVEL (Intermediate / Builder): Focus on system architecture, connecting dots, practical mental models, and why it exists."


def _get_form_of_address_instruction(form: Optional[str], language: str = "en") -> str:
    form = (form or "neutral").strip()
    if language == "pl":
        if form == "male":
            return "FORMA ZWROTU DO UŻYTKOWNIKA: Używaj formy męskiej czasu przeszłego (np. 'Uczyłeś się...', 'Badałeś...', 'Zgłębiałeś...')."
        elif form == "female":
            return "FORMA ZWROTU DO UŻYTKOWNIKA: Używaj formy żeńskiej czasu przeszłego (np. 'Uczyłaś się...', 'Badałaś...', 'Zgłębiałaś...')."
        elif form == "neutral":
            return "FORMA ZWROTU DO UŻYTKOWNIKA: Używaj form neutralnych / bezosobowych (np. 'Nawiązując do wcześniejszego zgłębiania...', 'W odniesieniu do Twojej wiedzy o...')."
        else:
            return f"FORMA ZWROTU DO UŻYTKOWNIKA: Preferowane zwroty: {form}"
    return ""


def _get_knowledge_depth_instruction(mastered_count: int, language: str = "en") -> str:
    """Generate dynamic instruction to enforce progressive depth from foundational gateway concepts to deep specializations."""
    if language == "pl":
        if mastered_count <= 3:
            return (
                f"FAZA WIEDZY I GŁĘBOKOŚCI (Wrota i Fundamenty — {mastered_count} opanowanych pojęć): "
                "Użytkownik dopiero zaczyna swoją podróż. KRYTYCZNE: Proponuj tematy FUNDAMENTALNE, SZEROKIE I PRZYSTĘPNE "
                "w danej dziedzinie — stanowiące intuicyjne wrota i kluczowe modele mentalne "
                "(np. dla Generatywnego AI: 'Jak model przewiduje następne słowo (Next-Token Prediction)' lub 'Wektory cech i embeddingi'; "
                "dla CS: 'Bramki logiczne i sumator binarny' lub 'Kompilator vs Interpreter'; "
                "dla Fizyki: 'Zasada zachowania pędu' lub 'Fale elektromagnetyczne'). "
                "ZASADA ANTY-KOPIOWANIA: Powyższe przykłady to wyłącznie ilustracja stylu — NIE KOPIUJ ich dosłownie, generuj świeże i unikalne pojęcia! "
                "BEZWZGLĘDNIE UNIKAJ na tym etapie niszowych, hyper-szczegółowych zagadnień czy formalnych teorii (np. Reguła 110, kwantyzacja NF4, formalne twierdzenia zupełności)."
            )
        elif mastered_count <= 9:
            return (
                f"FAZA WIEDZY I GŁĘBOKOŚCI (Rozgałęzianie i Architektura — {mastered_count} opanowanych pojęć): "
                "Użytkownik posiada bazowe fundamenty. Proponuj mechanizmy architektoniczne, łączenie kropek pomiędzy koncepcjami "
                "oraz przejście do praktycznych struktur składowych."
            )
        else:
            return (
                f"FAZA WIEDZY I GŁĘBOKOŚCI (Głęboka Eksploracja i Niszowe Niuanse — {mastered_count} opanowanych pojęć): "
                "Użytkownik ma bogatą bazę wiedzy. Możesz wchodzić w zaawansowane mechanizmy pod maską, nietypowe optymalizacje "
                "i głębokie zależności."
            )
    else:
        if mastered_count <= 3:
            return (
                f"KNOWLEDGE DEPTH STAGE (Foundational Gateway Concepts — {mastered_count} mastered concepts): "
                "The user is just starting their journey. CRITICAL: Suggest ACCESSIBLE, BROAD, AND HIGH-IMPACT "
                "GATEWAY CONCEPTS in the domains — establishing core mental models (e.g. for AI: 'Next-Token Prediction in LLMs' "
                "or 'Feature Vectors and Embeddings'; for CS: 'Logic Gates and Binary Adders'). "
                "ANTI-VERBATIM RULE: Examples are for tone illustration only — do NOT copy them literally. Generate fresh concepts. "
                "STRICTLY AVOID hyper-niche or overly specialized sub-theorems (like Rule 110 or deep formal sub-proofs) at this early stage."
            )
        elif mastered_count <= 9:
            return (
                f"KNOWLEDGE DEPTH STAGE (Branching & Systems Architecture — {mastered_count} mastered concepts): "
                "The user has core foundations established. Suggest architectural components, tradeoffs, and connecting dots."
            )
        else:
            return (
                f"KNOWLEDGE DEPTH STAGE (Deep Specialization & Nuance — {mastered_count} mastered concepts): "
                "The user has an extensive knowledge graph. Feel free to explore deep under-the-hood mechanisms and specialized nuances."
            )


def build_generation_prompts(
    vector: str,
    recent_concepts: List[Dict[str, Any]],
    all_titles: List[str],
    profile: Dict[str, Any],
    extra_context: Optional[str] = None,
    mastered_count: int = 0,
    previously_proposed: Optional[List[Dict[str, Any]]] = None
) -> tuple[str, str]:
    """
    Build system and user prompts for topic generation based on the chosen vector.
    """
    lang = profile.get("language", "en") if profile else "en"
    level = profile.get("grounding_level", "builder") if profile else "builder"
    form_of_address = profile.get("form_of_address", "neutral") if profile else "neutral"
    prompts = load_prompts(lang)

    # 1. Build Context
    labels = _get(prompts, "context_labels", default={})
    ctx_parts = []

    # Knowledge Depth Guidance
    ctx_parts.append(_get_knowledge_depth_instruction(mastered_count, lang))

    if recent_concepts:
        lines = []
        for c in recent_concepts[:8]:
            line = f"- {c['title']} ({c.get('domain', 'general')})"
            if c.get("summary"):
                line += f": {c['summary'][:120]}"
            lines.append(line)
        recent_label = _get(labels, "recent_history", default="Recent knowledge nodes:")
        ctx_parts.append(f"{recent_label}\n" + "\n".join(lines))

    if previously_proposed:
        prop_lines = [
            f"- {p['title']} ({p.get('domain', 'general')})"
            for p in previously_proposed[:10]
            if p.get("title")
        ]
        if prop_lines:
            p_label = "Tematy proponowane w przeszłości (widziane przez użytkownika):" if lang == "pl" else "Previously proposed topics shown to the user:"
            ctx_parts.append(f"{p_label}\n" + "\n".join(prop_lines) + "\n" + (
                "ZASADA PROPOZYCJI: Powyższe tematy były już wcześniej proponowane. NIE traktuj ich jako zakazu — możesz zaproponować dany temat ponownie, jeśli teraz świetnie pasuje do aktualnego kontekstu, ale unikaj powtarzania tego samego tematu bezpośrednio w kolejnych partiach."
                if lang == "pl" else
                "PROPOSAL PRINCIPLE: The above topics were offered previously. Do not treat them as permanent bans — you may re-propose one if it now fits the learning context, but avoid repetitive duplicates back-to-back."
            ))

    if all_titles:
        all_label = _get(labels, "all_topics", default="All explored titles:")
        ctx_parts.append(f"{all_label} {', '.join(all_titles[:50])}")

    if profile:
        pref_lines = []
        if profile.get("grounding_level"):
            g_label = _get(labels, "grounding_level", default="Grounding level:")
            pref_lines.append(f"{g_label} {profile['grounding_level']}")
            pref_lines.append(_get_grounding_instruction(level, lang))
        if profile.get("active_domains"):
            d_label = _get(labels, "preferred_areas", default="Active domains:")
            pref_lines.append(f"{d_label} {', '.join(profile['active_domains'])}")
        address_inst = _get_form_of_address_instruction(form_of_address, lang)
        if address_inst:
            pref_lines.append(address_inst)
        if profile.get("custom_instructions"):
            c_label = _get(labels, "custom_notes", default="User notes:")
            pref_lines.append(f"{c_label} {profile['custom_instructions']}")
        if pref_lines:
            header = _get(labels, "user_preferences", default="Cognitive profile:")
            ctx_parts.append(f"{header}\n" + "\n".join(pref_lines))

    full_context = "\n\n".join(ctx_parts).strip()

    # 2. System Prompt
    system_prompt = _get(prompts, "topic_generation", "system", default="")
    lang_instruction = _get(prompts, "language_instruction", default="")
    system_prompt = system_prompt.replace("{language_instruction}", lang_instruction)

    # 3. User Message Template
    tg = _get(prompts, "topic_generation", default={})
    user_template = _get(tg, vector, default="") or _get(tg, "default", default="")
    
    user_msg = user_template.replace("{context}", full_context)
    if extra_context:
        user_msg = user_msg.replace("{user_request}", extra_context)
        user_msg = user_msg.replace("{spark_text}", extra_context)

    return system_prompt, user_msg


def build_batch_generation_prompts(
    recent_concepts: List[Dict[str, Any]],
    all_titles: List[str],
    profile: Optional[Dict[str, Any]] = None,
    language: Optional[str] = None,
    inbox_sparks: Optional[List[Dict[str, Any]]] = None,
    mastered_count: int = 0,
    previously_proposed: Optional[List[Dict[str, Any]]] = None
) -> tuple[str, str]:
    """
    Build prompts to generate 4 distinct topic proposals simultaneously in a single AI request:
    'adjacent', 'deep_dive', 'cross_domain', and 'mental_fog'.
    """
    lang = language or (profile.get("language", "en") if profile else "en")
    prompts = load_prompts(lang)
    labels = _get(prompts, "context_labels", default={})

    # 1. Context construction
    ctx_parts = []

    # Progressive Knowledge Depth Guidance
    ctx_parts.append(_get_knowledge_depth_instruction(mastered_count, lang))

    if recent_concepts:
        history_lines = [
            f"- {c['title']} ({c.get('domain', 'general')}): {c.get('summary', '')}"
            for c in recent_concepts[:8]
        ]
        h_label = _get(labels, "recent_history", default="Recently explored/mastered concepts:")
        ctx_parts.append(f"{h_label}\n" + "\n".join(history_lines))

    if previously_proposed:
        prop_lines = [
            f"- {p['title']} ({p.get('domain', 'general')})"
            for p in previously_proposed[:10]
            if p.get("title")
        ]
        if prop_lines:
            p_label = "Tematy proponowane w przeszłości (widziane przez użytkownika):" if lang == "pl" else "Previously proposed topics shown to the user:"
            ctx_parts.append(f"{p_label}\n" + "\n".join(prop_lines) + "\n" + (
                "ZASADA PROPOZYCJI: Powyższe tematy były już wcześniej proponowane. NIE traktuj ich jako zakazu — możesz zaproponować dany temat ponownie, jeśli teraz świetnie pasuje do aktualnego kontekstu, ale unikaj powtarzania tego samego tematu bezpośrednio w kolejnych partiach."
                if lang == "pl" else
                "PROPOSAL PRINCIPLE: The above topics were offered previously. Do not treat them as permanent bans — you may re-propose one if it now fits the learning context, but avoid repetitive duplicates back-to-back."
            ))

    if inbox_sparks:
        spark_lines = [f"- {s.get('raw_text', '')}" for s in inbox_sparks[:4] if s.get('raw_text')]
        if spark_lines:
            s_label = "Zapisane przelotne dygresje w skrzynce (Sparks):" if lang == "pl" else "Inbox sparks & transient thoughts:"
            ctx_parts.append(f"{s_label}\n" + "\n".join(spark_lines))

    if all_titles:
        t_label = _get(labels, "all_topics", default="All previously touched topics:")
        ctx_parts.append(f"{t_label} {', '.join(all_titles[-35:])}")

    if profile:
        pref_lines = []
        level = profile.get("grounding_level", "builder")
        form_of_address = profile.get("form_of_address", "neutral")
        l_label = _get(labels, "grounding_level", default="Grounding level:")
        pref_lines.append(f"{l_label} {level}")
        pref_lines.append(_get_grounding_instruction(level, lang))
        if profile.get("active_domains"):
            d_label = _get(labels, "preferred_areas", default="Active domains:")
            pref_lines.append(f"{d_label} {', '.join(profile['active_domains'])}")
        address_inst = _get_form_of_address_instruction(form_of_address, lang)
        if address_inst:
            pref_lines.append(address_inst)
        if profile.get("custom_instructions"):
            c_label = _get(labels, "custom_notes", default="User notes:")
            pref_lines.append(f"{c_label} {profile['custom_instructions']}")
        if pref_lines:
            header = _get(labels, "user_preferences", default="Cognitive profile:")
            ctx_parts.append(f"{header}\n" + "\n".join(pref_lines))

    full_context = "\n\n".join(ctx_parts).strip()

    # 2. System Prompt
    system_prompt = _get(prompts, "batch_topic_generation", "system", default="")
    lang_instruction = _get(prompts, "language_instruction", default="")
    system_prompt = system_prompt.replace("{language_instruction}", lang_instruction)

    # 3. User Message Template
    user_template = _get(prompts, "batch_topic_generation", "user", default="")
    user_msg = user_template.replace("{context}", full_context)

    return system_prompt, user_msg


def build_dynamic_prompt_synthesis_prompts(
    concept_title: str,
    domain: str = "General",
    known_concepts: Optional[List[str]] = None,
    profile: Optional[Dict[str, Any]] = None
) -> tuple[str, str]:
    """
    Build prompts to synthesize a custom, concise, 2-3 sentence prompt for external LLMs
    specifically instructing how to teach that topic without rigid boilerplate or self-explaining.
    """
    lang = profile.get("language", "en") if profile else "en"
    level = profile.get("grounding_level", "builder") if profile else "builder"
    prompts = load_prompts(lang)

    system_prompt = _get(prompts, "prompt_synthesis", "system", default="")
    lang_instruction = _get(prompts, "language_instruction", default="")
    system_prompt = system_prompt.replace("{language_instruction}", lang_instruction)

    user_template = _get(prompts, "prompt_synthesis", "user", default="")
    known_str = ", ".join(known_concepts[:4]) if known_concepts else ("Brak" if lang == "pl" else "None")

    user_msg = user_template.replace("{topic}", concept_title)
    user_msg = user_msg.replace("{domain}", domain)
    user_msg = user_msg.replace("{level}", level)
    user_msg = user_msg.replace("{known_concepts}", known_str)

    return system_prompt, user_msg


def build_active_session_synthesis_prompts(
    concept_title: str,
    domain: str = "General",
    summary: str = "",
    known_concepts: Optional[List[str]] = None,
    profile: Optional[Dict[str, Any]] = None
) -> tuple[str, str]:
    """
    Build prompts to synthesize both a captivating, rich introduction (story/analogy/problem genesis)
    and a natural prompt for external LLMs for the active learning session.
    """
    lang = profile.get("language", "en") if profile else "en"
    level = profile.get("grounding_level", "builder") if profile else "builder"
    prompts = load_prompts(lang)

    system_prompt = _get(prompts, "active_session_synthesis", "system", default="")
    if not system_prompt:
        system_prompt = _get(prompts, "prompt_synthesis", "system", default="")
    lang_instruction = _get(prompts, "language_instruction", default="")
    system_prompt = system_prompt.replace("{language_instruction}", lang_instruction)

    user_template = _get(prompts, "active_session_synthesis", "user", default="")
    if not user_template:
        user_template = _get(prompts, "prompt_synthesis", "user", default="")

    known_str = ", ".join(known_concepts[:4]) if known_concepts else ("Brak" if lang == "pl" else "None")

    user_msg = user_template.replace("{topic}", concept_title)
    user_msg = user_msg.replace("{domain}", domain)
    user_msg = user_msg.replace("{level}", level)
    user_msg = user_msg.replace("{summary}", summary or "")
    user_msg = user_msg.replace("{known_concepts}", known_str)

    return system_prompt, user_msg


def build_direct_topic_prompts(
    title: str,
    domain: str,
    summary: str,
    profile: Optional[Dict[str, Any]] = None
) -> tuple[str, str]:
    """
    Build prompts to generate intuitive analogy and mental model for an explicitly chosen topic.
    """
    lang = profile.get("language", "en") if profile else "en"
    level = profile.get("grounding_level", "builder") if profile else "builder"
    form_of_address = profile.get("form_of_address", "neutral") if profile else "neutral"
    prompts = load_prompts(lang)

    system_prompt = _get(prompts, "topic_generation", "system", default="")
    lang_instruction = _get(prompts, "language_instruction", default="")
    system_prompt = system_prompt.replace("{language_instruction}", lang_instruction)

    grounding = _get_grounding_instruction(level, lang)
    address_inst = _get_form_of_address_instruction(form_of_address, lang)

    if lang == "pl":
        user_msg = (
            f"Użytkownik wybrał konkretny temat: \"{title}\" (Dziedzina: {domain}).\n"
            f"Krótki opis/pytanie wyjściowe: \"{summary}\"\n\n"
            f"{grounding}\n"
            f"{address_inst}\n\n"
            f"Sformatuj odpowiedź JSON DOKŁADNIE dla tego wybranego pojęcia \"{title}\" "
            f"tworząc zwięzły most logiczny (short_reason) i namacalny model mentalny / analogię (intuitive_model)."
        )
    else:
        user_msg = (
            f"User explicitly selected topic: \"{title}\" (Domain: {domain}).\n"
            f"Initial spark / description: \"{summary}\"\n\n"
            f"{grounding}\n\n"
            f"Format the JSON response specifically for this exact topic \"{title}\" "
            f"providing a concise bridge reason (short_reason) and a tangible intuitive_model / analogy."
        )

    return system_prompt, user_msg


def build_multiconcept_parse_prompts(
    raw_text: str,
    main_topic: str,
    language: str = "en"
) -> tuple[str, str]:
    """
    Prompt to parse multiple co-explored concepts from user's freeform session reflections.
    """
    prompts = load_prompts(language)
    system_prompt = _get(prompts, "concept_parsing", "system", default="")
    lang_instruction = _get(prompts, "language_instruction", default="")
    system_prompt = system_prompt.replace("{language_instruction}", lang_instruction)

    user_template = _get(prompts, "concept_parsing", "user", default="")
    user_msg = user_template.replace("{raw_text}", raw_text).replace("{main_topic}", main_topic)

    return system_prompt, user_msg


def build_external_learning_prompt(
    concept_title: str,
    domain: str = "general",
    intuitive_model: Optional[str] = None,
    known_concepts: Optional[List[str]] = None,
    profile: Optional[Dict[str, Any]] = None
) -> str:
    """
    Build a dynamic, single-paragraph copyable prompt for external LLMs (ChatGPT/Claude/Gemini)
    tailored to user's grounding level and intuition approach without rigid numbered boilerplate.
    """
    lang = profile.get("language", "en") if profile else "en"
    level = profile.get("grounding_level", "builder") if profile else "builder"
    prompts = load_prompts(lang)

    learning_prompts = prompts.get("learning_prompts", {})
    template = learning_prompts.get(level) or learning_prompts.get("builder") or (
        "Wytłumacz mi pojęcie \"{topic}\" ({domain}) w podejściu Top-Down i intuicyjnym.{known_context}"
        if lang == "pl" else
        "Explain \"{topic}\" ({domain}) using a Top-Down intuitive approach.{known_context}"
    )

    known_context = ""
    if known_concepts:
        prefix = learning_prompts.get("known_context_prefix", " (Nawiąż do: {known_concepts})")
        known_str = ", ".join(known_concepts[:4])
        known_context = prefix.replace("{known_concepts}", known_str)

    prompt = template.replace("{topic}", concept_title)
    prompt = prompt.replace("{domain}", domain)
    prompt = prompt.replace("{known_context}", known_context)
    return prompt.strip()


def build_cold_start_generation_prompts(
    interests: List[str],
    level: str,
    recent_thought: Optional[str] = None,
    rejected_topics: Optional[List[str]] = None,
    language: str = "en"
) -> tuple[str, str]:
    """
    Build prompts for dynamically generating 4 starter spark cards based on onboarding inputs.
    """
    prompts = load_prompts(language)
    system_prompt = _get(prompts, "cold_start_generation", "system", default="")
    lang_instruction = _get(prompts, "language_instruction", default="")
    system_prompt = system_prompt.replace("{language_instruction}", lang_instruction)

    user_template = _get(prompts, "cold_start_generation", "user", default="")
    interests_str = ", ".join(interests) if interests else "General STEM & Curiosity"
    thought_str = recent_thought if recent_thought else "None provided"

    rejected_context = ""
    if rejected_topics:
        if language == "pl":
            rejected_context = f"\nUŻYTKOWNIK ODRZUCIŁ TE PROPOZYCJE (nie sugeruj ich ani pokrewnych): {', '.join(rejected_topics)}."
        else:
            rejected_context = f"\nTHE USER REJECTED THESE TOPICS (do NOT suggest them or close synonyms): {', '.join(rejected_topics)}."

    user_msg = user_template.replace("{interests}", interests_str)
    user_msg = user_msg.replace("{level}", level or "builder")
    user_msg = user_msg.replace("{recent_thought}", thought_str)
    user_msg = user_msg.replace("{rejected_context}", rejected_context)

    return system_prompt, user_msg


def build_thought_to_concept_prompts(
    thought: str,
    profile: Optional[Dict[str, Any]] = None
) -> tuple[str, str]:
    """
    Build prompts to transform user's raw thought/query into a single, concrete, captivating concept topic.
    """
    lang = profile.get("language", "en") if profile else "en"
    level = profile.get("grounding_level", "builder") if profile else "builder"
    form_of_address = profile.get("form_of_address", "neutral") if profile else "neutral"
    prompts = load_prompts(lang)

    system_prompt = _get(prompts, "topic_generation", "system", default="")
    lang_instruction = _get(prompts, "language_instruction", default="")
    system_prompt = system_prompt.replace("{language_instruction}", lang_instruction)

    grounding = _get_grounding_instruction(level, lang)
    address_inst = _get_form_of_address_instruction(form_of_address, lang)

    if lang == "pl":
        user_msg = (
            f"Użytkownik wpisał swoją własną myśl / pytanie / impuls ciekawości:\n"
            f"\"{thought}\"\n\n"
            f"{grounding}\n"
            f"{address_inst}\n\n"
            f"ZASADY TYTUŁOWANIA:\n"
            f"- Tytuł (topic) ma mieć 2 do 5 słów, być naturalny, prosty i konkretny (jak tytuł dobrego artykułu technologicznego, a NIE pracy akademickiej!).\n"
            f"- NEGATYWNE PRZYKŁADY (ZAKAZ ZBYTNIEGO FORMALIZMU I NADĘCIA):\n"
            f"  ❌ Myśl: 'chciałbym zgłębić temat macierzy w kontekście AI' -> BŁĄD: 'Transformacje liniowe macierzy wag w sieciach neuronowych'\n"
            f"  ❌ Myśl: 'jak działa kompresja wideo' -> BŁĄD: 'Algorytmy transformaty kosinusowej w kodekach MPEG'\n"
            f"  ❌ Myśl: 'dlaczego ludzie boją się straty' -> BŁĄD: 'Psychologiczne ujęcie asymetrii awersji do ryzyka w teorii perspektywy'\n"
            f"- POZYTYWNE PRZYKŁADY NATURALNEJ SYNTEZY:\n"
            f"  ✔️ Myśl: 'chciałbym zgłębić temat macierzy w kontekście AI' -> Tytuł: 'Macierze w modelach AI'\n"
            f"  ✔️ Myśl: 'jak działa kompresja wideo' -> Tytuł: 'Kompresja wideo i klatki kluczowe'\n"
            f"  ✔️ Myśl: 'dlaczego ludzie boją się straty' -> Tytuł: 'Teoria perspektywy i awersja do straty'\n"
            f"  ✔️ Myśl: 'jak silnik szachowy ocenia pozycję' -> Tytuł: 'Ocena pozycji w szachach'\n"
            f"  ✔️ Myśl: 'dlaczego niebo jest niebieskie' -> Tytuł: 'Rozpraszanie Rayleigha i błękit nieba'\n\n"
            f"Przekształć wpisaną myśl użytkownika w JEDNO konkretne pojęcie według powyższego standardu.\n"
            f"Odpowiedz WYŁĄCZNIE poprawnym JSON."
        )
    else:
        user_msg = (
            f"The user entered their own thought / question / curiosity spark:\n"
            f"\"{thought}\"\n\n"
            f"{grounding}\n"
            f"{address_inst}\n\n"
            f"TITLE NAMING RULES:\n"
            f"- Title (topic) must be 2 to 5 words, natural, crisp, and direct (like a great tech article title, NOT a dry PhD thesis!).\n"
            f"- NEGATIVE EXAMPLES (AVOID OVERLY FORMAL / BLOATED TITLES):\n"
            f"  ❌ Input: 'explore matrices in AI' -> BAD: 'Linear Transformations of Weight Matrices in Deep Neural Networks'\n"
            f"  ❌ Input: 'how video compression works' -> BAD: 'Discrete Cosine Transform Algorithms in MPEG Standards'\n"
            f"- POSITIVE EXAMPLES OF CRISP TITLES:\n"
            f"  ✔️ Input: 'explore matrices in AI' -> Title: 'Matrices in AI Models'\n"
            f"  ✔️ Input: 'how video compression works' -> Title: 'Video Compression & Keyframes'\n"
            f"  ✔️ Input: 'how chess engines evaluate moves' -> Title: 'Position Evaluation in Chess'\n\n"
            f"Transform the user's input thought into ONE concrete concept following this standard.\n"
            f"Respond ONLY with valid JSON."
        )

    return system_prompt, user_msg


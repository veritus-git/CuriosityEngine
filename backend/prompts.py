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


def build_generation_prompts(
    vector: str,
    recent_concepts: List[Dict[str, Any]],
    all_titles: List[str],
    profile: Dict[str, Any],
    extra_context: Optional[str] = None
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

    if recent_concepts:
        lines = []
        for c in recent_concepts[:8]:
            line = f"- {c['title']} ({c.get('domain', 'general')})"
            if c.get("summary"):
                line += f": {c['summary'][:120]}"
            lines.append(line)
        recent_label = _get(labels, "recent_history", default="Recent knowledge nodes:")
        ctx_parts.append(f"{recent_label}\n" + "\n".join(lines))

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
    inbox_sparks: Optional[List[Dict[str, Any]]] = None
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
    if recent_concepts:
        history_lines = [
            f"- {c['title']} ({c.get('domain', 'general')}): {c.get('summary', '')}"
            for c in recent_concepts[:8]
        ]
        h_label = _get(labels, "recent_history", default="Recently explored/mastered concepts:")
        ctx_parts.append(f"{h_label}\n" + "\n".join(history_lines))

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


def build_cold_start_from_thought_prompts(
    thought: str,
    level: str = "builder",
    language: str = "en"
) -> tuple[str, str]:
    """
    Build prompts to generate 4 direct associative branches from user's custom thought input.
    """
    prompts = load_prompts(language)
    system_prompt = _get(prompts, "cold_start_generation", "system", default="")
    lang_instruction = _get(prompts, "language_instruction", default="")
    system_prompt = system_prompt.replace("{language_instruction}", lang_instruction)

    grounding = _get_grounding_instruction(level, language)

    if language == "pl":
        user_msg = (
            f"Użytkownik wpisał swoją własną myśl / pytanie / impuls ciekawości:\n\"{thought}\"\n\n"
            f"{grounding}\n\n"
            f"Wygeneruj dokładnie 4 BEZPOŚREDNIE, konkretne odnogi / tematy zgłębiające ten pomysł pod różnymi kątami. "
            f"Każda karta musi zawierać konkretny mechanizm związany z tą myślą."
        )
    else:
        user_msg = (
            f"The user entered their own thought / question / spark:\n\"{thought}\"\n\n"
            f"{grounding}\n\n"
            f"Generate exactly 4 DIRECT, specific branches / topics exploring this idea from different angles. "
            f"Each card must feature a specific mechanism directly related to this thought."
        )

    return system_prompt, user_msg


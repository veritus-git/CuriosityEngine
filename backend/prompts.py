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
        if profile.get("active_domains"):
            d_label = _get(labels, "preferred_areas", default="Active domains:")
            pref_lines.append(f"{d_label} {', '.join(profile['active_domains'])}")
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
    Build the copyable prompt for external LLMs (ChatGPT/Claude/Gemini) adhering to the 4 Pillars of Intuition.
    """
    lang = profile.get("language", "en") if profile else "en"
    prompts = load_prompts(lang)

    template = _get(prompts, "learning_prompt", "template", default="")
    if not template:
        return f"Explain {concept_title} top-down with intuitive analogies."

    known_str = ", ".join(known_concepts[:5]) if known_concepts else _get(prompts, "learning_prompt", "no_prereqs", default="None yet (start from scratch)")
    model_str = intuitive_model or ""

    prompt = template.replace("{topic}", concept_title)
    prompt = prompt.replace("{domain}", domain)
    prompt = prompt.replace("{known_concepts}", known_str)
    return prompt.strip()


def build_cold_start_generation_prompts(
    interests: List[str],
    level: str,
    recent_thought: Optional[str] = None,
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

    user_msg = user_template.replace("{interests}", interests_str)
    user_msg = user_msg.replace("{level}", level or "General")
    user_msg = user_msg.replace("{recent_thought}", thought_str)

    return system_prompt, user_msg


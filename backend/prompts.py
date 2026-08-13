"""
Prompt templates for AI topic generation and learning prompt creation.
All text is loaded from i18n/{lang}/prompts.json — nothing is hardcoded here.
"""

import json
import logging
from pathlib import Path

logger = logging.getLogger("curiosity.prompts")

I18N_DIR = Path(__file__).parent.parent / "frontend" / "i18n"

# Cache loaded prompt files
_prompts_cache = {}


def _load_prompts(language: str) -> dict:
    """Load prompts.json for the given language. Falls back to 'en'."""
    if language in _prompts_cache:
        return _prompts_cache[language]

    prompts_file = I18N_DIR / language / "prompts.json"
    if not prompts_file.exists():
        logger.warning(f"Prompts file not found for '{language}', falling back to 'en'")
        prompts_file = I18N_DIR / "en" / "prompts.json"
        language = "en"

    try:
        data = json.loads(prompts_file.read_text(encoding="utf-8"))
        _prompts_cache[language] = data
        return data
    except (json.JSONDecodeError, OSError) as e:
        logger.error(f"Failed to load prompts for '{language}': {e}")
        return {}


def _get(prompts: dict, *keys, default=""):
    """Safely traverse nested dict keys."""
    val = prompts
    for k in keys:
        if isinstance(val, dict):
            val = val.get(k, default)
        else:
            return default
    return val if val is not None else default


def build_topic_generation_prompt(mode, recent_topics, all_titles, preferences, user_request=None):
    """
    Build the system + user prompt for topic generation.
    All text comes from i18n/{lang}/prompts.json.
    """
    language = "en"
    if preferences and preferences.get("language"):
        language = preferences["language"]

    prompts = _load_prompts(language)
    labels = _get(prompts, "context_labels", default={})

    # Build context about what user has learned
    history_context = ""
    if recent_topics:
        history_lines = []
        for t in recent_topics[:10]:
            line = f"- {t['title']}"
            if t.get("notes"):
                line += f" (notes: {t['notes'][:150]})"
            if t.get("interest_rating"):
                line += f" [interest: {t['interest_rating']}/5]"
            history_lines.append(line)
        history_context = _get(labels, "recent_history", default="Recent learning history:") + "\n" + "\n".join(history_lines)

    all_titles_context = ""
    if all_titles:
        titles_list = [t["title"] for t in all_titles]
        label = _get(labels, "all_topics", default="All topics explored so far:")
        all_titles_context = f"\n{label} {', '.join(titles_list)}"

    prefs_context = ""
    if preferences:
        parts = []
        if preferences.get("preferred_subjects"):
            label = _get(labels, "preferred_areas", default="Preferred areas:")
            parts.append(f"{label} {', '.join(preferences['preferred_subjects'])}")
        if preferences.get("disliked_subjects"):
            label = _get(labels, "areas_to_avoid", default="Areas to avoid:")
            parts.append(f"{label} {', '.join(preferences['disliked_subjects'])}")
        if preferences.get("learning_style"):
            label = _get(labels, "learning_style", default="Learning style:")
            parts.append(f"{label} {preferences['learning_style']}")
        if preferences.get("current_interests"):
            label = _get(labels, "current_interests", default="Current interests:")
            parts.append(f"{label} {', '.join(preferences['current_interests'])}")
        if parts:
            header = _get(labels, "user_preferences", default="User preferences:")
            prefs_context = f"\n{header}\n" + "\n".join(parts)

    # Combine context
    context = f"{history_context}{all_titles_context}{prefs_context}".strip()

    # Get system prompt, inject language instruction if present
    system_prompt = _get(prompts, "topic_generation", "system", default="")
    lang_instruction = _get(prompts, "language_instruction", default="")
    if lang_instruction:
        system_prompt = system_prompt.replace("{language_instruction}", lang_instruction)
    else:
        system_prompt = system_prompt.replace("{language_instruction}", "")

    # Get mode-specific user message template
    tg = _get(prompts, "topic_generation", default={})
    user_template = _get(tg, mode, default="") or _get(tg, "default", default="")
    user_msg = user_template.replace("{context}", context)
    if user_request:
        user_msg = user_msg.replace("{user_request}", user_request)

    return system_prompt, user_msg


def build_learning_prompt(topic_title, preferences=None):
    """
    Build a learning prompt that the user can copy to another LLM.
    Template and style text come from i18n/{lang}/prompts.json.
    """
    language = "en"
    if preferences and preferences.get("language"):
        language = preferences["language"]

    prompts = _load_prompts(language)

    style_key = "top-down"
    if preferences and preferences.get("learning_style"):
        style_key = preferences["learning_style"]

    # Get style text from prompts.json
    styles = _get(prompts, "learning_styles", default={})
    style_text = _get(styles, style_key, default="")
    if not style_text:
        # Fallback: use the key as-is
        style_text = style_key

    # Get prompt template
    template = _get(prompts, "learning_prompt", "template", default="")
    if not template:
        # Absolute fallback if prompts.json is broken
        return f"Teach me about: {topic_title}"

    return template.replace("{topic}", topic_title).replace("{style}", style_text)

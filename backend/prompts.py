"""
Prompt templates for AI topic generation and learning prompt creation.
All prompts are language-aware — the AI responds in the user's chosen UI language.
"""

# Map language codes to language names for AI instructions
LANG_NAMES = {
    "en": "English",
    "pl": "Polish",
    "de": "German",
    "es": "Spanish",
    "fr": "French",
    "uk": "Ukrainian",
    "ja": "Japanese",
    "zh": "Chinese",
}


def _get_lang_name(code):
    """Get the human-readable language name for a code."""
    return LANG_NAMES.get(code, code)


def build_topic_generation_prompt(mode, recent_topics, all_titles, preferences, user_request=None):
    """
    Build the system + user prompt for topic generation.

    Modes:
    - connected: suggest something related to recent learning
    - random: suggest something unrelated
    - user_interest: user gives a direction
    - expand: go deeper on a specific topic
    """

    language = "en"
    if preferences and preferences.get("language"):
        language = preferences["language"]
    lang_name = _get_lang_name(language)

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
        history_context = "Recent learning history:\n" + "\n".join(history_lines)

    all_titles_context = ""
    if all_titles:
        titles_list = [t["title"] for t in all_titles]
        all_titles_context = f"\nAll topics explored so far: {', '.join(titles_list)}"

    prefs_context = ""
    if preferences:
        parts = []
        if preferences.get("preferred_subjects"):
            parts.append(f"Preferred areas: {', '.join(preferences['preferred_subjects'])}")
        if preferences.get("disliked_subjects"):
            parts.append(f"Areas to avoid: {', '.join(preferences['disliked_subjects'])}")
        if preferences.get("learning_style"):
            parts.append(f"Learning style: {preferences['learning_style']}")
        if preferences.get("current_interests"):
            parts.append(f"Current interests: {', '.join(preferences['current_interests'])}")
        if parts:
            prefs_context = "\nUser preferences:\n" + "\n".join(parts)

    # Language instruction for AI output
    lang_instruction = ""
    if language != "en":
        lang_instruction = f"""
LANGUAGE: You MUST respond entirely in {lang_name}.
The topic name, short_reason, and connection MUST ALL be written in {lang_name}.
Do NOT use English for any field values."""

    system_prompt = f"""You are CuriosityEngine — a personal guide that suggests ONE specific, focused concept for someone to learn today.

CRITICAL RULES:
1. NEVER suggest broad categories like "Mathematics", "Programming", "Physics", "Computer Science", "Economics"
2. ALWAYS suggest a SPECIFIC concept at a reasonable level of detail
3. Good examples: "Eigenvalues", "Gradient descent", "TCP three-way handshake", "Euler's number", "Hash tables", "Fourier Transform", "Memory allocation", "Bayesian inference", "RSA key generation", "Markov chains"
4. The topic should be small enough to explore meaningfully in one session
5. NEVER repeat a topic the user has already explored
6. Respond ONLY with valid JSON in the exact format specified
{lang_instruction}
Your response must be valid JSON with this exact structure:
{{
  "topic": "Topic Name",
  "short_reason": "One sentence explaining why this topic is suggested now",
  "connection": "Previous Topic → This Topic (or null if random)",
  "difficulty": "beginner|intermediate|advanced"
}}"""

    # Build user message based on mode
    if mode == "connected":
        user_msg = f"""Suggest ONE specific topic that naturally connects to my recent learning.

{history_context}
{all_titles_context}
{prefs_context}

Find a concept that builds on, extends, or is closely related to what I've been exploring. The connection should feel natural and intellectually satisfying."""

    elif mode == "random":
        user_msg = f"""Suggest ONE specific topic from a completely different domain than my recent learning.

{history_context}
{all_titles_context}
{prefs_context}

Choose something surprising and stimulating from a field I haven't explored. It should spark genuine curiosity. Be creative — go beyond typical STEM topics if appropriate."""

    elif mode == "user_interest":
        user_msg = f"""The user expressed this interest: "{user_request}"

{history_context}
{all_titles_context}
{prefs_context}

Based on this interest, suggest ONE specific, focused concept they could explore. Don't just restate their interest — find a concrete concept within that area."""

    elif mode == "expand":
        user_msg = f"""The user wants to go deeper on: "{user_request}"

{history_context}
{all_titles_context}
{prefs_context}

Suggest ONE specific concept that goes deeper into this topic area. It should build understanding and reveal new layers."""

    else:
        user_msg = f"""Suggest ONE specific, interesting topic for me to learn today.

{history_context}
{all_titles_context}
{prefs_context}

Consider my learning history and preferences. Choose something that would genuinely interest a curious, analytical mind."""

    return system_prompt, user_msg


def build_learning_prompt(topic_title, preferences=None):
    """
    Build a learning prompt that the user can copy to another LLM.

    This is NOT a rigid script — it's a flexible template that tells the LLM
    to adapt its explanation to the specific topic. The LLM decides what's
    relevant (examples, math, analogies, etc.) based on the topic itself.
    """

    language = "en"
    if preferences and preferences.get("language"):
        language = preferences["language"]
    lang_name = _get_lang_name(language)

    style = "top-down"
    if preferences and preferences.get("learning_style"):
        style = preferences["learning_style"]

    style_instructions = {
        "top-down": {
            "en": "I prefer learning top-down — start with the big picture and intuition, then gradually go into details.",
            "pl": "Preferuję naukę od ogółu do szczegółu — zacznij od ogólnego obrazu i intuicji, potem stopniowo przechodź do detali.",
        },
        "bottom-up": {
            "en": "I prefer learning bottom-up — start with concrete examples and build up to the general concept.",
            "pl": "Preferuję naukę od szczegółu do ogółu — zacznij od konkretnych przykładów i buduj ku ogólnej koncepcji.",
        },
        "mixed": {
            "en": "Use a mix of intuitive explanations and concrete examples as you see fit.",
            "pl": "Używaj mieszanki intuicyjnych wyjaśnień i konkretnych przykładów, jak uznasz za stosowne.",
        },
    }

    style_text = style_instructions.get(style, style_instructions["top-down"]).get(language)
    if not style_text:
        style_text = style_instructions.get(style, style_instructions["top-down"])["en"]

    if language == "pl":
        prompt = f"""Jesteś moim osobistym nauczycielem.

Dzisiejszy temat: {topic_title}

Jestem ciekawskim uczniem z analitycznym umysłem. {style_text}

Dostosuj swoje wyjaśnienie do tego konkretnego tematu:
- Wyjaśnij koncepcję intuicyjnie, używając analogii lub przykładów które pasują do tematu
- Jeśli temat tego wymaga, wprowadź formalną definicję — ale tylko gdy to pomaga zrozumieniu
- Nie zakładaj wiedzy specjalistycznej, której nie wyjaśniłeś
- Nie przytłaczaj niepotrzebną teorią — skup się na zrozumieniu

Na koniec:
1. Krótkie podsumowanie najważniejszych punktów
2. Zaproponuj 2 powiązane koncepcje do dalszej eksploracji, lub zapytaj czy coś było niejasne

Temat:
{topic_title}"""

    else:
        prompt = f"""You are my personal tutor.

Today's topic: {topic_title}

I'm a curious learner with an analytical mind. {style_text}

Adapt your explanation to this specific topic:
- Explain the concept intuitively, using analogies or examples that fit the subject
- If the topic calls for it, introduce formal definitions — but only when it aids understanding
- Don't assume specialized knowledge you haven't explained
- Don't overwhelm with unnecessary theory — focus on building understanding

At the end:
1. Brief summary of the key points
2. Suggest 2 related concepts to explore next, or ask if something was unclear

Topic:
{topic_title}"""

    return prompt

"""
Prompt templates for AI topic generation and learning prompt creation.
"""


def build_topic_generation_prompt(mode, recent_topics, all_titles, preferences, user_request=None):
    """
    Build the system + user prompt for topic generation.

    Modes:
    - connected: suggest something related to recent learning
    - random: suggest something unrelated
    - user_interest: user gives a direction
    - expand: go deeper on a specific topic
    """

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

    system_prompt = """You are a Learning Compass — a personal guide that suggests ONE specific, focused concept for someone to learn today.

CRITICAL RULES:
1. NEVER suggest broad categories like "Mathematics", "Programming", "Physics", "Computer Science", "Economics"
2. ALWAYS suggest a SPECIFIC concept at a reasonable level of detail
3. Good examples: "Eigenvalues", "Gradient descent", "TCP three-way handshake", "Euler's number", "Hash tables", "Fourier Transform", "Memory allocation", "Bayesian inference", "RSA key generation", "Markov chains"
4. The topic should be small enough to explore meaningfully in one session
5. NEVER repeat a topic the user has already explored
6. Respond ONLY with valid JSON in the exact format specified

Your response must be valid JSON with this exact structure:
{
  "topic": "Topic Name",
  "short_reason": "One sentence explaining why this topic is suggested now",
  "connection": "Previous Topic → This Topic (or null if random)",
  "difficulty": "beginner|intermediate|advanced"
}"""

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
    """Build a learning prompt that the user can copy to another LLM."""

    style = "top-down"
    if preferences and preferences.get("learning_style"):
        style = preferences["learning_style"]

    style_instruction = ""
    if style == "top-down":
        style_instruction = "I prefer learning top-down — start with the big picture and intuition, then gradually introduce formal definitions and details."
    elif style == "bottom-up":
        style_instruction = "I prefer learning bottom-up — start with concrete examples and build up to the general concept."
    else:
        style_instruction = f"My learning style: {style}."

    prompt = f"""You are my personal tutor.

Today I want to understand: {topic_title}

I'm a curious learner with an analytical mind. {style_instruction}

First explain the concept intuitively, then gradually introduce the formal definition.

Don't assume I know advanced mathematics or specialized terminology without explaining it.

Use concrete examples and analogies.

Don't overwhelm me with unnecessary theory.

At the end:
1. Give a brief summary.
2. Suggest 2 related concepts I could explore next, or ask if something was unclear.

Topic:
{topic_title}"""

    return prompt

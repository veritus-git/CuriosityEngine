"""
CuriosityEngine — Associative & Knowledge Graph Engine.
Coordinates vector-based matching, prompt generation, multi-concept parsing, and session closure.
"""

import logging
from typing import Dict, Any, Optional, List
from .database import (
    create_concept, get_concept, get_active_concept, get_suggested_concept,
    update_concept_status, reject_all_suggested_concepts, get_mastered_concepts,
    get_recent_concepts, get_all_concept_titles, get_sparks, update_spark_status,
    create_spark, create_bridge, complete_multiconcept_session, get_profile,
    get_all_concepts_with_embeddings, get_sparks_with_embeddings,
    get_previously_proposed_concepts
)
from .ai import generate_ai_json, generate_embedding, cosine_similarity, AIError
from .prompts import (
    build_generation_prompts, build_batch_generation_prompts,
    build_dynamic_prompt_synthesis_prompts, build_multiconcept_parse_prompts,
    build_external_learning_prompt, build_cold_start_generation_prompts,
    build_direct_topic_prompts, build_cold_start_from_thought_prompts,
    load_prompts
)

logger = logging.getLogger("curiosity.engine")


async def generate_batch_concept_suggestions(
    current_action: str = "skipped"
) -> Dict[str, Any]:
    """
    Generate 4 distinct topic proposals across the 4 primary exploration vectors in a single AI call:
    'adjacent', 'deep_dive', 'cross_domain', and 'mental_fog'.
    """
    # 1. Update any existing suggested concepts
    reject_all_suggested_concepts(new_status=current_action)

    # 2. Gather context
    recent = get_recent_concepts(limit=8)
    mastered = get_mastered_concepts(limit=50)
    all_titles = get_all_concept_titles()
    previously_proposed = get_previously_proposed_concepts(limit=20)
    inbox_sparks = get_sparks(status="inbox", limit=5)
    profile = get_profile()
    lang = profile.get("language", "pl")

    # 3. Build batch generation prompt
    sys_prompt, user_prompt = build_batch_generation_prompts(
        recent_concepts=recent,
        all_titles=all_titles,
        profile=profile,
        language=lang,
        inbox_sparks=inbox_sparks,
        mastered_count=len(mastered),
        previously_proposed=previously_proposed
    )

    # 4. Generate with AI
    parsed = await generate_ai_json(sys_prompt, user_prompt)

    vectors = ["adjacent", "deep_dive", "cross_domain", "mental_fog"]
    results = {}

    for v in vectors:
        v_data = parsed.get(v)
        if not v_data or not v_data.get("topic"):
            # Fallback title if missing
            title = f"Pojęcie ({v})" if lang == "pl" else f"Concept ({v})"
            domain = "General"
            summary = "Most asocjacyjny do Twojej wiedzy." if lang == "pl" else "Associative bridge."
            intuitive_model = "Intuicyjny model pojęcia." if lang == "pl" else "Intuitive concept model."
        else:
            title = v_data.get("topic", "").strip()
            domain = v_data.get("domain", "General").strip()
            summary = v_data.get("short_reason", "").strip()
            intuitive_model = v_data.get("intuitive_model", "").strip()

        # Generate embedding
        emb = await generate_embedding(f"{title} {domain} {summary}")

        concept = create_concept(
            title=title,
            domain=domain,
            summary=summary,
            intuitive_model=intuitive_model,
            difficulty=profile.get("grounding_level", "intermediate"),
            status="suggested",
            embedding=emb,
            source_mode=v
        )
        results[v] = concept

    logger.info(f"Generated 4-vector batch proposals: {[c['title'] for c in results.values()]}")
    return results


async def generate_dynamic_learning_prompt(concept_id: int) -> str:
    """
    Synthesize a tailored, dynamic, 1-paragraph prompt for external LLMs using AI.
    Falls back gracefully to domain-aware universal prompt builder.
    """
    concept = get_concept(concept_id)
    if not concept:
        return ""

    mastered = get_mastered_concepts(limit=6)
    known = [m["title"] for m in mastered if m["id"] != concept_id]
    profile = get_profile()
    lang = profile.get("language", "pl")

    try:
        sys_prompt, user_prompt = build_dynamic_prompt_synthesis_prompts(
            concept_title=concept["title"],
            domain=concept.get("domain", "General"),
            known_concepts=known,
            profile=profile
        )
        parsed = await generate_ai_json(sys_prompt, user_prompt)
        prompt_text = parsed.get("prompt") or parsed.get("text") or ""
        if prompt_text and len(prompt_text.strip()) > 15:
            return prompt_text.strip()
    except Exception as e:
        logger.warning(f"Dynamic prompt synthesis notice ({e}), using fallback builder.")

    return build_external_learning_prompt(
        concept_title=concept["title"],
        domain=concept.get("domain", "General"),
        intuitive_model=concept.get("intuitive_model"),
        known_concepts=known,
        profile=profile
    )


def save_topic_as_spark(title: str, domain: str, summary: str, concept_id: Optional[int] = None) -> Dict[str, Any]:
    """Save a proposed topic directly into the user's sparks inbox."""
    raw_text = f"{title} ({domain}): {summary}".strip()
    spark = create_spark(
        raw_text=raw_text,
        parent_concept_id=concept_id
    )
    logger.info(f"Saved topic '{title}' to sparks inbox.")
    return spark


def get_learning_prompt(concept_id: int) -> str:
    """Build the external LLM prompt for a specific concept."""
    concept = get_concept(concept_id)
    if not concept:
        return ""

    mastered = get_mastered_concepts(limit=6)
    known = [m["title"] for m in mastered if m["id"] != concept_id]
    profile = get_profile()

    return build_external_learning_prompt(
        concept_title=concept["title"],
        domain=concept.get("domain", "general"),
        intuitive_model=concept.get("intuitive_model"),
        known_concepts=known,
        profile=profile
    )


async def select_starter_topic(
    title: str,
    domain: Optional[str] = None,
    summary: Optional[str] = None
) -> Dict[str, Any]:
    """
    Directly adopt the user's chosen starter topic card.
    Generates an intuitive model and prompt tailored specifically for that exact topic.
    """
    reject_all_suggested_concepts(new_status="skipped")
    profile = get_profile()
    topic_domain = domain or "General"
    topic_summary = summary or ""

    # Generate intuitive model using AI tailored to the user's grounding level
    intuitive_model = ""
    try:
        sys_prompt, user_prompt = build_direct_topic_prompts(
            title=title,
            domain=topic_domain,
            summary=topic_summary,
            profile=profile
        )
        parsed = await generate_ai_json(sys_prompt, user_prompt)
        if parsed.get("short_reason"):
            topic_summary = parsed["short_reason"]
        intuitive_model = parsed.get("intuitive_model") or ""
    except Exception as e:
        logger.warning(f"Intuitive model generation notice for '{title}': {e}")
        intuitive_model = topic_summary

    emb = await generate_embedding(f"{title} {topic_domain} {topic_summary}")

    concept = create_concept(
        title=title,
        domain=topic_domain,
        summary=topic_summary,
        intuitive_model=intuitive_model,
        difficulty=profile.get("grounding_level", "intermediate"),
        status="active",
        embedding=emb,
        source_mode="starter_select"
    )

    logger.info(f"Directly activated starter topic: {title}")
    return concept


async def generate_starter_cards_from_thought(
    thought: str,
    language: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Generate 4 direct starter cards / branches rooted specifically in what the user typed.
    """
    profile = get_profile()
    lang = language or profile.get("language", "pl")
    level = profile.get("grounding_level", "builder")

    try:
        sys_prompt, user_prompt = build_cold_start_from_thought_prompts(
            thought=thought,
            level=level,
            language=lang
        )
        parsed = await generate_ai_json(sys_prompt, user_prompt)
        cards = parsed.get("cards", [])
        if len(cards) >= 4:
            return cards[:4]
    except Exception as e:
        logger.warning(f"Thought-based starter cards generation notice ({e}), falling back to dynamic generator.")

    return await generate_dynamic_starter_cards(
        interests=[thought],
        level=level,
        recent_thought=thought,
        language=lang
    )


async def generate_concept_suggestion(
    vector: str = "adjacent",
    user_input: Optional[str] = None,
    spark_id: Optional[int] = None,
    current_action: str = "skip"
) -> Dict[str, Any]:
    """
    Generate an associative concept suggestion according to the chosen compass vector.
    """
    # 1. Update any existing suggested concept
    reject_all_suggested_concepts(new_status=current_action)

    # 2. Gather context
    recent = get_recent_concepts(limit=8)
    mastered = get_mastered_concepts(limit=50)
    all_titles = get_all_concept_titles()
    previously_proposed = get_previously_proposed_concepts(limit=20)
    profile = get_profile()

    extra_context = user_input
    selected_spark = None

    # Special handling for 'spark' vector
    if vector == "spark":
        sparks = get_sparks(status="inbox", limit=10)
        if spark_id:
            selected_spark = next((s for s in sparks if s["id"] == spark_id), None)
        elif sparks:
            selected_spark = sparks[0]

        if selected_spark:
            extra_context = selected_spark["raw_text"]
        else:
            # Fallback if no sparks exist: treat as adjacent
            vector = "adjacent"

    # 3. Build generation prompts from i18n templates
    system_prompt, user_prompt = build_generation_prompts(
        vector=vector,
        recent_concepts=recent,
        all_titles=all_titles,
        profile=profile,
        extra_context=extra_context,
        mastered_count=len(mastered),
        previously_proposed=previously_proposed
    )

    # 4. Generate with AI
    result = await generate_ai_json(system_prompt, user_prompt)

    title = result.get("topic") or result.get("title")
    if not title:
        raise AIError("AI did not return a valid topic title.")

    domain = result.get("domain", "general")
    summary = result.get("short_reason") or result.get("summary", "")
    intuitive_model = result.get("intuitive_model") or result.get("connection", "")
    difficulty = result.get("difficulty", "intermediate")
    logical_reason = result.get("logical_reason") or result.get("connection") or summary

    # 5. Generate embedding for new concept
    emb = await generate_embedding(f"{title} {domain} {summary}")

    # 6. Save concept
    concept = create_concept(
        title=title,
        domain=domain,
        summary=summary,
        intuitive_model=intuitive_model,
        difficulty=difficulty,
        status="suggested",
        embedding=emb,
        source_mode=vector
    )

    # 7. If there's a recent concept or parent, create an associative bridge
    if recent and vector in ("adjacent", "deep_dive", "cross_domain"):
        parent_id = recent[0]["id"]
        create_bridge(
            source_id=parent_id,
            target_id=concept["id"],
            bridge_type=vector,
            logical_reason=logical_reason
        )

    # If converted from spark, mark spark converted
    if selected_spark:
        update_spark_status(selected_spark["id"], "converted")

    logger.info(f"Generated concept: {title} via vector: {vector}")
    return concept


async def complete_session_with_coexplored(
    concept_id: int,
    co_explored_text: Optional[str] = None,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Complete active session. If user mentions co-explored side topics in freeform text,
    parse them with AI and create linked nodes in the knowledge graph.
    """
    concept = get_concept(concept_id)
    if not concept:
        raise ValueError(f"Concept {concept_id} not found")

    profile = get_profile()
    extra_concepts = []

    if co_explored_text and co_explored_text.strip():
        try:
            sys_prompt, user_prompt = build_multiconcept_parse_prompts(
                raw_text=co_explored_text.strip(),
                main_topic=concept["title"],
                language=profile.get("language", "en")
            )
            parsed = await generate_ai_json(sys_prompt, user_prompt)
            items = parsed.get("concepts", [])
            for it in items:
                if it.get("title") and it["title"].lower() != concept["title"].lower():
                    extra_concepts.append({
                        "title": it["title"].strip(),
                        "domain": it.get("domain", concept.get("domain", "general")),
                        "summary": it.get("summary", ""),
                        "reason": it.get("reason", "Co-explored in session")
                    })
        except Exception as e:
            logger.warning(f"Co-explored concept parsing notice: {e}")

    result = complete_multiconcept_session(
        active_concept_id=concept_id,
        extra_concepts=extra_concepts,
        notes=notes
    )

    # Generate embeddings for newly created co-explored concepts
    for cid in result.get("co_explored_ids", []):
        c = get_concept(cid)
        if c and not c.get("embedding"):
            emb = await generate_embedding(f"{c['title']} {c.get('domain', '')} {c.get('summary', '')}")
            create_concept(
                title=c["title"],
                domain=c["domain"],
                summary=c["summary"],
                status="mastered",
                embedding=emb
            )

    return result


def get_learning_prompt(concept_id: int) -> str:
    """Build the external LLM prompt for a specific concept."""
    concept = get_concept(concept_id)
    if not concept:
        return ""

    mastered = get_mastered_concepts(limit=6)
    known = [m["title"] for m in mastered if m["id"] != concept_id]
    profile = get_profile()

    return build_external_learning_prompt(
        concept_title=concept["title"],
        domain=concept.get("domain", "general"),
        intuitive_model=concept.get("intuitive_model"),
        known_concepts=known,
        profile=profile
    )


async def generate_dynamic_starter_cards(
    interests: List[str],
    level: str,
    recent_thought: Optional[str] = None,
    rejected_topics: Optional[List[str]] = None,
    language: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Generate 4 custom, captivating starter cards using AI based on the user's onboarding choices.
    Falls back gracefully to localized default cards if AI fails.
    """
    profile = get_profile()
    lang = language or profile.get("language", "pl")

    try:
        sys_prompt, user_prompt = build_cold_start_generation_prompts(
            interests=interests,
            level=level,
            recent_thought=recent_thought,
            rejected_topics=rejected_topics,
            language=lang
        )
        parsed = await generate_ai_json(sys_prompt, user_prompt)
        cards = parsed.get("cards", [])
        if len(cards) >= 4:
            return cards[:4]
    except Exception as e:
        logger.warning(f"Dynamic starter cards generation notice ({e}), using default cards.")

    prompts = load_prompts(lang)
    return prompts.get("cold_start_cards", [])


---
description: Comprehensive development guidelines, core project philosophy, AI reasoning context, and repository rules for CuriosityEngine.
---

# CuriosityEngine — Project Manifesto, Philosophy & Coding Rules

> **Note for AI Agents**: This document is the ultimate source of truth for the philosophy, system architecture, UX design, and development standards of CuriosityEngine. Read this carefully before planning, designing, or implementing any feature.

---

## 1. The Core Vision & Problem Statement

### A. The Core Problem We Solve
Traditional learning systems fail for curious, multi-disciplinary minds (engineers, polymaths, builders):
1. **Rigid Linear Curricula / Checklists Fail**: Learning is not a linear checklist. When learning matrices, curiosity naturally branches into vectors, complex numbers, shader pipelines, or quantum states. A strict checklist creates chaos, friction, and pressure ("odfajkowywanie listy").
2. **Pure Randomizers ("Wheel of Fortune") Fail**: Complete randomness lacks coherence, continuity, and cognitive anchors.
3. **Cognitive Burden of Choice & "Mental Fog"**: When tired or overwhelmed, users don't know what they know or what they don't know. Formulating what to learn next or writing prompts from scratch is a massive mental barrier.

### B. What CuriosityEngine Is (and Is NOT)
* **It IS an Associative Curiosity & Intuition Engine**:
  * Acts like a personalized semantic memory (RAG + Knowledge Graph).
  * Learns the user's mental model, mastered nodes, skipped sparks, and cognitive pace over time.
  * Suggests concepts that **overlap / intersect (zazębiają się)** with previously learned ideas, rather than boring linear progressions:
    * *"Uczyłeś się wektorów? Może zaciekawią Cię macierze? Nie jest to bezpośrednia kontynuacja, ale mocno się zazębia."*
    * *"Zastanawiałeś się jak komputery przetwarzają grafikę 3D? Sprawdź liczby urojone i kwaterniony!"*
* **It IS NOT a Textbook / Course Platform**:
  * CuriosityEngine **does NOT teach the topic directly**.
  * Its purpose is to **take away the cognitive burden of choice and prompt crafting**.
  * It delivers: (1) the tailored concept, (2) the intuitive analogy/mental model, and (3) a rich, pre-formulated, copy-ready prompt to paste into external LLMs (ChatGPT, Claude) for deep exploration.

### C. Exploration Vectors (Modes of Curiosity)
The engine supports distinct cognitive directions:
1. **Most Asocjacyjny (Adjacent / Associative Bridge)**: Concepts that cross-cut or intersect with recently mastered knowledge.
2. **Nurkowanie Top-Down (First Principles / Under the Hood)**: Taking a high-level question and breaking it down to its foundational mechanism (e.g. "How computers process data" -> Binary System & Logic Gates).
3. **Inna Galaktyka (Serendipitous Jump)**: Leaping to a completely different branch (e.g., from CS/Math to Physics, Neuroscience, Economics, or Linguistics) based on global profile.
4. **Rozwiń Dygresję (Spark Inbox)**: Re-engaging with side thoughts or questions saved during previous sessions.
5. **Tryb Mental Fog (Low Cognitive Load)**: Zero-pressure intuitive analogies and tangible physical metaphors for tired evenings.

---

## 2. System Architecture & Engineering Principles

### A. Strict i18n & Zero Hardcoded Strings
* **Absolute Rule**: Code (Python, JavaScript, HTML templates) must **NEVER** contain hardcoded UI strings, labels, errors, placeholders, or prompt text.
* **Localization Files**:
  * `frontend/i18n/{lang}/ui.json` — all UI labels, button text, placeholders, error alerts, and tooltips.
  * `frontend/i18n/{lang}/prompts.json` — all LLM system prompts, user templates, and generation rules.
* Any dynamic text inserted into the DOM must use `data-i18n`, `data-i18n-placeholder`, or localized string lookups.

### B. Dual-Model AI Strategy & Graceful Fallbacks
* **Primary Engine**: `gemini-3.7-flash` for rich associative synthesis and prompt generation.
* **Automatic Fallback**: `gemini-3.5-flash-lite` automatically takes over on any rate-limit (429), API error, timeout, or JSON truncation without failing the user request.
* **Token Safety**: Enforce adequate token limits (`maxOutputTokens >= 2048`) with robust JSON extraction regex and fallback handlers.

### C. Visual Excellence & "Just Right" Information Density
* **Aesthetics (Linear / Raycast / Stripe Standard)**:
  * Ambient dark theme (`#07070c`), subtle orb glow animations, glassmorphism surfaces.
  * High-contrast typography, clear hierarchy, balanced optical vertical centering.
* **"Just Right Amount" of Elements**: Avoid cognitive overload. Every element on screen must feel intentional, calm, and uncluttered.
* **Responsiveness**:
  * Desktop: Expansive multi-column layouts (e.g. 3-column vertical choice cards).
  * Mobile: Full-width stacked buttons (`flex-direction: column-reverse; width: 100%; height: 48px;`) and horizontal card rows to prevent any horizontal overflow.
* **Tactile Feedback**: Every AI-driven or network action must display immediate, smooth loading indicators.

---

## 3. Git & Workflow Standards

1. **Commit Message Format**: Every commit message must contain **exactly 2 short, descriptive sentences**.
2. **Dual-Remote Push**: Every commit must be pushed to both remotes:
   ```bash
   git push github main && git push gitea main
   ```
3. **Database Migrations**: Any additions to `concepts`, `sparks`, `concept_bridges`, or `user_cognitive_profile` must be backward-compatible with automated migration logic in `backend/database.py`.
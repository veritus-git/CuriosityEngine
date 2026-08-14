---
description: Comprehensive development guidelines, core project philosophy, AI reasoning context, and repository rules for CuriosityEngine.
---

# CuriosityEngine — Project Philosophy & Development Rules

## 1. Core Mission & Vision
**CuriosityEngine** is an associative knowledge discovery and mental-model synthesis engine. It is NOT a standard Q&A chatbot, a rigid course curriculum, or a search engine.

### The Problem We Solve: "Mental Fog" & Unknown Unknowns
- Users (often engineers, builders, curious polymaths) often do **not** know what they know or what they don't know, or they suffer from cognitive fatigue / mental fog.
- Forcing a user to manually explain their knowledge in an intimidating blank form causes cognitive friction and failure.
- **Our Goal**: Provide zero-friction, bottom-up and top-down curiosity amplification. Through broad passion vectors (disciplines), preferred intuition styles (LEGO analogies vs. systems vs. deep rigor), and optional sparks, the engine generates fascinating cold-start sparks and associative bridges that effortlessly trigger learning flow.

---

## 2. Core Architectural Pillars

### A. Strict i18n & Zero Hardcoded Strings
- **Rule**: Source code (HTML, JS, Python) must **NEVER** contain hardcoded UI strings, labels, hints, placeholders, or prompt text.
- **Source of Truth**: 
  - `frontend/i18n/{lang}/ui.json` for all interface text, placeholders, labels, and error messages.
  - `frontend/i18n/{lang}/prompts.json` for all LLM prompt templates and instructions.
- All dynamic DOM text must be hydrated via `data-i18n` or looked up through the localized `translations` object.

### B. AI Model Architecture & Error Fallback
- **Primary Model**: `gemini-3.7-flash` for rich reasoning and synthesis.
- **Automatic Fallback**: If the primary model encounters rate limits (429), timeouts, JSON truncation, or API errors, the system must automatically and transparently fall back to `gemini-3.5-flash-lite` without crashing the user session.
- **Output Token Safety**: AI generation calls must enforce adequate `maxOutputTokens` (2048+) with clean JSON parsing safeguards and robust error handling.

### C. UX, Aesthetics & Visual Excellence (Raycast / Linear / Stripe Standard)
- **Aesthetics**: Deep dark ambient theme (`#07070c`), subtle orb glow animations, glassmorphism surfaces, clean typographic hierarchy, and balanced optical vertical centering.
- **Tactile Feedback**: Every interaction that invokes network or AI calls must provide instant visual feedback (smooth loading spinners, button state updates, or overlay).
- **Responsive by Design**:
  - **Desktop**: Expansive, rich, multi-column card grids and balanced stages.
  - **Mobile**: Single-column vertical flow with full-width stacked touch-friendly actions (`width: 100%; height: 48px; flex-direction: column-reverse;`) to prevent horizontal overflow.

---

## 3. Git & Deployment Rules
1. **Commit Messages**: Every commit message must consist of **exactly 2 short, descriptive sentences**.
2. **Dual-Remote Push**: Every push must target both configured remotes:
   ```bash
   git push github main && git push gitea main
   ```
3. **Database & Schema Integrity**: Any new cognitive preference or concept field must be backward-compatible with SQLite migrations in `backend/database.py`.
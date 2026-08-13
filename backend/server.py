"""
CuriosityEngine — FastAPI Server.
Provides the reactive REST API for the Zen Curiosity Dashboard.
"""

import os
import json
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List

from .database import (
    init_db, get_active_concept, get_suggested_concept, get_concept,
    update_concept_status, get_mastered_concepts, get_sparks,
    create_spark, update_spark_status, get_graph_data, get_profile,
    update_profile
)
from .ai import get_ai_status, AIError, generate_embedding
from .auth import register_user, login_user, get_current_user_token
from .engine import (
    generate_concept_suggestion, complete_session_with_coexplored,
    get_learning_prompt, generate_dynamic_starter_cards
)
from .prompts import load_prompts

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("curiosity.server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info("CuriosityEngine database initialized.")
    yield


app = FastAPI(title="CuriosityEngine", lifespan=lifespan)


# ─── Request Models ───

class AuthRequest(BaseModel):
    username: str
    password: str

class SuggestRequest(BaseModel):
    vector: str = Field(default="adjacent", pattern="^(adjacent|deep_dive|spark|cross_domain|mental_fog|user_spark)$")
    user_input: Optional[str] = None
    spark_id: Optional[int] = None
    current_action: str = "skip"

class CompleteSessionRequest(BaseModel):
    notes: Optional[str] = None
    co_explored_text: Optional[str] = None

class SparkCreateRequest(BaseModel):
    text: str
    parent_concept_id: Optional[int] = None

class OnboardingRequest(BaseModel):
    interests: List[str] = Field(default_factory=list)
    level: str = "builder"
    recent_thought: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    learning_style: Optional[str] = None
    grounding_level: Optional[str] = None
    active_domains: Optional[List[str]] = None
    custom_instructions: Optional[str] = None
    language: Optional[str] = None


# ─── Auth Routes ───

@app.post("/api/auth/register")
async def register(req: AuthRequest):
    try:
        register_user(req.username, req.password)
        token = login_user(req.username, req.password)
        return {"token": token}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/auth/login")
async def login(req: AuthRequest):
    token = login_user(req.username, req.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"token": token}


# ─── Application State Route ───

@app.get("/api/state")
async def get_app_state(username: str = Depends(get_current_user_token)):
    """Return unified state for the Zen Dashboard."""
    active = get_active_concept()
    suggested = get_suggested_concept()
    ai_status = get_ai_status()
    mastered = get_mastered_concepts(limit=100)
    sparks = get_sparks(status="inbox", limit=50)
    profile = get_profile()

    if active:
        state = "CONCEPT_ACTIVE"
        concept = active
        prompt = get_learning_prompt(active["id"])
    elif suggested:
        state = "CONCEPT_SUGGESTED"
        concept = suggested
        prompt = get_learning_prompt(suggested["id"])
    else:
        state = "NO_CONCEPT"
        concept = None
        prompt = None

    return {
        "state": state,
        "concept": concept,
        "prompt": prompt,
        "sparks_count": len(sparks),
        "mastered_count": len(mastered),
        "ai": ai_status,
        "profile": profile,
        "cold_start_active": (len(mastered) == 0 and not active and not suggested)
    }


# ─── Topic / Concept Exploration Routes ───

@app.post("/api/topics/suggest")
async def suggest_topic(req: SuggestRequest, username: str = Depends(get_current_user_token)):
    ai_status = get_ai_status()
    if not ai_status["configured"]:
        raise HTTPException(
            status_code=400,
            detail="AI is not configured. Please set AI_API_KEY in .env and restart."
        )

    try:
        concept = await generate_concept_suggestion(
            vector=req.vector,
            user_input=req.user_input,
            spark_id=req.spark_id,
            current_action=req.current_action
        )
        prompt = get_learning_prompt(concept["id"])
        return {
            "concept": concept,
            "prompt": prompt,
            "state": "CONCEPT_SUGGESTED"
        }
    except AIError as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.post("/api/topics/{concept_id}/accept")
async def accept_concept(concept_id: int, username: str = Depends(get_current_user_token)):
    concept = get_concept(concept_id)
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")

    update_concept_status(concept_id, "active")
    updated = get_concept(concept_id)
    prompt = get_learning_prompt(concept_id)
    return {
        "concept": updated,
        "prompt": prompt,
        "state": "CONCEPT_ACTIVE"
    }


@app.post("/api/topics/{concept_id}/skip")
async def skip_concept(concept_id: int, username: str = Depends(get_current_user_token)):
    concept = get_concept(concept_id)
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    update_concept_status(concept_id, "skipped")
    return {"state": "NO_CONCEPT"}


@app.post("/api/topics/{concept_id}/complete")
async def complete_session(
    concept_id: int,
    req: CompleteSessionRequest,
    username: str = Depends(get_current_user_token)
):
    try:
        res = await complete_session_with_coexplored(
            concept_id=concept_id,
            co_explored_text=req.co_explored_text,
            notes=req.notes
        )
        return {
            "result": res,
            "state": "SAVED"
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error completing session")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Sparks (Dygresje) Routes ───

@app.get("/api/sparks")
async def list_sparks(status: str = "inbox", username: str = Depends(get_current_user_token)):
    sparks = get_sparks(status=status)
    return {"sparks": sparks}


@app.post("/api/sparks")
async def add_spark(req: SparkCreateRequest, username: str = Depends(get_current_user_token)):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Spark text cannot be empty")
    emb = await generate_embedding(text)
    spark = create_spark(
        raw_text=text,
        parent_concept_id=req.parent_concept_id,
        embedding=emb
    )
    return {"spark": spark}


@app.post("/api/sparks/{spark_id}/dismiss")
async def dismiss_spark(spark_id: int, username: str = Depends(get_current_user_token)):
    update_spark_status(spark_id, "dismissed")
    return {"status": "ok"}


# ─── Knowledge Constellation & History ───

@app.get("/api/graph")
async def get_constellation_graph(username: str = Depends(get_current_user_token)):
    return get_graph_data()


@app.get("/api/history")
async def get_history_archive(limit: int = 50, username: str = Depends(get_current_user_token)):
    mastered = get_mastered_concepts(limit=limit)
    return {"items": mastered, "total": len(mastered)}


# ─── Cognitive Profile ───

@app.get("/api/profile")
async def get_user_profile(username: str = Depends(get_current_user_token)):
    return get_profile()


@app.post("/api/profile")
async def update_user_profile(req: ProfileUpdateRequest, username: str = Depends(get_current_user_token)):
    res = update_profile(
        learning_style=req.learning_style,
        grounding_level=req.grounding_level,
        active_domains=req.active_domains,
        custom_instructions=req.custom_instructions,
        language=req.language
    )
    return res


# ─── Cold Start Spark Cards ───

@app.get("/api/cold-start-cards")
async def get_starter_cards(username: str = Depends(get_current_user_token)):
    profile = get_profile()
    lang = profile.get("language", "en")
    prompts = load_prompts(lang)
    cards = prompts.get("cold_start_cards", [])
    return {"cards": cards}


@app.post("/api/onboarding")
async def complete_onboarding_route(req: OnboardingRequest, username: str = Depends(get_current_user_token)):
    update_profile(
        active_domains=req.interests,
        grounding_level=req.level,
        custom_instructions=req.recent_thought
    )
    cards = await generate_dynamic_starter_cards(
        interests=req.interests,
        level=req.level,
        recent_thought=req.recent_thought
    )
    return {"cards": cards, "profile": get_profile()}


@app.get("/api/languages")
async def get_languages():
    i18n_dir = FRONTEND_DIR / "i18n"
    languages = []
    if i18n_dir.exists():
        for lang_dir in sorted(i18n_dir.iterdir()):
            if not lang_dir.is_dir():
                continue
            ui_file = lang_dir / "ui.json"
            if not ui_file.exists():
                continue
            try:
                data = json.loads(ui_file.read_text(encoding="utf-8"))
                meta = data.get("meta", {})
                languages.append({
                    "code": meta.get("code", lang_dir.name),
                    "name": meta.get("name", lang_dir.name),
                    "native_name": meta.get("native_name", lang_dir.name),
                })
            except Exception as e:
                logger.warning(f"Skipping i18n {lang_dir.name}: {e}")
    return {"languages": languages}


# ─── Error Handlers ───

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled server error")
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong. Check server logs."}
    )


# ─── Static Frontend Serving ───

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

@app.get("/")
async def serve_index():
    return FileResponse(FRONTEND_DIR / "index.html")

app.mount("/", StaticFiles(directory=str(FRONTEND_DIR)), name="frontend")


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8080"))
    logger.info(f"Starting CuriosityEngine on {host}:{port}")
    uvicorn.run("backend.server:app", host=host, port=port, reload=True)

"""
CuriosityEngine — FastAPI server.
Serves the frontend and provides API endpoints.
"""

import os
import json
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Load .env before any other imports that use env vars
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List

from backend.database import (
    init_db, get_active_topic, get_suggested_topic, get_topic,
    create_topic, update_topic_status, reject_all_suggested,
    create_session, complete_session, get_session_for_topic,
    get_recent_topics, get_all_topic_titles, get_completed_topics,
    get_preferences, update_preferences, get_history, get_history_count,
)
from backend.ai import generate_topic, get_ai_status, AIError
from backend.prompts import build_topic_generation_prompt, build_learning_prompt

# --- Logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("curiosity")

# --- App ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    logger.info("Database initialized.")
    yield

app = FastAPI(title="CuriosityEngine", lifespan=lifespan)


# --- Request Models ---

class TopicGenerateRequest(BaseModel):
    mode: str = Field(default="connected", pattern="^(connected|random|user_interest|expand)$")
    user_request: Optional[str] = None

class TopicCompleteRequest(BaseModel):
    notes: Optional[str] = None
    discoveries: Optional[str] = None
    side_paths: Optional[str] = None
    difficulty_rating: Optional[int] = Field(default=None, ge=1, le=5)
    interest_rating: Optional[int] = Field(default=None, ge=1, le=5)

class PreferencesRequest(BaseModel):
    preferred_subjects: Optional[List[str]] = None
    disliked_subjects: Optional[List[str]] = None
    learning_style: Optional[str] = None
    current_interests: Optional[List[str]] = None
    language: Optional[str] = None

class LearningPromptRequest(BaseModel):
    topic_title: str


# --- API Routes ---

@app.get("/api/state")
async def get_state():
    """Get the current application state."""
    active = get_active_topic()
    suggested = get_suggested_topic()
    ai_status = get_ai_status()
    history_count = get_history_count()

    if active:
        session = get_session_for_topic(active["id"])
        state = "TOPIC_ACTIVE"
        topic = active
    elif suggested:
        session = None
        state = "TOPIC_SUGGESTED"
        topic = suggested
    else:
        session = None
        state = "NO_TOPIC"
        topic = None

    return {
        "state": state,
        "topic": topic,
        "session": session,
        "ai": ai_status,
        "history_count": history_count,
    }


@app.post("/api/topics/generate")
async def generate_topic_endpoint(req: TopicGenerateRequest):
    """Generate a new topic suggestion using AI."""
    ai_status = get_ai_status()
    if not ai_status["configured"]:
        raise HTTPException(
            status_code=400,
            detail="AI is not configured. Please set AI_API_KEY in your .env file and restart the server."
        )

    # Reject any existing suggestions
    reject_all_suggested()

    # Gather context
    recent = get_recent_topics(limit=10)
    all_titles = get_all_topic_titles()
    prefs = get_preferences()

    # Build prompts
    system_prompt, user_prompt = build_topic_generation_prompt(
        mode=req.mode,
        recent_topics=recent,
        all_titles=all_titles,
        preferences=prefs,
        user_request=req.user_request,
    )

    try:
        result = await generate_topic(system_prompt, user_prompt)
    except AIError as e:
        raise HTTPException(status_code=502, detail=str(e))

    # Save the suggestion
    topic = create_topic(
        title=result["topic"],
        description=result.get("short_reason"),
        short_reason=result.get("short_reason"),
        connection=result.get("connection"),
        difficulty=result.get("difficulty"),
        source_mode=req.mode if req.mode != "user_interest" else "user_requested",
    )

    logger.info(f"Generated topic: {result['topic']} (mode: {req.mode})")

    return {"topic": topic, "state": "TOPIC_SUGGESTED"}


@app.post("/api/topics/{topic_id}/accept")
async def accept_topic(topic_id: int):
    """Accept a suggested topic and start a learning session."""
    topic = get_topic(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found.")
    if topic["status"] != "suggested":
        raise HTTPException(status_code=400, detail="Topic is not in suggested state.")

    update_topic_status(topic_id, "active")
    create_session(topic_id)

    topic = get_topic(topic_id)
    session = get_session_for_topic(topic_id)

    logger.info(f"Accepted topic: {topic['title']}")

    return {"topic": topic, "session": session, "state": "TOPIC_ACTIVE"}


@app.post("/api/topics/{topic_id}/reject")
async def reject_topic(topic_id: int):
    """Reject a suggested topic."""
    topic = get_topic(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found.")

    update_topic_status(topic_id, "rejected")

    logger.info(f"Rejected topic: {topic['title']}")

    return {"state": "NO_TOPIC"}


@app.post("/api/topics/{topic_id}/complete")
async def complete_topic(topic_id: int, req: TopicCompleteRequest):
    """Complete a topic and save session notes."""
    topic = get_topic(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found.")
    if topic["status"] != "active":
        raise HTTPException(status_code=400, detail="Topic is not active.")

    complete_session(
        topic_id=topic_id,
        notes=req.notes,
        discoveries=req.discoveries,
        side_paths=req.side_paths,
        difficulty_rating=req.difficulty_rating,
        interest_rating=req.interest_rating,
    )
    update_topic_status(topic_id, "completed")

    topic = get_topic(topic_id)

    logger.info(f"Completed topic: {topic['title']}")

    return {"topic": topic, "state": "SAVED"}


@app.get("/api/history")
async def get_history_endpoint(limit: int = 50, offset: int = 0):
    """Get learning history."""
    limit = min(limit, 100)
    items = get_history(limit=limit, offset=offset)
    total = get_history_count()
    return {"items": items, "total": total}


@app.get("/api/topics/{topic_id}")
async def get_topic_endpoint(topic_id: int):
    """Get a single topic with its session data."""
    topic = get_topic(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found.")
    session = get_session_for_topic(topic_id)
    return {"topic": topic, "session": session}


@app.get("/api/preferences")
async def get_preferences_endpoint():
    """Get user preferences."""
    return get_preferences()


@app.post("/api/preferences")
async def update_preferences_endpoint(req: PreferencesRequest):
    """Update user preferences."""
    result = update_preferences(
        preferred_subjects=req.preferred_subjects,
        disliked_subjects=req.disliked_subjects,
        learning_style=req.learning_style,
        current_interests=req.current_interests,
        language=req.language,
    )
    logger.info("Preferences updated.")
    return result


@app.post("/api/learning-prompt")
async def generate_learning_prompt(req: LearningPromptRequest):
    """Generate a learning prompt for external LLM use."""
    prefs = get_preferences()
    prompt = build_learning_prompt(req.topic_title, prefs)
    return {"prompt": prompt}


@app.get("/api/languages")
async def get_languages():
    """List available languages by scanning i18n directory."""
    i18n_dir = FRONTEND_DIR / "i18n"
    languages = []
    if i18n_dir.exists():
        for f in sorted(i18n_dir.glob("*.json")):
            try:
                data = json.loads(f.read_text(encoding="utf-8"))
                meta = data.get("meta", {})
                languages.append({
                    "code": meta.get("code", f.stem),
                    "name": meta.get("name", f.stem),
                    "native_name": meta.get("native_name", f.stem),
                })
            except (json.JSONDecodeError, Exception) as e:
                logger.warning(f"Skipping invalid i18n file {f.name}: {e}")
    return {"languages": languages}


# --- Error Handlers ---

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error")
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong. Check the server logs for details."},
    )


# --- Static Files (serve frontend) ---
# Mount AFTER API routes so API takes priority

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

@app.get("/")
async def serve_index():
    return FileResponse(FRONTEND_DIR / "index.html")

# Serve static assets
app.mount("/", StaticFiles(directory=str(FRONTEND_DIR)), name="frontend")


# --- Entry Point ---

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8080"))
    logger.info(f"Starting CuriosityEngine on {host}:{port}")
    uvicorn.run("backend.server:app", host=host, port=port, reload=True)

"""
CuriosityEngine — Database Layer.
Full Graph & Vector Knowledge Architecture:
- concepts (knowledge nodes)
- sparks (quick side-thoughts / sparks inbox)
- concept_bridges (associative edges & reasoning)
- user_cognitive_profile (mental model preferences)
"""

import sqlite3
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from .context import current_user

logger = logging.getLogger("curiosity.database")
DATA_DIR = Path(__file__).parent.parent / "data"


def init_db_schema(conn: sqlite3.Connection):
    """Initialize or migrate the database schema."""
    cursor = conn.cursor()
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS concepts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL UNIQUE,
            domain TEXT NOT NULL DEFAULT 'general',
            summary TEXT,
            intuitive_model TEXT,
            difficulty TEXT DEFAULT 'intermediate',
            status TEXT NOT NULL DEFAULT 'suggested',
            embedding TEXT,
            source_mode TEXT DEFAULT 'adjacent',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            mastered_at TEXT
        );

        CREATE TABLE IF NOT EXISTS sparks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            raw_text TEXT NOT NULL,
            parent_concept_id INTEGER,
            embedding TEXT,
            status TEXT NOT NULL DEFAULT 'inbox',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (parent_concept_id) REFERENCES concepts(id)
        );

        CREATE TABLE IF NOT EXISTS concept_bridges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_concept_id INTEGER NOT NULL,
            target_concept_id INTEGER NOT NULL,
            bridge_type TEXT NOT NULL DEFAULT 'adjacent',
            logical_reason TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (source_concept_id) REFERENCES concepts(id),
            FOREIGN KEY (target_concept_id) REFERENCES concepts(id)
        );

        CREATE TABLE IF NOT EXISTS user_cognitive_profile (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            learning_style TEXT DEFAULT 'top-down_analogical',
            grounding_level TEXT DEFAULT 'builder',
            active_domains TEXT DEFAULT '["math", "computer_science"]',
            custom_instructions TEXT DEFAULT '',
            language TEXT DEFAULT 'pl',
            form_of_address TEXT DEFAULT 'neutral',
            onboarded INTEGER DEFAULT 0,
            starter_cards_json TEXT DEFAULT '[]',
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        INSERT OR IGNORE INTO user_cognitive_profile (id) VALUES (1);
    """)

    # Ensure onboarded, starter_cards_json, and form_of_address columns exist for existing dbs
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(user_cognitive_profile)")
    columns = [row[1] for row in cursor.fetchall()]
    if "onboarded" not in columns:
        cursor.execute("ALTER TABLE user_cognitive_profile ADD COLUMN onboarded INTEGER DEFAULT 0")
    if "starter_cards_json" not in columns:
        cursor.execute("ALTER TABLE user_cognitive_profile ADD COLUMN starter_cards_json TEXT DEFAULT '[]'")
    if "form_of_address" not in columns:
        cursor.execute("ALTER TABLE user_cognitive_profile ADD COLUMN form_of_address TEXT DEFAULT 'neutral'")

    # Auto-migration from legacy tables if present
    _migrate_legacy_data(conn)
    conn.commit()


def _migrate_legacy_data(conn: sqlite3.Connection):
    """Migrate data from legacy topics & user_preferences if they exist."""
    cursor = conn.cursor()
    
    # Check if legacy 'topics' table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='topics'")
    if cursor.fetchone():
        try:
            rows = cursor.execute("SELECT * FROM topics").fetchall()
            for r in rows:
                r_dict = dict(r)
                title = r_dict.get("title")
                if not title:
                    continue
                # Map old status
                old_status = r_dict.get("status", "suggested")
                new_status = "mastered" if old_status == "completed" else old_status
                
                cursor.execute("""
                    INSERT OR IGNORE INTO concepts 
                    (title, summary, intuitive_model, difficulty, status, source_mode, created_at, mastered_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    title,
                    r_dict.get("description") or r_dict.get("short_reason"),
                    r_dict.get("connection"),
                    r_dict.get("difficulty", "intermediate"),
                    new_status,
                    r_dict.get("source_mode", "adjacent"),
                    r_dict.get("created_at", datetime.now().isoformat()),
                    datetime.now().isoformat() if new_status == "mastered" else None
                ))
            logger.info("Migrated legacy topics to concepts table.")
        except Exception as e:
            logger.warning(f"Legacy topics migration notice: {e}")

    # Check legacy 'user_preferences'
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_preferences'")
    if cursor.fetchone():
        try:
            row = cursor.execute("SELECT * FROM user_preferences WHERE id = 1").fetchone()
            if row:
                r = dict(row)
                lang = r.get("language", "en")
                cursor.execute("""
                    UPDATE user_cognitive_profile 
                    SET language = ?, updated_at = datetime('now')
                    WHERE id = 1
                """, (lang,))
        except Exception as e:
            logger.warning(f"Legacy preferences migration notice: {e}")


def get_connection() -> sqlite3.Connection:
    """Get SQLite connection for the current user session."""
    username = current_user.get()
    safe_username = "".join(c for c in username if c.isalnum()) or "default"
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    db_path = DATA_DIR / f"curiosity_{safe_username}.db"

    needs_init = not db_path.exists()
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")

    if needs_init:
        init_db_schema(conn)
    else:
        # Verify schema
        init_db_schema(conn)

    return conn


def init_db():
    """Explicitly verify connection on startup."""
    conn = get_connection()
    conn.close()


# ─── Concepts (Knowledge Nodes) ───

def create_concept(
    title: str,
    domain: str = "general",
    summary: Optional[str] = None,
    intuitive_model: Optional[str] = None,
    difficulty: str = "intermediate",
    status: str = "suggested",
    embedding: Optional[List[float]] = None,
    source_mode: str = "adjacent"
) -> Dict[str, Any]:
    """Create a concept or update an existing one."""
    conn = get_connection()
    cursor = conn.cursor()
    
    emb_str = json.dumps(embedding) if embedding else None
    
    cursor.execute("""
        INSERT INTO concepts (title, domain, summary, intuitive_model, difficulty, status, embedding, source_mode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(title) DO UPDATE SET
            domain = excluded.domain,
            summary = COALESCE(excluded.summary, concepts.summary),
            intuitive_model = COALESCE(excluded.intuitive_model, concepts.intuitive_model),
            difficulty = excluded.difficulty,
            status = excluded.status,
            source_mode = excluded.source_mode
    """, (title, domain, summary, intuitive_model, difficulty, status, emb_str, source_mode))
    
    conn.commit()
    row = cursor.execute("SELECT * FROM concepts WHERE title = ?", (title,)).fetchone()
    conn.close()
    return dict(row) if row else {}


def get_concept(concept_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute("SELECT * FROM concepts WHERE id = ?", (concept_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_concept_by_title(title: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute("SELECT * FROM concepts WHERE LOWER(title) = LOWER(?)", (title.strip(),)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_active_concept() -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM concepts WHERE status = 'active' ORDER BY created_at DESC LIMIT 1"
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_suggested_concept() -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM concepts WHERE status = 'suggested' ORDER BY created_at DESC LIMIT 1"
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def update_concept_status(concept_id: int, status: str):
    conn = get_connection()
    if status == "mastered":
        conn.execute(
            "UPDATE concepts SET status = ?, mastered_at = datetime('now') WHERE id = ?",
            (status, concept_id)
        )
    else:
        conn.execute("UPDATE concepts SET status = ? WHERE id = ?", (status, concept_id))
    conn.commit()
    conn.close()


def reject_all_suggested_concepts(new_status: str = "skipped"):
    conn = get_connection()
    conn.execute("UPDATE concepts SET status = ? WHERE status = 'suggested'", (new_status,))
    conn.commit()
    conn.close()


def get_mastered_concepts(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM concepts WHERE status = 'mastered' ORDER BY mastered_at DESC, id DESC LIMIT ?",
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_recent_concepts(limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM concepts WHERE status IN ('mastered', 'active') ORDER BY COALESCE(mastered_at, created_at) DESC LIMIT ?",
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_all_concept_titles() -> List[str]:
    conn = get_connection()
    rows = conn.execute("SELECT title FROM concepts ORDER BY id DESC").fetchall()
    conn.close()
    return [r["title"] for r in rows]


def get_all_concepts_with_embeddings() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT id, title, domain, summary, embedding FROM concepts WHERE embedding IS NOT NULL").fetchall()
    conn.close()
    res = []
    for r in rows:
        d = dict(r)
        if d.get("embedding"):
            try:
                d["embedding"] = json.loads(d["embedding"])
            except Exception:
                d["embedding"] = None
        res.append(d)
    return res


# ─── Sparks (Side Thoughts & Inbox) ───

def create_spark(raw_text: str, parent_concept_id: Optional[int] = None, embedding: Optional[List[float]] = None) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    emb_str = json.dumps(embedding) if embedding else None
    cursor.execute(
        "INSERT INTO sparks (raw_text, parent_concept_id, embedding, status) VALUES (?, ?, ?, 'inbox')",
        (raw_text.strip(), parent_concept_id, emb_str)
    )
    spark_id = cursor.lastrowid
    conn.commit()
    row = cursor.execute("SELECT * FROM sparks WHERE id = ?", (spark_id,)).fetchone()
    conn.close()
    return dict(row) if row else {}


def get_sparks(status: str = "inbox", limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute(
        """SELECT s.*, c.title as parent_title 
           FROM sparks s 
           LEFT JOIN concepts c ON s.parent_concept_id = c.id 
           WHERE s.status = ? 
           ORDER BY s.created_at DESC LIMIT ?""",
        (status, limit)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_spark_status(spark_id: int, status: str):
    conn = get_connection()
    conn.execute("UPDATE sparks SET status = ? WHERE id = ?", (status, spark_id))
    conn.commit()
    conn.close()


def get_sparks_with_embeddings() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT id, raw_text, embedding FROM sparks WHERE status = 'inbox' AND embedding IS NOT NULL").fetchall()
    conn.close()
    res = []
    for r in rows:
        d = dict(r)
        if d.get("embedding"):
            try:
                d["embedding"] = json.loads(d["embedding"])
            except Exception:
                d["embedding"] = None
        res.append(d)
    return res


# ─── Bridges (Knowledge Graph Edges) ───

def create_bridge(source_id: int, target_id: int, bridge_type: str = "adjacent", logical_reason: str = "") -> Dict[str, Any]:
    if source_id == target_id:
        return {}
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO concept_bridges (source_concept_id, target_concept_id, bridge_type, logical_reason)
        VALUES (?, ?, ?, ?)
    """, (source_id, target_id, bridge_type, logical_reason))
    bridge_id = cursor.lastrowid
    conn.commit()
    row = cursor.execute("SELECT * FROM concept_bridges WHERE id = ?", (bridge_id,)).fetchone()
    conn.close()
    return dict(row) if row else {}


def get_bridges_for_concept(concept_id: int) -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("""
        SELECT b.*, 
               src.title as source_title, 
               tgt.title as target_title
        FROM concept_bridges b
        JOIN concepts src ON b.source_concept_id = src.id
        JOIN concepts tgt ON b.target_concept_id = tgt.id
        WHERE b.source_concept_id = ? OR b.target_concept_id = ?
    """, (concept_id, concept_id)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_graph_data() -> Dict[str, Any]:
    """Return nodes and links for the Constellation view."""
    conn = get_connection()
    nodes_rows = conn.execute("SELECT id, title, domain, status, difficulty FROM concepts WHERE status IN ('mastered', 'active')").fetchall()
    links_rows = conn.execute("""
        SELECT b.id, b.source_concept_id as source, b.target_concept_id as target, b.bridge_type, b.logical_reason
        FROM concept_bridges b
        JOIN concepts s ON b.source_concept_id = s.id
        JOIN concepts t ON b.target_concept_id = t.id
        WHERE s.status IN ('mastered', 'active') AND t.status IN ('mastered', 'active')
    """).fetchall()
    conn.close()
    return {
        "nodes": [dict(r) for r in nodes_rows],
        "links": [dict(r) for r in links_rows]
    }


# ─── Multi-Concept Session Completion ───

def complete_multiconcept_session(
    active_concept_id: int,
    extra_concepts: Optional[List[Dict[str, Any]]] = None,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Mark primary active concept as mastered, create and mark co-explored concepts,
    and build connecting bridges between them.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Mark main concept mastered
    cursor.execute(
        "UPDATE concepts SET status = 'mastered', mastered_at = datetime('now') WHERE id = ?",
        (active_concept_id,)
    )

    created_extra_ids = []
    if extra_concepts:
        for ec in extra_concepts:
            title = ec.get("title", "").strip()
            if not title:
                continue
            domain = ec.get("domain", "general")
            summary = ec.get("summary", "")
            
            cursor.execute("""
                INSERT INTO concepts (title, domain, summary, status, mastered_at, source_mode)
                VALUES (?, ?, ?, 'mastered', datetime('now'), 'co_explored')
                ON CONFLICT(title) DO UPDATE SET 
                    status = 'mastered',
                    mastered_at = datetime('now')
            """, (title, domain, summary))
            
            row = cursor.execute("SELECT id FROM concepts WHERE title = ?", (title,)).fetchone()
            if row and row["id"] != active_concept_id:
                cid = row["id"]
                created_extra_ids.append(cid)
                # Create bridge to active concept
                cursor.execute("""
                    INSERT INTO concept_bridges (source_concept_id, target_concept_id, bridge_type, logical_reason)
                    VALUES (?, ?, 'co_explored', ?)
                """, (active_concept_id, cid, ec.get("reason", "Co-explored during session")))

    conn.commit()
    main_concept = cursor.execute("SELECT * FROM concepts WHERE id = ?", (active_concept_id,)).fetchone()
    conn.close()

    return {
        "main_concept": dict(main_concept) if main_concept else None,
        "co_explored_ids": created_extra_ids,
        "notes": notes
    }


# ─── Cognitive Profile ───

def get_profile() -> Dict[str, Any]:
    conn = get_connection()
    row = conn.execute("SELECT * FROM user_cognitive_profile WHERE id = 1").fetchone()
    conn.close()
    if row:
        d = dict(row)
        try:
            d["active_domains"] = json.loads(d.get("active_domains") or "[]")
        except Exception:
            d["active_domains"] = []
        try:
            d["starter_cards"] = json.loads(d.get("starter_cards_json") or "[]")
        except Exception:
            d["starter_cards"] = []
        d["onboarded"] = bool(d.get("onboarded", 0))
        d["form_of_address"] = d.get("form_of_address") or "neutral"
        return d
    return {
        "learning_style": "top-down_analogical",
        "grounding_level": "builder",
        "active_domains": [],
        "custom_instructions": "",
        "language": "pl",
        "form_of_address": "neutral",
        "onboarded": False,
        "starter_cards": []
    }


def update_profile(
    learning_style: Optional[str] = None,
    grounding_level: Optional[str] = None,
    active_domains: Optional[List[str]] = None,
    custom_instructions: Optional[str] = None,
    language: Optional[str] = None,
    form_of_address: Optional[str] = None,
    onboarded: Optional[bool] = None,
    starter_cards: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    conn = get_connection()
    current = get_profile()

    style = learning_style if learning_style is not None else current["learning_style"]
    grounding = grounding_level if grounding_level is not None else current.get("grounding_level", "builder")
    domains = json.dumps(active_domains if active_domains is not None else current.get("active_domains", []))
    instructions = custom_instructions if custom_instructions is not None else current.get("custom_instructions", "")
    lang = language if language is not None else current.get("language", "pl")
    address = form_of_address if form_of_address is not None else current.get("form_of_address", "neutral")
    is_onboarded = int(onboarded) if onboarded is not None else int(current.get("onboarded", False))
    cards_json = json.dumps(starter_cards if starter_cards is not None else current.get("starter_cards", []))

    conn.execute("""
        UPDATE user_cognitive_profile
        SET learning_style = ?,
            grounding_level = ?,
            active_domains = ?,
            custom_instructions = ?,
            language = ?,
            form_of_address = ?,
            onboarded = ?,
            starter_cards_json = ?,
            updated_at = datetime('now')
        WHERE id = 1
    """, (style, grounding, domains, instructions, lang, address, is_onboarded, cards_json))
    conn.commit()
    conn.close()
    return get_profile()


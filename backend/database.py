"""
Database layer for CuriosityEngine.
SQLite with simple schema — topics, sessions, preferences.
"""

import sqlite3
import os
import json
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "curiosity.db"


def get_connection():
    """Get a database connection with row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """Initialize the database schema."""
    os.makedirs(DB_PATH.parent, exist_ok=True)
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            short_reason TEXT,
            connection TEXT,
            difficulty TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            status TEXT NOT NULL DEFAULT 'suggested',
            source_mode TEXT NOT NULL DEFAULT 'AI_generated'
        );

        CREATE TABLE IF NOT EXISTS learning_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic_id INTEGER NOT NULL,
            started_at TEXT NOT NULL DEFAULT (datetime('now')),
            completed_at TEXT,
            notes TEXT,
            discoveries TEXT,
            side_paths TEXT,
            difficulty_rating INTEGER,
            interest_rating INTEGER,
            FOREIGN KEY (topic_id) REFERENCES topics(id)
        );

        CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            preferred_subjects TEXT DEFAULT '[]',
            disliked_subjects TEXT DEFAULT '[]',
            learning_style TEXT DEFAULT 'top-down',
            current_interests TEXT DEFAULT '[]',
            language TEXT DEFAULT 'en',
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        INSERT OR IGNORE INTO user_preferences (id) VALUES (1);
    """)

    # Migration: add language column if missing (existing DBs)
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN language TEXT DEFAULT 'en'")
    except sqlite3.OperationalError:
        pass  # column already exists

    conn.commit()
    conn.close()


# --- Topic Operations ---

def create_topic(title, description=None, short_reason=None, connection=None,
                 difficulty=None, source_mode="AI_generated"):
    """Create a new topic and return it."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO topics (title, description, short_reason, connection, difficulty, source_mode)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (title, description, short_reason, connection, difficulty, source_mode)
    )
    topic_id = cursor.lastrowid
    conn.commit()

    topic = dict(cursor.execute("SELECT * FROM topics WHERE id = ?", (topic_id,)).fetchone())
    conn.close()
    return topic


def get_topic(topic_id):
    """Get a single topic by ID."""
    conn = get_connection()
    row = conn.execute("SELECT * FROM topics WHERE id = ?", (topic_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_active_topic():
    """Get the currently active topic, if any."""
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM topics WHERE status = 'active' ORDER BY created_at DESC LIMIT 1"
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_suggested_topic():
    """Get the most recent suggested topic."""
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM topics WHERE status = 'suggested' ORDER BY created_at DESC LIMIT 1"
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def update_topic_status(topic_id, status):
    """Update a topic's status."""
    conn = get_connection()
    conn.execute("UPDATE topics SET status = ? WHERE id = ?", (status, topic_id))
    conn.commit()
    conn.close()


def reject_all_suggested(new_status="skipped"):
    """Update all currently suggested topics to a new status (skipped or rejected)."""
    conn = get_connection()
    conn.execute("UPDATE topics SET status = ? WHERE status = 'suggested'", (new_status,))
    conn.commit()
    conn.close()


def get_completed_topics(limit=50):
    """Get completed topics, most recent first."""
    conn = get_connection()
    rows = conn.execute(
        """SELECT t.*, ls.notes, ls.discoveries, ls.interest_rating, ls.difficulty_rating,
                  ls.completed_at as session_completed_at
           FROM topics t
           LEFT JOIN learning_sessions ls ON ls.topic_id = t.id
           WHERE t.status = 'completed'
           ORDER BY t.created_at DESC
           LIMIT ?""",
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_recent_topics(limit=10):
    """Get recent topics for AI context (completed and active)."""
    conn = get_connection()
    rows = conn.execute(
        """SELECT t.*, ls.notes, ls.discoveries, ls.interest_rating
           FROM topics t
           LEFT JOIN learning_sessions ls ON ls.topic_id = t.id
           WHERE t.status IN ('completed', 'active')
           ORDER BY t.created_at DESC
           LIMIT ?""",
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_all_topic_titles():
    """Get all topic titles for context (including rejected ones and recently skipped ones)."""
    conn = get_connection()
    rows = conn.execute(
        """SELECT title, status FROM topics 
           WHERE status IN ('completed', 'active', 'rejected') 
              OR (status = 'skipped' AND created_at >= datetime('now', '-1 day'))
           ORDER BY created_at DESC"""
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# --- Session Operations ---

def create_session(topic_id):
    """Create a learning session for a topic."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO learning_sessions (topic_id) VALUES (?)",
        (topic_id,)
    )
    session_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return session_id


def complete_session(topic_id, notes=None, discoveries=None, side_paths=None,
                     difficulty_rating=None, interest_rating=None):
    """Complete a learning session."""
    conn = get_connection()

    # Find the session for this topic
    session = conn.execute(
        "SELECT id FROM learning_sessions WHERE topic_id = ? ORDER BY started_at DESC LIMIT 1",
        (topic_id,)
    ).fetchone()

    if session:
        conn.execute(
            """UPDATE learning_sessions
               SET completed_at = datetime('now'),
                   notes = ?,
                   discoveries = ?,
                   side_paths = ?,
                   difficulty_rating = ?,
                   interest_rating = ?
               WHERE id = ?""",
            (notes, discoveries, side_paths, difficulty_rating, interest_rating, session["id"])
        )
    else:
        conn.execute(
            """INSERT INTO learning_sessions
               (topic_id, completed_at, notes, discoveries, side_paths, difficulty_rating, interest_rating)
               VALUES (?, datetime('now'), ?, ?, ?, ?, ?)""",
            (topic_id, notes, discoveries, side_paths, difficulty_rating, interest_rating)
        )

    conn.commit()
    conn.close()


def get_session_for_topic(topic_id):
    """Get the session data for a topic."""
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM learning_sessions WHERE topic_id = ? ORDER BY started_at DESC LIMIT 1",
        (topic_id,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


# --- Preferences ---

def get_preferences():
    """Get user preferences."""
    conn = get_connection()
    row = conn.execute("SELECT * FROM user_preferences WHERE id = 1").fetchone()
    conn.close()
    if row:
        prefs = dict(row)
        prefs["preferred_subjects"] = json.loads(prefs.get("preferred_subjects") or "[]")
        prefs["disliked_subjects"] = json.loads(prefs.get("disliked_subjects") or "[]")
        prefs["current_interests"] = json.loads(prefs.get("current_interests") or "[]")
        prefs.setdefault("language", "en")
        return prefs
    return {
        "preferred_subjects": [],
        "disliked_subjects": [],
        "learning_style": "top-down",
        "current_interests": [],
        "language": "en"
    }


def update_preferences(preferred_subjects=None, disliked_subjects=None,
                        learning_style=None, current_interests=None,
                        language=None):
    """Update user preferences."""
    conn = get_connection()
    current = get_preferences()

    preferred = json.dumps(preferred_subjects if preferred_subjects is not None else current["preferred_subjects"])
    disliked = json.dumps(disliked_subjects if disliked_subjects is not None else current["disliked_subjects"])
    style = learning_style if learning_style is not None else current["learning_style"]
    interests = json.dumps(current_interests if current_interests is not None else current["current_interests"])
    lang = language if language is not None else current.get("language", "en")

    conn.execute(
        """UPDATE user_preferences
           SET preferred_subjects = ?,
               disliked_subjects = ?,
               learning_style = ?,
               current_interests = ?,
               language = ?,
               updated_at = datetime('now')
           WHERE id = 1""",
        (preferred, disliked, style, interests, lang)
    )
    conn.commit()
    conn.close()
    return get_preferences()


# --- History ---

def get_history(limit=100, offset=0):
    """Get learning history with session data."""
    conn = get_connection()
    rows = conn.execute(
        """SELECT t.id, t.title, t.description, t.short_reason, t.connection,
                  t.difficulty, t.created_at, t.status, t.source_mode,
                  ls.notes, ls.discoveries, ls.side_paths,
                  ls.difficulty_rating, ls.interest_rating,
                  ls.started_at as session_started, ls.completed_at as session_completed
           FROM topics t
           LEFT JOIN learning_sessions ls ON ls.topic_id = t.id
           WHERE t.status = 'completed'
           ORDER BY ls.completed_at DESC, t.created_at DESC
           LIMIT ? OFFSET ?""",
        (limit, offset)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_history_count():
    """Get total count of completed topics."""
    conn = get_connection()
    row = conn.execute("SELECT COUNT(*) as count FROM topics WHERE status = 'completed'").fetchone()
    conn.close()
    return row["count"] if row else 0

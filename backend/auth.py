import sqlite3
import hashlib
import secrets
from pathlib import Path
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .context import current_user

DATA_DIR = Path(__file__).parent.parent / "data"
AUTH_DB = DATA_DIR / "users.db"
security = HTTPBearer()

def get_auth_conn():
    DATA_DIR.mkdir(exist_ok=True)
    conn = sqlite3.connect(str(AUTH_DB))
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password_hash TEXT,
            token TEXT
        )
    """)
    return conn

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def register_user(username, password):
    conn = get_auth_conn()
    try:
        conn.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", 
                     (username, hash_password(password)))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise ValueError("Username already exists")
    conn.close()

def login_user(username, password):
    conn = get_auth_conn()
    user = conn.execute("SELECT * FROM users WHERE username = ? AND password_hash = ?", 
                        (username, hash_password(password))).fetchone()
    if not user:
        conn.close()
        return None
    token = secrets.token_hex(32)
    conn.execute("UPDATE users SET token = ? WHERE username = ?", (token, username))
    conn.commit()
    conn.close()
    return token

async def get_current_user_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    conn = get_auth_conn()
    user = conn.execute("SELECT username FROM users WHERE token = ?", (token,)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    username = user["username"]
    current_user.set(username)
    return username

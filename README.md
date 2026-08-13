# ⚡ CuriosityEngine

**One interesting thing at a time.**

A personal, self-hosted learning companion that uses AI to suggest specific, focused topics to explore — based on your curiosity, learning history, and interests.

Not a course platform. Not a productivity tracker. Just a calm, beautiful engine for your daily curiosity.

---

## Why?

You're curious. You want to learn something new. But you often get stuck:

> "Where do I start? What's the right order? Am I missing prerequisites?"

CuriosityEngine removes that friction. Open the page, get a topic, explore it. No pressure, no streaks, no gamification.

**Structured spontaneity.**

---

## Features

- 🎯 **AI-powered topic suggestions** — specific concepts, not broad categories
- 🔗 **Context-aware** — suggestions build on your learning history
- 🎲 **Multiple modes** — connected, random, user-directed, or deeper exploration
- 📋 **Copy learning prompt** — one-click prompt for your favorite LLM
- 📝 **Session reflection** — capture notes, discoveries, and ratings
- 📚 **Learning archive** — browse your exploration history
- 🌙 **Beautiful dark UI** — minimal, atmospheric, mobile-first
- 🔒 **Privacy-first** — all data local, API key never touches the browser

---

## Requirements

- Python 3.9+
- An AI API key (OpenAI, Anthropic, or Google Gemini)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/veritus-git/CuriosityEngine CuriosityEngine
cd CuriosityEngine

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your configuration
cp .env.example .env
```

Edit `.env` with your API key, AI model, AI provider, host, and port:

```env
AI_PROVIDER=gemini
AI_MODEL=gemini-2.0-flash
AI_API_KEY=your-key-here
HOST=0.0.0.0
PORT=8080
```

---

## Running

```bash
python -m backend.server
```

Open `http://localhost:8080` in your browser.

### Access from another device (phone, tablet)

Since the server binds to `0.0.0.0`, you can access it from any device on your local network:

1. Find your machine's local IP: `hostname -I`
2. Open `http://<your-ip>:8080` on your phone/tablet

---

## Server Deployment

If you want CuriosityEngine to run permanently on a home server (Raspberry Pi, any Linux box, old laptop, VPS, etc.):

### 1. Install on the server

```bash
# Make sure Python is available
sudo apt update && sudo apt install python3 python3-pip python3-venv

# Clone and set up
git clone https://github.com/veritus-git/CuriosityEngine ~/CuriosityEngine
cd ~/CuriosityEngine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API key: nano .env
```

### 2. Run as a systemd service (auto-start on boot)

Create `/etc/systemd/system/curiosity-engine.service`:

```ini
[Unit]
Description=CuriosityEngine
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/CuriosityEngine
Environment=PATH=/home/YOUR_USERNAME/CuriosityEngine/venv/bin
ExecStart=/home/YOUR_USERNAME/CuriosityEngine/venv/bin/python -m backend.server
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

> Replace `YOUR_USERNAME` with your actual user (e.g. `pi`, `linux`, `ubuntu`).

Then enable and start:

```bash
sudo systemctl enable curiosity-engine
sudo systemctl start curiosity-engine

# Check if it's running
sudo systemctl status curiosity-engine

# View logs
sudo journalctl -u curiosity-engine -f
```

### 3. Access from any device

Once running, open `http://<server-ip>:8080` from any device on the same network.

> **Tip for Raspberry Pi users:** The Pi's IP can change after reboot. Consider setting a static IP or using `hostname.local` (e.g. `http://raspberrypi.local:8080`) if mDNS is enabled.

---

## AI Integration

The app supports three providers:

| Provider | `AI_PROVIDER` | Example `AI_MODEL` |
|----------|---------------|---------------------|
| Google Gemini | `gemini` | `gemini-2.0-flash`, `gemini-3.1-flash-lite` |
| OpenAI | `openai` | `gpt-4o-mini`, `gpt-4o` |
| Anthropic | `anthropic` | `claude-sonnet-4-20250514` |

You can also use OpenAI-compatible APIs (Ollama, etc.) by setting `AI_BASE_URL`:

```env
AI_PROVIDER=openai
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=llama3
AI_API_KEY=ollama
```

The AI generates structured JSON with a topic suggestion. The backend validates the response before saving.

---

## Database

SQLite database stored at `data/curiosity.db`.

Tables:
- `topics` — suggested, active, completed, rejected topics
- `learning_sessions` — notes, discoveries, ratings for each exploration
- `user_preferences` — preferred/disliked subjects, learning style

The database is created automatically on first run.

---

## Security Notes

- API key is stored in `.env` (server-side only, never sent to browser)
- `.env` is in `.gitignore`
- All AI calls happen server-side
- User input is sanitized in the frontend
- No authentication (single-user, local-only design)

---

## Project Structure

```
CuriosityEngine/
├── backend/
│   ├── server.py      # FastAPI server + API routes
│   ├── database.py    # SQLite operations
│   ├── ai.py          # AI provider integration
│   └── prompts.py     # Prompt templates
├── frontend/
│   ├── index.html     # Single page app
│   ├── style.css      # Design system
│   └── app.js         # State machine + interactions
├── data/              # SQLite database (auto-created)
├── .env.example       # Configuration template
├── .gitignore
├── requirements.txt
└── README.md
```

---

## License

Personal project. Use however you like.

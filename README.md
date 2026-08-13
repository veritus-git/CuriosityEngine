# 🧭 Learning Compass

**One interesting thing at a time.**

A personal, self-hosted learning companion that uses AI to suggest specific, focused topics to explore — based on your curiosity, learning history, and interests.

Not a course platform. Not a productivity tracker. Just a calm, beautiful compass for your daily curiosity.

---

## Why?

You're curious. You want to learn something new. But you often get stuck:

> "Where do I start? What's the right order? Am I missing prerequisites?"

Learning Compass removes that friction. Open the page, get a topic, explore it. No pressure, no streaks, no gamification.

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
- An AI API key (OpenAI or Anthropic)

---

## Installation

```bash
# Clone the repository
git clone <your-repo-url> learning-compass
cd learning-compass

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your configuration
cp .env.example .env
```

Edit `.env` with your API key:

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
AI_API_KEY=sk-your-key-here
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

## Raspberry Pi Setup

```bash
# Install Python if needed
sudo apt update && sudo apt install python3 python3-pip python3-venv

# Clone and install
git clone <your-repo-url> ~/learning-compass
cd ~/learning-compass
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API key

# Run
python -m backend.server
```

### Run as a service (optional)

Create `/etc/systemd/system/learning-compass.service`:

```ini
[Unit]
Description=Learning Compass
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/learning-compass
Environment=PATH=/home/pi/learning-compass/venv/bin
ExecStart=/home/pi/learning-compass/venv/bin/python -m backend.server
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl enable learning-compass
sudo systemctl start learning-compass
```

---

## AI Integration

The app supports two providers:

| Provider | `AI_PROVIDER` | Example `AI_MODEL` |
|----------|---------------|---------------------|
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

SQLite database stored at `data/compass.db`.

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
learning-compass/
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

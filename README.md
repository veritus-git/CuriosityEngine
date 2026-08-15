# <img src="frontend/assets/logo.png" alt="CuriosityEngine Logo" width="32" height="32" valign="middle" /> CuriosityEngine

**One interesting thing at a time.**

A personal, self-hosted learning companion that uses AI to suggest specific, focused topics to explore — based on your curiosity, learning history, and interests.

Not a course platform. Not a productivity tracker. Just a calm, beautiful engine for your daily curiosity.


## Why?

You're curious. You want to learn something new. But you often get stuck:

> "Where do I start? What's the right order? Am I missing prerequisites?"

CuriosityEngine removes that friction. Open the page, get a topic, explore it. No pressure, no streaks, no gamification.

**Structured spontaneity.**


## Features

- 🎯 **AI-powered topic suggestions** — specific concepts, not broad categories
- 🔗 **Context-aware** — suggestions build on your learning history
- 🎲 **Multiple modes** — connected, random, user-directed, or deeper exploration
- 📋 **Copy learning prompt** — one-click prompt for your favorite LLM
- 📝 **Session reflection** — capture notes, discoveries, and ratings
- 📚 **Learning archive** — browse your exploration history
- 🌙 **Beautiful dark UI** — minimal, atmospheric, mobile-first
- 🔒 **Privacy-first** — all data local, API key never touches the browser

## Requirements

- Git
- Python 3.9+
- An AI API key (OpenAI, Anthropic, or Google Gemini)

## Setup & Installation

Whether you are running this on your personal laptop or deploying to a home server, the steps are exactly the same:

```bash
# 1. Install prerequisites (Debian/Ubuntu example)
sudo apt update && sudo apt install git python3 python3-pip python3-venv

# 2. Clone the repository
git clone https://github.com/veritus-git/CuriosityEngine ~/CuriosityEngine
cd ~/CuriosityEngine

# 3. Set up Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Configure AI
cp .env.example .env
# Edit .env to add your API key:
nano .env
```

### Running Locally

To run the app interactively in your terminal:
```bash
python -m backend.server
```
Open `http://localhost:8080` in your browser. (Since the server binds to `0.0.0.0`, you can also access it from your phone on the same network via `http://<your-local-ip>:8080`).

### Running as a Background Service (Servers)

If you want it to run permanently in the background (and auto-start on boot):

1. Create a service file: `sudo nano /etc/systemd/system/curiosity-engine.service`
2. Add the following (replace `YOUR_USERNAME` with your actual Linux user, e.g. `pi` or `linux`):
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
3. Enable and start the service:
```bash
sudo systemctl enable curiosity-engine
sudo systemctl start curiosity-engine
```

## Uninstallation & Cleanup

If you want to completely remove CuriosityEngine or free up port `8080`:

**1. Stop the server & free the port**
If you ran it in the terminal and accidentally sent it to the background (e.g., by pressing `Ctrl+Z`), you can forcefully kill whatever is using port 8080:
```bash
fuser -k 8080/tcp
```

If you set it up as a systemd background service, stop and disable it:
```bash
sudo systemctl stop curiosity-engine
sudo systemctl disable curiosity-engine
sudo rm /etc/systemd/system/curiosity-engine.service
sudo systemctl daemon-reload
```

**2. Delete all files and data**
Because CuriosityEngine is completely self-contained and privacy-first, all your data (database, settings, history) is stored right inside the project folder. To wipe everything permanently, simply delete the folder:
```bash
rm -rf ~/CuriosityEngine
```



## AI Integration & Environment Variables

CuriosityEngine is designed as a standalone, customizable shell. All intelligence is driven by your preferred AI provider configured in `.env`:

| Provider | `AI_PROVIDER` | `AI_MODEL` | `AI_FALLBACK_MODEL` | `AI_EMBEDDING_MODEL` |
|----------|---------------|------------|---------------------|----------------------|
| Google Gemini (Recommended) | `gemini` | `gemini-3.7-flash` | `gemini-3.5-flash-lite` | `gemini-embedding-001` |
| OpenAI | `openai` | `gpt-4o` | `gpt-4o-mini` | `text-embedding-3-small` |
| Anthropic | `anthropic` | `claude-3-7-sonnet-20250219` | `claude-3-5-haiku-20241022` | *(Uses built-in fallback)* |

### Example `.env` Configuration:
```env
# AI Provider & Models
AI_PROVIDER=gemini
AI_MODEL=gemini-3.7-flash
AI_FALLBACK_MODEL=gemini-3.5-flash-lite
AI_EMBEDDING_MODEL=gemini-embedding-001
AI_TIMEOUT=12.0
AI_API_KEY=your-gemini-api-key-here

# Server
HOST=0.0.0.0
PORT=8080
```

You can also use any OpenAI-compatible API (Ollama, vLLM, LocalAI) by configuring `AI_BASE_URL`:
```env
AI_PROVIDER=openai
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=llama3
AI_API_KEY=ollama
```



## Database

SQLite database stored at `data/curiosity.db`.

Tables:
- `topics` — suggested, active, completed, rejected topics
- `learning_sessions` — notes, discoveries, ratings for each exploration
- `user_preferences` — preferred/disliked subjects, learning style

The database is created automatically on first run.


## Security Notes

- API key is stored in `.env` (server-side only, never sent to browser)
- `.env` is in `.gitignore`
- All AI calls happen server-side
- User input is sanitized in the frontend
- No authentication (single-user, local-only design)


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


## License

Personal project. Use however you like.

# Prediction Agent
Demostration notebook for Emeritus Agentic Course

## Getting Started
1. Download repo 
2. Install [uv](https://docs.astral.sh/uv/)
3. Run `uv sync`

We want an agent to:
1. Get live data and get this from reputable sources
2. Store any of the data that we get so that we can use if for later.
3. We'd like for the model to utilize this data for future predictions and such.
4. Adding guardrails to prevent customer misuse.
5. Add more reasoning traces for the agent to analyze responses.

## GUI

A lightweight dashboard (adapted from RocketSmith) that streams the agent's
activity live. The agent just writes files into the project directory and the
GUI reacts:

- `data/` — live data fetched from reputable sources → **data** cards
- `predictions/` — model outputs → **prediction** cards
- `reports/` — markdown write-ups → **report** cards
- `gui/logs/session.jsonl` — reasoning traces → the **Session Log**

Architecture: a Python file-watcher (`prediction_agent.gui`) polls the project
for changes and pushes them over a WebSocket to a React/Tailwind frontend. The
page runs from `file://`, so the backend only serves `/ws` and `/api`.

### Run it

```bash
# One-time: build the frontend bundle (only needed after changing web/ source)
cd src/prediction_agent/gui/web && npm install && npm run build && cd -

# Launch the dashboard for the current directory (opens a browser)
uv run python -m prediction_agent.gui .

# Stop the server
uv run python -m prediction_agent.gui . --stop
```

The built bundle is committed under `src/prediction_agent/data/gui/`, so after
`uv sync` the launcher works without the npm step.

### Auto start / stop (Claude Code hooks)

`.claude/settings.json` wires the GUI to the conversation lifecycle:

- **`UserPromptSubmit`** — if the prompt mentions pokemon / pikachu / pokeapi /
  prediction-agent, the GUI spins up (async, idempotent — reuses a running one).
- **`SessionEnd`** — spins the GUI down.

The watched directory is `gui-workspace/` (gitignored), so the agent's `data/`,
`predictions/`, and `reports/` outputs there stream into the dashboard without
polluting the repo. Adjust the keyword regex or paths in `.claude/settings.json`;
review or disable the hooks anytime with `/hooks`.

To log a reasoning trace from agent code (write into `gui-workspace/`):

```python
from pathlib import Path
from prediction_agent.gui.log import gui_log

gui_log(Path("."), "prediction", "Chose pikachu (0.72 confidence)")
```


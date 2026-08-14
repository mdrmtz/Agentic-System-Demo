"""Canonical project directory layout.

Tools/agents write their outputs into these subdirectories and the GUI
reacts to the file changes.  Every path is relative to the project root.

The prediction agent's flow maps onto three top-level buckets:

- ``data/``        — raw data fetched from reputable live sources.
- ``predictions/`` — model outputs / predictions derived from that data.
- ``gui/``         — the frontend bundle, data snapshot, and session log.
"""

# Live data fetched from external sources (e.g. PokeAPI stats).
DATA_DIR = "data"

# Model predictions / derived analysis.
PREDICTIONS_DIR = "predictions"

# Free-form markdown reports.
REPORTS_DIR = "reports"

# GUI directory — holds the frontend bundle, data snapshot, and derived data.
GUI_DIR = "gui"
GUI_PID_FILE = "gui/.gui.pid"
GUI_MAIN_JS = "gui/main.js"
GUI_DATA_JS = "gui/data.js"

# Logs directory for agentic session logs (reasoning traces).
LOGS_DIR = "gui/logs"

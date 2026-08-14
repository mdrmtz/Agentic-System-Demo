"""Launch the prediction-agent GUI.

Usage::

    uv run python -m prediction_agent.gui [PROJECT_DIR]

Copies the built React bundle into ``PROJECT_DIR``, starts the
WebSocket/API backend, and opens the dashboard in a browser.  Any file
the agent writes under ``data/``, ``predictions/``, ``reports/`` or the
session log is streamed live to the dashboard.

``PROJECT_DIR`` defaults to the current working directory.
"""

import argparse
import sys
from pathlib import Path

from prediction_agent.gui.lifecycle import start_gui_server, stop_gui_server


def main() -> None:
    parser = argparse.ArgumentParser(description="Prediction agent GUI")
    parser.add_argument(
        "project_dir",
        nargs="?",
        default=".",
        help="Project directory to watch (default: current directory).",
    )
    parser.add_argument(
        "--stop",
        action="store_true",
        help="Stop any running GUI server for the project directory.",
    )
    args = parser.parse_args()

    project_dir = Path(args.project_dir).resolve()

    if args.stop:
        killed = stop_gui_server(project_dir)
        print(f"Stopped {len(killed)} GUI process(es).")
        return

    result = start_gui_server(project_dir)
    if result["error"]:
        print(f"Error: {result['error']}", file=sys.stderr)
        sys.exit(1)

    status = "reused existing" if result["reused"] else "started"
    print(f"GUI {status} at {result['server_url']} (pid {result['pid']}).")
    print(f"Watching: {project_dir}")


if __name__ == "__main__":
    main()

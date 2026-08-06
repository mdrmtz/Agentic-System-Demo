import sys

from mcp.server import MCPServer

app = MCPServer(name="prediction-agent")

def main():
    try:
        app.run()
    except Exception as e:
        print(
            f"prediction agent MCP server error: {type(e).__name__}: {e}",
            file=sys.stderr,
        )
        sys.exit(1)

if __name__ == "__main__":
    main()


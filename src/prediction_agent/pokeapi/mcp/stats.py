from mcp.server import MCPServer

def register_pokeapi_stats(app: MCPServer):
    from typing import Union
    from prediction_agent.mcp.types import ToolSuccess, ToolError
    from prediction_agent.pokeapi.stats import get_pokemon_stats
    from prediction_agent.mcp.utils import tool_error, tool_success

    @app.tool(
        name="pokeapi_stats",
        title="PokeAPI Stats",
        description="Provides stats for pokemons.",
        structured_output=True,
    )
    def pokeapi_stats(name: str) -> Union[ToolSuccess[dict], ToolError]:
        print(name)
        try:
            response_json = get_pokemon_stats(name)
            return tool_success(response_json)
        except Exception as e:
            return tool_error(f"{e}", "GENERAL_EXCEPTION")


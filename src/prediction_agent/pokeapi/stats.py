import httpx

def get_pokemon_stats(name: str):
    response = httpx.get(f"https://pokeapi.co/api/v2/pokemon/{name}")
    print(response.json())
    return response.json()


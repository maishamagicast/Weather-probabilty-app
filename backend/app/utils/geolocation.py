import requests
from dotenv import load_dotenv
import os

load_dotenv()
GEOCODE_API = os.getenv("GEOCODE_API")  # Optional custom API key

def get_coordinates_from_place(place_name):
    """Return latitude & longitude for a given place name."""
    url = f"https://nominatim.openstreetmap.org/search?q={place_name}&format=json&limit=1"
    response = requests.get(url, headers={"User-Agent": "NASA-WeatherApp"})
    data = response.json()
    if not data:
        raise ValueError("Location not found.")
    return float(data[0]["lat"]), float(data[0]["lon"])

def validate_coordinates(lat, lon):
    """Ensure latitude and longitude are within valid range."""
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise ValueError("Invalid coordinates")
    return True

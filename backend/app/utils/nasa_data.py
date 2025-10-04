import requests
import datetime

def fetch_nasa_power_data(lat, lon, start_date, end_date, parameters):
    """Fetch data from NASA POWER API."""
    base_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start": start_date.strftime("%Y%m%d"),
        "end": end_date.strftime("%Y%m%d"),
        "parameters": ",".join(parameters),
        "community": "AG",
        "format": "JSON"
    }
    r = requests.get(base_url, params=params)
    r.raise_for_status()
    return r.json()

def extract_mean_values(nasa_json):
    """Compute mean value for each parameter."""
    data = nasa_json.get("properties", {}).get("parameter", {})
    means = {}
    for param, values in data.items():
        vals = list(values.values())
        means[param] = sum(vals) / len(vals) if vals else None
    return means

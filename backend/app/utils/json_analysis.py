import json
from statistics import mean

def analyze_weather_json(data):
    """
    Analyze NASA POWER monthly dataset and summarize per year.
    Works for both formats:
      - data["properties"]["parameter"]
      - data["details"]["properties"]["parameter"]

    Uses only the 4 parameters we fetch:
      - T2M  → Average Air Temperature (°C)
      - PRECTOTCORR → Precipitation (mm/month)
      - WS2M → Wind Speed (m/s)
      - QV2M → Specific Humidity (g/kg)
    """

    # Adjust for nested 'details' key
    if "details" in data:
        data = data["details"]

    # Handle GeoJSON-like "features" structure
    if "features" in data:
        data = data["features"][0]

    # Defensive extraction of parameters
    params = data.get("properties", {}).get("parameter")
    if not params:
        return {"error": "Invalid NASA JSON format", "keys": list(data.keys())}

    # Map NASA POWER codes → descriptive readable names
    key_map = {
        "T2M": ("temperature", "Average Air Temperature (°C)"),
        "PRECTOTCORR": ("precipitation", "Precipitation (mm/month)"),
        "WS2M": ("wind_speed", "Wind Speed (m/s)"),
        "QV2M": ("humidity", "Specific Humidity (g/kg)"),
    }

    results = {}

    # Step 1: Process monthly values
    for param_code, values in params.items():
        if param_code not in key_map:
            continue  # ignore unused NASA params if present

        internal_key, readable_label = key_map[param_code]

        for date_str, val in values.items():
            # Skip NASA’s annual summary entries (month 13)
            if date_str.endswith("13"):
                continue

            year = date_str[:4]
            month = date_str[-2:]

            if year not in results:
                # Initialize only 4 parameters
                results[year] = {
                    "temperature": {"label": "Average Air Temperature (°C)", "monthly": [], "mean": None},
                    "precipitation": {"label": "Precipitation (mm/month)", "monthly": [], "mean": None},
                    "wind_speed": {"label": "Wind Speed (m/s)", "monthly": [], "mean": None},
                    "humidity": {"label": "Specific Humidity (g/kg)", "monthly": [], "mean": None},
                }

            results[year][internal_key]["monthly"].append({
                "month": month,
                "value": round(val, 2)
            })

    # Step 2: Compute yearly means
    for year, vars_dict in results.items():
        for var, data_obj in vars_dict.items():
            if data_obj["monthly"]:
                data_obj["mean"] = round(
                    mean([m["value"] for m in data_obj["monthly"]]), 2
                )

    return results


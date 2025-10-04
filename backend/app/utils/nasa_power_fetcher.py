import requests
from datetime import datetime
import statistics
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BASE_URL = os.getenv('NASA_API')

# Mapping NASA variable codes → human-readable names
PARAMETER_MAP = {
    "T2M": "temperature",           # 2-meter air temperature
    "PRECTOTCORR": "precipitation", # Total precipitation
    "WS2M": "windspeed",            # 2-meter wind speed
    "RH2M": "humidity"              # 2-meter relative humidity
}

def fetch_nasa_power_5yr(lat, lon, month, day, year=None, parameters=None):
    """
    Fetch NASA POWER data for a specific day (month/day) across 5 years,
    then return ONLY the averages (mean values) with readable keys.

    Parameters:
        lat (float): Latitude
        lon (float): Longitude
        month (int): Month of interest (1–12)
        day (int): Day of interest (1–31)
        year (int, optional): Ignored placeholder parameter
        parameters (list, optional): NASA variable codes (defaults to all)
    """
    # ✅ 'year' parameter is intentionally ignored

    if parameters is None:
        parameters = list(PARAMETER_MAP.keys())

    current_year = datetime.now().year
    start_year = current_year - 5
    all_values = {param: [] for param in parameters}

    print(f"\n🌍 Fetching NASA POWER data for lat={lat}, lon={lon}")
    print(f"📅 Target date each year: {month:02d}-{day:02d}")
    print(f"📆 Range: {start_year} → {current_year - 1}\n")

    for yr in range(start_year, current_year):
        date_str = f"{yr}{month:02d}{day:02d}"
        url = (
            f"{BASE_URL}?parameters={','.join(parameters)}"
            f"&community=ag&longitude={lon}&latitude={lat}"
            f"&start={date_str}&end={date_str}&format=JSON"
        )

        print(f"🔹 Fetching data for {yr}-{month:02d}-{day:02d}...")

        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            json_data = response.json()
            data = json_data["properties"]["parameter"]

            for param in parameters:
                if param in data and date_str in data[param]:
                    value = data[param][date_str]
                    all_values[param].append(value)

        except Exception as e:
            print(f"[WARN] Failed for {yr}-{month:02d}-{day:02d}: {e}")

    # Compute averages (rounded)
    means = {
        PARAMETER_MAP[param]: round(statistics.mean(values), 2)
        if values else None
        for param, values in all_values.items()
    }

    print("\n📊 5-Year Averages:")
    for name, avg in means.items():
        print(f"  {name}: {avg}")

    # ✅ Return JSON with readable labels
    result = {
        "latitude": lat,
        "longitude": lon,
        "averages": means,
    }

    return json.dumps(result, indent=4)


# Example usage:
if __name__ == "__main__":
    data_json = fetch_nasa_power_5yr(lat=-1.2921, lon=36.8219, month=9, day=15, year=2020)
    print("\n✅ Final JSON Output:\n", data_json)

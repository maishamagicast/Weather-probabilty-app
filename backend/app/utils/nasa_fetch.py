import requests
from datetime import datetime

NASA_API_URL = "https://power.larc.nasa.gov/api/temporal/{temporal}/point"

# ✅ NASA POWER parameter mapping (internal readable → NASA variable code)
PARAMETER_MAP = {
    "temperature": "T2M",           # 2-meter air temperature (°C)
    "precipitation": "PRECTOTCORR", # Precipitation (mm/day)
    "humidity": "RH2M",             # Relative humidity (%)
    "wind_speed": "WS2M"            # Wind speed at 2 meters (m/s)
}


def fetch_nasa_power_data(lat, lon, start_date, end_date, temporal="daily"):
    """
    Fetch NASA POWER weather data for the given coordinates and date range.

    Args:
        lat (float): Latitude of the location.
        lon (float): Longitude of the location.
        start_date (str): Start date (YYYYMMDD).
        end_date (str): End date (YYYYMMDD).
        temporal (str): One of ["daily", "monthly", "annual"].

    Returns:
        dict: JSON response from NASA POWER API or error message.
    """
    # Ensure valid temporal type
    if temporal not in ["daily", "monthly", "annual"]:
        raise ValueError(f"Invalid temporal argument '{temporal}'. Must be 'daily', 'monthly', or 'annual'.")

    # Build API URL
    url = NASA_API_URL.format(temporal=temporal)

    # Define parameters for API request
    params = {
        "latitude": lat,
        "longitude": lon,
        "start": start_date,
        "end": end_date,
        "community": "AG",
        "parameters": ",".join(PARAMETER_MAP.values()),
        "format": "JSON"
    }

    print(f"[DEBUG] Fetching NASA POWER {temporal} data for ({lat}, {lon})")
    print(f"[DEBUG] Request parameters: {params}")

    try:
        response = requests.get(url, params=params, timeout=30)
        print(f"[DEBUG] Response status: {response.status_code}")

        if response.status_code != 200:
            return {"error": f"NASA API returned {response.status_code}", "details": response.text}

        data = response.json()

        # Validate structure
        if "properties" not in data or "parameter" not in data["properties"]:
            print("[ERROR] Invalid NASA response structure")
            return {"error": "Invalid NASA API response structure", "data": data}

        return data

    except requests.exceptions.Timeout:
        print("[ERROR] NASA API request timed out")
        return {"error": "NASA API request timed out"}
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] NASA API request failed: {e}")
        return {"error": "NASA API request failed", "details": str(e)}
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return {"error": "Unexpected error while fetching NASA POWER data", "details": str(e)}

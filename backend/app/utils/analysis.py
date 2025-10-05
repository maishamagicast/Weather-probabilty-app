import os
import requests

# Mapping internal keys to NASA POWER parameters
PARAMETER_MAP = {
    "temperature": "T2M",          # 2-meter air temperature (C)
    "precipitation": "PRECTOTCORR", # Precipitation total (mm/day)
    "humidity": "RH2M",            # Relative humidity (%)
    "wind_speed": "WS2M"           # Wind speed at 2m (m/s)
}

NASA_API_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"


def fetch_and_analyze_nasa_data(user_query, lat, lon, start_date, end_date):
    print("\n[DEBUG] Incoming user_query:", user_query)

    # Select NASA parameters
    selected_params = [PARAMETER_MAP[key] for key in user_query if key in PARAMETER_MAP]
    if not selected_params:
        return {"error": "No valid parameters selected from user query."}

    print("[DEBUG] NASA Parameters selected:", selected_params)

    params = {
        "parameters": ",".join(selected_params),
        "start": start_date,
        "end": end_date,
        "latitude": lat,
        "longitude": lon,
        "community": "AG",
        "format": "JSON"
    }

    print("[DEBUG] Sending NASA API request with params:", params)
    response = requests.get(NASA_API_URL, params=params)
    print("[DEBUG] NASA API Response Status:", response.status_code)

    # Handle non-JSON or invalid responses
    try:
        data = response.json()
    except ValueError:
        print("[ERROR] Non-JSON response from NASA:", response.text[:200])
        return {"error": "Non-JSON response from NASA.", "details": response.text}

    # Check for NASA POWER error messages
    if "errors" in data or "error" in data:
        print("[ERROR] NASA API returned error:", data)
        return {"error": "NASA API returned an error.", "details": data}

    if "properties" not in data or "parameter" not in data["properties"]:
        print("[ERROR] Invalid NASA API response structure:", data)
        return {"error": "Invalid response from NASA API.", "details": data}

    daily_data = data["properties"]["parameter"]
    print("[DEBUG] Extracted daily_data keys:", list(daily_data.keys()))

    result = {}

    # Compute probabilities
    for key, query in user_query.items():
        if key not in PARAMETER_MAP:
            continue

        try:
            value_str, direction = query.split(":")
            threshold = float(value_str)
            nasa_key = PARAMETER_MAP[key]
            values = list(daily_data[nasa_key].values())

            print(f"[DEBUG] Calculating for {key.upper()}: threshold={threshold}, direction={direction}")
            probability = calculate_probability(values, threshold, direction)
            print(f"[RESULT] {key}: {probability}%")

            result[key] = f"{probability}%"

        except ValueError:
            print(f"[ERROR] Invalid threshold format for {key}: {query}")
            result[key] = "Invalid threshold format"
        except KeyError:
            print(f"[ERROR] Missing NASA data for {key}")
            result[key] = "Data unavailable"

    return result


def calculate_probability(values, threshold, direction):
    if direction == "above":
        count = sum(1 for v in values if v > threshold)
    elif direction == "below":
        count = sum(1 for v in values if v < threshold)
    else:
        print(f"[ERROR] Invalid direction: {direction}")
        return "Invalid direction"

    total = len(values)
    print(f"[DEBUG] count = {count}, total = {total}")
    return int((count / total) * 100) if total > 0 else 0


if __name__ == "__main__":
    # Example usage
    user_query = {
        "temperature": "30:above",
        "humidity": "50:below"
    }

    lat = 34.05
    lon = -118.25
    start_date = "20220101"
    end_date = "20221231"

    print("\n--- Running NASA Data Analysis Locally ---")
    result = fetch_and_analyze_nasa_data(user_query, lat, lon, start_date, end_date)
    print("\nFinal Analysis Result:")
    print(result)

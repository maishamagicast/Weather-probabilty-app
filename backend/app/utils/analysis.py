import os
import requests

# Mapping internal keys to NASA parameter codes
PARAMETER_MAP = {
    "temperature": "T2M",
    "precipitation": "PRECTOTCORR",
    "humidity": "RH2M",
    "wind_speed": "WS2M"
}

NASA_API_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

LAT = os.getenv("LATITUDE")
LON = os.getenv("LONGITUDE")
START_DATE = os.getenv("START_DATE")
END_DATE = os.getenv("END_DATE")


def fetch_and_analyze_nasa_data(user_query, lat, lon, start_date, end_date):
    print("\n[DEBUG] Incoming user_query:", dict(user_query))

    selected_params = [PARAMETER_MAP[key] for key in user_query if key in PARAMETER_MAP]
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

    data = response.json()

    if "properties" not in data:
        print("[ERROR] Invalid NASA API response:", data)
        return {"error": "Invalid response from NASA API."}

    daily_data = data["properties"]["parameter"]
    print("[DEBUG] Extracted daily_data keys:", list(daily_data.keys()))

    result = {}

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

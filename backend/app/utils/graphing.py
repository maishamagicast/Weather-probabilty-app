import requests
from collections import defaultdict

NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/monthly/point"

def fetch_weather_trends(lat, lon, start_date, end_date):
    """
    Using NASA POWER Monthly API (as documented):
    - start and end must be **year only**, e.g. 2020, 2022
    - send valid monthly-aggregated parameter names
    """
    print("DEBUG: Starting fetch_weather_trends")
    print(f"Inputs: lat={lat}, lon={lon}, start_date={start_date}, end_date={end_date}")

    # Parse only the year portion
    try:
        start_year = int(start_date[:4])
        end_year = int(end_date[:4])
    except Exception as e:
        print("ERROR parsing year:", e)
        return {"error": f"Invalid date: {e}"}

    params = {
        "latitude": lat,
        "longitude": lon,
        "community": "AG",   # using agroclimatology community
        "format": "JSON",
        "parameters": "T2M,PRECTOTCORR,WS2M,QV2M",  # parameter choices for monthly
        "start": str(start_year),
        "end": str(end_year)
    }

    print("Request params:", params)

    try:
        response = requests.get(NASA_POWER_URL, params=params, timeout=60)
        print("Request URL:", response.url)
        print("Status code:", response.status_code)
        data = response.json()
        print("Returned keys:", list(data.keys()))
    except Exception as e:
        print("ERROR in request:", e)
        return {"error": f"NASA API request failed: {e}"}

    # Check error messages if POWER fails
    if "header" in data and "messages" in data:
        print("NASA returned error messages:")
        for m in data["messages"]:
            print(" >", m)
        return {"error": "NASA API error", "details": data}

    if "properties" not in data or "parameter" not in data["properties"]:
        print("Unexpected structure; full data:", data)
        return {"error": "Unexpected API structure", "details": data}

    parameters = data["properties"]["parameter"]
    print("Available parameters:", parameters.keys())

    key_map = {
        "T2M": "temperature (°C)",
        "PRECTOT": "precipitation (mm)",
        "WS2M": "wind speed (m/s)",
        "QV2M": "humidity (g/kg)"
    }

    results = defaultdict(lambda: defaultdict(list))
    for pcode, pvals in parameters.items():
        pname = key_map.get(pcode, pcode)
        for year_month, val in pvals.items():
            # year_month is like "2020M01"
            year = year_month[:4]
            month = year_month[-2:]
            results[pname][year].append({
                "month": month,
                "value": round(val, 2)
            })

    print("DEBUG: Completed processing.")
    return {
        "latitude": lat,
        "longitude": lon,
        "start_year": start_year,
        "end_year": end_year,
        "monthly_summary": results
    }

# fetch_weather_trends(34.05, -118.25, "2020-01-01", "2022-12-31")  # Example call
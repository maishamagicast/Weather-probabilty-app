import requests
from datetime import datetime
from predictor import classify_weather

NASA_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

def get_weather_likelihood(lat, lon, month, day):
    start = end = f"2020{month:02d}{day:02d}"

    params = {
        "start": start,
        "end": end,
        "latitude": lat,
        "longitude": lon,
        "parameters": "T2M,PRECTOT,WINDSPD,QV2M",
        "format": "JSON",
        "community": "RE",
    }

    resp = requests.get(NASA_URL, params=params)
    resp.raise_for_status()
    data = resp.json()

    # Extract parameter values
    try:
        values = data["properties"]["parameter"]
        temp = list(values["T2M"].values())[0]
        precip = list(values["PRECTOT"].values())[0]
        wind = list(values["WINDSPD"].values())[0]
        humidity = list(values["QV2M"].values())[0]
    except KeyError:
        raise Exception("NASA data missing expected fields.")

    # Compute probabilities heuristically (based on historical extremes)
    result = classify_weather(temp, precip, wind, humidity, lat, lon, month, day)
   

    return {
        "latitude": lat,
        "longitude": lon,
        "month": month,
        "day": day,
        "temperature": temp,
        "precipitation": precip,
        "windspeed": wind,
        "humidity": humidity,
        "likelihoods": result,
    }

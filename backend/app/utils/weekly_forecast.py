# app/utils/seasonal_forecast.py
import requests
import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
NASA_POWER_URL = os.getenv('NASA_API')

def get_forecast(lat, lon, days=7):
    today = datetime.date.today()
    end_date = today + datetime.timedelta(days=days)

    params = {
        "parameters": "T2M,PRECTOT",
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "start": today.strftime("%Y%m%d"),
        "end": end_date.strftime("%Y%m%d"),
        "format": "JSON"
    }

    response = requests.get(NASA_POWER_URL, params=params)
    data = response.json()

    temps = list(data["properties"]["parameter"]["T2M"].values())
    rain = list(data["properties"]["parameter"]["PRECTOT"].values())

    avg_temp = sum(temps) / len(temps)
    total_rain = sum(rain)

    # Basic summary logic
    if total_rain > 50:
        message = "Expect heavy rainfall next week — avoid fertilizer application."
    elif total_rain < 10:
        message = "Low rainfall expected — consider irrigation if possible."
    else:
        message = "Moderate rainfall expected — suitable for planting."

    return {
        "avg_temp": round(avg_temp, 1),
        "total_rainfall": round(total_rain, 1),
        "summary": message
    }


# print(get_forecast(-1.286389, 36.817223, days=7))
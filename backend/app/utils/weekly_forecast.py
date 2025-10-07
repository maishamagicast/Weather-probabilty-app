# app/utils/weekly_forecast.py
import requests
import datetime
import os
from dotenv import load_dotenv

load_dotenv()
NASA_POWER_URL = os.getenv("NASA_API")

def get_forecast(lat, lon, days=7):
    end_date = datetime.date.today() - datetime.timedelta(days=1)
    start_date = end_date - datetime.timedelta(days=days - 1)

    params = {
        "parameters": "T2M,PRECTOTCORR",
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "start": start_date.strftime("%Y%m%d"),
        "end": end_date.strftime("%Y%m%d"),
        "format": "JSON"
    }

    response = requests.get(NASA_POWER_URL, params=params)
    data = response.json()

    try:
        props = data["properties"]["parameter"]
        temps = [t for t in props["T2M"].values() if t != -999]
        rain = [r for r in props.get("PRECTOTCORR", {}).values() if r != -999]

        if not temps or not rain:
            raise ValueError("No valid data points in NASA response.")

        avg_temp = sum(temps) / len(temps)
        total_rain = sum(rain)

        advice, confidence = farm_advisor(avg_temp, total_rain)

        return {
            "avg_temp": round(avg_temp, 1),
            "total_rainfall": round(total_rain, 1),
            "advice": advice,
            "confidence": confidence,
            "start_date": str(start_date),
            "end_date": str(end_date)
        }

    except Exception as e:
        return {"error": str(e), "details": data}


def farm_advisor(avg_temp, total_rain):
    """
    Generate farm-specific recommendations based on weather data.
    Returns (advice_message, confidence_level)
    """

    # Temperature and rainfall thresholds (can be tuned for Kenyan conditions)
    TOO_HOT = 33
    IDEAL_TEMP = (20, 30)
    TOO_COLD = 15

    HIGH_RAIN = 50
    LOW_RAIN = 10

    advice = []
    confidence = "moderate"

    # --- Temperature-based analysis ---
    if avg_temp > TOO_HOT:
        advice.append("Temperatures are very high — risk of crop heat stress. Consider shading or mulching.")
    elif avg_temp < TOO_COLD:
        advice.append("Cool conditions — germination and growth may slow down. Choose cold-tolerant crops.")
    else:
        advice.append("Temperatures are within optimal range for most crops.")

    # --- Rainfall-based analysis ---
    if total_rain > HIGH_RAIN:
        advice.append("Heavy rainfall expected — avoid fertilizer application and ensure good drainage.")
    elif total_rain < LOW_RAIN:
        advice.append("Low rainfall — consider irrigation or drought-tolerant varieties.")
    else:
        advice.append("Moderate rainfall — suitable for planting or top dressing.")

    # --- Combined logic for farming actions ---
    if total_rain > 80 and avg_temp < 25:
        advice.append("High moisture and moderate temperature — fungal disease risk (watch for rust, mildew).")
    if total_rain < 5 and avg_temp > 32:
        advice.append("Hot and dry — very low yield potential. Delay planting until better conditions.")
    if 20 < total_rain < 60 and IDEAL_TEMP[0] <= avg_temp <= IDEAL_TEMP[1]:
        advice.append("Excellent growing conditions — proceed with planting or transplanting.")

    # --- Confidence scoring ---
    if (LOW_RAIN <= total_rain <= HIGH_RAIN) and (IDEAL_TEMP[0] <= avg_temp <= IDEAL_TEMP[1]):
        confidence = "high"
    elif total_rain < 5 or avg_temp > 35:
        confidence = "low"

    final_advice = " ".join(advice)
    return final_advice, confidence


# Example test
if __name__ == "__main__":
    print("\n--- Weekly Farm Forecast ---")
    forecast = get_forecast(-1.286389, 36.817223, days=7)
    print(forecast)

# print(get_forecast(-1.286389, 36.817223, days=14))

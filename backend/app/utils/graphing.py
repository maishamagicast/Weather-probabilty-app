from datetime import datetime, timedelta
from app.utils.nasa_fetch import fetch_nasa_power_data
import requests

PARAMETER_MAP = {
    "temperature": "T2M",
    "humidity": "RH2M",
    "precipitation": "PRECTOTCORR",
    "wind_speed": "WS2M"
}


def fetch_weather_trends(lat, lon, start_date, end_date):
    """
    Fetch NASA POWER weather data (daily, monthly, yearly)
    for multiple key parameters across specified time ranges.

    Args:
        lat (float): Latitude
        lon (float): Longitude
        start_date (str): e.g. "20200101"
        end_date (str): e.g. "20251005"

    Returns:
        dict: Structured weather data for plotting and analysis.
    """
    try:
        # Convert strings → datetime objects
        start_dt = datetime.strptime(start_date, "%Y%m%d")
        end_dt = datetime.strptime(end_date, "%Y%m%d")

        print(f"\n📡 Fetching weather data for lat={lat}, lon={lon}")
        print(f"🗓️ Date range: {start_date} → {end_date}")

        # 1️⃣ DAILY data
        daily_json = fetch_nasa_power_data(lat, lon, start_date, end_date, temporal="daily")
        daily_data = {}
        if "properties" in daily_json and "parameter" in daily_json["properties"]:
            param_data = daily_json["properties"]["parameter"]
            all_dates = list(param_data[PARAMETER_MAP["temperature"]].keys())
            daily_data["dates"] = all_dates
            for name, nasa_key in PARAMETER_MAP.items():
                daily_data[name] = list(param_data.get(nasa_key, {}).values())

        print(f"✅ Fetched {len(daily_data.get('dates', []))} daily records")

        # 2️⃣ MONTHLY data (past 5 years)
        end_monthly = datetime.now()
        start_monthly = end_monthly - timedelta(days=5 * 365)
        monthly_json = fetch_nasa_power_data(
            lat, lon,
            start_monthly.strftime("%Y%m%d"),
            end_monthly.strftime("%Y%m%d"),
            temporal="monthly"
        )

        monthly_data = {}
        if "properties" in monthly_json and "parameter" in monthly_json["properties"]:
            monthly_param_data = monthly_json["properties"]["parameter"]
            months = list(monthly_param_data[PARAMETER_MAP["temperature"]].keys())
            monthly_data["months"] = months
            for name, nasa_key in PARAMETER_MAP.items():
                monthly_data[name] = list(monthly_param_data.get(nasa_key, {}).values())

        print(f"✅ Fetched {len(monthly_data.get('months', []))} monthly records")

        # 3️⃣ YEARLY data (past 10 years)
        end_yearly = datetime.now()
        start_yearly = end_yearly - timedelta(days=10 * 365)
        yearly_json = fetch_nasa_power_data(
            lat, lon,
            start_yearly.strftime("%Y%m%d"),
            end_yearly.strftime("%Y%m%d"),
            temporal="annual"
        )

        yearly_data = {}
        if "properties" in yearly_json and "parameter" in yearly_json["properties"]:
            yearly_param_data = yearly_json["properties"]["parameter"]
            years = list(yearly_param_data[PARAMETER_MAP["temperature"]].keys())
            yearly_data["years"] = years
            for name, nasa_key in PARAMETER_MAP.items():
                yearly_data[name] = list(yearly_param_data.get(nasa_key, {}).values())

        print(f"✅ Fetched {len(yearly_data.get('years', []))} yearly records")

        # 4️⃣ Compute means
        mean_data = {}
        for name in PARAMETER_MAP.keys():
            values = daily_data.get(name, [])
            if values:
                mean_data[name] = round(sum(values) / len(values), 2)
            else:
                mean_data[name] = None

        print(f"📊 Mean data: {mean_data}")

        # ✅ Final structured output
        result = {
            "coordinates": {"lat": lat, "lon": lon},
            "time_range": {"start": start_date, "end": end_date},
            "daily_data": daily_data,
            "monthly_5yr_data": monthly_data,
            "yearly_10yr_data": yearly_data,
            "mean_data": mean_data
        }

        print("\n🎯 WEATHER TREND SUMMARY READY ✅")
        return result

    except Exception as e:
        print(f"❌ Error: {e}")
        return {"error": str(e)}


# Example usage for testing
if __name__ == "__main__":
    data = fetch_weather_trends(
        lat=34.05,
        lon=-118.25,
        start_date="20200101",
        end_date="20251005"
    )
    print("\n🧾 FINAL RESULT SAMPLE KEYS:")
    print(data.keys())

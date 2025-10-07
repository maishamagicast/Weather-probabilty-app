from flask import Blueprint, request, jsonify
from app.utils.nasa_power_fetcher import fetch_nasa_power_5yr
from app.utils.weekly_forecast import get_forecast
from app.utils.analysis import fetch_and_analyze_nasa_data
from app.utils.graphing import fetch_weather_trends
from app.utils.json import analyze_weather_json


dashboard_bp = Blueprint("dashboard_bp", __name__)

@dashboard_bp.route("/data", methods=["POST"])
def get_nasa_data():
    """
    Route for fetching NASA POWER climate data averages.
    Expects JSON input with: month, day, year, latitude, longitude
    """
    data = request.get_json()

    # Validate required fields
    required_fields = ["month", "day", "year", "latitude", "longitude"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        lat = float(data["latitude"])
        lon = float(data["longitude"])
        month = int(data["month"])
        day = int(data["day"])
        year = int(data["year"])  # ignored by function, but accepted

        # Fetch the NASA data
        result_json = fetch_nasa_power_5yr(lat=lat, lon=lon, month=month, day=day, year=year)

        return jsonify({
            "message": "Data fetched successfully",
            "data": result_json
        }), 200

    except ValueError:
        return jsonify({"error": "Invalid latitude, longitude, or date values"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@dashboard_bp.route("/forecast", methods=["POST"])
def seasonal_forecast():
    """
    Fetch short-term (7–30 days) NASA POWER weather forecast for a given location.
    Expects JSON:
    {
        "latitude": -1.286389,
        "longitude": 36.817223,
        "days": 7
    }
    """
    data = request.get_json()

    if not data or "latitude" not in data or "longitude" not in data:
        return jsonify({"error": "Missing latitude or longitude"}), 400

    lat = float(data["latitude"])
    lon = float(data["longitude"])
    days = int(data.get("days", 7))  # default to 7-day forecast

    try:
        result = get_forecast(lat, lon, days)
        return jsonify({
            "message": f"{days}-day forecast retrieved successfully.",
            "data": result
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    



@dashboard_bp.route("/analysis-results", methods=["POST", "OPTIONS"])
def get_analysis_results():
    if request.method == "OPTIONS":
        # Handle preflight CORS request
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        return response, 200

    # Handle POST request
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    lat = data.pop("latitude", None)
    lon = data.pop("longitude", None)
    start_date = data.pop("start_date", None)
    end_date = data.pop("end_date", None)

    if not lat or not lon or not start_date or not end_date:
        return jsonify({
            "error": "Missing required fields: latitude, longitude, start_date, end_date"
        }), 400

    if not data:
        return jsonify({"error": "No thresholds provided in the body"}), 400

    try:
        print("[INFO] Fetching and analyzing NASA data...")
        result = fetch_and_analyze_nasa_data(data, lat, lon, start_date, end_date)

        # If NASA API returned an error message, expose it clearly
        if isinstance(result, dict) and "error" in result:
            print("[ERROR] NASA API returned:", result)
            response = jsonify({
                "error": result["error"],
                "details": result.get("details", "See server logs for more info.")
            })
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 502  # external API failure

        response = jsonify(result)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("[EXCEPTION] /analysis-results failed:", str(e))
        response = jsonify({"error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500
    
@dashboard_bp.route("/nasa-graphing", methods=["POST", "OPTIONS"])
def get_weather_trends():
    """Fetch and summarize NASA POWER monthly weather data."""
    if request.method == "OPTIONS":
        response = jsonify({"message": "CORS preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response, 200

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    lat = data.get("latitude")
    lon = data.get("longitude")
    start_date = str(data.get("start_date"))[:4]  # ✅ only year (YYYY)
    end_date = str(data.get("end_date"))[:4]      # ✅ only year (YYYY)

    if not all([lat, lon, start_date, end_date]):
        return jsonify({
            "error": "Missing required fields: latitude, longitude, start_date, end_date"
        }), 400

    try:
        # ✅ NASA Monthly API expects YYYY format for annual/monthly data
        nasa_raw = fetch_weather_trends(lat, lon, start_date, end_date)

        # Handle NASA API errors
        if "header" in nasa_raw and "messages" in nasa_raw:
            return jsonify({
                "error": "NASA POWER API returned an error.",
                "details": nasa_raw.get("messages", [])
            }), 502

        # Analyze JSON
        analyzed = analyze_weather_json(nasa_raw)

        response = jsonify({
            "message": "Weather trends successfully fetched and analyzed.",
            "coordinates": {"latitude": lat, "longitude": lon},
            "data": analyzed
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500

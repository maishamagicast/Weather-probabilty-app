from flask import Blueprint, request, jsonify
from app.utils.nasa_power_fetcher import fetch_nasa_power_5yr
from app.utils.weekly_forecast import get_forecast
from app.utils.analysis import fetch_and_analyze_nasa_data


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
    
    
from flask import Blueprint, request, jsonify

dashboard_bp = Blueprint("dashboard", __name__)

from flask import request

@dashboard_bp.route("/analysis-results", methods=["POST", "OPTIONS"])
def get_analysis_results():
    if request.method == "OPTIONS":
        # Handle preflight CORS request
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        return response, 200

    # Handle actual POST request
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    lat = data.pop("latitude", None)
    lon = data.pop("longitude", None)
    start_date = data.pop("start_date", None)
    end_date = data.pop("end_date", None)

    if not lat or not lon or not start_date or not end_date:
        return jsonify({"error": "Missing required fields: latitude, longitude, start_date, end_date"}), 400

    if not data:
        return jsonify({"error": "No thresholds provided in the body"}), 400

    try:
        result = fetch_and_analyze_nasa_data(data, lat, lon, start_date, end_date)
        response = jsonify(result)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 200
    except Exception as e:
        response = jsonify({"error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

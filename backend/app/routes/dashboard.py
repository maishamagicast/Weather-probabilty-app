from flask import Blueprint, request, jsonify
from app.utils.nasa_power_fetcher import fetch_nasa_power_5yr

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

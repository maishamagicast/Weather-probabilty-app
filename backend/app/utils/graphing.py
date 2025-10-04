from flask import Blueprint, request, jsonify
from datetime import datetime
from app.utils.geolocation import get_coordinates_from_place, validate_coordinates
from app.utils.nasa_data import fetch_nasa_power_data
from app.utils.predictor import compute_likelihoods

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/analyze", methods=["POST"])
def analyze_weather():
    """
    Expected JSON:
    {
        "place": "Nairobi, Kenya",
        "start_date": "2024-05-01",
        "end_date": "2024-05-07",
        "parameters": ["T2M", "WS2M", "PRECTOTCORR", "RH2M"]
    }
    """
    try:
        data = request.get_json()
        place = data.get("place")
        start_date = datetime.strptime(data.get("start_date"), "%Y-%m-%d")
        end_date = datetime.strptime(data.get("end_date"), "%Y-%m-%d")
        parameters = data.get("parameters", ["T2M", "WS2M", "PRECTOTCORR", "RH2M"])

        # 1️⃣ Convert place name → coordinates
        lat, lon = get_coordinates_from_place(place)
        validate_coordinates(lat, lon)

        # 2️⃣ Fetch NASA weather data
        nasa_json = fetch_nasa_power_data(lat, lon, start_date, end_date, parameters)
        if "properties" not in nasa_json or "parameter" not in nasa_json["properties"]:
            return jsonify({"error": "No data found for this region or time range."}), 404

        param_data = nasa_json["properties"]["parameter"]

        # 3️⃣ Structure data for frontend
        # Example: {"T2M": [22.1, 24.3, 23.8], "dates": ["2024-05-01", "2024-05-02", "2024-05-03"]}
        all_dates = list(param_data[parameters[0]].keys())
        structured = {"dates": all_dates}
        for param in parameters:
            structured[param] = list(param_data[param].values())

        # 4️⃣ Compute mean values
        mean_data = {
            param: round(sum(values) / len(values), 2)
            for param, values in structured.items() if param != "dates"
        }

        # 5️⃣ Predict weather likelihoods
        likelihoods = compute_likelihoods(mean_data)

        # 6️⃣ Farmer-friendly summary
        summary = []
        if likelihoods["very_wet"] > 0.5:
            summary.append("🌧️ High chance of rain — consider preparing drainage or rain storage.")
        if likelihoods["very_hot"] > 0.5:
            summary.append("☀️ Hot days expected — ensure crops are well irrigated.")
        if likelihoods["very_cold"] > 0.5:
            summary.append("🥶 Possible cold conditions — protect seedlings or livestock.")
        if likelihoods["very_windy"] > 0.5:
            summary.append("💨 Windy conditions likely — secure light structures or nets.")
        if likelihoods["very_uncomfortable"] > 0.5:
            summary.append("💦 Humid days ahead — monitor for crop fungal infections.")

        if not summary:
            summary.append("🌤️ Conditions look stable — good time for routine farm work.")

        # 7️⃣ Final response for frontend
        return jsonify({
            "location": place,
            "coordinates": {"lat": lat, "lon": lon},
            "time_range": {
                "start": start_date.strftime("%Y-%m-%d"),
                "end": end_date.strftime("%Y-%m-%d")
            },
            "structured_data": structured,     # ✅ ready for plotting
            "mean_data": mean_data,             # ✅ summary stats
            "likelihoods": likelihoods,         
            "summary": summary                  
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

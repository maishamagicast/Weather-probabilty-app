from flask import Blueprint, request, jsonify
from datetime import datetime
from app.utils.geolocation import get_coordinates_from_place, validate_coordinates
from app.utils.nasa_data import fetch_nasa_power_data, extract_mean_values
from app.utils.predictor import compute_likelihoods  # renamed from weather_analysis for clarity

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
    data = request.get_json()
    place = data.get("place")
    start_date = datetime.strptime(data.get("start_date"), "%Y-%m-%d")
    end_date = datetime.strptime(data.get("end_date"), "%Y-%m-%d")
    parameters = data.get("parameters", ["T2M", "WS2M", "PRECTOTCORR", "RH2M"])

    lat, lon = get_coordinates_from_place(place)
    validate_coordinates(lat, lon)

    nasa_json = fetch_nasa_power_data(lat, lon, start_date, end_date, parameters)
    mean_data = extract_mean_values(nasa_json)
    likelihoods = compute_likelihoods(mean_data)

    # Simple descriptive summary
    simple_summary = []
    if likelihoods.get("very_wet", 0) > 50:
        simple_summary.append("It will probably rain or be quite wet.")
    if likelihoods.get("very_hot", 0) > 50:
        simple_summary.append("Expect hot weather.")
    if likelihoods.get("very_cold", 0) > 50:
        simple_summary.append("It may be unusually cold.")
    if likelihoods.get("very_windy", 0) > 50:
        simple_summary.append("It could be windy.")
    if likelihoods.get("very_uncomfortable", 0) > 50:
        simple_summary.append("The humidity may feel uncomfortable.")
    if not simple_summary:
        simple_summary.append("Weather conditions look mostly comfortable.")

    return jsonify({
        "location": place,
        "coordinates": {"lat": lat, "lon": lon},
        "mean_data": mean_data,
        "likelihoods": likelihoods,
        "summary": " ".join(simple_summary)
    }), 200

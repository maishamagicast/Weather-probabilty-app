from flask import Blueprint, request, jsonify
import random
from datetime import datetime

prediction_bp = Blueprint("prediction", __name__)


@prediction_bp.route("/analyze", methods=["POST"])
def analyze_weather():
    """
    Endpoint that simulates weather probability analysis
    based on selected variables and thresholds from frontend.
    """

    data = request.get_json()
    selected_variables = data.get("selectedVariables", [])
    thresholds = data.get("thresholds", [])
    selected_date = data.get("selectedDate")

    # Simulated variables data
    weather_variables = {
        "temperature": {"unit": "°C", "base": 25},
        "precipitation": {"unit": "mm", "base": 50},
        "humidity": {"unit": "%", "base": 65},
        "wind": {"unit": "m/s", "base": 4}
    }

    results = []
    for variable in selected_variables:
        var_info = weather_variables.get(variable)
        threshold = next((t for t in thresholds if t["variable"] == variable), None)

        probability = random.randint(20, 95)
        mean = round(random.uniform(var_info["base"] - 5, var_info["base"] + 5), 1)

        # 10-year sample historical data
        historical_data = []
        for i in range(10):
            year = datetime.now().year - i
            historical_data.append({
                "year": year,
                "value": round(random.uniform(var_info["base"] - 7, var_info["base"] + 7), 1),
                "date": f"{year}-{selected_date}"
            })

        results.append({
            "variable": variable,
            "probability": probability,
            "mean": mean,
            "threshold": threshold.get("value") if threshold else 30,
            "operator": threshold.get("operator") if threshold else "above",
            "historicalData": historical_data,
            "unit": var_info["unit"]
        })

    return jsonify({
        "date": selected_date,
        "results": results,
        "status": "success"
    })

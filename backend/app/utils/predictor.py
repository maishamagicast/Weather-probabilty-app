def classify_weather(temp, precip, wind, humidity, lat, lon, month, day):
    """
    Classify weather likelihoods for farming guidance.
    Returns both numeric likelihoods and agricultural recommendations.
    """

    likelihoods = {}

    # Base probabilities (0–1 scale)
    likelihoods["very_hot"] = min(round(max(0, (temp - 30) / 20), 2), 1)
    likelihoods["very_cold"] = min(round(max(0, (15 - temp) / 15), 2), 1)
    likelihoods["very_windy"] = min(round(max(0, (wind - 8) / 10), 2), 1)
    likelihoods["very_wet"] = min(round(max(0, precip / 20), 2), 1)
    discomfort_index = temp + (0.1 * humidity)
    likelihoods["very_uncomfortable"] = min(round(max(0, (discomfort_index - 35) / 10), 2), 1)

    # 🌾 AGRICULTURAL INTERPRETATION
    insights = []

    if likelihoods["very_wet"] > 0.6:
        insights.append("High chance of rainfall — consider reducing irrigation and check drainage in low-lying fields.")
    elif 0.3 < likelihoods["very_wet"] <= 0.6:
        insights.append("Moderate rainfall likely — useful for newly planted crops but monitor soil moisture.")
    else:
        insights.append("Low rainfall expected — plan for irrigation if planting or during flowering stages.")

    if likelihoods["very_hot"] > 0.6:
        insights.append("High heat expected — irrigate early mornings or evenings to reduce evaporation.")
    elif 0.3 < likelihoods["very_hot"] <= 0.6:
        insights.append("Warm conditions — suitable for crops like maize and beans if water is sufficient.")
    else:
        insights.append("Cool temperatures — good for vegetables or cereal crops in early stages.")

    if likelihoods["very_cold"] > 0.5:
        insights.append("Cold conditions could slow crop growth — consider mulching or crop covers for young plants.")

    if likelihoods["very_windy"] > 0.5:
        insights.append("Windy conditions expected — support weak-stem crops and avoid pesticide spraying.")

    if likelihoods["very_uncomfortable"] > 0.5:
        insights.append("High humidity — increased risk of fungal diseases; apply preventive fungicide if necessary.")

    # Regionally contextual (optional, could expand later)
    if lat < 0 and month in [3, 4, 11, 12]:
        insights.append("This period is part of the rainy season in many East African regions — plan fieldwork accordingly.")

    return {
        "likelihoods": {k: round(v * 100, 1) for k, v in likelihoods.items()},
        "advice": insights
    }


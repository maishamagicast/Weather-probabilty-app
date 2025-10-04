import os

from flask import Flask, jsonify, request
from dotenv import load_dotenv
import requests
from pymongo import MongoClient
import earthaccess

auth = earthaccess.login(strategy="netrc")
load_dotenv()
app = Flask(__name__)

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_database("weatherdb")
weather_collection = db.get_collection("weather_history")

API_KEY = os.getenv("EARTHACCESS_API_KEY")

@app.route("/api/weather", methods=["GET"])
def get_weather():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    url = f"https://api.earthaccess.org/weather?lat={lat}&lon={lon}&key={API_KEY}"
    res = requests.get(url).json()

    # Save to MongoDB
    record = {
        "lat": lat,
        "lon": lon,
        "weather": res,
    }
    weather_collection.insert_one(record)

    return jsonify(res)

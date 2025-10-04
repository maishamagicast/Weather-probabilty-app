from flask import Flask
from mongoengine import connect
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

connect(
    db=os.getenv("MONGO_DB_NAME", "weather_app"),
    host=os.getenv("MONGO_URI", "mongodb://localhost:27017/weather_app")
)

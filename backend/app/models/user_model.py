"""
mongo_models.py (extended with utility helpers)

Includes:
- Database connection
- MongoEngine models (User, SavedLocation, Query, CachedNASAData, LikelihoodResult)
- Utility functions for:
  - Date normalization
  - Coordinate rounding (to help caching)
  - Threshold-based weather classification
  - Probability scaling and rounding
  - Random test data generation (for local testing)
"""

import os
import datetime
import random
from typing import Optional, Dict, Any, Tuple

from mongoengine import (
    connect,
    Document,
    EmbeddedDocument,
    StringField,
    EmailField,
    DateTimeField,
    FloatField,
    IntField,
    EmbeddedDocumentField,
    ReferenceField,
    DictField,
)

# ---------------------- DB connection ----------------------
def connect_db():
    MONGO_URI = os.getenv("MONGO_URI")
    if MONGO_URI:
        connect(host=MONGO_URI)
    else:
        connect(db=os.getenv("MONGO_DB", "climascope"))


# ---------------------- Utilities ----------------------
def normalize_date(date: Any) -> datetime.datetime:
    if isinstance(date, str):
        return datetime.datetime.fromisoformat(date)
    elif isinstance(date, datetime.date) and not isinstance(date, datetime.datetime):
        return datetime.datetime.combine(date, datetime.time.min)
    return date


def round_coordinates(lat: float, lon: float, precision: int = 2) -> Tuple[float, float]:
    """Round coordinates for caching (0.01 ≈ ~1 km)."""
    return round(lat, precision), round(lon, precision)


def probability_scale(value: float, min_val: float, max_val: float) -> float:
    """Normalize value to [0,1] range given thresholds."""
    if value <= min_val:
        return 0.0
    if value >= max_val:
        return 1.0
    return round((value - min_val) / (max_val - min_val), 2)


def classify_weather(temp: float, precip: float, wind: float, humidity: float) -> Dict[str, float]:
    """Heuristic classification of weather probabilities."""
    return {
        "very_hot": probability_scale(temp, 30, 45),
        "very_cold": probability_scale(15 - temp, -15, 0),
        "very_windy": probability_scale(wind, 8, 20),
        "very_wet": probability_scale(precip, 5, 50),
        "very_uncomfortable": probability_scale(temp + (0.1 * humidity), 35, 45),
    }


def random_weather_data() -> Dict[str, float]:
    """Generate random weather data (for testing without NASA API)."""
    return {
        "T2M": round(random.uniform(10, 40), 2),
        "PRECTOT": round(random.uniform(0, 30), 2),
        "WINDSPD": round(random.uniform(0, 15), 2),
        "QV2M": round(random.uniform(5, 30), 2),
    }


def format_likelihood_response(lat: float, lon: float, date: datetime.datetime, nasa_data: Dict[str, float], likelihoods: Dict[str, float]) -> Dict[str, Any]:
    """Prepare structured JSON output for the frontend."""
    return {
        "latitude": lat,
        "longitude": lon,
        "date": date.strftime("%Y-%m-%d"),
        "temperature": nasa_data.get("T2M"),
        "precipitation": nasa_data.get("PRECTOT"),
        "windspeed": nasa_data.get("WINDSPD"),
        "humidity": nasa_data.get("QV2M"),
        "likelihoods": likelihoods,
    }


# ---------------------- Models ----------------------
class Coordinates(EmbeddedDocument):
    lat = FloatField(required=True)
    lon = FloatField(required=True)


class NASAParameters(EmbeddedDocument):
    t2m = FloatField()
    prectot = FloatField()
    windspd = FloatField()
    qv2m = FloatField()
    raw = DictField()


class User(Document):
    email = EmailField(required=True, unique=True)
    name = StringField()
    created_at = DateTimeField(default=datetime.datetime.utcnow)


class SavedLocation(Document):
    user = ReferenceField("User", required=False, reverse_delete_rule=2)
    name = StringField()
    coords = EmbeddedDocumentField(Coordinates, required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)


class Query(Document):
    user = ReferenceField("User", required=False, reverse_delete_rule=2)
    location = EmbeddedDocumentField(Coordinates, required=True)
    date = DateTimeField(required=True)
    day_of_year = IntField(required=True)
    month = IntField(required=True)
    thresholds = DictField()
    cached_result = ReferenceField("LikelihoodResult", required=False)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    status = StringField(default="pending")

    @classmethod
    def create_from_payload(cls, lat: float, lon: float, date: Any, user: Optional[User] = None, thresholds: Optional[Dict] = None):
        date_dt = normalize_date(date)
        day_of_year = int(date_dt.timetuple().tm_yday)
        month = int(date_dt.month)
        q = cls(
            user=user,
            location=Coordinates(lat=lat, lon=lon),
            date=date_dt,
            day_of_year=day_of_year,
            month=month,
            thresholds=thresholds or {},
        )
        q.save()
        return q


class CachedNASAData(Document):
    location = EmbeddedDocumentField(Coordinates, required=True)
    date = DateTimeField(required=True)
    parameters = EmbeddedDocumentField(NASAParameters)
    raw = DictField()
    fetched_at = DateTimeField(default=datetime.datetime.utcnow)

    @classmethod
    def get(cls, lat: float, lon: float, date: Any):
        date_dt = normalize_date(date)
        return cls.objects(location__lat=lat, location__lon=lon, date=date_dt).first()

    @classmethod
    def upsert(cls, lat: float, lon: float, date: Any, parameters: Dict[str, Any], raw: Optional[Dict] = None):
        date_dt = normalize_date(date)
        params_doc = NASAParameters(
            t2m=parameters.get("T2M"),
            prectot=parameters.get("PRECTOT"),
            windspd=parameters.get("WINDSPD"),
            qv2m=parameters.get("QV2M"),
            raw=raw or {},
        )
        obj = cls.objects(location__lat=lat, location__lon=lon, date=date_dt).modify(
            upsert=True,
            new=True,
            set__parameters=params_doc,
            set__raw=raw or {},
            set__fetched_at=datetime.datetime.utcnow(),
        )
        return obj


class LikelihoodResult(Document):
    query = ReferenceField(Query, required=False)
    location = EmbeddedDocumentField(Coordinates, required=True)
    date = DateTimeField(required=True)
    likelihoods = DictField(required=True)
    inputs = EmbeddedDocumentField(NASAParameters)
    computed_at = DateTimeField(default=datetime.datetime.utcnow)

    @classmethod
    def create_from_calculation(cls, query: Query, lat: float, lon: float, date: Any, likelihoods: Dict[str, float], inputs: Dict[str, Any]):
        date_dt = normalize_date(date)
        inputs_doc = NASAParameters(
            t2m=inputs.get("T2M"),
            prectot=inputs.get("PRECTOT"),
            windspd=inputs.get("WINDSPD"),
            qv2m=inputs.get("QV2M"),
            raw=inputs.get("raw", {}),
        )
        res = cls(
            query=query,
            location=Coordinates(lat=lat, lon=lon),
            date=date_dt,
            likelihoods=likelihoods,
            inputs=inputs_doc,
        )
        res.save()
        if query:
            query.cached_result = res
            query.status = "computed"
            query.save()
        return res



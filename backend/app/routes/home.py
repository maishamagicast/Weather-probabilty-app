from flask import Blueprint, jsonify

home_bp = Blueprint("home", __name__)

@home_bp.route("/")
def home():
    return jsonify({
        "message": "🌦️ Welcome to the NASA Weather Likelihood API",
        "endpoints": {
            "signup": "/auth/signup",
            "login": "/auth/login",
            "dashboard": "/dashboard/analyze"
        }
    })

from flask import Blueprint, request, jsonify
from extensions import db
from app.models.user_model import User
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from datetime import timedelta
from flask import current_app
from sqlalchemy.exc import IntegrityError
auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")


# -------------------------
# REGISTER USER
# -------------------------
@auth_bp.route("/register", methods=["POST"])
def register_user():
    """
    Register a new user.
    Expected JSON:
    {
        "username": "johndoe",
        "email": "john@example.com",
        "password": "securepassword"
    }
    """
    data = request.get_json()

    if not data or not all(k in data for k in ("username", "email", "password")):
        return jsonify({"error": "Missing required fields"}), 400

    username = data["username"].strip()
    email = data["email"].strip().lower()
    password = data["password"]

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    try:
        new_user = User(username=username, email=email)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "User registered successfully!",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "created_at": new_user.created_at.isoformat()
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500


# -------------------------
# LOGIN USER
# -------------------------
@auth_bp.route("/login", methods=["POST"])
def login_user():
    """
    Log in a user.
    Expected JSON:
    {
        "email": "john@example.com",
        "password": "securepassword"
    }
    """
    data = request.get_json()

    if not data or not all(k in data for k in ("email", "password")):
        return jsonify({"error": "Missing email or password"}), 400

    email = data["email"].strip().lower()
    password = data["password"]

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Create JWT token (expires in 2 hours)
    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(hours=2)
    )

    return jsonify({
        "message": "Login successful!",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }), 200


# -------------------------
# PROTECTED TEST ROUTE
# -------------------------
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_profile():
    """Get logged-in user's profile"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat()
    })


#==================
# DEMO USER 
#==================
@auth_bp.route("/demo", methods=["GET"])
def demo_login():
    """
    Instantly log in as the demo user — no registration required.
    If the demo user doesn't exist, create it once.
    """

    demo_email = "demo@nasaapp.com"
    demo_username = "demo_user"
    demo_password = "demo1234"

    # Check if user exists
    demo_user = User.query.filter_by(email=demo_email).first()

    # Create once if missing
    if not demo_user:
        demo_user = User(username=demo_username, email=demo_email)
        demo_user.set_password(demo_password)
        db.session.add(demo_user)
        db.session.commit()

    # Auto-login with JWT token
    access_token = create_access_token(
        identity=demo_user.id,
        expires_delta=timedelta(hours=2)
    )

    return jsonify({
        "message": "Demo user logged in successfully",
        "access_token": access_token,
        "user": {
            "id": demo_user.id,
            "username": demo_user.username,
            "email": demo_user.email
        }
    }), 200
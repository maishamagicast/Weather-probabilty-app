from flask import Flask
from flask_cors import CORS
from extensions import db  # make sure you have this file with db = SQLAlchemy()
from app.routes.user import auth_bp
from app.routes.dashboard import dashboard_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Example configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app/weather.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/dashboard")

    with app.app_context():
        db.create_all()

    return app


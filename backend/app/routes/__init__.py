from flask import Flask
from flask_cors import CORS
from app.models import connect_db
from app.routes.home import home_bp
from app.routes.user import auth_bp
from app.routes.dashboard import dashboard_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["MONGODB_URI"] = "your_mongo_uri_here"
    connect_db(app.config["MONGODB_URI"])

    app.register_blueprint(home_bp)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/dashboard")

    return app

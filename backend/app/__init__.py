import os
from flask import Flask
from flask_cors import CORS
from extensions import db,jwt
from app.routes.user import auth_bp
from app.routes.dashboard import dashboard_bp
# from app.routes.prediction import prediction_bp
from app.config import DevConfig



def create_app():
    app = Flask(__name__)
    app.config.from_object(DevConfig)
    CORS(
        app,
        resources={r"/*": {"origins": '*'}},
        supports_credentials=False,  # set True only if using cookies/sessions
        allow_headers=["Content-Type", "Authorization"],  # ✅ JWT-safe
        expose_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    jwt.init_app(app)

    basedir = os.path.abspath(os.path.dirname(__file__))
    db_dir = os.path.join(basedir, "instances")
    os.makedirs(db_dir, exist_ok=True)  # make sure the folder exists
    db_path = os.path.join(db_dir, "weather.db")

    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "supersecretkey"

    db.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/dashboard")
    # app.register_blueprint(prediction_bp, url_prefix="/prediction")

    with app.app_context():
        db.create_all()

    return app



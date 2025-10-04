import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-super-secret")
    DEBUG = False


class DevConfig(Config):
    DEBUG = True


class ProdConfig(Config):
    DEBUG = False

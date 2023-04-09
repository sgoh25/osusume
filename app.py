import os

from datetime import timedelta
from flask import Flask
from flask_jwt_extended import JWTManager

from api import db
from api import auth
from api import post


def create_app():
    api = Flask(__name__)
    api.config.from_mapping(
        JWT_SECRET_KEY="dev",  # TBD!!
        DATABASE=os.path.join(api.instance_path, "database.sqlite"),
    )
    api.config.from_pyfile("config.py", silent=True)
    api.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=10)
    jwt = JWTManager(api)

    try:
        os.makedirs(api.instance_path)
    except OSError:
        pass

    # Initialize database clean up handler
    db.init_api(api)

    # Initialize authentication pages
    api.register_blueprint(auth.bp)

    # Initialize post pages
    api.register_blueprint(post.bp)

    return api

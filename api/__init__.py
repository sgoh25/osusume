import os

from flask import Flask
from flask_jwt_extended import JWTManager

from . import db
from . import auth


def create_app():
    api = Flask(__name__)
    api.config.from_mapping(
        JWT_SECRET_KEY="dev",  # TBD!!
        DATABASE=os.path.join(api.instance_path, "database.sqlite"),
    )
    api.config.from_pyfile("config.py", silent=True)
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

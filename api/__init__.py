import os

from flask import Flask
from flask_jwt_extended import JWTManager

from . import db
from . import auth


def create_app():
    app = Flask(__name__)
    app.config.from_mapping(
        JWT_SECRET_KEY="dev",  # TBD!!
        DATABASE=os.path.join(app.instance_path, "database.sqlite"),
    )
    app.config.from_pyfile("config.py", silent=True)
    jwt = JWTManager(app)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Initialize database clean up handler
    db.init_app(app)

    # Initialize authentication pages
    app.register_blueprint(auth.bp)

    return app

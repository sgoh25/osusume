import os

from datetime import timedelta
from flask import Flask
from flask_jwt_extended import JWTManager

from . import db
from . import auth
from . import post


def create_app():
    api = Flask(__name__)
    api.config.from_mapping(
        JWT_SECRET_KEY="GlMotYTJtzN5ExizvMDVTJvS9cKFaWiz42oFPskCXlD/OxzlsmyAfd+C8jvFzG99Wh8vfLMMav5QrmqWuWZ8RxliKZNqLq220zhWkPWVmJcajV6SDgkfC6eC+vwX6P2s9FyteFNOhbko2gbTi6YZBdepH1VWIw64GDN7LaiwtJxb3xg1S085VkPwIlhfxoOr6JUhP5XzClClCJ/sCT3mWfmnzthSOOXbn9okQbvLx90UMueetesNVrxaMZoM2T8c4x1cEDX+/NZW1AiPDQgXwg7rDdVRbf0+hssQqv5uC2JdwKQtYT68cO61nB4Q1kQDeaEiJVCl06Vp/EaMEoOuag",
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

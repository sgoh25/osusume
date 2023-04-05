import functools
import json

from flask import (
    Blueprint,
    flash,
    g,
    redirect,
    request,
    session,
    url_for,
)
from werkzeug.security import check_password_hash, generate_password_hash

from api.db import get_db

bp = Blueprint("auth", __name__, url_prefix="/auth")


@bp.route("/register", methods=["POST"])
def register():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    db = get_db()
    error = None

    if not username:
        error = "Username is required."
    elif not password:
        error = "Password is required."

    if error is None:
        try:
            db.execute(
                "INSERT INTO user (username, password) VALUES (?, ?)",
                (username, generate_password_hash(password)),
            )
            db.commit()
        except db.IntegrityError:
            error = f"User '{username}' is already registered."
        else:
            return {"msg": f"Account created with username '{username}'"}

    return {"msg": error}, 401

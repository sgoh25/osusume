import sys
import time

from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
    unset_jwt_cookies,
)
from werkzeug.security import check_password_hash, generate_password_hash

from api.db import get_db

bp = Blueprint("auth", __name__, url_prefix="/auth")


def get_expiration():
    now = datetime.now() + timedelta(minutes=10)
    return int(time.mktime(now.timetuple())) * 1000


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
            return {"msg": f"Account created"}

    return {"msg": error}, 401


@bp.route("/login", methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    db = get_db()
    error = None
    user = db.execute("SELECT * FROM user WHERE username = ?", (username,)).fetchone()

    if user is None:
        error = "Incorrect username."
    elif not check_password_hash(user["password"], password):
        error = "Incorrect password."

    if error is None:
        access_token = create_access_token(identity=username)
        return {
            "access_token": access_token,
            "access_expiration": get_expiration(),
            "msg": f"Login successful",
        }

    return {"msg": error}, 401


@bp.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "Logout successful"})
    unset_jwt_cookies(response)
    return response


@bp.route("/settings", methods=["GET", "POST", "DELETE"])
@jwt_required()
def settings():
    db = get_db()
    user = db.execute(
        "SELECT * FROM user WHERE username = ?", (get_jwt_identity(),)
    ).fetchone()

    if request.method == "GET":
        return {"username": get_jwt_identity()}
    elif request.method == "POST":
        curr_password = request.json.get("curr_password", None)
        new_password = request.json.get("new_password", None)

        if not check_password_hash(user["password"], curr_password):
            return {"msg": "Incorrect password"}, 400

        db.execute(
            "UPDATE user SET password = ? WHERE id = ?",
            (generate_password_hash(new_password), user["id"]),
        )
        db.commit()
        access_token = create_access_token(identity=get_jwt_identity())
        return {
            "access_token": access_token,
            "access_expiration": get_expiration(),
            "msg": "Password successfully changed!",
        }
    elif request.method == "DELETE":
        try:
            db.execute("DELETE from user where id = ?", (user["id"],))
            db.commit()
            return {"msg": "User deleted"}
        except Exception as e:
            return {"msg", e}
    return {}

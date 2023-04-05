import json
import sys

from datetime import datetime, timedelta, timezone
from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)

from api.auth import get_expiration
from api.db import get_db

bp = Blueprint("post", __name__, url_prefix="/post")


def get_user_id(username):
    db = get_db()
    user_info = db.execute(
        "SELECT * FROM user WHERE username = ?", (username,)
    ).fetchone()
    return user_info["id"]


@bp.after_request
def refresh_expiring_token(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=8))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if isinstance(data, dict):
                data["access_token"] = access_token
                data["access_expiration"] = get_expiration()
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        return response


@bp.route("/all", methods=["GET"])
def get_all():
    db = get_db()
    data = db.execute("SELECT * FROM post").fetchmany(10)
    posts = json.dumps([tuple(row) for row in data], default=str)
    if not posts:
        return {}
    return {"posts": posts}


@bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    db = get_db()
    user_id = get_user_id(get_jwt_identity())
    data = db.execute("SELECT * FROM post WHERE author_id = ?", (user_id,)).fetchall()
    posts = json.dumps([tuple(row) for row in data], default=str)
    if not posts:
        return {}
    return {"posts": posts}


@bp.route("/create", methods=["POST"])
@jwt_required()
def create_post():
    title = request.json.get("title", None)
    description = request.json.get("description", None)
    parameters = request.json.get("parameters", None)
    db = get_db()
    error = None

    if not title:
        error = "Title is required."

    if error is None:
        try:
            author = get_jwt_identity()
            author_id = get_user_id(author)
            db.execute(
                "INSERT INTO post (author_id, author, created, title, description, parameters) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    author_id,
                    author,
                    datetime.now().replace(second=0, microsecond=0),
                    title,
                    description,
                    parameters,
                ),
            )
            db.commit()
        except Exception as e:
            error = e
        else:
            return {"msg": "New post created"}
    return {"msg": error}

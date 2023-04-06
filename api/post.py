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


def parse_row_data(data, columns):
    posts = []
    for row in data:
        row_dict = {}
        for col, val in zip(columns, row):
            row_dict[col] = val
        posts.append(row_dict)
    if not posts:
        return {"posts": []}
    return {"posts": posts}


@bp.route("/home", methods=["GET"])
def get_home_posts():
    db = get_db()
    cursor = db.execute("SELECT * FROM post ORDER BY created DESC")
    data = cursor.fetchmany(10)
    columns = [desc[0] for desc in cursor.description]
    return parse_row_data(data, columns)


@bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile_posts():
    db = get_db()
    user_id = get_user_id(get_jwt_identity())
    cursor = db.execute(
        "SELECT * FROM post WHERE author_id = ? ORDER BY created DESC", (user_id,)
    )
    data = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    return parse_row_data(data, columns)


@bp.route("/create", methods=["POST"])
@jwt_required()
def create_post():
    title = request.json.get("title", None)
    description = request.json.get("description", None)
    tag = request.json.get("tag", None)
    db = get_db()
    error = None

    if not title:
        error = "Title is required."

    if error is None:
        try:
            author = get_jwt_identity()
            author_id = get_user_id(author)
            db.execute(
                "INSERT INTO post (author_id, author, created, title, description, tag) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    author_id,
                    author,
                    datetime.now(),
                    title,
                    description,
                    tag,
                ),
            )
            db.commit()
        except Exception as e:
            error = e
        else:
            return {"msg": "New post created"}
    return {"msg": error}


@bp.route("/<int:post_id>", methods=["POST", "GET", "DELETE"])
@jwt_required()
def post(post_id):
    db = get_db()
    if request.method == "DELETE":
        try:
            db.execute("DELETE from post where id = ?", (post_id,))
            db.commit()
            print(get_profile_posts(), file=sys.stdout)
            return {
                "msg": "Post deleted",
                "profile_posts": get_profile_posts()["posts"],
                "home_posts": get_home_posts()["posts"],
            }
        except Exception as e:
            return {"msg", e}
    elif request.method == "GET":
        row_data = {}
        try:
            cursor = db.execute("SELECT * FROM post WHERE id = ?", (post_id,))
            data = cursor.fetchone()
            columns = [desc[0] for desc in cursor.description]
            for col, val in zip(columns, data):
                row_data[col] = val
            return row_data
        except Exception as e:
            return {"msg", e}
    elif request.method == "POST":
        title = request.json.get("title", None)
        description = request.json.get("description", None)
        tag = request.json.get("tag", None)
        error = None

        if not title:
            error = "Title is required."

        if error is None:
            try:
                db.execute(
                    "UPDATE post SET created = ?, title = ?, description = ?, tag = ? WHERE id = ?",
                    (datetime.now(), title, description, tag, post_id),
                )
                db.commit()
            except Exception as e:
                error = e
            else:
                return {"msg": "Post updated"}
        return {"msg": error}
    return {}

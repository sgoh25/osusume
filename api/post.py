import json
import sys

from datetime import datetime, timedelta, timezone
from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
    verify_jwt_in_request,
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


def parse_row(row, columns, user_id):
    row_dict = {}
    for col, val in zip(columns, row):
        row_dict[col] = val
    row_dict["canEdit"] = row_dict["author_id"] == user_id
    return row_dict


def parse_row_data(data, columns, user_id, isComment=False):
    key = "posts"
    if isComment:
        key = "comments"
    posts = []
    if isinstance(data, dict):
        parse_row(data, columns, user_id)
    else:
        for row in data:
            posts.append(parse_row(row, columns, user_id))
    if not posts:
        return {key: []}
    return {key: posts}


def get_posts(table, condition, user_id, pg_num, isComment=False):
    db = get_db()
    offset = (pg_num - 1) * 5
    cursor = db.execute(
        f"SELECT * FROM {table} {condition} ORDER BY created DESC LIMIT 5 OFFSET {offset}"
    )
    data = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    response = parse_row_data(data, columns, user_id, isComment)
    response["total_rows"] = db.execute(
        f"SELECT COUNT(*) FROM {table} {condition}"
    ).fetchone()[0]
    return response


@bp.route("/home/<int:pg_num>", methods=["GET"])
def get_home_posts(pg_num):
    return get_posts("post", "", None, pg_num)


@bp.route("/home/<tag_id>/<int:pg_num>", methods=["GET"])
def get_tag_posts(tag_id, pg_num):
    return get_posts("post", f"WHERE tag = '{tag_id}'", None, pg_num)


@bp.route("/profile/posts/<int:pg_num>", methods=["GET"])
@jwt_required()
def get_profile_posts(pg_num):
    user_id = get_user_id(get_jwt_identity())
    return get_posts("post", f"WHERE author_id = {user_id}", user_id, pg_num)


@bp.route("/profile/comments/<int:pg_num>", methods=["GET"])
@jwt_required()
def get_profile_comments(pg_num):
    user_id = get_user_id(get_jwt_identity())
    return get_posts(
        "comment", f"WHERE author_id = {user_id}", user_id, pg_num, isComment=True
    )


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


@bp.route("/<int:post_id>", methods=["GET"])
def get_post(post_id):
    db = get_db()
    try:
        verify_jwt_in_request()
        user_id = get_user_id(get_jwt_identity())
    except:
        user_id = None
    try:
        cursor = db.execute("SELECT * FROM post WHERE id = ?", (post_id,))
        data = cursor.fetchone()
        columns = [desc[0] for desc in cursor.description]
        return parse_row(data, columns, user_id)
    except Exception as e:
        return {"msg", e}


@bp.route("/<int:post_id>", methods=["POST"])
@jwt_required()
def update_post(post_id):
    db = get_db()
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

@bp.route("/<int:post_id>/<int:pg_num>", methods=["DELETE"])
@jwt_required()
def delete_post(post_id, pg_num):
    db = get_db()
    try:
        db.execute("DELETE from post where id = ?", (post_id,))
        db.commit()
        profile_dict = get_profile_posts(pg_num)
        return {
            "msg": "Post deleted",
            "profile_posts": profile_dict["posts"],
            "total_rows": profile_dict["total_rows"],
        }
    except Exception as e:
        return {"msg", e}


@bp.route("/<int:post_id>/comment", methods=["POST"])
@jwt_required()
def make_comment(post_id):
    comment = request.json.get("comment", None)
    db = get_db()
    error = None

    if not comment:
        error = "Comment cannot be empty."

    if error is None:
        try:
            author = get_jwt_identity()
            author_id = get_user_id(author)
            db.execute(
                "INSERT INTO comment (post_id, author_id, author, created, comment, score) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    post_id,
                    author_id,
                    author,
                    datetime.now(),
                    comment,
                    0,
                ),
            )
            db.commit()
        except Exception as e:
            error = e
        else:
            comment_dict = get_comments(post_id, 1)
            return {
                "msg": "New comment created",
                "comments": comment_dict["comments"],
                "total_rows": comment_dict["total_rows"],
            }
    return {"msg": error}


@bp.route("/<int:post_id>/comment/<int:pg_num>", methods=["GET"])
def get_comments(post_id, pg_num):
    db = get_db()
    offset = (pg_num - 1) * 5
    try:
        verify_jwt_in_request()
        user_id = get_user_id(get_jwt_identity())
    except:
        user_id = None
    cursor = db.execute(
        "SELECT * FROM comment WHERE post_id = ? ORDER BY score DESC, created DESC LIMIT 5 OFFSET ?",
        (post_id, offset),
    )
    data = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    response = parse_row_data(data, columns, user_id, isComment=True)
    response["total_rows"] = db.execute(
        f"SELECT COUNT(*) FROM comment WHERE post_id = ?", (post_id,)
    ).fetchone()[0]
    return response


@bp.route("/<int:post_id>/comment/<int:comment_id>/<int:pg_num>", methods=["DELETE"])
@jwt_required()
def delete_comment(post_id, comment_id, pg_num):
    db = get_db()
    try:
        db.execute("DELETE from comment where id = ?", (comment_id,))
        db.commit()
        comment_dict = get_comments(post_id, pg_num)
        profile_comment_dict = get_profile_comments(pg_num)
        return {
            "msg": "Post deleted",
            "post_comments": comment_dict["comments"],
            "profile_comments": profile_comment_dict["comments"],
            "total_rows": comment_dict["total_rows"],
            "total_profile_rows": profile_comment_dict["total_rows"],
        }
    except Exception as e:
        return {"msg", e}


@bp.route("/<int:post_id>/comment/<int:comment_id>/vote", methods=["GET"])
def get_vote(post_id, comment_id):
    db = get_db()
    try:
        verify_jwt_in_request()
        user_id = get_user_id(get_jwt_identity())
        cursor = db.execute(
            "SELECT * FROM vote WHERE post_id = ? AND comment_id = ? AND author_id = ?",
            (post_id, comment_id, user_id),
        )
        data = cursor.fetchone()
        columns = [desc[0] for desc in cursor.description]
        response = {"voteScore": 0}
        if data:
            row = parse_row(data, columns, user_id)
            response["voteScore"] = row["score"]
        return response
    except Exception as e:
        return {"msg", e}


@bp.route("/<int:post_id>/comment/<int:comment_id>/vote", methods=["POST", "DELETE"])
@jwt_required()
def do_vote(post_id, comment_id):
    if request.method == "DELETE":
        author_id = get_user_id(get_jwt_identity())
        db = get_db()
        try:
            db.execute(
                "DELETE from vote where post_id = ? AND comment_id = ? AND author_id = ?",
                (post_id, comment_id, author_id),
            )
            db.commit()
            return {"msg": "Vote deleted"}
        except Exception as e:
            return {"msg", e}
    elif request.method == "POST":
        score = request.json.get("score", None)
        next_vote = request.json.get("next_vote", None)
        prev_vote = request.json.get("prev_vote", None)
        author_id = get_user_id(get_jwt_identity())
        db = get_db()
        try:
            voteScore = get_vote(post_id, comment_id)["voteScore"]
            if voteScore == 0:
                if prev_vote + next_vote != 0:
                    db.execute(
                        "INSERT INTO vote (post_id, comment_id, author_id, score) VALUES (?, ?, ?, ?)",
                        (post_id, comment_id, author_id, next_vote),
                    )
                db.execute(
                    "UPDATE comment SET score = ? WHERE post_id = ? AND id = ?",
                    (score, post_id, comment_id),
                )
                db.commit()
                return {"msg": "Vote casted"}
            return {"msg": "Already voted"}, 400
        except Exception as e:
            return {"msg", e}
    return {}


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

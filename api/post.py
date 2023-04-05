import json

from datetime import datetime, timedelta, timezone
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    unset_jwt_cookies,
    jwt_required,
    JWTManager,
)
from werkzeug.security import check_password_hash, generate_password_hash

from api.db import get_db

bp = Blueprint("post", __name__, url_prefix="/post")


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
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        return response


@bp.route("/profile")
@jwt_required()
def get_profile():
    db = get_db()
    posts = db.execute(
        "SELECT * FROM post WHERE username = ?", (get_jwt_identity(),)
    ).fetchall()

    if posts is None:
        return {}
    return {"posts": posts}

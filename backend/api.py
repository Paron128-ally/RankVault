import os
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import check_password_hash

import db
import content as ct

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static"),
)

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "*")
CORS(app, resources={r"/api/*": {"origins": FRONTEND_ORIGIN}}, supports_credentials=False)

db.init_db()


#Auth helpers
def current_student_id():
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    return db.get_student_id_for_token(token)


def token_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        sid = current_student_id()
        if not sid:
            return jsonify({"error": "unauthorized"}), 401
        return view(sid, *args, **kwargs)
    return wrapped


#Auth routes
@app.route("/api/auth/roster", methods=["GET"])
def roster():
    """Public: lets the login screen offer quick-login options, like the Jinja version did."""
    return jsonify({"roster": db.get_all_students(), "demo_password": db.DEMO_PASSWORD})


@app.route("/api/auth/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    enrollment = (body.get("enrollment") or "").strip()
    password = (body.get("password") or "").strip()

    student = db.get_student_by_enrollment(enrollment)
    if not student or not check_password_hash(student["password_hash"], password):
        return jsonify({"error": "Invalid enrollment ID or password."}), 401

    token = db.create_token(student["id"])
    student = {k: v for k, v in student.items() if k != "password_hash"}
    return jsonify({"token": token, "student": student})


@app.route("/api/auth/logout", methods=["POST"])
@token_required
def logout(sid):
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    db.delete_token(token)
    return jsonify({"ok": True})


@app.route("/api/auth/me", methods=["GET"])
@token_required
def me(sid):
    return jsonify({"student": db.get_student_by_id(sid)})


#Dashboard
@app.route("/api/dashboard", methods=["GET"])
@token_required
def dashboard(sid):
    stats = ct.get_student_stats(sid)
    weak_chapters = ct.get_weak_chapters(sid, count=2)
    return jsonify({
        "stats": stats,
        "weak_chapters": weak_chapters,
        "test_name": ct.CURRENT_TEST_NAME,
        "last_attempt": db.get_last_attempt(sid),
    })


#Packages (CPP)
@app.route("/api/packages", methods=["GET"])
@token_required
def packages(sid):
    stats = ct.get_student_stats(sid)
    return jsonify({
        "subjects": ct.SUBJECTS,
        "cpp_bank": ct.CPP_BANK,
        "workbooks": ct.WORKBOOKS,
        "stats": stats,
        "practiced": sorted(db.get_practiced_set(sid)),
    })


@app.route("/api/packages/practiced", methods=["POST"])
@token_required
def toggle_practiced(sid):
    body = request.get_json(silent=True) or {}
    chapter_id = body.get("chapterId")
    problem_id = body.get("problemId")
    done = bool(body.get("done"))
    if not chapter_id or not problem_id:
        return jsonify({"error": "chapterId and problemId are required"}), 400
    db.set_practiced(sid, chapter_id, problem_id, done)
    return jsonify({"ok": True, "practiced": sorted(db.get_practiced_set(sid))})


#ectures
@app.route("/api/lectures", methods=["GET"])
@token_required
def lectures(sid):
    lectures_list = []
    for lec in ct.LECTURES:
        lec = dict(lec)
        progress = db.get_lecture_progress(sid, lec["id"])
        lec["watched"] = progress if progress is not None else 0
        lectures_list.append(lec)
    return jsonify({"lectures": lectures_list})


@app.route("/api/lectures/progress", methods=["POST"])
@token_required
def save_lecture_progress(sid):
    body = request.get_json(silent=True) or {}
    lecture_id = body.get("lectureId")
    watched_sec = int(body.get("watchedSec") or 0)
    if not lecture_id:
        return jsonify({"error": "lectureId is required"}), 400
    db.set_lecture_progress(sid, lecture_id, watched_sec)
    return jsonify({"ok": True})


#myPlan
@app.route("/api/myplan", methods=["GET"])
@token_required
def myplan(sid):
    stats = ct.get_student_stats(sid)
    return jsonify({"subjects": ct.SUBJECTS, "stats": stats})


#Test engine
@app.route("/api/test-engine", methods=["GET"])
@token_required
def test_engine(sid):
    # Never send the `answer` field to the client before submission.
    questions = [{k: v for k, v in q.items() if k != "answer"} for q in ct.ENGINE_QUESTIONS]
    return jsonify({
        "questions": questions,
        "test_name": ct.CURRENT_TEST_NAME,
        "duration_sec": ct.CURRENT_TEST_DURATION_SEC,
    })


@app.route("/api/test-engine/submit", methods=["POST"])
@token_required
def submit_test(sid):
    body = request.get_json(silent=True) or {}
    answers = body.get("answers") or {}  # { "1": 2, "2": null, ... } question id -> selected option index

    correct = incorrect = unattempted = 0
    score = 0
    review = []
    for q in ct.ENGINE_QUESTIONS:
        selected = answers.get(str(q["id"]))
        if selected is None:
            unattempted += 1
        elif selected == q["answer"]:
            correct += 1
            score += 4
        else:
            incorrect += 1
            score -= 1
        review.append({
            "id": q["id"], "text": q["text"], "options": q["options"],
            "answer": q["answer"], "selected": selected,
        })

    max_score = len(ct.ENGINE_QUESTIONS) * 4
    db.save_test_attempt(sid, ct.CURRENT_TEST_NAME, score, max_score, correct, incorrect, unattempted)
    return jsonify({
        "score": score, "max_score": max_score,
        "correct": correct, "incorrect": incorrect, "unattempted": unattempted,
        "review": review,
    })


@app.route("/api/test-engine/history", methods=["GET"])
@token_required
def test_history(sid):
    return jsonify({"history": db.get_attempt_history(sid)})


#Health check (useful for Render/Railway)
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)

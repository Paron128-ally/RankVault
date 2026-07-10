import os
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash

import db
import content as ct
from werkzeug.security import check_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static"),
)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-change-me-in-production")
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

db.init_db()


# Auth helpers
def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("student_id"):
            return redirect(url_for("login", next=request.path))
        return view(*args, **kwargs)
    return wrapped


def current_student():
    sid = session.get("student_id")
    if not sid:
        return None
    try:
        return db.get_student_by_id(sid)
    except Exception:
        return None


@app.context_processor
def inject_student():
    # Safe contextual wrapper to prevent dashboard thread crashes
    student = current_student()
    streak = None
    if student:
        try:
            # Safely handle both standard dictionaries and sqlite Row objects
            student_id = student.get("id") if isinstance(student, dict) else student["id"]
            streak = ct.get_student_stats(student_id).get("streak", 0)
        except Exception:
            streak = 0
    return {"student": student, "streak": streak}


#Auth routes
@app.route("/login", methods=["GET", "POST"])
def login():
    if current_student():
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        enrollment = request.form.get("enrollment", "").strip()
        password = request.form.get("password", "").strip()

        student = db.get_student_by_enrollment(enrollment)
        if student and check_password_hash(student["password_hash"], password):
            session.clear()
            session["student_id"] = student["id"]
            
            next_page = request.args.get("next")
            if next_page and next_page.startswith("/"):
                return redirect(next_page)
            return redirect(url_for("dashboard"))

        flash("Invalid enrollment ID or password.")
        return redirect(url_for("login"))

    # Pass roster to populate quick-login options on the login screen
    roster = db.get_all_students()
    return render_template("login.html", roster=roster, demo_password=db.DEMO_PASSWORD)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


#App Workspace Module Routing
@app.route("/")
@app.route("/dashboard")
@login_required
def dashboard():
    sid = session["student_id"]
    stats = ct.get_student_stats(sid)
    weak_ch = ct.get_weak_chapters(sid, count=2)
    return render_template(
        "dashboard.html",
        stats=stats,
        weak_chapters=weak_ch,
        test_name=ct.CURRENT_TEST_NAME,
        active="dashboard"
    )


@app.route("/packages")
@login_required
def packages():
    sid = session["student_id"]
    stats = ct.get_student_stats(sid)
    return render_template(
        "packages.html",
        subjects=ct.SUBJECTS,
        cpp_bank=ct.CPP_BANK,
        workbooks=ct.WORKBOOKS,
        stats=stats,
        active="packages"
    )


@app.route("/lectures")
@login_required
def lectures():
    # Sync progress from SQLite layer
    lectures_list = list(ct.LECTURES)
    for lec in lectures_list:
        progress = db.get_lecture_progress(session["student_id"], lec["id"])
        lec["watched"] = progress if progress is not None else 0

    return render_template("lectures.html", lectures=lectures_list, active="lectures")


@app.route("/api/lecture-progress", methods=["POST"])
@login_required
def api_lecture_progress():
    data = request.get_json(force=True)
    lecture_id = data.get("lecture_id")
    watched_sec = data.get("watched_sec", 0)
    if lecture_id:
        db.set_lecture_progress(session["student_id"], lecture_id, watched_sec)
        return jsonify({"status": "success"})
    return jsonify({"status": "error", "message": "Missing fields"}), 400


@app.route("/test-engine")
@login_required
def test_engine():
    return render_template(
        "test_engine.html",
        questions=ct.ENGINE_QUESTIONS,
        test_name=ct.CURRENT_TEST_NAME,
        duration_sec=ct.CURRENT_TEST_DURATION_SEC,
        active="test_engine",
    )


@app.route("/api/submit-test", methods=["POST"])
@login_required
def api_submit_test():
    data = request.get_json(force=True)
    answers = data.get("answers", {})  # {question_id: selected_index}
    correct = incorrect = 0
    for q in ct.ENGINE_QUESTIONS:
        qid = str(q["id"])
        if qid not in answers:
            continue
        if answers[qid] == q["answer"]:
            correct += 1
        else:
            incorrect += 1
    unattempted = len(ct.ENGINE_QUESTIONS) - correct - incorrect
    score = correct * 4 - incorrect * 1
    max_score = len(ct.ENGINE_QUESTIONS) * 4
    db.save_test_attempt(
        session["student_id"], ct.CURRENT_TEST_NAME, score, max_score, correct, incorrect, unattempted
    )
    return jsonify({
        "score": score, "max_score": max_score,
        "correct": correct, "incorrect": incorrect, "unattempted": unattempted,
    })


@app.route("/myplan")
@login_required
def myplan():
    sid = session["student_id"]
    stats = ct.get_student_stats(sid)
    return render_template("myplan.html", subjects=ct.SUBJECTS, stats=stats, active="myplan")


if __name__ == "__main__":
    app.run(debug=True, port=5500)

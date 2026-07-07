# ===========================================================
# AscentPrep — SQLite data access layer
# Real student rows with hashed passwords, and a table that
# persists test attempts across logins (the actual payoff of
# having a backend instead of just a client-side profile switch).
# ===========================================================
import sqlite3
from pathlib import Path
from werkzeug.security import generate_password_hash

DB_PATH = Path(__file__).parent / "instance" / "ascentprep.db"
DEMO_PASSWORD = "ascent123"  # same for every seeded account — shown on the login page

STUDENTS_SEED = [
    ("stu01", "Aarav Mehta",     "AP24-1182", 12, "JEE Main & Advanced", "Kandivali Centre"),
    ("stu02", "Diya Sharma",     "AP24-1183", 12, "JEE Main & Advanced", "Kandivali Centre"),
    ("stu03", "Vihaan Kulkarni", "AP24-1184", 11, "JEE Main & Advanced", "Andheri Centre"),
    ("stu04", "Ananya Iyer",     "AP24-1185", 11, "BITSAT", "Andheri Centre"),
    ("stu05", "Reyansh Joshi",   "AP24-1186", 12, "JEE Main & Advanced", "Bandra Centre"),
    ("stu06", "Ishita Verma",    "AP24-1187", 10, "NTSE", "Andheri Centre"),
    ("stu07", "Kabir Nair",      "AP24-1188", 12, "BITSAT", "Bandra Centre"),
    ("stu08", "Saanvi Rao",      "AP24-1189", 9,  "Foundation", "Kandivali Centre"),
    ("stu09", "Arjun Deshmukh",  "AP24-1190", 11, "JEE Main & Advanced", "Andheri Centre"),
    ("stu10", "Myra Patil",      "AP24-1191", 12, "JEE Main & Advanced", "Bandra Centre"),
    ("stu11", "Vivaan Gupta",    "AP24-1192", 10, "NTSE", "Andheri Centre"),
    ("stu12", "Anika Reddy",     "AP24-1193", 12, "BITSAT", "Andheri Centre"),
    ("stu13", "Aditya Bhat",     "AP24-1194", 11, "JEE Main & Advanced", "Kandivali Centre"),
    ("stu14", "Kiara Menon",     "AP24-1195", 9,  "Foundation", "Andheri Centre"),
    ("stu15", "Sai Pillai",      "AP24-1196", 12, "JEE Main & Advanced", "Kandivali Centre"),
    ("stu16", "Riya Choudhary",  "AP24-1197", 11, "BITSAT", "Bandra Centre"),
    ("stu17", "Yash Agarwal",    "AP24-1198", 10, "NTSE", "Andheri Centre"),
    ("stu18", "Tara Krishnan",   "AP24-1199", 12, "JEE Main & Advanced", "Andheri Centre"),
    ("stu19", "Dhruv Malhotra",  "AP24-1200", 11, "JEE Main & Advanced", "Bandra Centre"),
    ("stu20", "Naina Sinha",     "AP24-1201", 12, "BITSAT", "Andheri Centre"),
]


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS students (
            id            TEXT PRIMARY KEY,
            name          TEXT NOT NULL,
            enrollment    TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            grade         INTEGER NOT NULL,
            track         TEXT NOT NULL,
            centre        TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS test_attempts (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id    TEXT NOT NULL REFERENCES students(id),
            test_name     TEXT NOT NULL,
            score         INTEGER NOT NULL,
            max_score     INTEGER NOT NULL,
            correct_ct    INTEGER NOT NULL,
            incorrect_ct  INTEGER NOT NULL,
            unattempted   INTEGER NOT NULL,
            taken_at      TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS lecture_progress (
            student_id    TEXT NOT NULL REFERENCES students(id),
            lecture_id    TEXT NOT NULL,
            watched_sec   INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (student_id, lecture_id)
        );
        CREATE TABLE IF NOT EXISTS auth_tokens (
            token         TEXT PRIMARY KEY,
            student_id    TEXT NOT NULL REFERENCES students(id),
            created_at    TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS cpp_practiced (
            student_id    TEXT NOT NULL REFERENCES students(id),
            chapter_id    TEXT NOT NULL,
            problem_id    TEXT NOT NULL,
            PRIMARY KEY (student_id, chapter_id, problem_id)
        );
    """)
    count = conn.execute("SELECT COUNT(*) c FROM students").fetchone()["c"]
    if count == 0:
        pw_hash = generate_password_hash(DEMO_PASSWORD)
        conn.executemany(
            "INSERT INTO students (id, name, enrollment, password_hash, grade, track, centre) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            [(sid, name, enr, pw_hash, grade, track, centre)
             for sid, name, enr, grade, track, centre in STUDENTS_SEED],
        )
        conn.commit()
    conn.close()


def get_student_by_id(student_id: str):
    conn = get_conn()
    row = conn.execute("SELECT * FROM students WHERE id = ?", (student_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_student_by_enrollment(enrollment: str):
    conn = get_conn()
    row = conn.execute("SELECT * FROM students WHERE enrollment = ? COLLATE NOCASE", (enrollment.strip(),)).fetchone()
    conn.close()
    return dict(row) if row else None


def list_students():
    conn = get_conn()
    rows = conn.execute("SELECT id, name, enrollment, grade, track, centre FROM students ORDER BY name").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def save_test_attempt(student_id, test_name, score, max_score, correct_ct, incorrect_ct, unattempted):
    conn = get_conn()
    conn.execute(
        "INSERT INTO test_attempts (student_id, test_name, score, max_score, correct_ct, incorrect_ct, unattempted) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (student_id, test_name, score, max_score, correct_ct, incorrect_ct, unattempted),
    )
    conn.commit()
    conn.close()


def get_last_attempt(student_id):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM test_attempts WHERE student_id = ? ORDER BY taken_at DESC LIMIT 1", (student_id,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_attempt_history(student_id, limit=10):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM test_attempts WHERE student_id = ? ORDER BY taken_at DESC LIMIT ?", (student_id, limit)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def set_lecture_progress(student_id, lecture_id, watched_sec):
    conn = get_conn()
    conn.execute(
        "INSERT INTO lecture_progress (student_id, lecture_id, watched_sec) VALUES (?, ?, ?) "
        "ON CONFLICT(student_id, lecture_id) DO UPDATE SET watched_sec = excluded.watched_sec",
        (student_id, lecture_id, watched_sec),
    )
    conn.commit()
    conn.close()


def get_lecture_progress(student_id, lecture_id):
    """Fetches the watched duration in seconds for a specific student and lecture."""
    conn = get_conn()
    row = conn.execute(
        "SELECT watched_sec FROM lecture_progress WHERE student_id = ? AND lecture_id = ?",
        (student_id, lecture_id)
    ).fetchone()
    conn.close()
    return row["watched_sec"] if row else 0

def get_all_students():
    """Fetches all seeded student accounts from the database to populate the login page options."""
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, enrollment, name, grade, track, centre FROM students ORDER BY id ASC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ---------- Token auth (for the JSON API / decoupled frontend) -----------
def create_token(student_id: str) -> str:
    import secrets
    token = secrets.token_urlsafe(32)
    conn = get_conn()
    conn.execute("INSERT INTO auth_tokens (token, student_id) VALUES (?, ?)", (token, student_id))
    conn.commit()
    conn.close()
    return token


def get_student_id_for_token(token: str):
    if not token:
        return None
    conn = get_conn()
    row = conn.execute("SELECT student_id FROM auth_tokens WHERE token = ?", (token,)).fetchone()
    conn.close()
    return row["student_id"] if row else None


def delete_token(token: str):
    conn = get_conn()
    conn.execute("DELETE FROM auth_tokens WHERE token = ?", (token,))
    conn.commit()
    conn.close()


# ---------- CPP subjective "marked practiced" persistence -----------------
def get_practiced_set(student_id: str) -> set:
    conn = get_conn()
    rows = conn.execute(
        "SELECT chapter_id, problem_id FROM cpp_practiced WHERE student_id = ?", (student_id,)
    ).fetchall()
    conn.close()
    return {f"{r['chapter_id']}:{r['problem_id']}" for r in rows}


def set_practiced(student_id: str, chapter_id: str, problem_id: str, done: bool):
    conn = get_conn()
    if done:
        conn.execute(
            "INSERT OR IGNORE INTO cpp_practiced (student_id, chapter_id, problem_id) VALUES (?, ?, ?)",
            (student_id, chapter_id, problem_id),
        )
    else:
        conn.execute(
            "DELETE FROM cpp_practiced WHERE student_id = ? AND chapter_id = ? AND problem_id = ?",
            (student_id, chapter_id, problem_id),
        )
    conn.commit()
    conn.close()

# app.py
from flask import Flask, jsonify, request, Blueprint
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
import os
import json
import re
import math
from difflib import SequenceMatcher
from urllib.parse import quote_plus
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

from backend.api.database import (
    SessionLocal, init_db, User, College, PGListing, SafetyReport, UserType, UserStatus, GenderPreference, PropertyType
)

# ============================================================
# Flask App Setup
# ============================================================

def _load_local_env():
    """Load simple KEY=VALUE pairs from nearby .env files if present."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    env_files = [
        os.path.join(base_dir, ".env"),
        os.path.join(base_dir, "..", ".env"),
    ]

    for env_path in env_files:
        if not os.path.exists(env_path):
            continue
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for raw in f:
                    line = raw.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, value = line.split("=", 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    if key and key not in os.environ:
                        os.environ[key] = value
        except OSError:
            continue


_load_local_env()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-me")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=365)

jwt = JWTManager(app)

# CORS configuration
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost",
                "http://localhost:8080",
                "http://127.0.0.1",
                "http://127.0.0.1:8080",
            ]
        }
    },
    supports_credentials=True,
)

# Initialize database schema
init_db()

SUBJECT_RESOURCE_MAP = {
    "data structures": {
        "notes": [
            {"title": "GeeksForGeeks DSA", "url": "https://www.geeksforgeeks.org/data-structures/"},
            {"title": "NPTEL Data Structures", "url": "https://nptel.ac.in/courses/106102064"},
            {"title": "TutorialsPoint Data Structures", "url": "https://www.tutorialspoint.com/data_structures_algorithms/index.htm"},
            {"title": "VisuAlgo (Visual Learning)", "url": "https://visualgo.net/en"},
            {"title": "CP Handbook (Open PDF)", "url": "https://cses.fi/book/book.pdf"},
            {"title": "MIT OCW Algorithms Notes", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/readings/"},
        ],
        "topics": ["arrays", "linked list", "stack", "queue", "trees", "graphs", "heap", "dynamic programming", "tries"],
        "video_queries": ["dsa full course", "data structures placement interview", "dynamic programming complete guide"],
    },
    "operating systems": {
        "notes": [
            {"title": "NPTEL Operating Systems", "url": "https://nptel.ac.in/courses/106106144"},
            {"title": "GeeksForGeeks OS", "url": "https://www.geeksforgeeks.org/operating-systems/"},
            {"title": "TutorialsPoint OS", "url": "https://www.tutorialspoint.com/operating_system/index.htm"},
            {"title": "MIT OS Engineering (6.828)", "url": "https://pdos.csail.mit.edu/6.828/"},
            {"title": "OSTEP Book", "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/"},
            {"title": "Linux Kernel Docs", "url": "https://www.kernel.org/doc/html/latest/"},
        ],
        "topics": ["process", "thread", "cpu scheduling", "deadlock", "memory management", "virtual memory", "paging", "file systems"],
        "video_queries": ["operating systems full course", "os gate smashers", "virtual memory and paging"],
    },
    "dbms": {
        "notes": [
            {"title": "NPTEL DBMS", "url": "https://nptel.ac.in/courses/106105175"},
            {"title": "GeeksForGeeks DBMS", "url": "https://www.geeksforgeeks.org/dbms/"},
            {"title": "W3Schools SQL", "url": "https://www.w3schools.com/sql/"},
            {"title": "CMU Intro to Databases", "url": "https://15445.courses.cs.cmu.edu/"},
            {"title": "Use The Index, Luke", "url": "https://use-the-index-luke.com/"},
            {"title": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/"},
        ],
        "topics": ["normalization", "indexing", "transactions", "sql joins", "acid", "query optimization", "concurrency control", "er model"],
        "video_queries": ["dbms full course", "sql joins and normalization", "transactions and concurrency dbms"],
    },
    "computer networks": {
        "notes": [
            {"title": "NPTEL Computer Networks", "url": "https://nptel.ac.in/courses/106105183"},
            {"title": "GeeksForGeeks Networks", "url": "https://www.geeksforgeeks.org/computer-network-tutorials/"},
            {"title": "TutorialsPoint Networks", "url": "https://www.tutorialspoint.com/data_communication_computer_network/index.htm"},
            {"title": "Stanford CS144 Notes", "url": "https://cs144.github.io/"},
            {"title": "Kurose & Ross Companion", "url": "https://gaia.cs.umass.edu/kurose_ross/index.php"},
            {"title": "Cloudflare Learning Center", "url": "https://www.cloudflare.com/learning/"},
        ],
        "topics": ["osi model", "tcp", "udp", "routing", "dns", "http", "congestion control", "subnetting", "arp"],
        "video_queries": ["computer networks full course", "tcp congestion control explained", "subnetting tricks"],
    },
    "java": {
        "notes": [
            {"title": "Oracle Java Docs", "url": "https://docs.oracle.com/javase/tutorial/"},
            {"title": "GeeksForGeeks Java", "url": "https://www.geeksforgeeks.org/java/"},
            {"title": "W3Schools Java", "url": "https://www.w3schools.com/java/"},
            {"title": "Baeldung Java", "url": "https://www.baeldung.com/"},
            {"title": "Official OpenJDK Docs", "url": "https://openjdk.org/"},
            {"title": "Spring Guides", "url": "https://spring.io/guides"},
        ],
        "topics": ["oop", "collections", "multithreading", "streams", "spring basics", "jvm", "exception handling", "generics"],
        "video_queries": ["java full course", "java collections and streams", "spring boot beginner project"],
    },
    "python": {
        "notes": [
            {"title": "Python Official Docs", "url": "https://docs.python.org/3/tutorial/"},
            {"title": "GeeksForGeeks Python", "url": "https://www.geeksforgeeks.org/python-programming-language-tutorial/"},
            {"title": "W3Schools Python", "url": "https://www.w3schools.com/python/"},
            {"title": "Real Python Tutorials", "url": "https://realpython.com/"},
            {"title": "Automate The Boring Stuff", "url": "https://automatetheboringstuff.com/"},
            {"title": "FastAPI Docs", "url": "https://fastapi.tiangolo.com/"},
        ],
        "topics": ["functions", "oop", "decorators", "flask", "data analysis", "asyncio", "typing", "testing"],
        "video_queries": ["python full course", "python projects for beginners", "python flask fastapi tutorial"],
    },
}

CHATBOT_SYSTEM_PROMPT = (
    "You are a study mentor for BTech students. Give concise, practical guidance and always suggest the next best learning step."
)

# ============================================================
# Utility Helpers
# ============================================================

def get_db():
    """Provide a SQLAlchemy session (works with FastAPI & Flask)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def db_session():
    """Simple context manager for Flask route handlers."""
    db = SessionLocal()
    try:
        return db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def _iso_date(dt):
    if not dt:
        return None
    return dt.strftime("%Y-%m-%d")


def _pg_status_to_ui(status):
    mapping = {
        "active": "approved",
        "inactive": "rejected",
        "pending_approval": "pending",
        "suspended": "rejected",
    }
    return mapping.get(status, status)


def _ui_status_to_pg(status):
    mapping = {
        "approved": "active",
        "rejected": "inactive",
        "pending": "pending_approval",
    }
    return mapping.get(status, status)


def _user_type_value(user):
    if not user or not user.user_type:
        return None
    return user.user_type.value if hasattr(user.user_type, "value") else str(user.user_type)


def _get_current_user(db):
    uid = get_jwt_identity()
    if not uid:
        return None
    return db.query(User).filter(User.id == int(uid)).first()


def _require_user_role(user, allowed_roles):
    role = _user_type_value(user)
    return role in allowed_roles


def _owner_pg_to_payload(pg):
    return {
        "id": pg.id,
        "name": pg.name,
        "description": pg.description,
        "propertyType": pg.property_type.value if pg.property_type else None,
        "genderPreference": pg.gender_preference.value if pg.gender_preference else None,
        "address": pg.address,
        "area": pg.area,
        "city": pg.city,
        "state": pg.state,
        "postalCode": pg.postal_code,
        "price": int(pg.base_price or 0),
        "securityDeposit": int(pg.security_deposit or 0),
        "totalRooms": int(pg.total_rooms or 0),
        "totalBeds": int(pg.total_beds or 0),
        "occupiedBeds": int(pg.occupied_beds or 0),
        "availableBeds": max(0, int(pg.total_beds or 0) - int(pg.occupied_beds or 0)),
        "status": pg.status,
        "verified": bool(pg.verified),
        "rating": float(pg.average_rating or 0),
        "totalReviews": int(pg.total_reviews or 0),
        "collegeId": pg.college_id,
        "collegeName": pg.college.name if pg.college else None,
        "basicAmenities": pg.basic_amenities or [],
        "comfortAmenities": pg.comfort_amenities or [],
        "safetyFeatures": pg.safety_features or [],
        "createdAt": _iso_date(pg.created_at),
        "updatedAt": _iso_date(pg.updated_at),
    }


def _http_get_json(url):
    try:
        with urlopen(url, timeout=12) as res:
            return json.loads(res.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
        return None


def _http_post_json(url, payload, headers=None):
    request_headers = {"Content-Type": "application/json"}
    if headers:
        request_headers.update(headers)

    req = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=request_headers,
        method="POST",
    )
    try:
        with urlopen(req, timeout=25) as res:
            body = res.read().decode("utf-8")
            parsed = json.loads(body) if body else {}
            return res.getcode(), parsed
    except HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="ignore")
        try:
            parsed = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            parsed = {"message": raw[:500]}
        return exc.code, parsed
    except (URLError, TimeoutError, json.JSONDecodeError):
        return None, None


def _judge0_language_id(language):
    default_map = {
        "python": 71,      # Python (3.x)
        "javascript": 63,  # JavaScript (Node.js)
        "cpp": 54,         # C++ (GCC 9.2.0)
        "java": 62,        # Java (OpenJDK 13)
    }

    env_map = {
        "python": os.getenv("JUDGE0_LANG_PYTHON"),
        "javascript": os.getenv("JUDGE0_LANG_JAVASCRIPT"),
        "cpp": os.getenv("JUDGE0_LANG_CPP"),
        "java": os.getenv("JUDGE0_LANG_JAVA"),
    }

    override = env_map.get(language)
    if override and str(override).strip().isdigit():
        return int(str(override).strip())

    return default_map.get(language)


def _judge0_submission_url(base_url):
    if not base_url:
        return None
    normalized = base_url.rstrip("/")
    if normalized.endswith("/submissions"):
        return f"{normalized}?base64_encoded=false&wait=true"
    return f"{normalized}/submissions?base64_encoded=false&wait=true"


def _map_judge0_result(payload):
    if not isinstance(payload, dict):
        return None

    status_obj = payload.get("status") or {}
    status_id = status_obj.get("id")
    status_desc = status_obj.get("description")

    stdout = payload.get("stdout") or ""
    stderr = payload.get("stderr") or ""
    compile_output = payload.get("compile_output") or ""
    message = payload.get("message") or ""

    # Judge0 can provide only status/message for some failures; expose that as stderr.
    run_stderr_parts = [part for part in [stderr, message] if part]
    if not run_stderr_parts and status_id not in (3, None) and status_desc:
        run_stderr_parts.append(str(status_desc))

    exit_code = payload.get("exit_code")
    if exit_code is None:
        if status_id == 3:
            exit_code = 0
        elif run_stderr_parts or compile_output:
            exit_code = 1
        else:
            exit_code = -1

    return {
        "compile": {
            "stdout": "",
            "stderr": compile_output,
            "code": 0 if not compile_output else 1,
            "signal": None,
        },
        "run": {
            "stdout": stdout,
            "stderr": "\n".join(run_stderr_parts),
            "code": exit_code,
            "signal": payload.get("signal"),
            "status": status_desc,
            "time": payload.get("time"),
            "memory": payload.get("memory"),
        },
    }


def _normalize_subject(subject):
    return (subject or "").strip().lower()


def _extract_words(text):
    return re.findall(r"[a-zA-Z0-9]+", (text or "").lower())


def _cosine_similarity(text_a, text_b):
    words_a = _extract_words(text_a)
    words_b = _extract_words(text_b)
    if not words_a or not words_b:
        return 0.0

    freq_a = {}
    freq_b = {}
    for token in words_a:
        freq_a[token] = freq_a.get(token, 0) + 1
    for token in words_b:
        freq_b[token] = freq_b.get(token, 0) + 1

    common = set(freq_a.keys()).intersection(freq_b.keys())
    numerator = sum(freq_a[token] * freq_b[token] for token in common)
    norm_a = math.sqrt(sum(v * v for v in freq_a.values()))
    norm_b = math.sqrt(sum(v * v for v in freq_b.values()))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return numerator / (norm_a * norm_b)


def _split_sentences(text):
    chunks = re.split(r"(?<=[.!?])\s+", (text or "").strip())
    return [chunk.strip() for chunk in chunks if len(chunk.strip()) > 24]


def _curated_video_fallback(subject, topic=None, resource=None, limit=12):
    subject_title = (subject or "engineering").title()
    search_terms = []
    if topic:
        search_terms.append(f"{subject} {topic} explained")
    search_terms.extend((resource or {}).get("video_queries") or [])
    search_terms.append(f"{subject} full course")
    search_terms.append(f"{subject} interview questions")
    search_terms.extend([f"{subject} {tag}" for tag in ((resource or {}).get("topics") or [])[:6]])

    unique = []
    seen = set()
    for term in search_terms:
        normalized = (term or "").strip().lower()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        unique.append(term.strip())
        if len(unique) >= limit:
            break

    return [
        {
            "title": f"{subject_title}: {term}",
            "url": f"https://www.youtube.com/results?search_query={quote_plus(term)}",
            "channel": "YouTube Search",
            "thumbnail": None,
        }
        for term in unique
    ]


def _fetch_video_recommendations(subject, topic=None, resource=None, limit=12):
    query = f"{subject} {topic or ''} tutorial for students".strip()
    encoded = quote_plus(query)
    providers = [
        f"https://piped.video/api/v1/search?q={encoded}&filter=videos",
        f"https://yewtu.be/api/v1/search?q={encoded}&type=video",
    ]

    results = []
    seen_urls = set()
    for endpoint in providers:
        payload = _http_get_json(endpoint)
        if not isinstance(payload, list):
            continue

        for item in payload:
            title = item.get("title") if isinstance(item, dict) else None
            url = item.get("url") if isinstance(item, dict) else None
            thumbnail = item.get("thumbnail") if isinstance(item, dict) else None
            uploader = item.get("uploaderName") if isinstance(item, dict) else None
            if not title:
                continue
            if url and url.startswith("/"):
                url = f"https://www.youtube.com{url}"
            if not url:
                continue
            if url in seen_urls:
                continue

            seen_urls.add(url)
            results.append(
                {
                    "title": title,
                    "url": url,
                    "channel": uploader,
                    "thumbnail": thumbnail,
                }
            )
            if len(results) >= limit:
                break

        if len(results) >= limit:
            break

    curated = _curated_video_fallback(subject, topic=topic, resource=resource, limit=limit)
    for item in curated:
        if item["url"] in seen_urls:
            continue
        results.append(item)
        seen_urls.add(item["url"])
        if len(results) >= limit:
            break

    return results[:limit]


def _chatbot_rule_response(subject, message):
    msg = (message or "").lower()
    rules = [
        (
            ["syllabus", "roadmap", "plan"],
            "Start with fundamentals, solve 10 practice problems, revise weak concepts, then attempt previous-year questions every weekend.",
        ),
        (
            ["exam", "revision", "last minute"],
            "Use 40-40-20 strategy: 40% high-weight topics, 40% numericals/problem-solving, 20% quick memory sheets.",
        ),
        (
            ["project", "mini project", "btech"],
            "Pick a small real-world problem, define scope in one page, build MVP first, then add one measurable innovation.",
        ),
        (
            ["coding", "dsa", "interview"],
            "Follow a daily routine: 1 concept review + 2 easy + 1 medium problem, and track mistakes in a notes sheet.",
        ),
    ]

    for keywords, response in rules:
        if any(keyword in msg for keyword in keywords):
            return f"For {subject.title()}: {response}"
    return f"For {subject.title()}, focus on concept clarity first, then examples, then timed practice. Ask me a specific topic and I will break it into a 7-day plan."


def _fallback_next_steps(subject, message, resource):
    topics = (resource or {}).get("topics") or []
    top_topics = topics[:3]
    topic_text = ", ".join(top_topics) if top_topics else "core concepts"
    return [
        f"Spend 35 minutes revising {topic_text} in {subject.title()}.",
        "Watch 1 targeted video and write 5 bullet takeaways.",
        "Solve 3 practice questions with a 30-minute timer.",
        "Review mistakes and create a one-page cheat sheet.",
    ]


def _parse_chat_response_json(text):
    raw = (text or "").strip()
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        return json.loads(raw[start : end + 1])
    except json.JSONDecodeError:
        return None


def _fetch_groq_chat_response(subject, message, resource, hint):
    api_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not api_key:
        return None

    model = (os.getenv("GROQ_MODEL") or "llama-3.3-70b-versatile").strip()
    topics = (resource or {}).get("topics") or []
    note_titles = [item.get("title") for item in ((resource or {}).get("notes") or []) if item.get("title")]
    hint_text = hint.get("summary") if isinstance(hint, dict) else ""

    system_prompt = (
        "You are an expert BTech mentor. Return practical, exam-focused help.\n"
        "Respond in JSON with keys: answer (string), nextSteps (array of 3-5 strings), "
        "revisionChecklist (array of 3-6 strings)."
    )
    user_prompt = (
        f"Subject: {subject}\n"
        f"Student question: {message}\n"
        f"Priority topics: {', '.join(topics[:8])}\n"
        f"Available notes: {', '.join(note_titles[:8])}\n"
        f"Reference hint: {hint_text}\n"
        "Make the answer concise but actionable."
    )

    status_code, payload = _http_post_json(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            "model": model,
            "temperature": 0.3,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        },
        headers={"Authorization": f"Bearer {api_key}"},
    )
    if status_code is None or status_code >= 400 or not isinstance(payload, dict):
        return None

    choices = payload.get("choices") or []
    if not choices:
        return None
    content = ((choices[0] or {}).get("message") or {}).get("content")
    if not content:
        return None

    parsed = _parse_chat_response_json(content)
    if not isinstance(parsed, dict):
        return {
            "answer": content.strip(),
            "nextSteps": _fallback_next_steps(subject, message, resource),
            "revisionChecklist": [],
        }

    answer = (parsed.get("answer") or "").strip()
    next_steps = parsed.get("nextSteps") or []
    revision_checklist = parsed.get("revisionChecklist") or []
    if not answer:
        return None
    if not isinstance(next_steps, list):
        next_steps = []
    if not isinstance(revision_checklist, list):
        revision_checklist = []

    return {
        "answer": answer,
        "nextSteps": [str(step).strip() for step in next_steps if str(step).strip()][:5],
        "revisionChecklist": [str(step).strip() for step in revision_checklist if str(step).strip()][:6],
    }


def _fetch_ddg_hint(query):
    encoded = quote_plus(query)
    payload = _http_get_json(f"https://api.duckduckgo.com/?q={encoded}&format=json&no_html=1&skip_disambig=1")
    if not isinstance(payload, dict):
        return None

    abstract = (payload.get("AbstractText") or "").strip()
    source_url = payload.get("AbstractURL")
    heading = (payload.get("Heading") or "").strip()
    if abstract:
        return {"heading": heading or "Reference", "summary": abstract, "url": source_url}
    return None


def _fetch_codeforces_profile(handle):
    encoded = quote_plus(handle)
    payload = _http_get_json(f"https://codeforces.com/api/user.info?handles={encoded}")
    if not isinstance(payload, dict) or payload.get("status") != "OK":
        return None
    users = payload.get("result") or []
    if not users:
        return None
    return users[0]


def _fetch_codeforces_stats(handle):
    encoded = quote_plus(handle)
    payload = _http_get_json(f"https://codeforces.com/api/user.status?handle={encoded}&from=1&count=200")
    if not isinstance(payload, dict) or payload.get("status") != "OK":
        return None

    submissions = payload.get("result") or []
    solved_keys = set()
    solved_by_tag = {}
    for item in submissions:
        verdict = item.get("verdict")
        problem = item.get("problem") or {}
        contest_id = problem.get("contestId")
        index = problem.get("index")
        if contest_id and index and verdict == "OK":
            solved_keys.add(f"{contest_id}-{index}")
            for tag in (problem.get("tags") or []):
                solved_by_tag[tag] = solved_by_tag.get(tag, 0) + 1

    recent = []
    for item in submissions[:15]:
        problem = item.get("problem") or {}
        contest_id = problem.get("contestId")
        index = problem.get("index")
        if not contest_id or not index:
            continue
        recent.append(
            {
                "name": problem.get("name"),
                "verdict": item.get("verdict"),
                "url": f"https://codeforces.com/problemset/problem/{contest_id}/{index}",
            }
        )

    weakest_tags = [k for k, _ in sorted(solved_by_tag.items(), key=lambda pair: pair[1])[:3]]
    return {
        "submissionCount": len(submissions),
        "solvedCount": len(solved_keys),
        "weakestTags": weakest_tags,
        "recentSubmissions": recent,
    }


def _recommend_codeforces_problems(rating_floor, rating_ceiling, solved_count):
    payload = _http_get_json("https://codeforces.com/api/problemset.problems")
    if not isinstance(payload, dict) or payload.get("status") != "OK":
        return []

    problems = (payload.get("result") or {}).get("problems") or []
    selected = []
    for problem in problems:
        rating = problem.get("rating")
        if rating is None:
            continue
        if rating < rating_floor or rating > rating_ceiling:
            continue
        contest_id = problem.get("contestId")
        index = problem.get("index")
        if not contest_id or not index:
            continue
        selected.append(
            {
                "name": problem.get("name"),
                "rating": rating,
                "tags": (problem.get("tags") or [])[:4],
                "url": f"https://codeforces.com/problemset/problem/{contest_id}/{index}",
            }
        )
        if len(selected) >= 8:
            break

    if selected:
        return selected

    base_search = quote_plus("codeforces easy problems for beginners")
    return [
        {
            "name": "Codeforces Problemset Search",
            "rating": rating_floor,
            "tags": ["practice"],
            "url": f"https://codeforces.com/problemset?order=BY_SOLVED_DESC&tags={base_search}",
        }
    ]


def _crossref_matches(text):
    sentences = _split_sentences(text)
    if not sentences:
        return []

    probe_sentences = sorted(sentences, key=len, reverse=True)[:3]
    matches = []
    for sentence in probe_sentences:
        encoded = quote_plus(sentence[:120])
        payload = _http_get_json(f"https://api.crossref.org/works?query.bibliographic={encoded}&rows=3")
        if not isinstance(payload, dict):
            continue
        items = ((payload.get("message") or {}).get("items") or [])
        for item in items:
            titles = item.get("title") or []
            title = titles[0] if titles else "Untitled"
            doi = item.get("DOI")
            url = f"https://doi.org/{doi}" if doi else item.get("URL")
            ratio = SequenceMatcher(None, sentence.lower(), str(title).lower()).ratio()
            matches.append(
                {
                    "sentence": sentence,
                    "matchedTitle": title,
                    "sourceUrl": url,
                    "similarity": round(ratio * 100, 1),
                }
            )

    matches.sort(key=lambda x: x["similarity"], reverse=True)
    return matches[:6]


# ============================================================
# Flask Routes
# ============================================================

@app.route("/")
def index():
    return "", 404


api = Blueprint("api", __name__, url_prefix="/api")


@api.route("/health", methods=["GET"])
def health():
    return jsonify(status="ok"), 200


# ------------------------------------------------------------
# AUTHENTICATION
# ------------------------------------------------------------

@api.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    username = (data.get("username") or "").strip() or email.split("@")[0]
    full_name = (data.get("name") or "").strip()

    if not email or not password:
        return jsonify(error="email and password are required"), 400

    db = db_session()
    if db.query(User).filter(User.email == email).first():
        return jsonify(error="email already exists"), 409

    hashed = generate_password_hash(password)
    user = User(username=username, email=email, password_hash=hashed, full_name=full_name)
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return jsonify(error="username or email already exists"), 409

    return jsonify(message="user registered"), 201


@api.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify(error="email and password are required"), 400

    db = db_session()
    user = db.query(User).filter(User.email == email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify(error="invalid credentials"), 401

    uid = str(user.id)
    access_token = create_access_token(identity=uid, fresh=True)
    refresh_token = create_refresh_token(identity=uid)

    return jsonify(
        access_token=access_token,
        access_token_exp=3600,
        refresh_token=refresh_token,
        refresh_token_exp=31536000,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "user_type": _user_type_value(user),
            "status": user.status.value if user.status else None,
        },
    ), 200


@api.route("/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=str(current_user), fresh=False)
    return jsonify(access_token=new_access_token, access_token_exp=3600), 200


# ------------------------------------------------------------
# USER PROFILE
# ------------------------------------------------------------

@api.route("/user/profile", methods=["GET"])
@jwt_required()
def get_profile():
    uid = get_jwt_identity()
    db = db_session()
    user = db.query(User).filter(User.id == int(uid)).first()
    if not user:
        return jsonify(error="not found"), 404

    profile = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "user_type": _user_type_value(user),
        "college_id": user.college_id,
        "language_preference": user.language_preference,
        "status": user.status.value if user.status else None,
    }
    return jsonify(profile), 200


@api.route("/user/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    uid = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    allowed = ["username", "full_name", "phone", "college_id", "language_preference"]

    db = db_session()
    user = db.query(User).filter(User.id == int(uid)).first()
    if not user:
        return jsonify(error="not found"), 404

    for key in allowed:
        if key in data and data[key]:
            setattr(user, key, data[key])

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return jsonify(error="username already exists"), 409

    return jsonify(message="profile updated"), 200


# ------------------------------------------------------------
# PG LISTINGS
# ------------------------------------------------------------

@api.route("/pgs", methods=["GET"])
def list_pgs():
    db = db_session()
    listings = db.query(PGListing).all()
    out = []
    for pg in listings:
        out.append({
            "id": pg.id,
            "name": pg.name,
            "city": pg.city,
            "state": pg.state,
            "price": pg.base_price,
            "verified": bool(pg.verified),
            "average_rating": float(pg.average_rating or 0),
        })
    return jsonify(out), 200


@api.route("/pgs/<int:pg_id>", methods=["GET"])
def get_pg(pg_id):
    db = db_session()
    pg = db.query(PGListing).filter(PGListing.id == pg_id).first()
    if not pg:
        return jsonify(error="not found"), 404
    print(pg)
    return jsonify({
        "id": pg.id,
        "name": pg.name,
        "description": pg.description,
        "city": pg.city,
        "state": pg.state,
        "price": pg.base_price,
        "verified": bool(pg.verified),
    }), 200


# ------------------------------------------------------------
# COLLEGES
# ------------------------------------------------------------

@api.route("/colleges", methods=["GET"])
def list_colleges():
    db = db_session()
    colleges = db.query(College).all()
    out = [
        {
            "id": c.id,
            "name": c.name,
            "city": c.city,
            "state": c.state,
            "verified": bool(c.verified),
        }
        for c in colleges
    ]
    return jsonify(out), 200


# ------------------------------------------------------------
# SEARCH (Simple Example)
# ------------------------------------------------------------

@api.route("/search", methods=["POST"])
def search():
    body = request.get_json(silent=True) or {}
    q = (body.get("query") or "").strip()
    if not q:
        return jsonify(error="query is required"), 400
    db = db_session()
    results = db.query(User).filter(User.username.ilike(f"%{q}%")).all()
    return jsonify(results=[{"id": u.id, "username": u.username} for u in results]), 200


# ------------------------------------------------------------
# BOOKINGS (Placeholder)
# ------------------------------------------------------------

@api.route("/bookings", methods=["POST"])
@jwt_required(optional=True)
def create_booking():
    data = request.get_json(silent=True) or {}
    return jsonify(id=1, status="received", data=data), 201


# ------------------------------------------------------------
# ADMIN DASHBOARD
# ------------------------------------------------------------

@api.route("/admin/overview", methods=["GET"])
@jwt_required()
def admin_overview():
    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"admin"}):
        return jsonify(error="forbidden"), 403

    total_users = db.query(User).count()
    active_pgs = db.query(PGListing).filter(PGListing.status == "active").count()
    pending_approvals = db.query(PGListing).filter(PGListing.status == "pending_approval").count()
    safety_reports = db.query(SafetyReport).count()
    monthly_bookings = 0
    avg_rating = db.query(PGListing.average_rating).all()
    ratings = [float(r[0]) for r in avg_rating if r[0] is not None]
    average_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0

    return jsonify(
        totalUsers=total_users,
        activePGs=active_pgs,
        pendingApprovals=pending_approvals,
        safetyReports=safety_reports,
        monthlyBookings=monthly_bookings,
        averageRating=average_rating,
    ), 200


@api.route("/admin/pgs", methods=["GET"])
@jwt_required()
def admin_list_pgs():
    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"admin"}):
        return jsonify(error="forbidden"), 403

    listings = db.query(PGListing).all()
    out = []
    for pg in listings:
        owner_name = pg.owner.full_name if pg.owner and pg.owner.full_name else (pg.owner.username if pg.owner else "Unknown")
        out.append(
            {
                "id": pg.id,
                "name": pg.name,
                "owner": owner_name,
                "location": pg.area or pg.city,
                "status": _pg_status_to_ui(pg.status),
                "rating": float(pg.average_rating or 0),
                "capacity": int(pg.total_beds or 0),
                "occupied": int(pg.occupied_beds or 0),
                "verified": bool(pg.verified),
                "submittedDate": _iso_date(pg.created_at),
                "city": pg.city,
                "state": pg.state,
                "price": pg.base_price,
            }
        )
    return jsonify(out), 200


@api.route("/admin/pgs/<int:pg_id>/status", methods=["PATCH"])
@jwt_required()
def admin_update_pg_status(pg_id):
    data = request.get_json(silent=True) or {}
    ui_status = (data.get("status") or "").strip().lower()
    new_status = _ui_status_to_pg(ui_status)
    if new_status not in {"active", "inactive", "pending_approval", "suspended"}:
        return jsonify(error="invalid status"), 400

    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"admin"}):
        return jsonify(error="forbidden"), 403

    pg = db.query(PGListing).filter(PGListing.id == pg_id).first()
    if not pg:
        return jsonify(error="not found"), 404

    pg.status = new_status
    db.commit()
    return jsonify(message="status updated", status=_pg_status_to_ui(pg.status)), 200


@api.route("/admin/pgs/<int:pg_id>", methods=["DELETE"])
@jwt_required()
def admin_delete_pg(pg_id):
    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"admin"}):
        return jsonify(error="forbidden"), 403

    pg = db.query(PGListing).filter(PGListing.id == pg_id).first()
    if not pg:
        return jsonify(error="not found"), 404
    db.delete(pg)
    db.commit()
    return jsonify(message="pg deleted"), 200


@api.route("/admin/reports", methods=["GET"])
@jwt_required()
def admin_list_reports():
    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"admin"}):
        return jsonify(error="forbidden"), 403

    reports = db.query(SafetyReport).order_by(SafetyReport.created_at.desc()).all()
    out = []
    for report in reports:
        reporter = report.reporter_name or "Anonymous"
        if report.reporter and report.reporter.full_name:
            reporter = report.reporter.full_name
        out.append(
            {
                "id": report.id,
                "type": report.type,
                "location": report.location,
                "reporter": reporter,
                "status": report.status,
                "priority": report.priority,
                "submittedDate": _iso_date(report.created_at),
                "description": report.description,
            }
        )
    return jsonify(out), 200


@api.route("/admin/reports", methods=["POST"])
@jwt_required()
def admin_create_report():
    data = request.get_json(silent=True) or {}
    report_type = (data.get("type") or "").strip()
    location = (data.get("location") or "").strip()
    description = (data.get("description") or "").strip()
    priority = (data.get("priority") or "medium").strip().lower()
    status = (data.get("status") or "pending").strip().lower()
    reporter_name = (data.get("reporter") or "Anonymous").strip()

    if not report_type or not location or not description:
        return jsonify(error="type, location and description are required"), 400
    if priority not in {"low", "medium", "high"}:
        return jsonify(error="invalid priority"), 400
    if status not in {"pending", "investigating", "resolved"}:
        return jsonify(error="invalid status"), 400

    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"admin"}):
        return jsonify(error="forbidden"), 403

    report = SafetyReport(
        type=report_type,
        location=location,
        description=description,
        priority=priority,
        status=status,
        reporter_name=reporter_name,
    )
    db.add(report)
    db.commit()

    return jsonify(message="report created", id=report.id), 201


@api.route("/admin/reports/<int:report_id>/status", methods=["PATCH"])
@jwt_required()
def admin_update_report_status(report_id):
    data = request.get_json(silent=True) or {}
    new_status = (data.get("status") or "").strip().lower()
    if new_status not in {"pending", "investigating", "resolved"}:
        return jsonify(error="invalid status"), 400

    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"admin"}):
        return jsonify(error="forbidden"), 403

    report = db.query(SafetyReport).filter(SafetyReport.id == report_id).first()
    if not report:
        return jsonify(error="not found"), 404

    report.status = new_status
    db.commit()
    return jsonify(message="status updated", status=report.status), 200


@api.route("/admin/users", methods=["GET"])
@jwt_required()
def admin_list_users():
    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"admin"}):
        return jsonify(error="forbidden"), 403

    users = db.query(User).order_by(User.created_at.desc()).all()
    out = []
    for user in users:
        out.append(
            {
                "id": user.id,
                "name": user.full_name,
                "email": user.email,
                "type": user.user_type.value if user.user_type else "student",
                "joinDate": _iso_date(user.created_at),
                "status": user.status.value if user.status else "active",
                "college": user.college.name if user.college else "N/A",
                "username": user.username,
                "phone": user.phone,
            }
        )
    return jsonify(out), 200


@api.route("/admin/users", methods=["POST"])
@jwt_required()
def admin_create_user():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name = (data.get("name") or "").strip()
    username = (data.get("username") or "").strip() or email.split("@")[0]
    user_type = (data.get("type") or "student").strip().lower()
    status = (data.get("status") or "active").strip().lower()

    if not email or not password or not name:
        return jsonify(error="name, email and password are required"), 400
    if user_type not in {"student", "owner", "admin"}:
        return jsonify(error="invalid user type"), 400
    if status not in {"active", "inactive", "suspended", "pending_verification"}:
        return jsonify(error="invalid status"), 400

    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"admin"}):
        return jsonify(error="forbidden"), 403

    if db.query(User).filter(User.email == email).first():
        return jsonify(error="email already exists"), 409

    user = User(
        username=username,
        email=email,
        full_name=name,
        phone=(data.get("phone") or None),
        password_hash=generate_password_hash(password),
        user_type=UserType(user_type),
        status=UserStatus(status),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return jsonify(error="username, email, or phone already exists"), 409

    return jsonify(message="user created", id=user.id), 201


@api.route("/admin/users/<int:user_id>", methods=["PUT"])
@jwt_required()
def admin_update_user(user_id):
    data = request.get_json(silent=True) or {}
    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"admin"}):
        return jsonify(error="forbidden"), 403

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return jsonify(error="not found"), 404

    if "name" in data and data["name"]:
        user.full_name = str(data["name"]).strip()
    if "email" in data and data["email"]:
        user.email = str(data["email"]).strip().lower()
    if "username" in data and data["username"]:
        user.username = str(data["username"]).strip()
    if "phone" in data:
        user.phone = str(data["phone"]).strip() or None
    if "type" in data:
        t = str(data["type"]).strip().lower()
        if t not in {"student", "owner", "admin"}:
            return jsonify(error="invalid user type"), 400
        user.user_type = UserType(t)
    if "status" in data:
        s = str(data["status"]).strip().lower()
        if s not in {"active", "inactive", "suspended", "pending_verification"}:
            return jsonify(error="invalid status"), 400
        user.status = UserStatus(s)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return jsonify(error="username, email, or phone already exists"), 409
    return jsonify(message="user updated"), 200


@api.route("/admin/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def admin_delete_user(user_id):
    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"admin"}):
        return jsonify(error="forbidden"), 403

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return jsonify(error="not found"), 404
    db.delete(user)
    db.commit()
    return jsonify(message="user deleted"), 200


# ------------------------------------------------------------
# OWNER DASHBOARD
# ------------------------------------------------------------

@api.route("/owner/overview", methods=["GET"])
@jwt_required()
def owner_overview():
    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"owner"}):
        return jsonify(error="forbidden"), 403

    listings = db.query(PGListing).filter(PGListing.owner_id == user.id).all()
    total_listings = len(listings)
    active_listings = len([pg for pg in listings if pg.status == "active"])
    pending_approvals = len([pg for pg in listings if pg.status == "pending_approval"])
    total_beds = sum(int(pg.total_beds or 0) for pg in listings)
    occupied_beds = sum(int(pg.occupied_beds or 0) for pg in listings)
    monthly_revenue = sum(int(pg.base_price or 0) * int(pg.occupied_beds or 0) for pg in listings)
    occupancy_rate = round((occupied_beds / total_beds) * 100, 1) if total_beds else 0

    return jsonify(
        totalListings=total_listings,
        activeListings=active_listings,
        pendingApprovals=pending_approvals,
        totalBeds=total_beds,
        occupiedBeds=occupied_beds,
        occupancyRate=occupancy_rate,
        monthlyRevenue=monthly_revenue,
    ), 200


@api.route("/owner/pgs", methods=["GET"])
@jwt_required()
def owner_list_pgs():
    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"owner"}):
        return jsonify(error="forbidden"), 403

    listings = db.query(PGListing).filter(PGListing.owner_id == user.id).order_by(PGListing.created_at.desc()).all()
    return jsonify([_owner_pg_to_payload(pg) for pg in listings]), 200


@api.route("/owner/pgs", methods=["POST"])
@jwt_required()
def owner_create_pg():
    data = request.get_json(silent=True) or {}
    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"owner"}):
        return jsonify(error="forbidden"), 403

    name = (data.get("name") or "").strip()
    address = (data.get("address") or "").strip()
    city = (data.get("city") or "").strip()
    state = (data.get("state") or "").strip()
    price = int(data.get("price") or 0)
    total_beds = int(data.get("totalBeds") or 0)
    total_rooms = int(data.get("totalRooms") or 0)

    if not name or not address or not city or not state:
        return jsonify(error="name, address, city and state are required"), 400
    if price <= 0 or total_beds <= 0 or total_rooms <= 0:
        return jsonify(error="price, totalBeds and totalRooms must be greater than 0"), 400

    college_id = data.get("collegeId")
    if college_id:
        college = db.query(College).filter(College.id == int(college_id)).first()
        if not college:
            return jsonify(error="invalid collegeId"), 400
    else:
        college = db.query(College).first()
        if not college:
            return jsonify(error="no college available to attach listing"), 400
        college_id = college.id

    gender_preference = (data.get("genderPreference") or "co-ed").strip().lower()
    if gender_preference not in {"male", "female", "co-ed"}:
        return jsonify(error="invalid genderPreference"), 400

    property_type = (data.get("propertyType") or "pg").strip().lower()
    if property_type not in {"pg", "hostel", "apartment", "room"}:
        return jsonify(error="invalid propertyType"), 400

    listing = PGListing(
        owner_id=user.id,
        college_id=int(college_id),
        name=name,
        description=(data.get("description") or "").strip() or None,
        property_type=PropertyType(property_type),
        gender_preference=GenderPreference(gender_preference),
        address=address,
        area=(data.get("area") or "").strip() or None,
        city=city,
        state=state,
        postal_code=(data.get("postalCode") or "").strip() or None,
        base_price=price,
        security_deposit=int(data.get("securityDeposit") or 0),
        total_rooms=total_rooms,
        total_beds=total_beds,
        occupied_beds=min(int(data.get("occupiedBeds") or 0), total_beds),
        basic_amenities=data.get("basicAmenities") or [],
        comfort_amenities=data.get("comfortAmenities") or [],
        safety_features=data.get("safetyFeatures") or [],
        status="pending_approval",
        verified=False,
    )

    db.add(listing)
    db.commit()
    db.refresh(listing)
    return jsonify(message="listing created", listing=_owner_pg_to_payload(listing)), 201


@api.route("/owner/pgs/<int:pg_id>", methods=["PUT"])
@jwt_required()
def owner_update_pg(pg_id):
    data = request.get_json(silent=True) or {}
    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"owner"}):
        return jsonify(error="forbidden"), 403

    listing = db.query(PGListing).filter(PGListing.id == pg_id, PGListing.owner_id == user.id).first()
    if not listing:
        return jsonify(error="listing not found"), 404

    updatable_fields = {
        "name": "name",
        "description": "description",
        "address": "address",
        "area": "area",
        "city": "city",
        "state": "state",
        "postalCode": "postal_code",
        "price": "base_price",
        "securityDeposit": "security_deposit",
        "totalRooms": "total_rooms",
        "totalBeds": "total_beds",
        "occupiedBeds": "occupied_beds",
    }

    for payload_key, model_key in updatable_fields.items():
        if payload_key in data:
            setattr(listing, model_key, data[payload_key])

    if "genderPreference" in data:
        gp = str(data.get("genderPreference") or "").strip().lower()
        if gp not in {"male", "female", "co-ed"}:
            return jsonify(error="invalid genderPreference"), 400
        listing.gender_preference = GenderPreference(gp)

    if "propertyType" in data:
        pt = str(data.get("propertyType") or "").strip().lower()
        if pt not in {"pg", "hostel", "apartment", "room"}:
            return jsonify(error="invalid propertyType"), 400
        listing.property_type = PropertyType(pt)

    if "basicAmenities" in data:
        listing.basic_amenities = data.get("basicAmenities") or []
    if "comfortAmenities" in data:
        listing.comfort_amenities = data.get("comfortAmenities") or []
    if "safetyFeatures" in data:
        listing.safety_features = data.get("safetyFeatures") or []

    listing.occupied_beds = min(int(listing.occupied_beds or 0), int(listing.total_beds or 0))
    if int(listing.base_price or 0) <= 0 or int(listing.total_beds or 0) <= 0 or int(listing.total_rooms or 0) <= 0:
        return jsonify(error="price, totalBeds and totalRooms must be greater than 0"), 400

    db.commit()
    db.refresh(listing)
    return jsonify(message="listing updated", listing=_owner_pg_to_payload(listing)), 200


@api.route("/owner/pgs/<int:pg_id>/occupancy", methods=["PATCH"])
@jwt_required()
def owner_update_occupancy(pg_id):
    data = request.get_json(silent=True) or {}
    occupied_beds = data.get("occupiedBeds")
    if occupied_beds is None:
        return jsonify(error="occupiedBeds is required"), 400

    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"owner"}):
        return jsonify(error="forbidden"), 403

    listing = db.query(PGListing).filter(PGListing.id == pg_id, PGListing.owner_id == user.id).first()
    if not listing:
        return jsonify(error="listing not found"), 404

    occupied_beds = int(occupied_beds)
    if occupied_beds < 0 or occupied_beds > int(listing.total_beds or 0):
        return jsonify(error="occupiedBeds must be between 0 and totalBeds"), 400

    listing.occupied_beds = occupied_beds
    db.commit()
    db.refresh(listing)
    return jsonify(message="occupancy updated", listing=_owner_pg_to_payload(listing)), 200


@api.route("/owner/pgs/<int:pg_id>", methods=["DELETE"])
@jwt_required()
def owner_delete_pg(pg_id):
    db = db_session()
    user = _get_current_user(db)
    if not user:
        return jsonify(error="not found"), 404
    if not _require_user_role(user, {"owner"}):
        return jsonify(error="forbidden"), 403

    listing = db.query(PGListing).filter(PGListing.id == pg_id, PGListing.owner_id == user.id).first()
    if not listing:
        return jsonify(error="listing not found"), 404

    db.delete(listing)
    db.commit()
    return jsonify(message="listing deleted"), 200


# ------------------------------------------------------------
# STUDENT LEARNING HUB
# ------------------------------------------------------------

@api.route("/learning/subjects", methods=["GET"])
@jwt_required(optional=True)
def learning_subjects():
    return jsonify(subjects=sorted(SUBJECT_RESOURCE_MAP.keys())), 200


@api.route("/learning/resources", methods=["GET"])
@jwt_required(optional=True)
def learning_resources():
    subject = _normalize_subject(request.args.get("subject"))
    topic = (request.args.get("topic") or "").strip()
    if not subject:
        return jsonify(error="subject is required"), 400

    resource = SUBJECT_RESOURCE_MAP.get(subject)
    if not resource:
        return jsonify(error="subject not supported"), 404

    videos = _fetch_video_recommendations(subject, topic, resource=resource)
    return jsonify(
        subject=subject,
        notes=resource.get("notes") or [],
        topics=resource.get("topics") or [],
        videos=videos,
    ), 200


@api.route("/learning/chatbot", methods=["POST"])
@jwt_required(optional=True)
def learning_chatbot():
    data = request.get_json(silent=True) or {}
    subject = _normalize_subject(data.get("subject")) or "general engineering"
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify(error="message is required"), 400

    subject_resource = SUBJECT_RESOURCE_MAP.get(subject, {"notes": [], "topics": []})
    base_response = _chatbot_rule_response(subject, message)
    ddg_hint = _fetch_ddg_hint(f"{subject} {message}")
    references = []
    if ddg_hint:
        references.append(ddg_hint)
    for note in (subject_resource.get("notes") or [])[:3]:
        if not note.get("url"):
            continue
        references.append(
            {
                "heading": "Subject Note",
                "summary": note.get("title") or "Reference",
                "url": note.get("url"),
            }
        )

    groq_response = _fetch_groq_chat_response(subject, message, subject_resource, ddg_hint)
    answer = (groq_response or {}).get("answer") or base_response
    next_steps = (groq_response or {}).get("nextSteps") or _fallback_next_steps(subject, message, subject_resource)
    revision_checklist = (groq_response or {}).get("revisionChecklist") or []

    return jsonify(
        systemPrompt=CHATBOT_SYSTEM_PROMPT,
        answer=answer,
        references=references,
        nextSteps=next_steps,
        revisionChecklist=revision_checklist,
        model="groq" if groq_response else "rule-based-fallback",
    ), 200


@api.route("/coding/codeforces", methods=["GET"])
@jwt_required(optional=True)
def coding_codeforces():
    handle = (request.args.get("handle") or "").strip()
    if not handle:
        return jsonify(error="handle is required"), 400

    profile = _fetch_codeforces_profile(handle)
    if not profile:
        return jsonify(error="unable to fetch Codeforces profile"), 404

    stats = _fetch_codeforces_stats(handle) or {
        "submissionCount": 0,
        "solvedCount": 0,
        "weakestTags": [],
        "recentSubmissions": [],
    }

    rating = int(profile.get("rating") or 900)
    recommendations = _recommend_codeforces_problems(max(800, rating - 200), min(2000, rating + 100), stats["solvedCount"])

    return jsonify(
        profile={
            "handle": profile.get("handle"),
            "rating": profile.get("rating"),
            "maxRating": profile.get("maxRating"),
            "rank": profile.get("rank"),
            "avatar": profile.get("avatar"),
        },
        stats=stats,
        recommendations=recommendations,
    ), 200


@api.route("/coding/execute", methods=["POST"])
@jwt_required(optional=True)
def coding_execute():
    data = request.get_json(silent=True) or {}
    language = (data.get("language") or "").strip().lower()
    code = data.get("code") or ""
    stdin = data.get("stdin") or ""

    allowed_languages = {"python", "javascript", "cpp", "java"}
    if language not in allowed_languages:
        return jsonify(error="unsupported language"), 400

    if not str(code).strip():
        return jsonify(error="code is required"), 400

    if len(code) > 30000:
        return jsonify(error="code size exceeds limit (30000 chars)"), 400

    language_id = _judge0_language_id(language)
    if language_id is None:
        return jsonify(error="unsupported language mapping for Judge0"), 400

    runner_url = _judge0_submission_url((os.getenv("CODE_RUNNER_URL") or "").strip())
    if not runner_url:
        return jsonify(
            error="Online compiler is not configured. Set CODE_RUNNER_URL to your Judge0 base URL (or /submissions endpoint)."
        ), 503

    upstream_payload = {
        "language_id": language_id,
        "source_code": code,
        "stdin": stdin,
        "base64_encoded": False,
    }

    upstream_headers = {}
    runner_token = (os.getenv("CODE_RUNNER_TOKEN") or "").strip()
    if runner_token:
        upstream_headers["Authorization"] = f"Bearer {runner_token}"
    rapidapi_key = (os.getenv("JUDGE0_RAPIDAPI_KEY") or "").strip()
    rapidapi_host = (os.getenv("JUDGE0_RAPIDAPI_HOST") or "").strip()
    if rapidapi_key:
        upstream_headers["X-RapidAPI-Key"] = rapidapi_key
    if rapidapi_host:
        upstream_headers["X-RapidAPI-Host"] = rapidapi_host

    status_code, upstream_data = _http_post_json(runner_url, upstream_payload, upstream_headers)
    if status_code is None:
        return jsonify(error="Compiler provider is unreachable. Try again later."), 502

    if status_code >= 400:
        message = None
        if isinstance(upstream_data, dict):
            message = upstream_data.get("message") or upstream_data.get("error")
        return jsonify(error=message or "Compiler provider rejected the request"), 502

    if not isinstance(upstream_data, dict):
        return jsonify(error="Invalid response from compiler provider"), 502

    mapped = _map_judge0_result(upstream_data)
    if not mapped:
        return jsonify(error="Invalid response from compiler provider"), 502
    return jsonify(mapped), 200


@api.route("/plagiarism/check", methods=["POST"])
@jwt_required(optional=True)
def plagiarism_check():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    compare_text = (data.get("compareText") or "").strip()
    if len(text) < 80:
        return jsonify(error="text must be at least 80 characters"), 400

    local_similarity = round(_cosine_similarity(text, compare_text) * 100, 1) if compare_text else 0.0
    external_matches = _crossref_matches(text)

    external_score = max([m.get("similarity", 0) for m in external_matches], default=0)
    risk_score = round(max(local_similarity, external_score), 1)
    if risk_score >= 70:
        risk_level = "high"
    elif risk_score >= 40:
        risk_level = "medium"
    else:
        risk_level = "low"

    return jsonify(
        localSimilarity=local_similarity,
        externalRiskScore=round(external_score, 1),
        overallRiskScore=risk_score,
        riskLevel=risk_level,
        recommendations=[
            "Rewrite highlighted parts in your own words",
            "Add proper citations for borrowed ideas",
            "Run another check after revision before final submission",
        ],
        externalMatches=external_matches,
    ), 200


# Register API blueprint
app.register_blueprint(api)

# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=True)


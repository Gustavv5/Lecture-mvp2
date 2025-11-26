import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

from database import (
    init_db,
    insert_transcription,
    get_transcriptions,
    get_transcription_by_id,
    delete_transcription
)


load_dotenv()

app = Flask(__name__)
CORS(app)

# ------------ ACCESS CODE PROTECTION ------------
ACCESS_CODE = os.getenv("ACCESS_CODE")

@app.before_request
def require_access_code():
    # allow the home route without code
    if request.path == "/" or request.method == "OPTIONS":
        return None  

    provided = request.headers.get("X-ACCESS-CODE")
    if provided != ACCESS_CODE:
        return jsonify({"error": "Unauthorized - missing or wrong access code"}), 401


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ---------- Small helpers for MVP ----------

def simple_category_from_text(text: str) -> str:
    """Very rough category detection based on keywords."""
    text_lower = text.lower()
    if any(w in text_lower for w in ["math", "algebra", "calculus", "equation"]):
        return "Mathematics"
    if any(w in text_lower for w in ["biology", "cell", "evolution", "dna"]):
        return "Science"
    if any(w in text_lower for w in ["economy", "market", "business", "finance"]):
        return "Business"
    if any(w in text_lower for w in ["history", "war", "revolution", "empire"]):
        return "History"
    if any(w in text_lower for w in ["psychology", "behavior", "cognitive"]):
        return "Psychology"
    return "General"


def simple_key_points_from_text(text: str, max_points: int = 5):
    """
    Very simple key-point extractor:
    - split into sentences
    - take the first few non-empty ones
    """
    sentences = [s.strip() for s in text.replace("\n", " ").split(".") if s.strip()]
    points = []
    for s in sentences[:max_points]:
        points.append({"point": s, "importance": "normal"})
    return points


# ------------ TRANSCRIBE ROUTE ------------

@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if "file" not in request.files:
        return {"error": "No file uploaded"}, 400

    file = request.files["file"]

    # Save file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp:
        file.save(temp.name)
        audio_path = temp.name

    # Send to Whisper
    try:
        with open(audio_path, "rb") as audio:
            result = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio,
            )
    except Exception as e:
        return {"error": str(e)}, 500

    transcript = result.text
    summary = transcript[:300] + "..." if len(transcript) > 300 else transcript
    category = simple_category_from_text(transcript)
    key_points = simple_key_points_from_text(transcript)

    # Save to DB (we only store transcript + summary;
    # category and key_points are recomputed when needed)
    insert_transcription(file.filename, transcript, summary)

    # Frontend gets everything in one go
    return jsonify(
        {
            "filename": file.filename,
            "transcript": transcript,
            "summary": summary,
            "category": category,
            "key_points": key_points,
        }
    )


# ------------ HISTORY ROUTE ------------

@app.route("/history", methods=["GET"])
def history():
    """
    Returns a lightweight list for the dashboard.
    For each lecture: id, filename, summary, category.
    """
    rows = get_transcriptions()
    result = []
    for row in rows:
        category = simple_category_from_text(row["transcript"])
        result.append(
            {
                "id": row["id"],
                "filename": row["filename"],
                "summary": row["summary"],
                "category": category,
            }
        )
    return jsonify(result)


# ------------ LECTURE DETAIL ROUTE ------------

@app.route("/lecture/<int:lecture_id>", methods=["GET"])
def lecture_detail(lecture_id):
    lecture = get_transcription_by_id(lecture_id)
    if not lecture:
        return {"error": "Lecture not found"}, 404

    category = simple_category_from_text(lecture["transcript"])
    key_points = simple_key_points_from_text(lecture["transcript"])

    return jsonify(
        {
            "id": lecture["id"],
            "filename": lecture["filename"],
            "summary": lecture["summary"],
            "transcript": lecture["transcript"],
            "category": category,
            "key_points": key_points,
        }
    )


# ------------ DELETE LECTURE ROUTE ------------


# ------------ DELETE LECTURE ROUTE ------------
@app.route("/lecture/<int:lecture_id>", methods=["DELETE"])
def delete_lecture(lecture_id):
    # we just assume id exists; for a real app you’d check first
    delete_transcription(lecture_id)
    return {"status": "deleted", "id": lecture_id}



# ------------ HOME ROUTE ------------

@app.route("/", methods=["GET"])
def home():
    return {"message": "Lecture backend is running"}


if __name__ == "__main__":
    # Ensure DB table exists when running locally
    init_db()
    app.run(host="0.0.0.0", port=5000)






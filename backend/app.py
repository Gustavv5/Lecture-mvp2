import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from database import insert_transcription, get_transcriptions
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
                file=audio
            )
    except Exception as e:
        return {"error": str(e)}, 500

    transcript = result.text
    summary = transcript[:150] + "..."

    insert_transcription(file.filename, transcript, summary)

    return jsonify({
        "transcript": transcript,
        "summary": summary
    })


# ------------ HISTORY ROUTE ------------
@app.route("/history", methods=["GET"])
def history():
    return jsonify(get_transcriptions())


# ------------ HOME ROUTE ------------
@app.route("/", methods=["GET"])
def home():
    return {"message": "Lecture backend is running"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)






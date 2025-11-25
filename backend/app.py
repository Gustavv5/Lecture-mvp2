import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from database import insert_transcription, get_transcriptions
import tempfile

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ----------- UPLOAD & TRANSCRIBE ------------
@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if "file" not in request.files:
        return {"error": "No file uploaded"}, 400

    file = request.files["file"]

    # Save incoming audio temporarily
    with tempfile.NamedTemporaryFile(delete=False) as temp:
        file.save(temp.name)
        audio_path = temp.name

    # Send audio to OpenAI Whisper API
    with open(audio_path, "rb") as audio:
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio
        )

    transcript = result.text
    summary = transcript[:150] + "..."

    # Save to DB
    insert_transcription(file.filename, transcript, summary)

    return jsonify({
        "transcript": transcript,
        "summary": summary
    })


# ----------- GET HISTORY ------------
@app.route("/history", methods=["GET"])
def history():
    return jsonify(get_transcriptions())


# ----------- HOME ROUTE ------------
@app.route("/", methods=["GET"])
def home():
    return {"message": "Lecture backend is running"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)






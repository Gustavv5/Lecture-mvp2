
from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
from backend.database import init_db, insert_transcriptions, get_transcriptions

app = Flask(__name__)
CORS(app)

# Initialize the database
init_db()

# Load the Whisper model once
model = whisper.load_model('base')

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save the uploaded file temporarily
    file_path = f"./temp_{file.filename}"
    file.save(file_path)

    # Transcribe and summarize
    result = model.transcribe(file_path)
    transcript = result['text']
    summary = transcript[:200] + "..."

    # Insert into DB
    insert_transcriptions(file.filename, transcript, summary)

    return jsonify({
        "transcript": transcript,
        "summary": summary
    })

@app.route('/transcriptions', methods=['GET'])
def all_transcriptions():
    rows = get_transcriptions()
    data = [{"id": r[0], "audio_path": r[1], "transcript": r[2], "summary": r[3]} for r in rows]
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)



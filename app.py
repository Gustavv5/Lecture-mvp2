
import whisper
import sqlite3

# Transcribe and summarize audio
def transcribe_and_summarize(audio_path):
    model = whisper.load_model("base")
    result = model.transcribe(audio_path)
    transcript = result["text"]
    summary = transcript[:100] + "..."  # simple fake summary
    save_to_db(audio_path, transcript, summary)
    return transcript, summary

# Save data to the database
def save_to_db(audio_path, transcript, summary):
    conn = sqlite3.connect("transcriptions.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transcriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            audio_file TEXT,
            transcript TEXT,
            summary TEXT
        )
    ''')
    cursor.execute(
        "INSERT INTO transcriptions (audio_file, transcript, summary) VALUES (?, ?, ?)",
        (audio_path, transcript, summary)
    )
    conn.commit()
    conn.close()

if __name__ == "__main__":
    transcript, summary = transcribe_and_summarize("One Way.mp3")
    print("Transcript:", transcript[:200], "...")
    print("Summary:", summary)

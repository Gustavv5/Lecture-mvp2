
import whisper
import sqlite3

def transcribe_and_summarize(audio_path):
    
    model = whisper.load_model('base')
    result  = model.transcribe(audio_path)
    transcript = result['text']
    summary = transcript[:100] + '...'
    save_to_db(audio_path, transcript, summary)
    
    return transcript, summary

def save_to_db(audio_path, transcript, summary):
    conn = sqlite3.connect('transcriptions.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transcriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            audio_file TEXT,
            transcript TEXT,
            summary TEXT)
        )
    ''')
    cursor.execute(
        'INSERT INTO transcriptions (audio_file, transcript, summary) VALUES (?, ?, ?)',
    )
    conn.commit()
    conn.close()

if __name__ == '__main__':
    transcript, summary = transcribe_and_summarize('One_Way.mp3')
    print('Transcript:', transcript[:200], '...')
    print('Summary:', summary)


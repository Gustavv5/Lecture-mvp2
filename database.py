
import sqlite3

def init_db():

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
    conn.commit()
    conn.close()

def save_to_db(audio_file, transcript, summary):

    conn = sqlite3.connect('transcriptions.db')
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO transcriptions (audio_file, transcript, summary) VALUES (?, ?, ?)',
        (audio_file, transcript, summary)
    )
    conn.commit()
    conn.close()

def get_transcriptions():

    conn = sqlite3.connect('transcriptions.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM transcriptions')
    rows = cursor.fetchall()
    conn.close()

    return rows

    

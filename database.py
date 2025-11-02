
import sqlite3

def init_db():
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
    conn.commit()
    conn.close()

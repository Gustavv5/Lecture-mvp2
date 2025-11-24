import psycopg2
import os

DATABASE_URL = os.environ.get("DATABASE_URL")  # Render will provide this

def get_conn():
    return psycopg2.connect(DATABASE_URL)

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS transcriptions (
            id SERIAL PRIMARY KEY,
            audio_path TEXT,
            transcript TEXT,
            summary TEXT
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

def insert_transcriptions(audio_path, transcript, summary):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO transcriptions (audio_path, transcript, summary) VALUES (%s, %s, %s)",
        (audio_path, transcript, summary)
    )
    conn.commit()
    cur.close()
    conn.close()

def get_transcriptions():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM transcriptions")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows





    

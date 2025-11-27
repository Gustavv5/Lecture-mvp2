import os
import psycopg2
import psycopg2.extras


DATABASE_URL = os.environ.get("DATABASE_URL")

def get_conn():
    return psycopg2.connect(DATABASE_URL, sslmode="require")

def init_db():
    """Create table if not exists (PostgreSQL)."""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS transcriptions (
            id SERIAL PRIMARY KEY,
            filename TEXT,
            transcript TEXT,
            summary TEXT
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

def insert_transcription(filename, transcript, summary):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO transcriptions (filename, transcript, summary)
        VALUES (%s, %s, %s);
    """, (filename, transcript, summary))
    conn.commit()
    cur.close()
    conn.close()

def get_transcriptions():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM transcriptions ORDER BY id DESC;")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows

def get_transcription_by_id(lecture_id):
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM transcriptions WHERE id = %s;", (lecture_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row

def delete_transcription(id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM transcriptions WHERE id = %s;", (id,))
    conn.commit()
    cur.close()
    conn.close()









    

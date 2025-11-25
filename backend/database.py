import os
import psycopg2
import psycopg2.extras

DATABASE_URL = os.getenv("DATABASE_URL")

def get_conn():
    return psycopg2.connect(DATABASE_URL, sslmode="require")

def insert_transcription(filename, transcript, summary):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO transcriptions (filename, transcript, summary)
        VALUES (%s, %s, %s)
    """, (filename, transcript, summary))
    conn.commit()
    cur.close()
    conn.close()

def get_transcriptions():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM transcriptions ORDER BY id DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows






    

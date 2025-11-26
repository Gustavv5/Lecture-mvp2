import sqlite3

DB_NAME = "transcriptions.db"


def get_conn():
    return sqlite3.connect(DB_NAME)


def insert_transcription(filename, transcript, summary):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO transcriptions (filename, transcript, summary)
        VALUES (?, ?, ?)
    """, (filename, transcript, summary))
    conn.commit()
    conn.close()


def get_transcriptions():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT rowid, filename, transcript, summary FROM transcriptions ORDER BY rowid DESC")
    rows = cur.fetchall()
    conn.close()
    return [{"id": r[0], "filename": r[1], "transcript": r[2], "summary": r[3]} for r in rows]







    

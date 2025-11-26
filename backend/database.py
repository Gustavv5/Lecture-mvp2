import sqlite3

DB_NAME = "transcriptions.db"


def get_conn():
    return sqlite3.connect(DB_NAME)


def init_db():
    """Ensure the table exists. Call this once on startup."""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS transcriptions (
            filename TEXT,
            transcript TEXT,
            summary TEXT
        )
        """
    )
    conn.commit()
    conn.close()


def insert_transcription(filename, transcript, summary):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO transcriptions (filename, transcript, summary)
        VALUES (?, ?, ?)
        """,
        (filename, transcript, summary),
    )
    conn.commit()
    conn.close()


def get_transcriptions():
    """
    Return all rows as a list of dicts:
    {id, filename, transcript, summary}
    """
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT rowid, filename, transcript, summary "
        "FROM transcriptions ORDER BY rowid DESC"
    )
    rows = cur.fetchall()
    conn.close()
    return [
        {"id": r[0], "filename": r[1], "transcript": r[2], "summary": r[3]}
        for r in rows
    ]


def get_transcription_by_id(rowid: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT rowid, filename, transcript, summary "
        "FROM transcriptions WHERE rowid = ?",
        (rowid,),
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {"id": row[0], "filename": row[1], "transcript": row[2], "summary": row[3]}


def delete_transcription(rowid: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM transcriptions WHERE rowid = ?", (rowid,))
    conn.commit()
    conn.close()








    

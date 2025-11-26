import sqlite3

conn = sqlite3.connect("transcriptions.db")
cur = conn.cursor()

cur.execute("SELECT rowid, filename, substr(transcript, 1, 100), substr(summary, 1, 100) FROM transcriptions")

rows = cur.fetchall()

print("ROWS IN DB:")
for row in rows:
    print(row)

conn.close()

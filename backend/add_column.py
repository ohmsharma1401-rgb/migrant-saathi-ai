import sqlite3
import os

db_path = os.path.abspath("saathi.db")
print("Target DB path:", db_path)

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    try:
        cur.execute("ALTER TABLE otp_sessions ADD COLUMN email VARCHAR(255);")
        conn.commit()
        print("Successfully added email column to otp_sessions in saathi.db!")
    except Exception as e:
        print("Column alter message:", e)
    conn.close()
else:
    print("saathi.db not found at:", db_path)

# Also check test.db just in case
test_db = os.path.abspath("test.db")
if os.path.exists(test_db):
    conn = sqlite3.connect(test_db)
    cur = conn.cursor()
    try:
        cur.execute("ALTER TABLE otp_sessions ADD COLUMN email VARCHAR(255);")
        conn.commit()
        print("Successfully added email column to otp_sessions in test.db!")
    except Exception as e:
        print("test.db alter message:", e)
    conn.close()

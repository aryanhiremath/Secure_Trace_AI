
import sqlite3
from pathlib import Path

db_path = Path(__file__).resolve().parent / "securetrace.db"

if not db_path.exists():
    raise FileNotFoundError(
        f"Database not found: {db_path}"
    )

connection = sqlite3.connect(db_path)

try:
    columns = {
        row[1]
        for row in connection.execute(
            "PRAGMA table_info(documents)"
        )
    }

    if not columns:
        raise RuntimeError(
            "The documents table does not exist in this database."
        )

    if "owner_email" not in columns:
        connection.execute(
            """
            ALTER TABLE documents
            ADD COLUMN owner_email VARCHAR NOT NULL
            DEFAULT 'admin@securetrace.ai'
            """
        )
        print(
            "Added owner_email. Existing documents assigned to admin."
        )
    else:
        print("owner_email column already exists.")

    connection.commit()

finally:
    connection.close()

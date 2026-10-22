
from database import engine
from sqlalchemy import text

with engine.begin() as conn:
    columns = [
        row[1]
        for row in conn.execute(text("PRAGMA table_info(documents)"))
    ]

    print("Existing columns:", columns)

    if "owner_email" not in columns:
        conn.execute(
            text("ALTER TABLE documents ADD COLUMN owner_email VARCHAR")
        )
        print("Added owner_email column")
    else:
        print("owner_email column already exists")

    conn.execute(
        text("""
            UPDATE documents
            SET owner_email = :email
            WHERE owner_email IS NULL OR owner_email = ''
        """),
        {"email": "admin@securetrace.ai"}
    )

    print("Migration completed!")
    print(conn.execute(text("PRAGMA table_info(documents)")).fetchall())

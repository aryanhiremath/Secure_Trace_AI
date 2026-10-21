
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone

from database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False, unique=True)
    content_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=False)

    # Demo user who uploaded the document
    owner_email = Column(String, nullable=False, index=True)

    uploaded_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

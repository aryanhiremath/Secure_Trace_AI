from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Literal
from uuid import uuid4

from fastapi import (
    Depends,
    FastAPI,
    File,
    Header,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

import models
from database import Base, engine, get_db


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SecureTrace AI API",
    description="Backend API for SecureTrace AI document security platform",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg",
}

ALLOWED_DEMO_USERS = {
    "admin@securetrace.ai",
    "isba@gmail.com",
    "aryan@gmail.com",
    "shreyas@gmail.com",
    "mustakim@gmail.com",
}


def utc_now_naive() -> datetime:
    """UTC timestamp stored as a naive datetime for SQLite compatibility."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def get_demo_user(
    x_user_email: str = Header(..., alias="X-User-Email"),
) -> str:
    """Resolve a demo user from the request header (demo-only identity)."""
    email = x_user_email.strip().lower()
    if email not in ALLOWED_DEMO_USERS:
        raise HTTPException(status_code=401, detail="Unknown demo user.")
    return email


class CreateShareRequest(BaseModel):
    document_id: int = Field(gt=0)
    recipient_email: str
    permission: Literal["view_only", "view_download"] = "view_only"
    expiry_hours: int = Field(default=168, ge=1, le=720)


def document_to_dict(document: models.Document):
    return {
        "id": document.id,
        "filename": document.filename,
        "content_type": document.content_type,
        "file_size": document.file_size,
        "uploaded_at": document.uploaded_at,
    }


def share_to_dict(share: models.Share, document: models.Document):
    now = utc_now_naive()
    expired = share.expires_at is not None and share.expires_at <= now
    status = "Revoked" if share.revoked_at is not None else (
        "Expired" if expired else "Active"
    )
    return {
        "id": share.id,
        "document_id": share.document_id,
        "document": document.filename,
        "owner_email": share.owner_email,
        "recipient_email": share.recipient_email,
        "permission": share.permission,
        "created_at": share.created_at,
        "expires_at": share.expires_at,
        "revoked_at": share.revoked_at,
        "status": status,
    }


def get_document_or_404(db: Session, document_id: int):
    document = db.query(models.Document).filter(
        models.Document.id == document_id
    ).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    return document


def active_share_query(db: Session, document_id: int, recipient_email: str):
    now = utc_now_naive()
    return db.query(models.Share).filter(
        models.Share.document_id == document_id,
        models.Share.recipient_email == recipient_email,
        models.Share.revoked_at.is_(None),
        (models.Share.expires_at.is_(None)) | (models.Share.expires_at > now),
    )


def require_document_view_access(
    db: Session,
    document: models.Document,
    current_email: str,
):
    if document.owner_email == current_email:
        return None

    share = active_share_query(db, document.id, current_email).first()
    if not share:
        # Don't reveal whether another user's document exists.
        raise HTTPException(status_code=404, detail="Document not found.")
    return share


@app.get("/")
def root():
    return {
        "message": "SecureTrace AI backend is running",
        "status": "success",
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "SecureTrace AI"}


@app.post("/api/documents/upload", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    owner_email: str = Depends(get_demo_user),
):
    original_name = Path(file.filename or "").name
    extension = Path(original_name).suffix.lower()

    if not original_name or extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type.")

    stored_filename = f"{uuid4().hex}{extension}"
    destination = UPLOAD_DIR / stored_filename
    file_size = 0

    try:
        with destination.open("wb") as output:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="File exceeds the 10 MB limit.",
                    )
                output.write(chunk)

        if file_size == 0:
            raise HTTPException(status_code=400, detail="Empty files are not allowed.")

        document = models.Document(
            filename=original_name,
            stored_filename=stored_filename,
            content_type=file.content_type,
            file_size=file_size,
            owner_email=owner_email,
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        return document_to_dict(document)

    except Exception:
        db.rollback()
        if destination.exists():
            destination.unlink()
        raise
    finally:
        await file.close()


@app.get("/api/documents")
def list_documents(
    db: Session = Depends(get_db),
    owner_email: str = Depends(get_demo_user),
):
    documents = (
        db.query(models.Document)
        .filter(models.Document.owner_email == owner_email)
        .order_by(models.Document.id.desc())
        .all()
    )
    return [document_to_dict(document) for document in documents]


@app.get("/api/documents/{document_id}/preview")
def preview_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_email: str = Depends(get_demo_user),
):
    document = get_document_or_404(db, document_id)
    require_document_view_access(db, document, current_email)

    file_path = UPLOAD_DIR / document.stored_filename
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Stored file not found.")

    if file_path.suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Browser preview is currently available for PDF files only.",
        )

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        headers={"Content-Disposition": 'inline; filename="preview.pdf"'},
    )


@app.get("/api/documents/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_email: str = Depends(get_demo_user),
):
    document = get_document_or_404(db, document_id)

    if document.owner_email != current_email:
        share = active_share_query(db, document.id, current_email).first()
        if not share or share.permission != "view_download":
            raise HTTPException(status_code=403, detail="Download permission denied.")

    file_path = UPLOAD_DIR / document.stored_filename
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Stored file not found.")

    return FileResponse(
        path=file_path,
        media_type=document.content_type or "application/octet-stream",
        filename=document.filename,
    )


@app.post("/api/shares", status_code=201)
def create_share(
    payload: CreateShareRequest,
    db: Session = Depends(get_db),
    owner_email: str = Depends(get_demo_user),
):
    recipient_email = payload.recipient_email.strip().lower()
    if recipient_email not in ALLOWED_DEMO_USERS:
        raise HTTPException(
            status_code=400,
            detail="Recipient must be one of the configured demo users.",
        )
    if recipient_email == owner_email:
        raise HTTPException(
            status_code=400,
            detail="You cannot share a document with yourself.",
        )

    document = db.query(models.Document).filter(
        models.Document.id == payload.document_id,
        models.Document.owner_email == owner_email,
    ).first()
    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found in your workspace.",
        )

    share = models.Share(
        document_id=document.id,
        owner_email=owner_email,
        recipient_email=recipient_email,
        permission=payload.permission,
        created_at=utc_now_naive(),
        expires_at=utc_now_naive() + timedelta(hours=payload.expiry_hours),
    )
    db.add(share)
    db.commit()
    db.refresh(share)
    return share_to_dict(share, document)


@app.get("/api/shares")
def list_created_shares(
    db: Session = Depends(get_db),
    owner_email: str = Depends(get_demo_user),
):
    rows = (
        db.query(models.Share, models.Document)
        .join(models.Document, models.Share.document_id == models.Document.id)
        .filter(models.Share.owner_email == owner_email)
        .order_by(models.Share.id.desc())
        .all()
    )
    return [share_to_dict(share, document) for share, document in rows]


@app.get("/api/shares/received")
def list_received_shares(
    db: Session = Depends(get_db),
    recipient_email: str = Depends(get_demo_user),
):
    rows = (
        db.query(models.Share, models.Document)
        .join(models.Document, models.Share.document_id == models.Document.id)
        .filter(models.Share.recipient_email == recipient_email)
        .order_by(models.Share.id.desc())
        .all()
    )
    return [share_to_dict(share, document) for share, document in rows]


@app.post("/api/shares/{share_id}/revoke")
def revoke_share(
    share_id: int,
    db: Session = Depends(get_db),
    owner_email: str = Depends(get_demo_user),
):
    share = db.query(models.Share).filter(
        models.Share.id == share_id,
        models.Share.owner_email == owner_email,
    ).first()
    if not share:
        raise HTTPException(status_code=404, detail="Share not found.")

    if share.revoked_at is None:
        share.revoked_at = utc_now_naive()
        db.commit()
        db.refresh(share)

    document = get_document_or_404(db, share.document_id)
    return share_to_dict(share, document)

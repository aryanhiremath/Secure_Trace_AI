
from pathlib import Path
from uuid import uuid4

from fastapi import (
    Depends,
    FastAPI,
    File,
    Header,
    HTTPException,
    Query,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

import models
from database import Base, engine, get_db


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SecureTrace AI API",
    description="Backend API for SecureTrace AI document security platform",
    version="1.0.0",
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
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".png",
    ".jpg",
    ".jpeg",
}

ALLOWED_DEMO_USERS = {
    "admin@securetrace.ai",
    "isba@gmail.com",
    "aryan@gmail.com",
    "shreyas@gmail.com",
    "mustakim@gmail.com",
}


def get_demo_user(
    x_user_email: str = Header(..., alias="X-User-Email"),
):
    """Resolve the current demo user from the request header."""
    email = x_user_email.strip().lower()

    if email not in ALLOWED_DEMO_USERS:
        raise HTTPException(
            status_code=401,
            detail="Unknown demo user.",
        )

    return email


def document_to_dict(document: models.Document):
    return {
        "id": document.id,
        "filename": document.filename,
        "content_type": document.content_type,
        "file_size": document.file_size,
        "uploaded_at": document.uploaded_at,
    }


@app.get("/")
def root():
    return {
        "message": "SecureTrace AI backend is running",
        "status": "success",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SecureTrace AI",
    }


@app.post("/api/documents/upload", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    owner_email: str = Depends(get_demo_user),
):
    original_name = Path(file.filename or "").name
    extension = Path(original_name).suffix.lower()

    if not original_name or extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type.",
        )

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
            raise HTTPException(
                status_code=400,
                detail="Empty files are not allowed.",
            )

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
    owner_email: str = Query(...),
    db: Session = Depends(get_db),
):
    # Validate the demo user's email from the preview URL.
    owner_email = owner_email.strip().lower()

    if owner_email not in ALLOWED_DEMO_USERS:
        raise HTTPException(
            status_code=401,
            detail="Unknown demo user.",
        )

    document = (
        db.query(models.Document)
        .filter(
            models.Document.id == document_id,
            models.Document.owner_email == owner_email,
        )
        .first()
    )

    # Return the same response if the file doesn't exist
    # or belongs to a different user.
    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    file_path = UPLOAD_DIR / document.stored_filename

    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Stored file not found.",
        )

    if file_path.suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Browser preview is currently available for PDF files only.",
        )

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"},
    )

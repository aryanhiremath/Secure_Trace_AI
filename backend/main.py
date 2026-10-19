
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine, Base

Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="SecureTrace AI API",
    description="Backend API for SecureTrace AI document security platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

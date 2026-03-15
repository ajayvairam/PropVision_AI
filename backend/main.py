"""
PropVision AI – FastAPI Application
Main entry point with all routes: upload, search, dashboard stats, image serving.
"""

import os
import json
import uuid
import logging
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import User, PropertyImage
from auth import router as auth_router, get_current_user
from ai_engine import detect_objects, generate_image_embedding, generate_text_embedding, add_to_faiss, search_faiss

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s  %(message)s")
logger = logging.getLogger(__name__)

# ── Database Initialization ────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Upload Directory ───────────────────────────────────────────────────────
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── FastAPI App ────────────────────────────────────────────────────────────
app = FastAPI(
    title="PropVision AI",
    description="Autonomous Spatial Intelligence for Property Image Understanding",
    version="1.0.0",
)

# Global exception handler to log tracebacks
import traceback
from fastapi.responses import JSONResponse
from starlette.requests import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s %s:", request.method, request.url.path)
    logger.error(traceback.format_exc())
    return JSONResponse(status_code=500, content={"detail": str(exc)})

# CORS – allow the React dev server dynamically on any port
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http(s)?://(?:localhost|127\.0\.0\.1)(?::\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images as static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include authentication routes
app.include_router(auth_router)


# ── Response Schemas ───────────────────────────────────────────────────────
class ImageResponse(BaseModel):
    id: int
    file_path: str
    file_url: str
    room_type: str
    confidence_score: float
    detected_objects: List[str]

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    total_images: int
    bedrooms: int
    kitchens: int
    living_rooms: int
    bathrooms: int
    dining_rooms: int
    studies: int


class UploadResponse(BaseModel):
    message: str
    images: List[ImageResponse]


class SearchResponse(BaseModel):
    query: str
    results: List[ImageResponse]


# ── Helpers ────────────────────────────────────────────────────────────────
def _image_to_response(img: PropertyImage) -> ImageResponse:
    """Convert a PropertyImage DB record to an API response."""
    try:
        detected = json.loads(img.detected_objects) if img.detected_objects else []
    except (json.JSONDecodeError, TypeError):
        detected = []

    filename = os.path.basename(img.file_path)
    return ImageResponse(
        id=img.id,
        file_path=img.file_path,
        file_url=f"/uploads/{filename}",
        room_type=img.room_type,
        confidence_score=img.confidence_score,
        detected_objects=detected,
    )


# ── Routes ─────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "PropVision AI API is running 🚀"}


@app.post("/upload", response_model=UploadResponse)
async def upload_images(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload one or more property images for AI processing."""
    processed: List[ImageResponse] = []

    for file in files:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            logger.warning("Skipped non-image file: %s", file.filename)
            continue

        # Save to disk
        ext = os.path.splitext(file.filename)[1] or ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        save_path = os.path.join(UPLOAD_DIR, unique_name)
        contents = await file.read()
        with open(save_path, "wb") as f:
            f.write(contents)
        logger.info("Saved upload → %s", save_path)

        # ── AI Pipeline ────────────────────────────────────────────────
        # 1. YOLO11 object detection
        detection = detect_objects(save_path)
        logger.info("YOLO11 → %s (%s, %.2f)", detection["detected_objects"], detection["room_type"], detection["confidence_score"])

        # 2. CLIP embedding
        embedding = generate_image_embedding(save_path)

        # 3. Save to database
        db_image = PropertyImage(
            file_path=save_path,
            room_type=detection["room_type"],
            confidence_score=detection["confidence_score"],
            detected_objects=json.dumps(detection["detected_objects"]),
            user_id=current_user.id,
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)

        # 4. Add to FAISS index
        add_to_faiss(embedding, db_image.id)

        processed.append(_image_to_response(db_image))

    if not processed:
        raise HTTPException(status_code=400, detail="No valid image files were uploaded.")

    return UploadResponse(message=f"Successfully processed {len(processed)} image(s).", images=processed)


@app.get("/search", response_model=SearchResponse)
def search_images(
    query: str = Query(..., min_length=1, description="Natural language search query"),
    top_k: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Semantic search over property images using CLIP + FAISS."""
    # Generate text embedding for the query
    query_embedding = generate_text_embedding(query)

    # Search FAISS
    faiss_results = search_faiss(query_embedding, top_k=top_k)

    if not faiss_results:
        return SearchResponse(query=query, results=[])

    # Fetch matching images from DB
    image_ids = [img_id for img_id, _ in faiss_results]
    images = db.query(PropertyImage).filter(
        PropertyImage.id.in_(image_ids),
        PropertyImage.user_id == current_user.id,
    ).all()

    # Preserve FAISS ranking order
    id_to_image = {img.id: img for img in images}
    ordered = [_image_to_response(id_to_image[img_id]) for img_id in image_ids if img_id in id_to_image]

    return SearchResponse(query=query, results=ordered)


@app.get("/my-images", response_model=List[ImageResponse])
def get_my_images(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all images belonging to the authenticated user."""
    images = (
        db.query(PropertyImage)
        .filter(PropertyImage.user_id == current_user.id)
        .order_by(PropertyImage.id.desc())
        .all()
    )
    return [_image_to_response(img) for img in images]


@app.get("/stats", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return dashboard metrics for the authenticated user."""
    user_images = db.query(PropertyImage).filter(PropertyImage.user_id == current_user.id)
    total = user_images.count()

    def _count(room: str) -> int:
        return user_images.filter(PropertyImage.room_type == room).count()

    return StatsResponse(
        total_images=total,
        bedrooms=_count("Bedroom"),
        kitchens=_count("Kitchen"),
        living_rooms=_count("Living Room"),
        bathrooms=_count("Bathroom"),
        dining_rooms=_count("Dining Room"),
        studies=_count("Study"),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

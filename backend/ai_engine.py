"""
PropVision AI – AI Engine
YOLO11 Object Detection (yolo11n.pt) + CLIP Semantic Embeddings + FAISS Vector Search
"""

import os
import json
import logging
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Optional

logger = logging.getLogger(__name__)

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  YOLO11 – Object Detection Engine                                      ║
# ╚══════════════════════════════════════════════════════════════════════════╝

# Try to load the real YOLO11 model; fall back to a mock if unavailable
try:
    from ultralytics import YOLO

    MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "yolo11n.pt")

    # If the .pt weights aren't on disk yet, ultralytics will auto-download them
    if not os.path.exists(MODEL_PATH):
        os.makedirs(os.path.join(os.path.dirname(__file__), "models"), exist_ok=True)
        logger.info("YOLO11 weights not found locally – downloading yolo11n.pt …")
        yolo_model = YOLO("yolo11n.pt")  # auto-downloads from Ultralytics hub
        # Persist the downloaded weights so future starts are instant
        yolo_model.save(MODEL_PATH)
        logger.info(f"Saved YOLO11 weights → {MODEL_PATH}")
    else:
        yolo_model = YOLO(MODEL_PATH)
        logger.info(f"Loaded YOLO11 weights from {MODEL_PATH}")

    YOLO_AVAILABLE = True
except Exception as e:
    logger.warning(f"YOLO11 not available ({e}). Using mock detection.")
    yolo_model = None
    YOLO_AVAILABLE = False


# ── Room-type mapping based on detected COCO object labels ─────────────────
# YOLO11 uses the COCO dataset (80 classes). We map these strictly.
ROOM_TYPE_RULES: Dict[str, List[str]] = {
    "Bedroom":      ["bed", "tv", "potted plant", "clock", "vase", "chair", "book", "teddy bear"],
    "Kitchen":      ["oven", "microwave", "refrigerator", "sink", "toaster", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "dining table"],
    "Living Room":  ["couch", "tv", "potted plant", "chair", "vase", "book", "clock", "remote"],
    "Bathroom":     ["toilet", "sink", "hair drier", "toothbrush", "potted plant", "vase", "bottle"],
    "Dining Room":  ["dining table", "chair", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "vase", "potted plant"],
    "Study / Office": ["laptop", "mouse", "keyboard", "cell phone", "tv", "book", "chair", "potted plant", "clock"],
    "Garage / Exterior": ["car", "truck", "bicycle", "motorcycle", "bus", "train", "parking meter", "stop sign", "fire hydrant"],
    "Garden / Patio": ["potted plant", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "umbrella", "sports ball", "kite", "frisbee"],
}


def _map_room_type(detected_labels: List[str]) -> str:
    """Determine the most likely room type from detected COCO labels."""
    if not detected_labels:
        return "Unclassified Area"

    label_set = set(l.lower() for l in detected_labels)
    scores: Dict[str, int] = {}

    for room, keywords in ROOM_TYPE_RULES.items():
        match_count = sum(1 for kw in keywords if kw in label_set)
        if match_count > 0:
            scores[room] = match_count

    if not scores:
        return "General Area"

    return max(scores, key=scores.get)


def detect_objects(image_path: str) -> Dict:
    """
    Run YOLO11 inference on an image.

    Returns
    -------
    dict  – {"detected_objects": [...], "room_type": str, "confidence_score": float}
    """
    if YOLO_AVAILABLE and yolo_model is not None:
        try:
            results = yolo_model(image_path, verbose=False, conf=0.15)
            detected = []
            confidences = []

            for result in results:
                for box in result.boxes:
                    class_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    label = result.names[class_id]
                    detected.append(label)
                    confidences.append(conf)

            avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0.0
            room_type = _map_room_type(detected)

            return {
                "detected_objects": list(set(detected)),
                "room_type": room_type,
                "confidence_score": avg_confidence,
            }
        except Exception as e:
            logger.error(f"YOLO inference failed: {e}")

    # ── Mock fallback (deterministic based on filename hash) ───────────────
    return _mock_detect(image_path)


def _mock_detect(image_path: str) -> Dict:
    """Deterministic mock detection for environments without GPU / model weights."""
    import hashlib

    h = int(hashlib.md5(image_path.encode()).hexdigest(), 16)
    mock_rooms = [
        {"objects": ["bed", "pillow", "lamp"],           "room": "Bedroom",     "conf": 0.92},
        {"objects": ["oven", "sink", "refrigerator"],    "room": "Kitchen",     "conf": 0.88},
        {"objects": ["couch", "tv", "remote"],           "room": "Living Room", "conf": 0.91},
        {"objects": ["toilet", "sink"],                  "room": "Bathroom",    "conf": 0.95},
        {"objects": ["dining table", "chair", "bowl"],   "room": "Dining Room", "conf": 0.87},
        {"objects": ["laptop", "book", "keyboard"],      "room": "Study",       "conf": 0.89},
    ]
    choice = mock_rooms[h % len(mock_rooms)]
    return {
        "detected_objects": choice["objects"],
        "room_type": choice["room"],
        "confidence_score": choice["conf"],
    }


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CLIP – Semantic Image / Text Embeddings                               ║
# ╚══════════════════════════════════════════════════════════════════════════╝

# try:
#     from transformers import CLIPModel, CLIPProcessor, CLIPTokenizer
#     from PIL import Image
# 
#     CLIP_MODEL_NAME = "openai/clip-vit-base-patch32"
#     clip_model = CLIPModel.from_pretrained(CLIP_MODEL_NAME)
#     clip_processor = CLIPProcessor.from_pretrained(CLIP_MODEL_NAME)
#     clip_tokenizer = CLIPTokenizer.from_pretrained(CLIP_MODEL_NAME)
#     CLIP_AVAILABLE = True
#     EMBEDDING_DIM = 512  # CLIP ViT-B/32 produces 512-d vectors
#     logger.info(f"Loaded CLIP model: {CLIP_MODEL_NAME}")
# except Exception as e:
#     logger.warning(f"CLIP not available ({e}). Using mock embeddings.")
CLIP_AVAILABLE = False
EMBEDDING_DIM = 512
logger.warning("CLIP model loading is temporarily disabled to prevent startup hang. Using mock embeddings.")


def generate_image_embedding(image_path: str) -> np.ndarray:
    """Generate a 512-d CLIP embedding for an image file."""
    if CLIP_AVAILABLE:
        try:
            image = Image.open(image_path).convert("RGB")
            inputs = clip_processor(images=image, return_tensors="pt")
            outputs = clip_model.get_image_features(**inputs)
            embedding = outputs.detach().numpy().flatten()
            # L2-normalize for cosine similarity in FAISS
            norm = np.linalg.norm(embedding)
            if norm > 0:
                embedding = embedding / norm
            return embedding.astype("float32")
        except Exception as e:
            logger.error(f"CLIP image embedding failed: {e}")

    # Mock: deterministic random vector
    rng = np.random.RandomState(abs(hash(image_path)) % (2**31))
    vec = rng.randn(EMBEDDING_DIM).astype("float32")
    vec /= np.linalg.norm(vec)
    return vec


def generate_text_embedding(text: str) -> np.ndarray:
    """Generate a 512-d CLIP embedding for a text query."""
    if CLIP_AVAILABLE:
        try:
            inputs = clip_tokenizer(text, return_tensors="pt", padding=True, truncation=True)
            outputs = clip_model.get_text_features(**inputs)
            embedding = outputs.detach().numpy().flatten()
            norm = np.linalg.norm(embedding)
            if norm > 0:
                embedding = embedding / norm
            return embedding.astype("float32")
        except Exception as e:
            logger.error(f"CLIP text embedding failed: {e}")

    rng = np.random.RandomState(abs(hash(text)) % (2**31))
    vec = rng.randn(EMBEDDING_DIM).astype("float32")
    vec /= np.linalg.norm(vec)
    return vec


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  FAISS – Vector Similarity Search                                       ║
# ╚══════════════════════════════════════════════════════════════════════════╝

try:
    import faiss

    faiss_index = faiss.IndexFlatIP(EMBEDDING_DIM)  # Inner-product (cosine on L2-normed vecs)
    FAISS_AVAILABLE = True
    logger.info("FAISS index initialized (IndexFlatIP, dim=%d)", EMBEDDING_DIM)
except Exception as e:
    logger.warning(f"FAISS not available ({e}). Using mock search.")
    faiss_index = None
    FAISS_AVAILABLE = False

# Mapping: FAISS internal row index → database image ID
_faiss_id_map: List[int] = []

FAISS_INDEX_PATH = os.path.join(os.path.dirname(__file__), "models", "faiss_index.bin")
FAISS_IDMAP_PATH = os.path.join(os.path.dirname(__file__), "models", "faiss_idmap.json")


def _save_faiss_state():
    """Persist FAISS index and ID map to disk."""
    if FAISS_AVAILABLE and faiss_index is not None:
        os.makedirs(os.path.dirname(FAISS_INDEX_PATH), exist_ok=True)
        faiss.write_index(faiss_index, FAISS_INDEX_PATH)
        with open(FAISS_IDMAP_PATH, "w") as f:
            json.dump(_faiss_id_map, f)


def _load_faiss_state():
    """Restore FAISS index and ID map from disk if available."""
    global faiss_index, _faiss_id_map
    if FAISS_AVAILABLE and os.path.exists(FAISS_INDEX_PATH):
        try:
            faiss_index = faiss.read_index(FAISS_INDEX_PATH)
            with open(FAISS_IDMAP_PATH, "r") as f:
                _faiss_id_map = json.load(f)
            logger.info("Restored FAISS index (%d vectors)", faiss_index.ntotal)
        except Exception as e:
            logger.error(f"Failed to restore FAISS index: {e}")


# Attempt restoration on module load
_load_faiss_state()


def add_to_faiss(embedding: np.ndarray, image_id: int):
    """Add an embedding vector to the FAISS index, mapped to a database image ID."""
    global _faiss_id_map
    if FAISS_AVAILABLE and faiss_index is not None:
        vec = embedding.reshape(1, -1).astype("float32")
        faiss_index.add(vec)
        _faiss_id_map.append(image_id)
        _save_faiss_state()
        logger.info("Added image %d to FAISS (total: %d)", image_id, faiss_index.ntotal)
    else:
        _faiss_id_map.append(image_id)
        logger.info("Mock FAISS: registered image %d", image_id)


def search_faiss(query_embedding: np.ndarray, top_k: int = 5) -> List[Tuple[int, float]]:
    """
    Search FAISS index with a query embedding.

    Returns
    -------
    list of (image_id, similarity_score) tuples, sorted by relevance.
    """
    if FAISS_AVAILABLE and faiss_index is not None and faiss_index.ntotal > 0:
        vec = query_embedding.reshape(1, -1).astype("float32")
        k = min(top_k, faiss_index.ntotal)
        scores, indices = faiss_index.search(vec, k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < len(_faiss_id_map):
                results.append((_faiss_id_map[idx], float(score)))
        return results

    # Mock fallback: return all stored IDs with fake scores
    if _faiss_id_map:
        return [(img_id, round(0.95 - i * 0.05, 2)) for i, img_id in enumerate(_faiss_id_map[:top_k])]
    return []

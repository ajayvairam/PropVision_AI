<p align="center">
  <img src="https://img.shields.io/badge/YOLO11-Object%20Detection-00D26A?style=for-the-badge&logo=yolo&logoColor=white" />
  <img src="https://img.shields.io/badge/CLIP-Semantic%20Search-FFD700?style=for-the-badge&logo=openai&logoColor=black" />
  <img src="https://img.shields.io/badge/FAISS-Vector%20Search-4285F4?style=for-the-badge&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React%2019-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
</p>

<h1 align="center">🔍 PropVision AI</h1>

<p align="center">
  <strong>Autonomous Spatial Intelligence for Property Image Understanding</strong>
</p>

<p align="center">
  Transform raw property images into structured, searchable data.<br/>
  AI-powered object detection • automatic room classification • natural-language semantic search — all in seconds.
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧠 Overview

**PropVision AI** is a full-stack computer-vision platform designed for the real estate industry. It accepts property photographs and autonomously:

1. **Detects objects** (beds, couches, refrigerators, sinks, …) using **YOLO11** (80 COCO classes).
2. **Classifies rooms** (Bedroom, Kitchen, Living Room, Bathroom, Dining Room, Study, Garage, Garden) via a rule-based mapping engine driven by detected object constellations.
3. **Generates semantic embeddings** with **OpenAI CLIP** (ViT-B/32) and indexes them in **FAISS** for sub-second natural-language search — query with phrases like *"bright study with large windows"* and get visually relevant results.

Everything is wrapped in a sleek **React 19** frontend with protected routes, a dashboard with real-time metrics, drag-and-drop upload, and an analysis/search page.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **🎯 YOLO11 Object Detection** | State-of-the-art real-time inference identifies 80+ COCO objects with bounding boxes and per-object confidence scores |
| **🏠 Automatic Room Classification** | Intelligent mapping engine classifies room types based on detected object constellations |
| **🔎 Semantic Search (CLIP + FAISS)** | Natural-language queries powered by CLIP text/image embeddings indexed in a FAISS inner-product vector store |
| **📊 Dashboard Analytics** | Real-time metric cards: total images, bedrooms, kitchens, living rooms, bathrooms breakdown |
| **📤 Drag-and-Drop Upload** | Intuitive upload interface with live progress, batch processing, and instant AI analysis results |
| **🔐 JWT Authentication** | Secure signup/login with bcrypt-hashed passwords and 24-hour JWT tokens |
| **👤 Profile Management** | Change password, delete account, and view account details |
| **🔍 Room-Type Filtering** | Filter analyzed images by detected room type (Bedroom, Kitchen, Living Room, etc.) |
| **⚡ Real-Time Processing** | Full AI pipeline (detection → classification → embedding → indexing) completes in < 2 seconds |
| **🧩 Graceful Fallbacks** | Mock detection and embedding engines when YOLO/CLIP/FAISS are unavailable — the app always runs |

---

## 🏗 Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     React 19 Frontend                      │
│  ┌──────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌─────────┐  │
│  │ Home │ │Dashboard │ │ Upload │ │Analysis│ │ Profile │  │
│  └──┬───┘ └────┬─────┘ └───┬────┘ └───┬────┘ └────┬────┘  │
│     └──────────┴───────────┴──────────┴────────────┘       │
│                         Axios HTTP                         │
└────────────────────────┬───────────────────────────────────┘
                         │  REST API
┌────────────────────────▼───────────────────────────────────┐
│                    FastAPI Backend                          │
│                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐  │
│  │  Auth (JWT)  │  │  Routes     │  │   Static Files    │  │
│  │  /signup     │  │  /upload    │  │   /uploads/*      │  │
│  │  /login      │  │  /search    │  └───────────────────┘  │
│  │  /change-pwd │  │  /my-images │                         │
│  │  /delete-acc │  │  /stats     │                         │
│  └─────────────┘  └──────┬──────┘                         │
│                          │                                 │
│  ┌───────────────────────▼────────────────────────────┐    │
│  │               AI Engine Pipeline                    │    │
│  │                                                     │    │
│  │  ┌──────────┐   ┌───────────┐   ┌───────────────┐  │    │
│  │  │ YOLO11   │──▶│   CLIP    │──▶│    FAISS      │  │    │
│  │  │ Detection│   │ Embedding │   │ Vector Index  │  │    │
│  │  └──────────┘   └───────────┘   └───────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                  │
│  ┌───────────────────────▼────────────────────────────┐     │
│  │            SQLite (SQLAlchemy ORM)                  │     │
│  │   Users  ───1:N──▶  PropertyImages                 │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance async Python API framework |
| **SQLAlchemy + SQLite** | ORM and lightweight relational database |
| **YOLO11 (Ultralytics)** | Real-time object detection (yolo11n.pt) |
| **OpenAI CLIP** | Image/text embedding generation (ViT-B/32, 512-d) |
| **FAISS** | Facebook AI Similarity Search – vector index |
| **bcrypt + python-jose** | Password hashing and JWT token management |
| **Uvicorn** | ASGI server for production-grade performance |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | Component-based UI framework |
| **React Router v7** | Client-side routing with protected routes |
| **Vite 8** | Lightning-fast dev server and build tool |
| **Axios** | HTTP client for API communication |
| **Lucide React** | Beautiful, consistent icon system |
| **Vanilla CSS** | Custom-designed styles with modern aesthetics |

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.9+  
- **Node.js** 18+  
- **pip** and **npm**

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/PropVision-AI.git
cd PropVision-AI
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
python main.py
```

The backend will start at **`http://localhost:8000`**.  
Interactive API docs are available at **`http://localhost:8000/docs`**.

> **Note:** YOLO11 weights (`yolo11n.pt`) auto-download on first run if not present. CLIP and FAISS gracefully fall back to mock engines if unavailable.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will start at **`http://localhost:5173`**.

### 4. Create an Account

1. Navigate to `http://localhost:5173`
2. Click **Sign Up** and create your account
3. Upload property images and watch the AI pipeline in action!

---

## 📡 API Reference

All authenticated endpoints require a `Bearer` token in the `Authorization` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ❌ | Health check |
| `POST` | `/signup` | ❌ | Register a new user |
| `POST` | `/login` | ❌ | Authenticate and get JWT token |
| `POST` | `/upload` | ✅ | Upload images for AI analysis |
| `GET` | `/search?query=...` | ✅ | Semantic search over property images |
| `GET` | `/my-images` | ✅ | List all images for the current user |
| `GET` | `/stats` | ✅ | Dashboard metrics (room-type breakdown) |
| `POST` | `/change-password` | ✅ | Update account password |
| `DELETE` | `/delete-account` | ✅ | Permanently delete account and all data |

### Example: Upload Images
```bash
curl -X POST http://localhost:8000/upload \
  -H "Authorization: Bearer <your-token>" \
  -F "files=@bedroom.png" \
  -F "files=@kitchen.jpg"
```

### Example: Semantic Search
```bash
curl "http://localhost:8000/search?query=modern+kitchen+with+stainless+steel" \
  -H "Authorization: Bearer <your-token>"
```

---

## 📁 Project Structure

```
PropVision AI/
│
├── backend/
│   ├── main.py              # FastAPI app entry point & routes
│   ├── ai_engine.py         # YOLO11 + CLIP + FAISS AI pipeline
│   ├── auth.py              # JWT authentication & user management
│   ├── database.py          # SQLAlchemy engine & session config
│   ├── models.py            # User & PropertyImage ORM models
│   ├── requirements.txt     # Python dependencies
│   ├── models/              # AI model weights (yolo11n.pt, FAISS index)
│   └── uploads/             # Uploaded property images
│
├── frontend/
│   ├── index.html            # HTML entry point
│   ├── package.json          # Node.js dependencies & scripts
│   ├── vite.config.js        # Vite configuration
│   └── src/
│       ├── main.jsx          # React app bootstrap
│       ├── App.jsx           # Router with protected routes
│       ├── App.css           # Global styles
│       ├── api.js            # Axios instance with auth interceptors
│       └── pages/
│           ├── Home.jsx      # Landing page with hero & feature grid
│           ├── Home.css
│           ├── Auth.jsx      # Login / Sign Up form
│           ├── Auth.css
│           ├── Dashboard.jsx # Metrics dashboard & image gallery
│           ├── Dashboard.css
│           ├── Upload.jsx    # Drag-and-drop upload with live results
│           ├── Upload.css
│           ├── Analysis.jsx  # Semantic search & room-type filtering
│           ├── Analysis.css
│           ├── Profile.jsx   # Account settings & management
│           └── Profile.css
│
├── .gitignore
└── README.md
```

---

## 📸 Screenshots

> _Screenshots coming soon — run the app locally to explore the full UI!_

| Page | Description |
|------|-------------|
| **Home** | Hero section with animated gradients, feature cards, and "How It Works" steps |
| **Dashboard** | Metric cards, image gallery with room-type badges and confidence scores |
| **Upload** | Drag-and-drop zone, file list, progress bar, and instant AI results |
| **Analysis** | Semantic search bar, room-type filter pills, and detailed detection cards |
| **Profile** | Account info, password change, and account deletion with confirmation |

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** this repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using YOLO11, CLIP, FAISS, FastAPI & React
</p>

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Brain, Eye, Search, Upload, Zap, Shield,
  ArrowRight, Sparkles, ScanLine, Image as ImageIcon
} from 'lucide-react'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const token = localStorage.getItem('propvision_token')

  return (
    <div className="home-page">
      {/* ── Navbar ────────────────────────────────────────────────── */}
      <nav className="home-nav">
        <div className="home-nav-inner container">
          <div className="home-logo" onClick={() => navigate('/')}>
            <div className="logo-icon">
              <Eye size={24} />
            </div>
            <span className="logo-text">PropVision <span className="logo-accent">AI</span></span>
          </div>
          <div className="home-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            {token ? (
              <button className="nav-btn-primary" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
            ) : (
              <>
                <button className="nav-btn-outline" onClick={() => navigate('/auth')}>
                  Sign In
                </button>
                <button className="nav-btn-primary" onClick={() => navigate('/auth')}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-bg-shapes">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
        </div>
        <div className="hero-content container">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>NOW POWERED BY GPT-4 VISION</span>
          </div>
          <h1 className="hero-headline">
            Autonomous <span className="highlight-green">Spatial Intelligence</span> for
            Property <span className="highlight-yellow">Image Understanding</span>
          </h1>
          <p className="hero-subtitle">
            Transform raw property images into structured, searchable data. Our AI automatically
            detects objects, classifies rooms, and enables semantic search — all in seconds.
          </p>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={() => navigate(token ? '/dashboard' : '/auth')}>
              Get Started
              <ArrowRight size={18} />
            </button>
            <button className="hero-btn-outline" onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              Explore Features
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">99.2%</span>
              <span className="stat-label">Detection Accuracy</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-number">&lt;2s</span>
              <span className="stat-label">Processing Time</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-number">6+</span>
              <span className="stat-label">Room Types</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────── */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Core Capabilities</span>
            <h2>Intelligent Image Understanding</h2>
            <p>Powered by YOLO11, CLIP, and FAISS — the most advanced vision stack available.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon-green">
                <ScanLine size={28} />
              </div>
              <h3>YOLO11 Object Detection</h3>
              <p>State-of-the-art real-time detection identifies beds, sofas, sinks, and 80+ COCO objects with industry-leading accuracy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-yellow">
                <Brain size={28} />
              </div>
              <h3>Auto Room Classification</h3>
              <p>Intelligent mapping engine automatically classifies rooms — Bedroom, Kitchen, Living Room — based on detected object constellations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-green">
                <Search size={28} />
              </div>
              <h3>Semantic Search</h3>
              <p>CLIP embeddings + FAISS vector search let you query with natural language like "bright study with large windows" and get instant results.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-yellow">
                <Zap size={28} />
              </div>
              <h3>Real-Time Processing</h3>
              <p>Upload images and receive AI analysis in under 2 seconds. Built for scale with efficient batch processing capabilities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Workflow</span>
            <h2>How It Works</h2>
            <p>From upload to insight in four automated steps.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon"><Upload size={24} /></div>
              <h3>Upload Images</h3>
              <p>Drag and drop property images through our intuitive upload interface.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon"><Eye size={24} /></div>
              <h3>AI Detection</h3>
              <p>YOLO11 scans every image and detects objects with precise bounding boxes.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon"><Brain size={24} /></div>
              <h3>Room Classification</h3>
              <p>Our engine maps detected objects to room types automatically.</p>
            </div>
            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-icon"><Search size={24} /></div>
              <h3>Semantic Search</h3>
              <p>Find any property image using natural language queries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <Eye size={20} />
              <span>PropVision AI</span>
            </div>
            <p>© 2024 PropVision AI. Autonomous Spatial Intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

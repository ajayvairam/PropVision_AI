import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye, Upload as UploadIcon, LayoutDashboard, BarChart3,
  LogOut, CloudUpload, FileImage, CheckCircle, X, AlertCircle, Menu, User
} from 'lucide-react'
import api, { API_URL } from '../api'
import './Upload.css'

function Upload() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (selectedFiles) => {
    const imageFiles = Array.from(selectedFiles).filter((f) =>
      f.type.startsWith('image/')
    )
    if (imageFiles.length === 0) {
      setError('Please select valid image files.')
      return
    }
    setFiles((prev) => [...prev, ...imageFiles])
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one image to upload.')
      return
    }

    setUploading(true)
    setProgress(0)
    setError('')
    setResults([])

    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setProgress(pct)
        },
      })
      setResults(response.data.images)
      setFiles([])
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('propvision_token')
    localStorage.removeItem('propvision_username')
    navigate('/')
  }

  return (
    <div className="dashboard-layout">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="sidebar sidebar-open">
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => navigate('/')}>
            <div className="sidebar-logo-icon">
              <Eye size={20} />
            </div>
            <span>PropVision <span className="logo-accent">AI</span></span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-link" onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button className="sidebar-link active">
            <UploadIcon size={20} />
            <span>Upload</span>
          </button>
          <button className="sidebar-link" onClick={() => navigate('/analysis')}>
            <BarChart3 size={20} />
            <span>Analysis</span>
          </button>
          <button className="sidebar-link" onClick={() => navigate('/profile')}>
            <User size={20} />
            <span>Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h1>Upload Images</h1>
            <p>Upload property images for AI-powered analysis</p>
          </div>
        </header>

        <div className="upload-content">
          {/* Drop Zone */}
          <div
            className={`drop-zone ${dragOver ? 'drop-zone-active' : ''} ${files.length > 0 ? 'drop-zone-has-files' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <div className="drop-zone-icon">
              <CloudUpload size={48} />
            </div>
            <h3>Drag & Drop Images Here</h3>
            <p>or click to browse files</p>
            <span className="drop-zone-hint">Supports JPG, PNG, WEBP</span>
          </div>

          {/* Error */}
          {error && (
            <div className="upload-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="file-list">
              <div className="file-list-header">
                <h3>{files.length} file(s) selected</h3>
                <button className="clear-all-btn" onClick={() => setFiles([])}>Clear All</button>
              </div>
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <FileImage size={18} className="file-item-icon" />
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(0)} KB</span>
                  <button className="file-remove" onClick={(e) => { e.stopPropagation(); removeFile(index) }}>
                    <X size={16} />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              <button className="upload-submit-btn" onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <UploadIcon size={18} />
                    Upload & Analyze
                  </>
                )}
              </button>
            </div>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div className="upload-progress">
              <div className="progress-header">
                <span>Analyzing images with YOLO11 + CLIP…</span>
                <span className="progress-pct">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="upload-results">
              <div className="results-header">
                <CheckCircle size={20} className="results-icon" />
                <h3>Analysis Complete — {results.length} image(s) processed</h3>
              </div>
              <div className="results-grid">
                {results.map((img) => (
                  <div key={img.id} className="result-card">
                    <div className="result-card-img">
                      <img src={`${API_URL}${img.file_url}`} alt={img.room_type} />
                      <div className="image-overlay">
                        <span className="room-type-badge">{img.room_type}</span>
                        <span className="confidence-badge">
                          {Math.round(img.confidence_score * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="result-card-info">
                      <div className="object-tags">
                        {img.detected_objects.map((obj, i) => (
                          <span key={i} className="object-tag">{obj}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="view-dashboard-btn" onClick={() => navigate('/dashboard')}>
                View Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Upload

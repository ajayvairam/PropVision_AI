import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Eye, Search, Upload, LayoutDashboard, BarChart3,
  LogOut, Filter, SlidersHorizontal, User
} from 'lucide-react'
import api, { API_URL } from '../api'
import './Analysis.css'

const ROOM_FILTERS = ['All', 'Bedroom', 'Kitchen', 'Living Room', 'Bathroom', 'Dining Room', 'Study', 'General Room']

function Analysis() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('query') || ''

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeFilter, setActiveFilter] = useState('All')
  const [images, setImages] = useState([])
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    fetchAllImages()
  }, [])

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const fetchAllImages = async () => {
    setLoading(true)
    try {
      const res = await api.get('/my-images')
      setImages(res.data)
    } catch (err) {
      console.error('Failed to fetch images:', err)
    } finally {
      setLoading(false)
    }
  }

  const performSearch = async (query) => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await api.get(`/search?query=${encodeURIComponent(query.trim())}`)
      setSearchResults(res.data.results)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults(null)
    setSearched(false)
    setActiveFilter('All')
  }

  const displayImages = searchResults !== null ? searchResults : images
  const filteredImages = activeFilter === 'All'
    ? displayImages
    : displayImages.filter((img) => img.room_type === activeFilter)

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
          <button className="sidebar-link" onClick={() => navigate('/upload')}>
            <Upload size={20} />
            <span>Upload</span>
          </button>
          <button className="sidebar-link active">
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
            <h1>Analysis & Search</h1>
            <p>Search and explore your property images with AI</p>
          </div>
        </header>

        <div className="analysis-content">
          {/* Search Bar */}
          <form className="analysis-search" onSubmit={handleSearch}>
            <div className="analysis-search-wrapper">
              <Search size={20} className="analysis-search-icon" />
              <input
                type="text"
                placeholder='Try "bright study room with large window" or "modern kitchen"'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search-btn" onClick={clearSearch}>
                  Clear
                </button>
              )}
              <button type="submit" className="search-submit-btn" disabled={loading}>
                <Search size={18} />
                Search
              </button>
            </div>
          </form>

          {/* Filters */}
          <div className="filter-bar">
            <div className="filter-label">
              <Filter size={16} />
              <span>Filter by Room</span>
            </div>
            <div className="filter-buttons">
              {ROOM_FILTERS.map((filter) => (
                <button
                  key={filter}
                  className={`filter-btn ${activeFilter === filter ? 'filter-btn-active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Results Header */}
          {searched && searchResults !== null && (
            <div className="results-info">
              <SlidersHorizontal size={16} />
              <span>
                Found <strong>{filteredImages.length}</strong> result(s) for "<strong>{searchQuery}</strong>"
              </span>
            </div>
          )}

          {/* Image Grid */}
          {loading ? (
            <div className="analysis-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="image-card-skeleton"></div>
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="empty-state">
              <Search size={48} />
              <h3>{searched ? 'No Results Found' : 'No Images Yet'}</h3>
              <p>
                {searched
                  ? 'Try a different search query or room filter.'
                  : 'Upload property images to see them analyzed here.'}
              </p>
              {!searched && (
                <button className="empty-upload-btn" onClick={() => navigate('/upload')}>
                  <Upload size={18} />
                  Upload Images
                </button>
              )}
            </div>
          ) : (
            <div className="analysis-grid">
              {filteredImages.map((img) => (
                <div key={img.id} className="analysis-card">
                  <div className="analysis-card-img">
                    <img src={`${API_URL}${img.file_url}`} alt={img.room_type} loading="lazy" />
                    <div className="image-overlay">
                      <span className="room-type-badge">{img.room_type}</span>
                      <span className="confidence-badge">
                        {Math.round(img.confidence_score * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="analysis-card-body">
                    <div className="analysis-card-header">
                      <h3>{img.room_type}</h3>
                      <span className="confidence-score-text">
                        Confidence: {Math.round(img.confidence_score * 100)}%
                      </span>
                    </div>
                    <div className="analysis-card-tags">
                      <span className="tags-label">YOLO11 Detected:</span>
                      <div className="object-pills">
                        {img.detected_objects.map((obj, i) => (
                          <span key={i} className="object-pill">{obj}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Analysis

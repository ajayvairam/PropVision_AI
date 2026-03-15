import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Eye, Search, Upload, LayoutDashboard, Image as ImageIcon,
  LogOut, Menu, X, BedDouble, CookingPot,
  Sofa, Bath, ChevronRight, User
} from 'lucide-react'
import api, { API_URL } from '../api'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const username = localStorage.getItem('propvision_username') || 'User'
  const [stats, setStats] = useState({
    total_images: 0, bedrooms: 0, kitchens: 0, living_rooms: 0,
    bathrooms: 0, dining_rooms: 0, studies: 0,
  })
  const [images, setImages] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, imagesRes] = await Promise.all([
        api.get('/stats'),
        api.get('/my-images'),
      ])
      setStats(statsRes.data)
      setImages(imagesRes.data)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('propvision_token')
    localStorage.removeItem('propvision_username')
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/analysis?query=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const metricCards = [
    { label: 'Total Images', value: stats.total_images, icon: <ImageIcon size={22} />, color: 'green' },
    { label: 'Bedrooms', value: stats.bedrooms, icon: <BedDouble size={22} />, color: 'yellow' },
    { label: 'Kitchens', value: stats.kitchens, icon: <CookingPot size={22} />, color: 'green' },
    { label: 'Living Rooms', value: stats.living_rooms, icon: <Sofa size={22} />, color: 'yellow' },
  ]

  return (
    <div className="dashboard-layout">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => navigate('/')}>
            <div className="sidebar-logo-icon">
              <Eye size={20} />
            </div>
            {sidebarOpen && <span>PropVision <span className="logo-accent">AI</span></span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button className={`sidebar-link active`} onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button className="sidebar-link" onClick={() => navigate('/upload')}>
            <Upload size={20} />
            {sidebarOpen && <span>Upload</span>}
          </button>
          <Link to="/analysis" className={`sidebar-link ${location.pathname === '/analysis' ? 'active' : ''}`}>
            <Search size={20} />
            {sidebarOpen && <span>Analysis</span>}
          </Link>
          <Link to="/profile" className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`}>
            <User size={20} />
            {sidebarOpen && <span>Profile</span>}
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h1>Dashboard</h1>
            <p>Welcome back, <strong>{username}</strong></p>
          </div>
          <div className="topbar-right">
            <form className="topbar-search" onSubmit={handleSearch}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search images... (e.g. bright study room)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <button className="topbar-upload-btn" onClick={() => navigate('/upload')}>
              <Upload size={18} />
              Upload Images
            </button>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="metrics-grid">
          {metricCards.map((card, idx) => (
            <div key={idx} className="metric-card">
              <div className={`metric-icon metric-icon-${card.color}`}>
                {card.icon}
              </div>
              <div className="metric-info">
                <span className="metric-value">{loading ? '—' : card.value}</span>
                <span className="metric-label">{card.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Images Section */}
        <div className="dashboard-section">
          <div className="section-title-row">
            <h2>Your Property Images</h2>
            <button className="see-all-btn" onClick={() => navigate('/analysis')}>
              See All <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="image-card-skeleton"></div>
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="empty-state">
              <ImageIcon size={48} />
              <h3>No Images Yet</h3>
              <p>Upload your first property images to get started with AI analysis.</p>
              <button className="empty-upload-btn" onClick={() => navigate('/upload')}>
                <Upload size={18} />
                Upload Images
              </button>
            </div>
          ) : (
            <div className="images-grid">
              {images.map((img) => (
                <div key={img.id} className="image-card" onClick={() => navigate(`/analysis?id=${img.id}`)}>
                  <div className="image-card-img">
                    <img src={`${API_URL}${img.file_url}`} alt={img.room_type} loading="lazy" />
                    <div className="image-overlay">
                      <span className="room-type-badge">{img.room_type}</span>
                      <span className="confidence-badge">
                        {Math.round(img.confidence_score * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="image-card-info">
                    <div className="object-tags">
                      {img.detected_objects.slice(0, 3).map((obj, i) => (
                        <span key={i} className="object-tag">{obj}</span>
                      ))}
                      {img.detected_objects.length > 3 && (
                        <span className="object-tag object-tag-more">
                          +{img.detected_objects.length - 3}
                        </span>
                      )}
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

export default Dashboard

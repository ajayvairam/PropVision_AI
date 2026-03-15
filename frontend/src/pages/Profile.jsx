import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Upload, 
  Search, 
  LogOut,
  User,
  KeyRound,
  Trash2,
  AlertTriangle,
  Eye,
  Menu,
  X,
  BarChart3
} from 'lucide-react'
import { apiChangePassword, apiDeleteAccount } from '../api'
import './Profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const username = localStorage.getItem('propvision_username') || 'User'
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [loadingPwd, setLoadingPwd] = useState(false)

  // Delete Account State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [delError, setDelError] = useState('')
  const [loadingDel, setLoadingDel] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('propvision_token')
    localStorage.removeItem('propvision_username')
    navigate('/')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess('')
    
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
        setPwdError('New password must be at least 6 characters')
        return
    }

    setLoadingPwd(true)
    try {
      await apiChangePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword
      })
      setPwdSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwdError(err.response?.data?.detail || 'Failed to change password')
    } finally {
      setLoadingPwd(false)
    }
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    setDelError('')
    setLoadingDel(true)
    try {
      await apiDeleteAccount({ password: deletePassword })
      // On success, clear token and go home
      handleLogout()
    } catch (err) {
      setDelError(err.response?.data?.detail || 'Failed to delete account')
      setLoadingDel(false)
    }
  }

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
          <button className="sidebar-link" onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button className="sidebar-link" onClick={() => navigate('/upload')}>
            <Upload size={20} />
            {sidebarOpen && <span>Upload</span>}
          </button>
          <button className="sidebar-link" onClick={() => navigate('/analysis')}>
            <BarChart3 size={20} />
            {sidebarOpen && <span>Analysis</span>}
          </button>
          <button className="sidebar-link active" onClick={() => navigate('/profile')}>
            <User size={20} />
            {sidebarOpen && <span>Profile</span>}
          </button>
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
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h1>User Profile</h1>
            <p>Manage your account settings</p>
          </div>
          <div className="topbar-right">
             <div className="user-profile">
               <div className="avatar">{username.charAt(0).toUpperCase()}</div>
             </div>
          </div>
        </header>

        <div className="profile-content">
          <div className="profile-header-card">
            <div className="profile-avatar-large">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h2>{username}</h2>
              <p>Member since {new Date().getFullYear()}</p>
            </div>
          </div>

          <div className="profile-grid">
            {/* Change Password Card */}
            <div className="profile-card">
              <div className="card-header">
                <KeyRound size={24} className="card-icon green" />
                <h3>Change Password</h3>
              </div>
              <form onSubmit={handleChangePassword} className="profile-form">
                {pwdError && <div className="form-alert error">{pwdError}</div>}
                {pwdSuccess && <div className="form-alert success">{pwdSuccess}</div>}
                
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={loadingPwd}>
                  {loadingPwd ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Delete Account Card */}
            <div className="profile-card danger-zone">
              <div className="card-header">
                <AlertTriangle size={24} className="card-icon red" />
                <h3>Danger Zone</h3>
              </div>
              <div className="card-body">
                <p className="danger-text">
                  Once you delete your account, there is no going back. Please be certain.
                  All your uploaded images and data will be permanently deleted.
                </p>
                
                {!showDeleteConfirm ? (
                  <button 
                    className="btn btn-danger-outline"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 size={18} />
                    Delete Account
                  </button>
                ) : (
                  <form onSubmit={handleDeleteAccount} className="delete-confirm-form">
                    {delError && <div className="form-alert error">{delError}</div>}
                    <div className="form-group">
                      <label>Enter password to confirm deletion</label>
                      <input 
                        type="password" 
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Current password"
                        required 
                      />
                    </div>
                    <div className="delete-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-danger" disabled={loadingDel}>
                        {loadingDel ? 'Deleting...' : 'Yes, Delete My Account'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

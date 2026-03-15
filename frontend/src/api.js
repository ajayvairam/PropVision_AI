import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('propvision_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('propvision_token')
      localStorage.removeItem('propvision_username')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export const API_URL = API_BASE_URL
export default api

// Helper methods for Profile actions
export const apiChangePassword = (data) => api.post('/change-password', data)
export const apiDeleteAccount = (data) => api.delete('/delete-account', { data })

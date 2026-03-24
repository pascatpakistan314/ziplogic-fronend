import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add Authorization header with JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  
  const method = config.method ? config.method.toUpperCase() : 'GET'
  
  // Add CSRF token for non-GET requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken
    }
  }
  
  return config
}, (error) => {
  return Promise.reject(error)
})

const getCsrfToken = () => {
  const name = 'csrftoken'
  let cookieValue = null
  
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  
  return cookieValue
}

// ============================================================================
// SECURITY FIX #3: Improved error handling and redirect prevention
// ============================================================================

let isRedirecting = false
let lastRedirectTime = 0
const REDIRECT_COOLDOWN = 5000

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const currentTime = Date.now()
    
    if (error.response?.status === 401) {
      // Prevent multiple rapid redirects
      if (isRedirecting || (currentTime - lastRedirectTime < REDIRECT_COOLDOWN)) {
        console.warn('[API] Redirect prevented - already handling auth error')
        return Promise.reject(error)
      }
      
      // Try to refresh token first
      const refreshToken = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('refresh_token='))
        ?.split('=')[1]
      
      if (refreshToken && !error.config._retry) {
        try {
          error.config._retry = true
          const response = await authAPI.refreshToken({ refresh: refreshToken })
          
          // Validate response
          if (!response.data || !response.data.access) {
            throw new Error('Invalid refresh response')
          }
          
          // Retry original request (new token sent via cookie)
          return api(error.config)
        } catch (refreshError) {
          console.error('[API] Token refresh failed:', refreshError)
        }
      }
      
      // Only redirect if we're not already on login page
      if (!window.location.pathname.includes('/login')) {
        isRedirecting = true
        lastRedirectTime = currentTime
        
        // Clear auth cookies (backend does this on logout)
        window.location.href = '/login?session_expired=true'
        
        // Reset flag after cooldown
        setTimeout(() => {
          isRedirecting = false
        }, REDIRECT_COOLDOWN)
      }
    }
    
    return Promise.reject(error)
  }
)

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  verifyOTP: (data) => api.post('/auth/verify-otp/', data),
  resendOTP: (data) => api.post('/auth/resend-otp/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  requestPasswordReset: (data) => api.post('/auth/password-reset/', data),
  confirmPasswordReset: (data) => api.post('/auth/password-reset/confirm/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  refreshToken: (data) => api.post('/auth/token/refresh/', data),
}

// ============================================================================
// PROJECTS API
// ============================================================================

export const projectsAPI = {
  create: (data) => api.post('/agents_v3/generate/', data),
  list: () => api.get('/agents_v3/projects/'),
  get: (id) => api.get(`/agents_v3/project/${id}/`),
  delete: (id) => api.delete(`/agents_v3/project/${id}/delete/`),
  getStatus: (id) => api.get(`/agents_v3/project/${id}/status/`),
  
  // Try V5 first, fallback to V3 for backward compatibility
  getFiles: async (id) => {
    try {
      return await api.get(`/agents_v5/project/${id}/files/`);
    } catch (err) {
      console.warn('V5 files endpoint failed, falling back to V3:', err.message);
      return await api.get(`/agents_v3/project/${id}/files/`);
    }
  },
  
  getFileContent: (id, path, type = 'frontend') => 
    api.get(`/agents_v3/project/${id}/file/`, { params: { path, type } }),
  getDownloadUrl: (id) => `${API_URL}/agents_v3/project/${id}/download/`,
}

// ============================================================================
// SUBSCRIPTIONS API
// ============================================================================

export const subscriptionsAPI = {
  getPlans: () => api.get('/subscriptions/plans/'),
  getMySubscription: () => api.get('/subscriptions/my-subscription/'),
  createCheckout: (data) => api.post('/subscriptions/checkout/', data),
  cancelSubscription: () => api.post('/subscriptions/cancel/'),
  getMyPayments: () => api.get('/subscriptions/payments/'),
  getMyInvoices: () => api.get('/subscriptions/invoices/'),
}

// ============================================================================
// DASHBOARD API
// ============================================================================

export const dashboardAPI = {
  stats: () => api.get('/agents_v3/stats/'),
  getStats: () => api.get('/agents_v3/stats/'),
  usage: () => api.get('/agents_v3/usage/'),
}

// ============================================================================
// ADMIN API
// ============================================================================

export const adminAPI = {
  getStats: () => api.get('/admin/stats/'),
  getUsers: (params) => api.get('/admin/users/', { params }),
  getUser: (id) => api.get(`/admin/users/${id}/`),
  updateUser: (id, data) => api.put(`/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),
  getProjects: (params) => api.get('/admin/projects/', { params }),
  getProject: (id) => api.get(`/admin/projects/${id}/`),
  deleteProject: (id) => api.delete(`/admin/projects/${id}/`),
  getProjectDownloadUrl: (id) => `${API_URL}/agents_v3/project/${id}/download/`,
  getPayments: (params) => api.get('/admin/payments/', { params }),
  refundPayment: (id) => api.post(`/admin/payments/${id}/refund/`),
  getLicenses: (params) => api.get('/admin/licenses/', { params }),
  verifyLicense: (key) => api.post('/admin/licenses/verify/', { key }),
  revokeLicense: (id) => api.post(`/admin/licenses/${id}/revoke/`),
  getSettings: () => api.get('/admin/settings/'),
  updateSettings: (data) => api.put('/admin/settings/', data),
}

// ============================================================================
// DISCOVERY API
// ============================================================================

export const discoveryAPI = {
  discover: (prompt) => api.post('/agents_v3/project/discover/', { prompt }),
  enrich: (data) => api.post('/agents_v3/project/enrich/', data),
  scrapeStyle: (url) => api.post('/agents_v3/project/scrape-style/', { url }),
}

// ============================================================================
// FIX API
// ============================================================================

export const fixAPI = {
  fixError: (data) => api.post('/agents_v3/fix/', data),
}

// ============================================================================
// EDITOR API - With Input Validation (SECURITY FIX #4)
// ============================================================================

const validateFilePath = (path) => {
  if (!path) return ''
  
  // Prevent directory traversal attacks
  const safePath = path
    .replace(/\.\./g, '')  // Remove ..
    .replace(/\.\.\//g, '')  // Remove ../
    .replace(/\.\\\\/g, '') // Remove ..\ (Windows)
    .replace(/[^a-zA-Z0-9._\-/]/g, '_')  // Only safe characters
    .substring(0, 500)  // Limit length
  
  return safePath
}

const validateImage = (file) => {
  // Validate file type
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed')
  }
  
  // Validate file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    throw new Error('File must be smaller than 5MB')
  }
  
  // Validate file name
  if (!file.name || file.name.length > 255) {
    throw new Error('Invalid file name')
  }
  
  return true
}

export const editorAPI = {
  // Save single file
  saveFile: (projectId, path, content) => {
    const safePath = validateFilePath(path)
    if (!safePath) throw new Error('Invalid file path')
    return api.put(`/agents_v3/project/${projectId}/file/save/`, { path: safePath, content })
  },
  
  // AI edit
  aiEdit: (projectId, command, filePath = null) => {
    if (!command || command.length > 5000) {
      throw new Error('Invalid command')
    }
    const safePath = filePath ? validateFilePath(filePath) : null
    return api.post(`/agents_v3/project/${projectId}/ai-edit/`, { 
      command, 
      file_path: safePath 
    })
  },
  
  // Upload image with validation (SECURITY FIX #4)
  uploadImage: (projectId, file, path = '') => {
    try {
      validateImage(file)
    } catch (error) {
      return Promise.reject(error)
    }
    
    const safePath = validateFilePath(path)
    const formData = new FormData()
    formData.append('image', file)
    if (safePath) formData.append('path', safePath)
    
    return api.post(`/agents_v3/project/${projectId}/upload-image/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // Add new file
  addFile: (projectId, path, content = '') => {
    const safePath = validateFilePath(path)
    if (!safePath) throw new Error('Invalid file path')
    return api.post(`/agents_v3/project/${projectId}/add-file/`, { path: safePath, content })
  },
  
  // Delete file
  deleteFile: (projectId, path) => {
    const safePath = validateFilePath(path)
    if (!safePath) throw new Error('Invalid file path')
    return api.delete(`/agents_v3/project/${projectId}/delete-file/`, { data: { path: safePath } })
  },
  
  // Bulk save
  bulkSave: (projectId, files) => {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('Invalid files')
    }
    
    const validatedFiles = files.map(f => ({
      path: validateFilePath(f.path),
      content: f.content
    }))
    
    return api.post(`/agents_v3/project/${projectId}/bulk-save/`, { files: validatedFiles })
  },
}

export default api
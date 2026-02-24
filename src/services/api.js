import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors - PREVENT REDIRECT LOOPS
let isRedirecting = false
let lastRedirectTime = 0
const REDIRECT_COOLDOWN = 5000 // 5 seconds

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
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken && !error.config._retry) {
        try {
          error.config._retry = true
          const response = await authAPI.refreshToken({ refresh: refreshToken })
          const { access } = response.data
          localStorage.setItem('token', access)
          
          // Retry the original request with new token
          error.config.headers.Authorization = `Bearer ${access}`
          return api(error.config)
        } catch (refreshError) {
          console.error('[API] Token refresh failed:', refreshError)
        }
      }
      
      // Only redirect if we're not already on login page
      if (!window.location.pathname.includes('/login')) {
        isRedirecting = true
        lastRedirectTime = currentTime
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        
        // Reset flag after cooldown
        setTimeout(() => {
          isRedirecting = false
        }, REDIRECT_COOLDOWN)
      }
    }
    return Promise.reject(error)
  }
)

// ==========================================
// AUTH API
// ==========================================

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

// ==========================================
// PROJECTS API - Using agents_v3
// ==========================================

export const projectsAPI = {
  create: (data) => api.post('/agents_v3/generate/', data),
  list: () => api.get('/agents_v3/projects/'),
  get: (id) => api.get(`/agents_v3/project/${id}/`),
  delete: (id) => api.delete(`/agents_v3/project/${id}/delete/`),
  getStatus: (id) => api.get(`/agents_v3/project/${id}/status/`),
  getFiles: (id) => api.get(`/agents_v3/project/${id}/files/`),
  getFileContent: (id, path, type = 'frontend') => 
    api.get(`/agents_v3/project/${id}/file/`, { params: { path, type } }),
  getDownloadUrl: (id) => `${API_URL}/agents_v3/project/${id}/download/`,
}

// ==========================================
// SUBSCRIPTIONS API
// ==========================================

export const subscriptionsAPI = {
  // Get all plans (public)
  getPlans: () => api.get('/subscriptions/plans/'),
  
  // User subscription
  getMySubscription: () => api.get('/subscriptions/my-subscription/'),
  createCheckout: (data) => api.post('/subscriptions/checkout/', data),
  cancelSubscription: () => api.post('/subscriptions/cancel/'),
  
  // Payment history
  getMyPayments: () => api.get('/subscriptions/payments/'),
  getMyInvoices: () => api.get('/subscriptions/invoices/'),
}

// ==========================================
// PAYMENTS API (DEPRECATED - Use subscriptionsAPI)
// ==========================================

export const paymentsAPI = {
  createCheckout: (data) => api.post('/subscriptions/checkout/', data),
}

// ==========================================
// DASHBOARD API - NOW USING agents_v3!
// ==========================================

export const dashboardAPI = {
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // FIXED: Using /agents_v3/stats/ instead of /dashboard/stats/
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  stats: () => api.get('/agents_v3/stats/'),
  getStats: () => api.get('/agents_v3/stats/'),  // Alias for backward compatibility
  usage: () => api.get('/agents_v3/usage/'),
}

// ==========================================
// ADMIN API
// ==========================================

export const adminAPI = {
  // Dashboard
  getStats: () => api.get('/admin/stats/'),

  // Users
  getUsers: (params) => api.get('/admin/users/', { params }),
  getUser: (id) => api.get(`/admin/users/${id}/`),
  updateUser: (id, data) => api.put(`/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),

  // Projects
  getProjects: (params) => api.get('/admin/projects/', { params }),
  getProject: (id) => api.get(`/admin/projects/${id}/`),
  deleteProject: (id) => api.delete(`/admin/projects/${id}/`),
  getProjectDownloadUrl: (id) => `${API_URL}/agents_v3/project/${id}/download/`,

  // Payments
  getPayments: (params) => api.get('/admin/payments/', { params }),
  refundPayment: (id) => api.post(`/admin/payments/${id}/refund/`),

  // Licenses
  getLicenses: (params) => api.get('/admin/licenses/', { params }),
  verifyLicense: (key) => api.post('/admin/licenses/verify/', { key }),
  revokeLicense: (id) => api.post(`/admin/licenses/${id}/revoke/`),

  // Settings
  getSettings: () => api.get('/admin/settings/'),
  updateSettings: (data) => api.put('/admin/settings/', data),
}

export default api
// ==========================================
// DISCOVERY API — Smart Questionnaire
// ==========================================

export const discoveryAPI = {
  // Analyze prompt, get questions (zero LLM tokens)
  discover: (prompt) => api.post('/agents_v3/project/discover/', { prompt }),
  
  // Enrich prompt with answers (zero LLM tokens)
  enrich: (data) => api.post('/agents_v3/project/enrich/', data),
  
  // Scrape design from URL
  scrapeStyle: (url) => api.post('/agents_v3/project/scrape-style/', { url }),
}

// ==========================================
// FIX API — Error fixing
// ==========================================

export const fixAPI = {
  fixError: (data) => api.post('/agents_v3/fix/', data),
}

// ==========================================
// CMS / EDITOR API — Edit files, AI commands, upload images
// ==========================================

export const editorAPI = {
  // Save single file
  saveFile: (projectId, path, content) => 
    api.put(`/agents_v3/project/${projectId}/file/save/`, { path, content }),
  
  // AI edit — natural language: "change the title to XYZ"
  aiEdit: (projectId, command, filePath = null) =>
    api.post(`/agents_v3/project/${projectId}/ai-edit/`, { command, file_path: filePath }),
  
  // Upload image
  uploadImage: (projectId, file, path = '') => {
    const formData = new FormData()
    formData.append('image', file)
    if (path) formData.append('path', path)
    return api.post(`/agents_v3/project/${projectId}/upload-image/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // Add new file
  addFile: (projectId, path, content = '') =>
    api.post(`/agents_v3/project/${projectId}/add-file/`, { path, content }),
  
  // Delete file
  deleteFile: (projectId, path) =>
    api.delete(`/agents_v3/project/${projectId}/delete-file/`, { data: { path } }),
  
  // Bulk save multiple files
  bulkSave: (projectId, files) =>
    api.post(`/agents_v3/project/${projectId}/bulk-save/`, { files }),
}

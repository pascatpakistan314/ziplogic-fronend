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

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
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
// PROJECTS API
// ==========================================

export const projectsAPI = {
  create: (data) => api.post('/projects/', data),
  list: () => api.get('/projects/list/'),
  get: (id) => api.get(`/projects/${id}/`),
  delete: (id) => api.delete(`/projects/${id}/`),
  getStatus: (id) => api.get(`/projects/${id}/status/`),
  getFiles: (id) => api.get(`/projects/${id}/files/`),
  getFileContent: (id, path, type = 'frontend') => 
    api.get(`/projects/${id}/file/`, { params: { path, type } }),
  getDownloadUrl: (id) => `${API_URL}/projects/${id}/download/`,
}

// ==========================================
// PAYMENTS API
// ==========================================

export const paymentsAPI = {
  createCheckout: (data) => api.post('/payments/checkout/', data),
}

// ==========================================
// DASHBOARD API
// ==========================================

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats/'),
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
  getProjectDownloadUrl: (id) => `${API_URL}/projects/${id}/download/`,

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

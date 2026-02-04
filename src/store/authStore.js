import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Set auth state
      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },
      
      // Clear auth state
      clearAuth: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },
      
      // Login
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.login({ email, password })
          const { user, tokens } = response.data
          get().setAuth(user, tokens.access)
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.errors || error.response?.data?.message || 'Login failed'
          }
        } finally {
          set({ isLoading: false })
        }
      },
      
      // Register
      register: async (email, username, password, passwordConfirm) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.register({ 
            email, 
            username, 
            password, 
            password_confirm: passwordConfirm 
          })
          return { success: true, data: response.data }
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.errors || error.response?.data?.message || 'Registration failed'
          }
        } finally {
          set({ isLoading: false })
        }
      },
      
      // Verify OTP
      verifyOTP: async (email, otp) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.verifyOTP({ email, otp })
          const { user, tokens } = response.data
          get().setAuth(user, tokens.access)
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.message || 'Invalid OTP'
          }
        } finally {
          set({ isLoading: false })
        }
      },
      
      // Resend OTP
      resendOTP: async (email) => {
        try {
          await authAPI.resendOTP({ email })
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.message || 'Failed to resend OTP'
          }
        }
      },
      
      // Logout
      logout: async () => {
        try {
          await authAPI.logout()
        } catch {
          // Ignore errors
        }
        get().clearAuth()
      },
      
      // Get profile
      fetchProfile: async () => {
        try {
          const response = await authAPI.getProfile()
          set({ user: response.data.user })
          return response.data.user
        } catch {
          return null
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

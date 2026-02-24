import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'

// Token expiry time in milliseconds (5 hours)
const TOKEN_EXPIRY_MS = 5 * 60 * 60 * 1000;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      tokenExpiryTime: null, // Track when token expires
      
      // Set auth state with expiry time
      setAuth: (user, token, refreshToken) => {
        const expiryTime = Date.now() + TOKEN_EXPIRY_MS;
        localStorage.setItem('token', token);
        localStorage.setItem('access_token', token); // For WebContainer
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('token_expiry', expiryTime.toString());
        set({ 
          user, 
          token, 
          refreshToken, 
          isAuthenticated: true,
          tokenExpiryTime: expiryTime
        });
        
        // Setup auto-logout timer (safe)
        try { get().setupAutoLogout(); } catch(e) { console.warn('[Auth] Auto-logout setup failed:', e); }
      },
      
      // Clear auth state
      clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiry');
        set({ 
          user: null, 
          token: null, 
          refreshToken: null, 
          isAuthenticated: false,
          tokenExpiryTime: null
        });
      },
      
      // Check if token is expired
      isTokenExpired: () => {
        const expiryTime = get().tokenExpiryTime || parseInt(localStorage.getItem('token_expiry') || '0');
        if (!expiryTime) return true;
        return Date.now() > expiryTime;
      },
      
      // Get remaining time until expiry (in ms)
      getRemainingTime: () => {
        const expiryTime = get().tokenExpiryTime || parseInt(localStorage.getItem('token_expiry') || '0');
        if (!expiryTime) return 0;
        return Math.max(0, expiryTime - Date.now());
      },
      
      // Setup auto-logout timer
      setupAutoLogout: () => {
        const remainingTime = get().getRemainingTime();
        
        if (remainingTime <= 0) {
          // Already expired, logout immediately
          console.log('Token expired, logging out...');
          get().logout();
          return;
        }
        
        // Clear any existing timer
        if (window._authLogoutTimer) {
          clearTimeout(window._authLogoutTimer);
        }
        
        // Set new timer
        console.log(`Auto-logout scheduled in ${Math.round(remainingTime / 1000 / 60)} minutes`);
        window._authLogoutTimer = setTimeout(() => {
          console.log('Session expired, logging out...');
          get().logout();
          // Redirect to login
          window.location.href = '/login?expired=true';
        }, remainingTime);
      },
      
      // Check auth on app load
      checkAuth: () => {
        const state = get();
        
        // If we have auth data, check expiry
        if (state.isAuthenticated && state.token) {
          if (get().isTokenExpired()) {
            console.log('Token expired on load, clearing auth...');
            get().clearAuth();
            return false;
          }
          
          // Setup auto-logout timer
          get().setupAutoLogout();
          return true;
        }
        
        return false;
      },
      
      // Login
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login({ email, password });
          const data = response.data;
          console.log('[Auth] Login response:', data);
          
          if (data.success && data.access && data.user) {
            try {
              get().setAuth(data.user, data.access, data.refresh);
            } catch (authError) {
              console.error('[Auth] setAuth error (non-fatal):', authError);
              // Manually set the essentials even if setAuth partially fails
              localStorage.setItem('token', data.access);
              localStorage.setItem('access_token', data.access);
              localStorage.setItem('refresh_token', data.refresh);
              set({ user: data.user, token: data.access, refreshToken: data.refresh, isAuthenticated: true });
            }
            return { success: true };
          } else if (data.needs_verification) {
            return { success: false, error: 'Please verify your email first', needs_verification: true, email: data.email };
          } else {
            return { success: false, error: data.message || data.error || 'Login failed' };
          }
        } catch (error) {
          console.error('[Auth] Login error:', error);
          const msg = error.response?.data;
          // DRF validation errors can be nested
          const errorText = typeof msg === 'string' ? msg 
            : msg?.non_field_errors?.[0] 
            || msg?.detail 
            || msg?.message 
            || msg?.errors 
            || (Array.isArray(msg) ? msg[0] : null)
            || 'Invalid email or password';
          return { success: false, error: typeof errorText === 'string' ? errorText : 'Login failed' };
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Register
      register: async (email, username, password, passwordConfirm) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register({ 
            email, 
            username, 
            password, 
            password_confirm: passwordConfirm 
          });
          return { success: true, data: response.data };
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.errors || error.response?.data?.message || 'Registration failed'
          };
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Verify OTP
      verifyOTP: async (email, otp) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.verifyOTP({ email, otp });
          const { user, tokens } = response.data;
          get().setAuth(user, tokens.access, tokens.refresh);
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.message || 'Invalid OTP'
          };
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Resend OTP
      resendOTP: async (email) => {
        try {
          await authAPI.resendOTP({ email });
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.message || 'Failed to resend OTP'
          };
        }
      },
      
      // Logout
      logout: async () => {
        // Clear auto-logout timer
        if (window._authLogoutTimer) {
          clearTimeout(window._authLogoutTimer);
          window._authLogoutTimer = null;
        }
        
        try {
          await authAPI.logout();
        } catch {
          // Ignore errors
        }
        get().clearAuth();
      },
      
      // Refresh token (extend session)
      refreshSession: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) return false;
        
        try {
          const response = await authAPI.refreshToken({ refresh: refreshToken });
          const newToken = response.data.access;
          
          // Update token with new expiry
          const expiryTime = Date.now() + TOKEN_EXPIRY_MS;
          localStorage.setItem('token', newToken);
          localStorage.setItem('access_token', newToken);
          localStorage.setItem('token_expiry', expiryTime.toString());
          
          set({ token: newToken, tokenExpiryTime: expiryTime });
          
          // Reset auto-logout timer
          get().setupAutoLogout();
          
          return true;
        } catch {
          // Refresh failed, logout
          get().logout();
          return false;
        }
      },
      
      // Get profile
      fetchProfile: async () => {
        try {
          const response = await authAPI.getProfile();
          set({ user: response.data.user });
          return response.data.user;
        } catch {
          return null;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        tokenExpiryTime: state.tokenExpiryTime
      }),
      onRehydrateStorage: () => (state) => {
        // Check auth after rehydration from storage
        if (state) {
          setTimeout(() => {
            state.checkAuth();
          }, 100);
        }
      },
    }
  )
);

// Export helper to check remaining time
export const getSessionRemainingTime = () => {
  const store = useAuthStore.getState();
  return store.getRemainingTime();
};

// Export helper to format remaining time
export const formatRemainingTime = () => {
  const ms = getSessionRemainingTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};
/**
 * Re-export from services/authStore.js
 * This ensures only ONE zustand store instance exists
 * regardless of import path (./store/authStore or ./services/authStore)
 */
export { useAuthStore, getSessionRemainingTime, formatRemainingTime } from '../services/authStore'
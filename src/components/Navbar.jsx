import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Zap, Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  
  const handleLogout = async () => {
    await logout()
    navigate('/')
  }
  
  return (
    <nav className="bg-dark-900/80 backdrop-blur-md border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <Zap className="w-8 h-8 text-primary-500" />
              <span className="gradient-text">ZipLogic</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/pricing" className="text-dark-300 hover:text-white transition">Pricing</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-dark-300 hover:text-white transition">Dashboard</Link>
                <Link to="/new-project" className="btn-primary flex items-center gap-2">
                  <Zap className="w-4 h-4" /> New Project
                </Link>
                
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-xl py-1">
                      <div className="px-4 py-2 border-b border-dark-600">
                        <p className="text-sm font-medium">{user?.username}</p>
                        <p className="text-xs text-dark-400">{user?.email}</p>
                      </div>
                      {(user?.is_superuser || user?.is_staff) && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-primary-400 hover:bg-dark-700 w-full">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <button onClick={() => { handleLogout(); setUserMenuOpen(false) }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-dark-700 w-full">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-dark-300 hover:text-white transition">Login</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-dark-300">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-900 border-t border-dark-700 px-4 py-4 space-y-3">
          <Link to="/pricing" className="block text-dark-300" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="block text-dark-300" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/new-project" className="block btn-primary text-center" onClick={() => setMobileMenuOpen(false)}>New Project</Link>
              {(user?.is_superuser || user?.is_staff) && (
                <Link to="/admin" className="block text-primary-400" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
              )}
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }} className="block text-red-400 w-full text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-dark-300" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="block btn-primary text-center" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

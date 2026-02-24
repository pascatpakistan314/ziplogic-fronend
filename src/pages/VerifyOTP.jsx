import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../services/authStore'
import { Zap, Mail } from 'lucide-react'
import { ButtonLoading } from '../components/Loading'
import toast from 'react-hot-toast'

export default function VerifyOTP() {
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const { verifyOTP, resendOTP, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [resending, setResending] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !otp) {
      toast.error('Please enter email and OTP')
      return
    }
    
    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits')
      return
    }
    
    const result = await verifyOTP(email, otp)
    
    if (result.success) {
      toast.success('Email verified! Welcome to ZipLogic!')
      navigate('/dashboard')
    } else {
      toast.error(result.error || 'Invalid OTP')
    }
  }
  
  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    
    setResending(true)
    const result = await resendOTP(email)
    setResending(false)
    
    if (result.success) {
      toast.success('New OTP sent!')
    } else {
      toast.error(result.error || 'Failed to resend')
    }
  }
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-4">
            <Zap className="w-8 h-8 text-primary-500" />
            <span className="gradient-text">ZipLogic</span>
          </Link>
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-dark-400 mt-2">Enter the 6-digit code we sent to your email</p>
        </div>
        
        <form onSubmit={handleSubmit} className="card p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input text-center text-2xl tracking-[0.5em] font-mono"
              placeholder="000000"
              maxLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? <ButtonLoading /> : 'Verify Email'}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-primary-500 hover:text-primary-400 text-sm"
            >
              {resending ? 'Sending...' : "Didn't receive code? Resend"}
            </button>
          </div>
        </form>
        
        <p className="text-center text-dark-400 mt-6">
          <Link to="/login" className="text-primary-500 hover:text-primary-400">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}

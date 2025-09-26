import { useState, useEffect } from 'react'
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react'

const Login = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Clear error when user starts typing
  useEffect(() => {
    if (error && (email || password)) {
      setError('')
    }
  }, [email, password])

  const validateInputs = () => {
    if (!email.trim()) {
      setError('Please enter your email address')
      return false
    }
    if (!password.trim()) {
      setError('Please enter your password')
      return false
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    // Clear any existing errors
    setError('')
    
    // Validate inputs first
    if (!validateInputs()) {
      return
    }

    setLoading(true)
    
    try {
      await onLogin(email.trim(), password)
      // Success - the auth context will handle navigation
    } catch (err) {
      console.error('Login failed:', err)
      
      // Set user-friendly error message
      const errorMessage = err.message || 'Login failed. Please try again.'
      setError(errorMessage)
      
      // Clear password field on error for security
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Police Portal</h1>
          <p className="text-white/80 mt-2">Secure Login for Authorized Personnel</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-white/60 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-11 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-white/60"
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-white/60 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-11 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-white/60"
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-300 p-3 rounded-lg text-sm backdrop-blur-sm">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => onNavigate('forgot')}
            disabled={loading}
            className="text-blue-300 hover:text-blue-200 text-sm font-medium hover:underline transition-colors disabled:opacity-50"
          >
            Forgot Password?
          </button>
          <div className="text-white/70 text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('signup')}
              disabled={loading}
              className="text-blue-300 hover:text-blue-200 font-medium hover:underline transition-colors disabled:opacity-50"
            >
              Register Here
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="text-center text-xs text-white/60">
            <div className="flex items-center justify-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Secure Police Authority System</span>
            </div>
            <p className="mt-1">Authorized personnel only</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
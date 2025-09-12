import { useState } from 'react'
import { Shield, Mail, ArrowLeft } from 'lucide-react'

const ForgotPassword = ({ onForgotPassword, onNavigate }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await onForgotPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-100">
          <div className="text-center">
            <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Check Your Email</h1>
            <p className="text-slate-600 mb-6">
              We've sent a password reset link to {email}. Please check your inbox and follow the instructions to reset your password.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Forgot Password</h1>
          <p className="text-slate-600 mt-2">Enter your email to reset your password</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your registered email"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('login')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

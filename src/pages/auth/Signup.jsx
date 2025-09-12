import { useState } from 'react'
import { Shield, User, Mail, Phone, Badge, Building, Key } from 'lucide-react'

const Signup = ({ onSignup, onNavigate }) => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'police',
    mobile_number: '',
    badge_number: '',
    station: '',
    official_id_type: '',
    admin_secret: ''
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleNext = () => {
    if (step === 1 && (!formData.email || !formData.password || !formData.name)) {
      setError('Please fill all required fields')
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }
    
    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    setError('')
    setStep(2)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    console.log('Form data before submission:', formData) // Debug log

    // Validate admin secret if admin role
    if (formData.role === 'admin') {
      const adminSecret = import.meta.env.VITE_ADMIN_SECRET_KEY
      console.log('Admin secret check:', { provided: formData.admin_secret, expected: adminSecret }) // Debug log
      
      if (!formData.admin_secret) {
        setError('Admin secret key is required for administrator accounts')
        setLoading(false)
        return
      }
      
      if (formData.admin_secret !== adminSecret) {
        setError('Invalid admin secret key')
        setLoading(false)
        return
      }
    }

    // Validate police fields
    if (formData.role === 'police') {
      if (!formData.badge_number || !formData.station) {
        setError('Badge number and station are required for police officers')
        setLoading(false)
        return
      }
    }

    try {
      const userData = {
        email: formData.email,
        name: formData.name,
        role: formData.role, // Make sure role is preserved
        mobile_number: formData.mobile_number || null,
        badge_number: formData.role === 'police' ? formData.badge_number : null,
        station: formData.role === 'police' ? formData.station : null,
        official_id_type: formData.official_id_type || null,
        official_id_image_url: null,
        is_verified: formData.role === 'admin' // Auto-verify admin users
      }

      console.log('User data being sent:', JSON.stringify(userData, null, 2)) // Debug log

      await onSignup(formData.email, formData.password, userData)
    } catch (err) {
      console.error('Signup error:', err) // Debug log
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-blue-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Register</h1>
          <p className="text-slate-600 mt-2">Join the Police Authority System</p>
          <div className="flex justify-center mt-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
            <div className={`w-16 h-1 mt-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Create a strong password (min 6 characters)"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="police">Police Officer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-3 text-sm">
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">
                  Selected Role: {formData.role === 'admin' ? 'Administrator' : 'Police Officer'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.mobile_number}
                  onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>

            {formData.role === 'police' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Badge Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Badge className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.badge_number}
                      onChange={(e) => handleInputChange('badge_number', e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter badge number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Police Station <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.station}
                      onChange={(e) => handleInputChange('station', e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter station name"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {formData.role === 'admin' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Admin Secret Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    value={formData.admin_secret}
                    onChange={(e) => handleInputChange('admin_secret', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter admin secret key"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Contact system administrator for the secret key
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Official ID Type</label>
              <select
                value={formData.official_id_type}
                onChange={(e) => handleInputChange('official_id_type', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select ID type</option>
                <option value="aadhar">Aadhar Card</option>
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
                <option value="employee_id">Employee ID</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-1/2 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-1/2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <div className="text-slate-500 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
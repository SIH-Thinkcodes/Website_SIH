import { useState } from 'react'
import { Shield, User, Mail, Phone, Badge, Building, Key, Upload, FileImage, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../../utils/supabase'

const Signup = ({ onSignup, onNavigate }) => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'police',
    mobile_number: '',
    badge_number: '',
    station: '',
    unit: '',
    official_id_type: '',
    official_id_number: '',
    admin_secret: ''
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    console.log('File selected:', file) // Debug logging
    
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type)
      setError('Please upload a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      console.log('File too large:', file.size)
      setError('File size must be less than 5MB')
      return
    }

    console.log('File validation passed, setting selected file')
    setSelectedFile(file)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      console.log('File preview created')
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const validateStep = (stepNumber) => {
    if (stepNumber === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
        setError('Please fill all required fields')
        return false
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address')
        return false
      }

      // Validate password strength
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        return false
      }

      // Check password match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }

      return true
    }

    if (stepNumber === 2) {
      // Validate mobile number format (basic)
      if (formData.mobile_number && !/^\d{10}$/.test(formData.mobile_number.replace(/\D/g, ''))) {
        setError('Please enter a valid 10-digit mobile number')
        return false
      }

      if (formData.role === 'police') {
        if (!formData.badge_number || !formData.station || !formData.unit) {
          setError('Badge number, station, and unit are required for police officers')
          return false
        }
      }

      if (formData.role === 'admin') {
        const adminSecret = import.meta.env.VITE_ADMIN_SECRET_KEY
        if (!formData.admin_secret) {
          setError('Admin secret key is required for administrator accounts')
          return false
        }
        if (formData.admin_secret !== adminSecret) {
          setError('Invalid admin secret key')
          return false
        }
      }

      return true
    }

    if (stepNumber === 3) {
      if (!formData.official_id_type || !formData.official_id_number) {
        setError('Please select ID type and enter ID number')
        return false
      }

      if (!selectedFile) {
        setError('Please upload your official ID document')
        return false
      }

      return true
    }

    return true
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    setError('')
    setStep(step + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const uploadImage = async (file, userId) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      const filePath = `official-ids/${fileName}`

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Image upload error:', error)
      throw new Error('Failed to upload image: ' + error.message)
    }
  }

  // Replace the handleSubmit function in your Signup component with this:
const handleSubmit = async () => {
  if (!validateStep(step)) return

  setLoading(true)
  setError('')
  setUploadProgress(0)

  // IMPORTANT: Store the file reference before any async operations
  const fileToUpload = selectedFile

  try {
    const userData = {
      email: formData.email,
      name: formData.name,
      role: formData.role,
      mobile_number: formData.mobile_number || null,
      badge_number: formData.role === 'police' ? formData.badge_number : null,
      station: formData.role === 'police' ? formData.station : null,
      unit: formData.role === 'police' ? formData.unit : null,
      official_id_type: formData.official_id_type || null,
      official_id_number: formData.official_id_number || null,
      is_verified: formData.role === 'admin'
    }

    console.log('Creating user account...')
    console.log('File to upload:', fileToUpload?.name || 'none')
    const authData = await onSignup(formData.email, formData.password, userData)
    console.log('User ID after signup:', authData?.user?.id)

    if (fileToUpload && authData?.user?.id) {
      console.log('Starting image upload...')
      setUploadProgress(20)
      
      try {
        const fileExt = fileToUpload.name.split('.').pop()
        const fileName = `${authData.user.id}_${Date.now()}.${fileExt}`
        const filePath = `official-ids/${fileName}`

        console.log('Uploading file:', fileName, 'Size:', fileToUpload.size)

        setUploadProgress(40)

        // Upload file directly to storage (remove bucket check)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error details:', uploadError)
          if (uploadError.message.includes('duplicate')) {
            throw new Error('File already exists. Please try again.')
          } else if (uploadError.message.includes('policy')) {
            throw new Error('Permission denied. Contact administrator.')
          } else {
            throw new Error(`Upload failed: ${uploadError.message}`)
          }
        }

        console.log('Upload successful:', uploadData)
        setUploadProgress(70)

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)

        if (!urlData?.publicUrl) {
          throw new Error('Failed to generate file URL')
        }

        console.log('Generated public URL:', urlData.publicUrl)
        setUploadProgress(90)

        // Update profile with image URL
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ official_id_image_url: urlData.publicUrl })
          .eq('id', authData.user.id)

        if (updateError) {
          console.error('Failed to update profile with image URL:', updateError)
          // Don't throw here - user is created, just image link failed
          console.warn('User created but image URL not saved to profile')
        } else {
          console.log('Profile updated with image URL successfully')
        }

        setUploadProgress(100)
        console.log('Image upload completed successfully')

      } catch (imageError) {
        console.error('Image upload failed:', imageError)
        // Show error to user but don't fail the entire signup
        setError(`Account created successfully, but image upload failed: ${imageError.message}`)
        // Still consider signup successful
        setTimeout(() => {
          console.log('Signup completed with image upload warning')
          // Don't redirect immediately if there was an upload error
        }, 3000)
        return // Exit early to show the error
      }
    } else {
      console.log('No file to upload:', {
        hasFile: !!fileToUpload,
        fileName: fileToUpload?.name,
        hasUserId: !!authData?.user?.id,
        userId: authData?.user?.id
      })
      setUploadProgress(100)
    }

    console.log('Signup completed successfully')
    
  } catch (err) {
    console.error('Signup error:', err)
    if (err.message.includes('User already registered')) {
      setError('An account with this email already exists. Please try logging in instead.')
    } else if (err.message.includes('rate limit')) {
      setError('Too many signup attempts. Please try again later.')
    } else if (err.message.includes('Invalid email')) {
      setError('Please enter a valid email address.')
    } else if (err.message.includes('Password should be at least 6 characters')) {
      setError('Password must be at least 6 characters long.')
    } else {
      setError(err.message || 'Signup failed. Please try again.')
    }
  } finally {
    setLoading(false)
    if (uploadProgress === 100 && !error) {
      // Only reset progress if everything succeeded
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }
}

  const renderStepIndicator = () => (
    <div className="flex justify-center mt-4">
      {[1, 2, 3].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= stepNum ? 'bg-blue-600 text-white' : 'bg-white/20 text-white/60'
          }`}>
            {step > stepNum ? <CheckCircle className="w-4 h-4" /> : stepNum}
          </div>
          {stepNum < 3 && (
            <div className={`w-16 h-1 ${step > stepNum ? 'bg-blue-600' : 'bg-white/20'}`}></div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-white/20">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Register</h1>
          <p className="text-white/80 mt-2">Join the Police Authority System</p>
          {renderStepIndicator()}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/60"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
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
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
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

        {/* Step 2: Professional Details */}
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
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
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

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select your unit</option>
                    <option value="patrol">Patrol Unit</option>
                    <option value="motorcycle">Motorcycle Unit</option>
                    <option value="emergency">Emergency Response Unit</option>
                    <option value="beach">Beach Patrol Unit</option>
                    <option value="tourist">Tourist Police Unit</option>
                  </select>
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleBack}
                disabled={loading}
                className="w-1/2 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="w-1/2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 3: ID Verification */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-amber-50 rounded-lg p-3 text-sm">
              <div className="flex items-center">
                <FileImage className="w-4 h-4 text-amber-600 mr-2" />
                <span className="font-medium text-amber-800">
                  Upload your official ID document for verification
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Official ID Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.official_id_type}
                onChange={(e) => handleInputChange('official_id_type', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select ID type</option>
                <option value="aadhar">Aadhar Card</option>
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
                <option value="employee_id">Employee ID</option>
                <option value="voter_id">Voter ID</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                ID Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.official_id_number}
                onChange={(e) => handleInputChange('official_id_number', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter ID number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Upload ID Document <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                {!imagePreview ? (
                  <div>
                    <Upload className="mx-auto w-12 h-12 text-slate-400 mb-4" />
                    <p className="text-slate-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500">PNG, JPG, WebP up to 5MB</p>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </div>
                ) : (
                  <div>
                    <img
                      src={imagePreview}
                      alt="ID Preview"
                      className="mx-auto max-h-48 rounded-lg mb-4"
                    />
                    <p className="text-sm text-slate-600 mb-2">{selectedFile?.name}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setSelectedFile(null)
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleBack}
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
                {loading ? 'Creating Account...' : 'Complete Registration'}
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
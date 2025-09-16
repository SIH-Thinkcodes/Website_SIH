import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { supabase, authAPI } from './utils/supabase'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import PoliceDashboard from './pages/dashboard/PoliceDashboard'
import { GlassBackground } from './components/ui/glass-background'

// Error component for profile loading issues
function ProfileError({ error, onRetry, onLogout }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-400/30">
            <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Profile Loading Error</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={onRetry}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              Try Again
            </button>
            <button 
              onClick={onLogout}
              className="w-full bg-white/20 text-white py-3 px-4 rounded-lg hover:bg-white/30 font-medium border border-white/30"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main App Component that uses AuthContext
function AppContent() {
  const { user, profile, loading, profileError, login, signup, logout, retryProfileFetch } = useAuth()
  const [currentPage, setCurrentPage] = useState('login')
  const [pendingOfficers, setPendingOfficers] = useState([])
  const [activeOfficers, setActiveOfficers] = useState([])

  // Load officers when admin profile is available
  useEffect(() => {
    if (profile?.role === 'admin') {
      loadAllOfficers()
    }
  }, [profile])

  // Set current page based on user role
  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') {
        setCurrentPage('admin-dashboard')
      } else if (profile.role === 'police') {
        setCurrentPage('police-dashboard')
      }
    } else {
      setCurrentPage('login')
    }
  }, [user, profile])

  const loadAllOfficers = async () => {
    try {
      const { data: allOfficers, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'police')
        .order('created_at', { ascending: false })

      if (error) throw error

      const pending = allOfficers?.filter(officer => !officer.is_verified) || []
      const active = allOfficers?.filter(officer => officer.is_verified) || []

      setPendingOfficers(pending)
      setActiveOfficers(active)

      console.log('Loaded officers:', { pending: pending.length, active: active.length })
    } catch (error) {
      console.error('Error loading officers:', error)
    }
  }

  const handleLogin = async (email, password) => {
    try {
      await login(email, password)
    } catch (error) {
      throw error
    }
  }

  const handleSignup = async (email, password, userData) => {
    try {
      const data = await signup(email, password, userData)
      setCurrentPage('login')
      return data  // Return the auth data so Signup.jsx can access user.id
    } catch (error) {
      throw error
    }
  }

  const handleForgotPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    })
    if (error) throw error
  }

  const handleLogout = async () => {
    try {
      await logout()
      setCurrentPage('login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleApproveOfficer = async (officerId) => {
    try {
      await authAPI.verifyOfficer(officerId)
      await loadAllOfficers()
    } catch (error) {
      console.error('Error approving officer:', error)
    }
  }

  const handleRejectOfficer = async (officerId) => {
    try {
      await authAPI.rejectOfficer(officerId)
      await loadAllOfficers()
    } catch (error) {
      console.error('Error rejecting officer:', error)
    }
  }

  const navigate = (page) => {
    setCurrentPage(page)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-white/80 mt-4 text-center">Loading...</p>
        </div>
      </div>
    )
  }

  // Profile error state - show error with retry option
  if (user && !profile && profileError) {
    return (
      <ProfileError 
        error={profileError}
        onRetry={retryProfileFetch}
        onLogout={handleLogout}
      />
    )
  }

  // If user is logged in and profile is loaded, show appropriate dashboard
  if (user && profile) {
    if (profile.role === 'admin') {
      return (
        <AdminDashboard
          profile={profile}
          onLogout={handleLogout}
          onApproveOfficer={handleApproveOfficer}
          onRejectOfficer={handleRejectOfficer}
          pendingOfficers={pendingOfficers}
          activeOfficers={activeOfficers}
        />
      )
    } else if (profile.role === 'police') {
      return (
        <PoliceDashboard
          profile={profile}
          onLogout={handleLogout}
          isVerified={profile.is_verified}
        />
      )
    }
  }

  // Auth pages - render based on current page
  switch (currentPage) {
    case 'signup':
      return (
        <Signup
          onSignup={handleSignup}
          onNavigate={navigate}
        />
      )
    case 'forgot':
      return (
        <ForgotPassword
          onForgotPassword={handleForgotPassword}
          onNavigate={navigate}
        />
      )
    case 'login':
    default:
      return (
        <Login
          onLogin={handleLogin}
          onNavigate={navigate}
        />
      )
  }
}

// Main App wrapper with AuthProvider
function App() {
  return (
    <div className="relative min-h-screen">
      <GlassBackground className="fixed inset-0 z-0" />
      <div className="relative z-10">
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </div>
    </div>
  )
}

export default App
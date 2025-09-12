import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { supabase, authAPI } from './utils/supabase'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import PoliceDashboard from './pages/dashboard/PoliceDashboard'

// Main App Component that uses AuthContext
function AppContent() {
  const { user, profile, loading, login, signup, logout } = useAuth()
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
      await signup(email, password, userData)
      setCurrentPage('login')
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

  const navigate = (page) => {
    setCurrentPage(page)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-600 mt-4 text-center">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is logged in, show appropriate dashboard
  if (user && profile) {
    if (profile.role === 'admin') {
      return (
        <AdminDashboard
          profile={profile}
          onLogout={handleLogout}
          onApproveOfficer={handleApproveOfficer}
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
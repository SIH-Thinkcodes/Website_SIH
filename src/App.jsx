import { useState, useEffect } from 'react'
import { supabase, authAPI } from './utils/supabase'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import PoliceDashboard from './pages/dashboard/PoliceDashboard'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingOfficers, setPendingOfficers] = useState([])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setCurrentPage('login')
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Load pending officers for admin
    if (profile?.role === 'admin') {
      loadPendingOfficers()
    }
  }, [profile])

  const loadProfile = async (userId) => {
    try {
      const profileData = await authAPI.getProfile(userId)
      setProfile(profileData)
      
      // Set current page based on role
      if (profileData.role === 'admin') {
        setCurrentPage('admin-dashboard')
      } else if (profileData.role === 'police') {
        setCurrentPage('police-dashboard')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPendingOfficers = async () => {
    try {
      const officers = await authAPI.getPendingOfficers()
      setPendingOfficers(officers)
    } catch (error) {
      console.error('Error loading pending officers:', error)
    }
  }

  const handleLogin = async (email, password) => {
    try {
      await authAPI.signIn(email, password)
      // Auth state change will be handled by the listener
    } catch (error) {
      throw error // Re-throw to let Login component handle the error display
    }
  }

  const handleSignup = async (email, password, userData) => {
    try {
      await authAPI.signUp(email, password, userData)
      setCurrentPage('login')
    } catch (error) {
      throw error // Re-throw to let Signup component handle the error display
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
      await authAPI.signOut()
      setUser(null)
      setProfile(null)
      setCurrentPage('login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleApproveOfficer = async (officerId) => {
    try {
      await authAPI.verifyOfficer(officerId)
      // Reload pending officers list
      await loadPendingOfficers()
    } catch (error) {
      console.error('Error approving officer:', error)
      // You might want to show an error message to the user here
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

export default App
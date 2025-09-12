import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, authAPI } from '../utils/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

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
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    try {
      const profileData = await authAPI.getProfile(userId)
      setProfile(profileData)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const data = await authAPI.signIn(email, password)
    return data
  }

  const signup = async (email, password, userData) => {
    const data = await authAPI.signUp(email, password, userData)
    return data
  }

  const logout = async () => {
    await authAPI.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      login,
      signup,
      logout,
      isAdmin: profile?.role === 'admin',
      isPolice: profile?.role === 'police',
      isVerified: profile?.is_verified || false
    }}>
      {children}
    </AuthContext.Provider>
  )
}
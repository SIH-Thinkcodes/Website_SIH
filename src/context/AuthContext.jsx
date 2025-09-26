import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, authAPI } from '../utils/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProfile = async (userId) => {
    try {
      setError('')
      console.log('Loading profile for user:', userId)
      
      const profileData = await authAPI.getProfile(userId)
      console.log('Profile loaded:', profileData.role)
      
      setProfile(profileData)
      return profileData
    } catch (err) {
      console.error('Error loading profile:', err)
      setError(err.message || 'Failed to load profile')
      setProfile(null)
      throw err
    }
  }

  useEffect(() => {
    console.log('Initializing auth...')

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          return
        }

        if (session?.user) {
          console.log('Found existing session:', session.user.id)
          setUser(session.user)
        }
      } catch (err) {
        console.error('Session initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)

        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
          setProfile(null)
          setError('')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user && !profile) {
      const fetchProfile = async () => {
        setLoading(true)
        try {
          await loadProfile(user.id)
        } catch (err) {
          // Error handled in loadProfile
        }
        setLoading(false)
      }
      fetchProfile()
    }
  }, [user])

  const login = async (email, password) => {
    try {
      setError('')
      setLoading(true)
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('Login error:', authError)
        
        let errorMessage = 'Login failed'
        if (authError.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.'
        } else if (authError.message?.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link.'
        } else if (authError.message?.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later.'
        } else {
          errorMessage = authError.message || 'Login failed'
        }
        throw new Error(errorMessage)
      }

      if (!data?.user) {
        throw new Error('Login failed - no user data received')
      }

      console.log('Login successful:', data.user.id)
      return data // Return success data
    } catch (err) {
      setError(err.message) // Set error for context, but let caller handle it
      throw err // Propagate error to caller
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email, password, userData) => {
    try {
      setError('')
      setLoading(true)
      
      const authData = await authAPI.signUp(email, password, userData)
      console.log('Signup successful')
      
      return authData
    } catch (err) {
      console.error('Signup error:', err)
      
      if (err.message?.includes('User already registered')) {
        setError('An account with this email already exists. Please try logging in.')
      } else if (err.message?.includes('Invalid email')) {
        setError('Please enter a valid email address.')
      } else if (err.message?.includes('Password should be at least 6 characters')) {
        setError('Password must be at least 6 characters long.')
      } else {
        setError(err.message || 'Signup failed')
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setError('')
      console.log('Logging out...')
      
      await supabase.auth.signOut()
      
      setUser(null)
      setProfile(null)
      
      console.log('Logout successful')
    } catch (err) {
      console.error('Logout error:', err)
      setError('Logout failed')
      throw err
    }
  }

  const retryProfileFetch = async () => {
    if (!user) return
    
    try {
      setError('')
      setLoading(true)
      await loadProfile(user.id)
    } catch (err) {
      console.error('Retry profile fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    profile,
    loading,
    error,
    login,
    signup,
    logout,
    retryProfileFetch,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
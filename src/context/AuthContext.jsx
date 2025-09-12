import { createContext, useContext, useState, useEffect, useRef } from 'react'
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
  const [initialized, setInitialized] = useState(false)
  
  // Use refs to prevent duplicate listeners and logout calls
  const authListenerRef = useRef(null)
  const isLoggingOutRef = useRef(false)

  useEffect(() => {
    initializeAuth()
    
    // Cleanup on unmount
    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.subscription?.unsubscribe()
      }
    }
  }, [])

  const initializeAuth = async () => {
    try {
      console.log('Initializing auth...')
      
      // Set up auth listener FIRST, before getting session
      if (!authListenerRef.current) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id || 'no user')
            
            // Handle different auth events
            if (event === 'SIGNED_OUT') {
              console.log('User signed out, clearing state')
              setUser(null)
              setProfile(null)
              setLoading(false)
              return
            }
            
            if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed, maintaining current state')
              return
            }
            
            if (session?.user) {
              console.log('User signed in:', session.user.id)
              setUser(session.user)
              await loadProfile(session.user.id)
            } else if (!isLoggingOutRef.current) {
              // Only clear state if we're not in the middle of a logout
              console.log('No session, clearing state')
              setUser(null)
              setProfile(null)
              setLoading(false)
            }
          }
        )
        
        authListenerRef.current = { subscription }
      }
      
      // Get initial session AFTER setting up listener
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        setLoading(false)
        setInitialized(true)
        return
      }

      if (session?.user) {
        console.log('Found existing session:', session.user.id)
        setUser(session.user)
        await loadProfile(session.user.id)
      } else {
        console.log('No existing session found')
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
      
      setInitialized(true)
    } catch (error) {
      console.error('Error initializing auth:', error)
      setLoading(false)
      setInitialized(true)
    }
  }

  const loadProfile = async (userId) => {
    if (!userId) {
      setLoading(false)
      return
    }
    
    try {
      console.log('Loading profile for user:', userId)
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000) // 10 second timeout
      })
      
      const profilePromise = authAPI.getProfile(userId)
      
      const profileData = await Promise.race([profilePromise, timeoutPromise])
      setProfile(profileData)
      console.log('Profile loaded successfully:', profileData.role)
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
      
      // If it's a timeout, we still want to stop loading
      if (error.message === 'Profile fetch timeout') {
        console.error('Profile fetch timed out after 10 seconds')
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      console.log('Starting login process...')
      
      // Clear any existing state first
      setUser(null)
      setProfile(null)
      
      const data = await authAPI.signIn(email, password)
      console.log('Login successful:', data.user?.id)
      return data
    } catch (error) {
      console.error('Login failed:', error)
      setLoading(false)
      throw error
    }
  }

  const signup = async (email, password, userData) => {
    try {
      console.log('Starting signup process...')
      const data = await authAPI.signUp(email, password, userData)
      console.log('Signup successful:', data.user?.id)
      return data
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  const logout = async () => {
    // Prevent multiple logout calls
    if (isLoggingOutRef.current) {
      console.log('Logout already in progress, skipping...')
      return
    }
    
    try {
      isLoggingOutRef.current = true
      console.log('Starting logout process...')
      
      // Clear local state immediately
      setUser(null)
      setProfile(null)
      setLoading(false)
      
      // Try to sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Only sign out from this tab/browser
      })
      
      if (error) {
        console.log('Supabase logout error (may be expected):', error.message)
      } else {
        console.log('Supabase logout successful')
      }
      
      console.log('Logout completed successfully')
    } catch (error) {
      console.log('Logout error (expected if no session):', error.message)
    } finally {
      isLoggingOutRef.current = false
    }
  }

  const value = {
    user,
    profile,
    loading,
    login,
    signup,
    logout,
    loadProfile,
    isAdmin: profile?.role === 'admin',
    isPolice: profile?.role === 'police',
    isVerified: profile?.is_verified || false
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
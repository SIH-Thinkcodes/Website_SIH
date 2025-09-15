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
  const [profileError, setProfileError] = useState(null)

  // Use refs to prevent duplicate listeners and logout calls
  const authListenerRef = useRef(null)
  const isLoggingOutRef = useRef(false)
  const profileFetchAttempts = useRef(0)
  const currentUserIdRef = useRef(null) // Track current user ID to prevent duplicates
  const isLoadingProfileRef = useRef(false) // Prevent concurrent profile loads

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
              setProfileError(null)
              profileFetchAttempts.current = 0
              currentUserIdRef.current = null
              isLoadingProfileRef.current = false
              setLoading(false)
              return
            }

            if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed, maintaining current state')
              return
            }

            // Handle user sign in - prevent duplicate profile fetches
            if (session?.user) {
              const newUserId = session.user.id

              // Only process if it's a genuinely new user or we don't have a profile yet
              if (newUserId !== currentUserIdRef.current) {
                console.log('New user signed in:', newUserId)
                currentUserIdRef.current = newUserId
                setUser(session.user)
                profileFetchAttempts.current = 0
                await loadProfile(newUserId)
              } else {
                console.log('Same user, skipping profile fetch')
              }
            } else if (!isLoggingOutRef.current) {
              // Only clear state if we're not in the middle of a logout
              console.log('No session, clearing state')
              setUser(null)
              setProfile(null)
              setProfileError(null)
              profileFetchAttempts.current = 0
              currentUserIdRef.current = null
              isLoadingProfileRef.current = false
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
        currentUserIdRef.current = session.user.id
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

  const loadProfile = async (userId, isRetry = false) => {
    if (!userId || isLoadingProfileRef.current) {
      console.log('Skipping profile fetch - no userId or already loading')
      if (!userId) setLoading(false)
      return
    }

    // Prevent too many retry attempts
    if (profileFetchAttempts.current >= 3) {
      console.log('Max profile fetch attempts reached, stopping retries')
      setProfileError('Unable to load profile after multiple attempts')
      setLoading(false)
      return
    }

    isLoadingProfileRef.current = true
    profileFetchAttempts.current++

    let error = null // Declare error variable to track it

    try {
      console.log(`Loading profile for user: ${userId} (attempt ${profileFetchAttempts.current})`)
      setProfileError(null)

      // Shorter timeout for retries
      const timeoutDuration = isRetry ? 5000 : 15000

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), timeoutDuration)
      })

      const profilePromise = authAPI.getProfile(userId)

      const profileData = await Promise.race([profilePromise, timeoutPromise])
      setProfile(profileData)
      profileFetchAttempts.current = 0 // Reset on success
      console.log('Profile loaded successfully:', profileData.role)
      setLoading(false)
    } catch (err) {
      error = err // Store the error for use in finally block
      console.error('Error loading profile:', err)

      if (err.message === 'Profile fetch timeout') {
        console.error(`Profile fetch timed out (attempt ${profileFetchAttempts.current})`)

        // Retry once more with shorter timeout
        if (profileFetchAttempts.current < 3) {
          console.log('Retrying profile fetch...')
          isLoadingProfileRef.current = false // Reset flag before retry
          setTimeout(() => loadProfile(userId, true), 1000)
          return // Don't set loading to false yet
        }
      }

      setProfile(null)
      setProfileError(err.message)
      setLoading(false)
    } finally {
      // Only reset the loading flag if we're not retrying
      if (profileFetchAttempts.current >= 3 || profile !== null || error?.message !== 'Profile fetch timeout') {
        isLoadingProfileRef.current = false
      }
    }
  }
  const login = async (email, password) => {
    try {
      setLoading(true)
      console.log('Starting login process...')

      // Clear any existing state first
      setUser(null)
      setProfile(null)
      setProfileError(null)
      profileFetchAttempts.current = 0
      currentUserIdRef.current = null
      isLoadingProfileRef.current = false

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
      setProfileError(null)
      profileFetchAttempts.current = 0
      currentUserIdRef.current = null
      isLoadingProfileRef.current = false
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

  const retryProfileFetch = () => {
    if (user?.id && !isLoadingProfileRef.current) {
      profileFetchAttempts.current = 0
      setLoading(true)
      loadProfile(user.id)
    }
  }

  const rejectOfficer = async (officerId) => {
    try {
      await authAPI.rejectOfficer(officerId)
      // Refresh officer data if admin
      if (profile?.role === 'admin') {
        // You might want to emit an event or call a callback here
      }
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    profileError,
    login,
    signup,
    logout,
    loadProfile,
    retryProfileFetch,
    rejectOfficer,
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
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Config:', { supabaseUrl, supabaseKey: supabaseKey ? 'Present' : 'Missing' })

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Auth helpers
export const authAPI = {
  // Sign up user
  signUp: async (email, password, userData) => {
    try {
      console.log('Starting signup process with userData:', userData)

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.name,
            role: userData.role
          }
        }
      })
      
      console.log('Auth signup result:', { authData, authError })
      
      if (authError) {
        if (authError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists')
        }
        if (authError.message.includes('rate limit')) {
          throw new Error('Too many signup attempts. Please try again later.')
        }
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      console.log('Created auth user with ID:', authData.user.id)

      // The trigger function should have created the profile automatically
      // Wait for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Check the automatically created profile (no RLS, so this should work)
      const { data: autoCreatedProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      console.log('Auto-created profile:', { autoCreatedProfile, checkError })

      if (autoCreatedProfile) {
        console.log('Profile was auto-created by trigger, checking if update is needed...')
        
        // Check if the auto-created profile has all the correct data
        const needsUpdate = (
          autoCreatedProfile.name !== userData.name ||
          autoCreatedProfile.role !== userData.role ||
          autoCreatedProfile.mobile_number !== userData.mobile_number ||
          autoCreatedProfile.badge_number !== userData.badge_number ||
          autoCreatedProfile.station !== userData.station ||
          autoCreatedProfile.official_id_type !== userData.official_id_type ||
          autoCreatedProfile.is_verified !== (userData.is_verified || false)
        )

        if (needsUpdate) {
          console.log('Auto-created profile needs updating...')
          const { data: updatedProfile, error: updateError } = await supabase
            .from('user_profiles')
            .update({
              name: userData.name,
              role: userData.role,
              mobile_number: userData.mobile_number || null,
              badge_number: userData.badge_number || null,
              station: userData.station || null,
              official_id_type: userData.official_id_type || null,
              is_verified: userData.is_verified || false
            })
            .eq('id', authData.user.id)
            .select()

          if (updateError) {
            console.error('Profile update failed:', updateError)
            throw new Error('Failed to update user profile: ' + updateError.message)
          }
          console.log('Profile updated successfully:', updatedProfile)
        } else {
          console.log('Auto-created profile is already correct, no update needed')
        }
      } else {
        console.log('No auto-created profile found, trying manual insert...')
        // Fallback: try to manually insert the profile
        const profileData = {
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          mobile_number: userData.mobile_number || null,
          badge_number: userData.badge_number || null,
          station: userData.station || null,
          official_id_type: userData.official_id_type || null,
          official_id_image_url: userData.official_id_image_url || null,
          is_verified: userData.is_verified || false
        }

        const { data: insertedProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert([profileData])
          .select()

        if (insertError) {
          console.error('Manual profile insert failed:', insertError)
          throw new Error('Failed to create user profile manually: ' + insertError.message)
        }
        
        console.log('Profile created manually:', insertedProfile)
      }
      
      return authData
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  },

  // Sign in
  signIn: async (email, password) => {
    try {
      console.log('Attempting to sign in with email:', email)
      
      // Clear any existing session first
      await supabase.auth.signOut({ scope: 'local' })
      
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Sign in error:', error)
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password')
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before logging in')
        }
        if (error.message.includes('rate limit')) {
          throw new Error('Too many login attempts. Please try again later.')
        }
        throw error
      }
      
      console.log('Sign in successful:', data.user?.id)
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  // Sign out
  signOut: async () => {
    try {
      console.log('Signing out from Supabase...')
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) {
        console.error('Logout error:', error)
        throw error
      }
      console.log('Supabase signout successful')
    } catch (error) {
      console.error('Signout error:', error)
      throw error
    }
  },

  // Get current user profile - WITH DETAILED DEBUG LOGGING
  getProfile: async (userId) => {
    console.log('=== STARTING PROFILE FETCH DEBUG ===')
    console.log('1. Fetching profile for user:', userId)
    
    try {
      // First, let's check if the table exists and has data
      console.log('2. Checking if table has any data...')
      const { data: allProfiles, error: countError } = await supabase
        .from('user_profiles')
        .select('id, email, name, role')
        .limit(5)
      
      console.log('3. Sample profiles in table:', allProfiles)
      if (countError) {
        console.error('4. Error checking table:', countError)
      }
      
      // Now try to get the specific profile
      console.log('5. Attempting to fetch specific profile...')
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      const endTime = Date.now()
      console.log(`6. Query completed in ${endTime - startTime}ms`)
      console.log('7. Query result - data:', data)
      console.log('8. Query result - error:', error)
      
      if (error) {
        console.error('9. Profile fetch error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        if (error.code === 'PGRST116') {
          throw new Error('User profile not found')
        }
        throw error
      }
      
      if (!data) {
        console.error('10. No data returned but no error either')
        throw new Error('Profile not found - no data returned')
      }
      
      console.log('11. Profile fetched successfully:', data)
      console.log('=== PROFILE FETCH DEBUG COMPLETE ===')
      return data
    } catch (error) {
      console.error('=== PROFILE FETCH ERROR ===')
      console.error('Error details:', error)
      console.error('Error stack:', error.stack)
      throw error
    }
  },

  // Get pending officers (admin only)
  getPendingOfficers: async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'police')
        .eq('is_verified', false)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching pending officers:', error)
      throw error
    }
  },

  // Verify officer (admin only)
  verifyOfficer: async (officerId) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_verified: true })
        .eq('id', officerId)
      
      if (error) throw error
    } catch (error) {
      console.error('Error verifying officer:', error)
      throw error
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        if (error.message.includes('rate limit')) {
          throw new Error('Too many reset attempts. Please try again later.')
        }
        throw error
      }
    } catch (error) {
      console.error('Password reset error:', error)
      throw error
    }
  }
}
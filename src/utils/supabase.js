import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
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
      
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
      throw error
    }
  },

  // Get current user profile
  getProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('User profile not found')
        }
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Profile fetch error:', error)
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
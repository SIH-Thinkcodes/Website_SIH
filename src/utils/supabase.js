import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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

      // Wait for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Check the automatically created profile
      const { data: autoCreatedProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (autoCreatedProfile) {
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
          const { error: updateError } = await supabase
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

          if (updateError) {
            throw new Error('Failed to update user profile: ' + updateError.message)
          }
        }
      } else {
        // Fallback: manually insert the profile
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

        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([profileData])

        if (insertError) {
          throw new Error('Failed to create user profile manually: ' + insertError.message)
        }
      }
      
      return authData
    } catch (error) {
      throw error
    }
  },

  // Sign in
  signIn: async (email, password) => {
    try {
      // Clear any existing session first
      await supabase.auth.signOut({ scope: 'local' })
      
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 100))
      
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
      throw error
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) {
        throw error
      }
    } catch (error) {
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
      throw error
    }
  }
}
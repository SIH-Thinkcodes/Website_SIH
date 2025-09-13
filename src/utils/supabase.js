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
    const { data: autoCreatedProfile } = await supabase
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
  },

  // Sign in
  signIn: async (email, password) => {
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
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) {
      throw error
    }
  },

  // Get current user profile
  getProfile: async (userId) => {
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
  },

  // Get pending officers (admin only)
  getPendingOfficers: async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'police')
      .eq('is_verified', false)
    
    if (error) throw error
    return data || []
  },

  // Verify officer (admin only)
  verifyOfficer: async (officerId) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_verified: true })
      .eq('id', officerId)
    
    if (error) throw error
  },

  // Reset password
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) {
      if (error.message.includes('rate limit')) {
        throw new Error('Too many reset attempts. Please try again later.')
      }
      throw error
    }
  }
}

// FIR (First Information Report) API
export const firAPI = {
  // Create a new FIR
  createFIR: async (firData) => {
    const { data, error } = await supabase
      .from('fir_reports')
      .insert([firData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get all FIRs for a police officer
  getFIRsByOfficer: async (officerId) => {
    const { data, error } = await supabase
      .from('fir_reports')
      .select('*')
      .eq('officer_id', officerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get all FIRs (admin only)
  getAllFIRs: async () => {
    const { data, error } = await supabase
      .from('fir_reports')
      .select(`
        *,
        officer:user_profiles!fir_reports_officer_id_fkey(name, badge_number, station)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get FIR by ID
  getFIRById: async (firId) => {
    const { data, error } = await supabase
      .from('fir_reports')
      .select(`
        *,
        officer:user_profiles!fir_reports_officer_id_fkey(name, badge_number, station)
      `)
      .eq('id', firId)
      .single()
    
    if (error) throw error
    return data
  },

  // Update FIR status
  updateFIRStatus: async (firId, status, notes = null) => {
    const updateData = { status }
    if (notes) updateData.notes = notes
    
    const { data, error } = await supabase
      .from('fir_reports')
      .update(updateData)
      .eq('id', firId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Search FIRs
  searchFIRs: async (searchTerm, filters = {}) => {
    let query = supabase
      .from('fir_reports')
      .select(`
        *,
        officer:user_profiles!fir_reports_officer_id_fkey(name, badge_number, station)
      `)

    // Apply search term
    if (searchTerm) {
      query = query.or(`fir_number.ilike.%${searchTerm}%,complainant_name.ilike.%${searchTerm}%,incident_description.ilike.%${searchTerm}%`)
    }

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.crime_type) {
      query = query.eq('crime_type', filters.crime_type)
    }
    if (filters.date_from) {
      query = query.gte('incident_date', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('incident_date', filters.date_to)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}
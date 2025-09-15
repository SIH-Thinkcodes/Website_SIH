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
            role: userData.role,
            mobile_number: userData.mobile_number,
            badge_number: userData.badge_number,
            station: userData.station,
            unit: userData.unit,
            official_id_type: userData.official_id_type,
            official_id_number: userData.official_id_number,
            is_verified: userData.is_verified || false
          }
        }
      })
      
      if (authError) {
        console.error('Auth Error:', authError)
        
        if (authError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists')
        }
        if (authError.message.includes('rate limit')) {
          throw new Error('Too many signup attempts. Please try again later.')
        }
        if (authError.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address')
        }
        if (authError.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long')
        }
        if (authError.message.includes('signup is disabled')) {
          throw new Error('Account registration is currently disabled. Please contact support.')
        }
        
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      console.log('User created successfully:', authData.user.id)
      
      // Wait for the database trigger to complete
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Verify the profile was created
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError)
      }

      if (!profile) {
        // Fallback: manually create the profile
        console.log('Creating profile manually...')
        const profileData = {
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          mobile_number: userData.mobile_number || null,
          badge_number: userData.badge_number || null,
          station: userData.station || null,
          unit: userData.unit || null,
          official_id_type: userData.official_id_type || null,
          official_id_number: userData.official_id_number || null,
          official_id_image_url: null,
          is_verified: userData.is_verified || false
        }

        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([profileData])

        if (insertError) {
          console.error('Manual profile creation failed:', insertError)
          throw new Error('Failed to create user profile: ' + insertError.message)
        }
      }
      
      return authData
    } catch (error) {
      console.error('Signup process failed:', error)
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
        console.error('Login error:', error)
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password')
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before logging in')
        }
        if (error.message.includes('rate limit')) {
          throw new Error('Too many login attempts. Please try again later.')
        }
        if (error.message.includes('signups not allowed')) {
          throw new Error('Login is currently disabled. Please contact support.')
        }
        
        throw new Error(error.message)
      }
      
      return data
    } catch (error) {
      console.error('Login process failed:', error)
      throw error
    }
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
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get active officers (admin only)
  getActiveOfficers: async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'police')
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Verify officer (admin only)
  verifyOfficer: async (officerId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ is_verified: true })
      .eq('id', officerId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Reject officer (admin only)
  rejectOfficer: async (officerId, reason = null) => {
    // You might want to create a separate table for rejected applications
    // For now, we'll just delete the profile
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', officerId)
    
    if (error) throw error
    
    // Also delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(officerId)
    if (authError) {
      console.error('Failed to delete auth user:', authError)
      // Don't throw here as profile is already deleted
    }
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

// Storage helpers
export const storageAPI = {
  // Upload file to documents bucket
  uploadDocument: async (file, path, userId) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      const fullPath = `${path}/${fileName}`

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fullPath)

      return publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error('Failed to upload file: ' + error.message)
    }
  },

  // Delete file from storage
  deleteDocument: async (path) => {
    try {
      const { error } = await supabase.storage
        .from('documents')
        .remove([path])

      if (error) throw error
    } catch (error) {
      console.error('Delete error:', error)
      throw new Error('Failed to delete file: ' + error.message)
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
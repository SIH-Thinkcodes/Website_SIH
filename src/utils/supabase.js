// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js';

// Singleton Supabase clients
let supabaseInstance = null;
let supabaseAdminInstance = null;

const getSupabase = () => {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseInstance;
};

const getSupabaseAdmin = () => {
  if (!supabaseAdminInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminInstance;
};

export const supabase = getSupabase();
const supabaseAdmin = getSupabaseAdmin();

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://sih-tourist-safety-backend.onrender.com'; // Update with your Render URL
const adminSecretKey = import.meta.env.VITE_ADMIN_SECRET_KEY; 

// Auth helpers
export const authAPI = {
  // Sign up user
  async signUp(email, password, userData) {
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
            is_verified: userData.is_verified || false,
          },
        },
      });

      if (authError) {
        console.error('Auth Error:', authError);
        if (authError.code === 'user_already_exists') {
          throw new Error('An account with this email already exists');
        }
        if (authError.code === 'rate_limit_exceeded') {
          throw new Error('Too many signup attempts. Please try again later.');
        }
        if (authError.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address');
        }
        if (authError.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long');
        }
        if (authError.message.includes('signup is disabled')) {
          throw new Error('Account registration is currently disabled. Please contact support.');
        }
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      console.log('User created successfully:', authData.user.id);

      // Verify the profile was created
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to verify user profile: ' + profileError.message);
      }

      if (!profile) {
        console.log('Creating profile manually...');
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
          is_verified: userData.is_verified || false,
        };

        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([profileData]);

        if (insertError) {
          console.error('Manual profile creation failed:', insertError);
          throw new Error('Failed to create user profile: ' + insertError.message);
        }
      }

      return authData;
    } catch (error) {
      console.error('Signup process failed:', error);
      throw error;
    }
  },

  // Sign in
  async signIn(email, password) {
    try {
      await supabase.auth.signOut({ scope: 'local' });
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        if (error.code === 'invalid_credentials') {
          throw new Error('Invalid email or password');
        }
        if (error.code === 'email_not_confirmed') {
          throw new Error('Please check your email and click the confirmation link before logging in');
        }
        if (error.code === 'rate_limit_exceeded') {
          throw new Error('Too many login attempts. Please try again later.');
        }
        if (error.message.includes('signups not allowed')) {
          throw new Error('Login is currently disabled. Please contact support.');
        }
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Login process failed:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      throw error;
    }
  },

  // Get current user profile
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('User profile not found');
      }
      if (error.code === 'PGRST301') {
        throw new Error('Unauthorized access to user profile');
      }
      throw error;
    }

    return data;
  },

  // Get pending officers (admin only)
  async getPendingOfficers() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'police')
      .eq('is_verified', false)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST301') {
        throw new Error('Unauthorized access to pending officers');
      }
      throw error;
    }
    return data || [];
  },

  // Get active officers (admin only)
  async getActiveOfficers() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'police')
      .eq('is_verified', true)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST301') {
        throw new Error('Unauthorized access to active officers');
      }
      throw error;
    }
    return data || [];
  },

  // Verify officer (admin only)
  async verifyOfficer(officerId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ is_verified: true })
        .eq('id', officerId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST301') {
          throw new Error('Unauthorized access to verify officer');
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error verifying officer:', error);
      throw error;
    }
  },

  // Reject officer (admin only)
  async rejectOfficer(officerId, reason = null) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', officerId);

      if (error) {
        if (error.code === 'PGRST301') {
          throw new Error('Unauthorized access to reject officer');
        }
        throw error;
      }

      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(officerId);
      if (authError) {
        console.error('Failed to delete auth user:', authError);
      }
    } catch (error) {
      console.error('Error rejecting officer:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      if (error.code === 'rate_limit_exceeded') {
        throw new Error('Too many reset attempts. Please try again later.');
      }
      throw error;
    }
  },
};

// Traveller API for mobile app users
export const travellerAPI = {
  // Get pending travellers (admin only)
  async getPendingTravellers() {
    const { data, error } = await supabase
      .from('traveller_profiles')
      .select('*')
      .eq('is_verified', false)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST301') {
        throw new Error('Unauthorized access to pending travellers');
      }
      throw error;
    }
    return data || [];
  },

  // Get verified travellers (admin only)
  async getVerifiedTravellers() {
    const { data, error } = await supabase
      .from('traveller_profiles')
      .select('*')
      .eq('is_verified', true)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST301') {
        throw new Error('Unauthorized access to verified travellers');
      }
      throw error;
    }
    return data || [];
  },

  // Verify traveller and generate blockchain digital ID (admin only)
  async verifyTraveller(travellerId) {
    try {
      const { data: traveller, error: fetchError } = await supabase
        .from('traveller_profiles')
        .select('*')
        .eq('id', travellerId)
        .single();

      if (fetchError || !traveller) {
        throw new Error('Traveller not found');
      }

      const response = await fetch(`${backendUrl}/api/traveller/update-digital-id/${travellerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSecretKey}`,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate digital ID');
      }

      const { data, error } = await supabase
        .from('traveller_profiles')
        .update({
          is_verified: true,
          digital_id: result.traveller.digital_id,
          blockchain_wallet_address: result.traveller.blockchain_wallet_address,
          blockchain_transaction_hash: result.traveller.blockchain_transaction_hash,
        })
        .eq('id', travellerId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST301') {
          throw new Error('Unauthorized access to verify traveller');
        }
        throw error;
      }

      console.log('Traveller verified with blockchain digital ID:', result);
      return data;
    } catch (error) {
      console.error('Error verifying traveller:', error);
      throw error;
    }
  },

  // Reject traveller (admin only)
  async rejectTraveller(travellerId, reason = null) {
    try {
      const response = await fetch(`${backendUrl}/api/traveller/reject/${travellerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSecretKey}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to reject traveller');
      }

      const { error } = await supabase
        .from('traveller_profiles')
        .delete()
        .eq('id', travellerId);

      if (error) {
        if (error.code === 'PGRST301') {
          throw new Error('Unauthorized access to reject traveller');
        }
        throw error;
      }
      console.log('Traveller profile deleted:', travellerId);
    } catch (error) {
      console.error('Error rejecting traveller:', error);
      throw error;
    }
  },

  // Search traveller by digital ID
  async searchByDigitalId(digitalId) {
    try {
      const response = await fetch(`${backendUrl}/api/traveller/by-digital-id/${digitalId}`, {
        headers: {
          'Authorization': `Bearer ${adminSecretKey}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Traveller not found');
      }

      return result.traveller;
    } catch (error) {
      console.error('Error searching traveller:', error);
      throw error;
    }
  },

  // Get traveller by ID
  async getTravellerById(travellerId) {
    const { data, error } = await supabase
      .from('traveller_profiles')
      .select('*')
      .eq('id', travellerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Traveller not found');
      }
      if (error.code === 'PGRST301') {
        throw new Error('Unauthorized access to traveller profile');
      }
      throw error;
    }

    return data;
  },
};

// Storage helpers
export const storageAPI = {
  // Upload file to documents bucket
  async uploadDocument(file, path, userId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const fullPath = `${path}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fullPath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload file: ' + error.message);
    }
  },

  // Delete file from storage
  async deleteDocument(path) {
    try {
      const { error } = await supabase.storage
        .from('documents')
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete file: ' + error.message);
    }
  },
};

// FIR (First Information Report) API
export const firAPI = {
  // Create a new FIR
  async createFIR(firData) {
    const { data, error } = await supabase
      .from('fir_reports')
      .insert([firData])
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST301') {
        throw new Error('Unauthorized access to create FIR');
      }
      throw error;
    }
    return data;
  },

  // Get all FIRs for a police officer
  async getFIRsByOfficer(officerId) {
    const { data, error } = await supabase
      .from('fir_reports')
      .select('*')
      .eq('officer_id', officerId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST301') {
        throw new Error('Unauthorized access to officer FIRs');
      }
      throw error;
    }
    return data || [];
  },

  // Get all FIRs (admin only)
  async getAllFIRs() {
    const { data, error } = await supabase
      .from('fir_reports')
      .select(`
        *,
        officer:user_profiles!fir_reports_officer_id_fkey(name, badge_number, station)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST301') {
        throw new Error('Unauthorized access to all FIRs');
      }
      throw error;
    }
    return data || [];
  },

  // Get FIR by ID
  async getFIRById(firId) {
    const { data, error } = await supabase
      .from('fir_reports')
      .select(`
        *,
        officer:user_profiles!fir_reports_officer_id_fkey(name, badge_number, station)
      `)
      .eq('id', firId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('FIR not found');
      }
      if (error.code === 'PGRST301') {
        throw new Error('Unauthorized access to FIR');
      }
      throw error;
    }
    return data;
  },

  // Update FIR status
  async updateFIRStatus(firId, status, notes = null) {
    const updateData = { status };
    if (notes) updateData.notes = notes;

    const { data, error } = await supabase
      .from('fir_reports')
      .update(updateData)
      .eq('id', firId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST301') {
        throw new Error('Unauthorized access to update FIR');
      }
      throw error;
    }
    return data;
  },

  // Search FIRs
  async searchFIRs(searchTerm, filters = {}) {
    let query = supabase
      .from('fir_reports')
      .select(`
        *,
        officer:user_profiles!fir_reports_officer_id_fkey(name, badge_number, station)
      `);

    if (searchTerm) {
      query = query.or(`fir_number.ilike.%${searchTerm}%,complainant_name.ilike.%${searchTerm}%,incident_description.ilike.%${searchTerm}%`);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.crime_type) {
      query = query.eq('crime_type', filters.crime_type);
    }
    if (filters.date_from) {
      query = query.gte('incident_date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('incident_date', filters.date_to);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST301') {
        throw new Error('Unauthorized access to search FIRs');
      }
      throw error;
    }
    return data || [];
  },
};
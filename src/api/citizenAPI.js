import { supabase } from '../utils/supabase'

export const citizenAPI = {
  getCitizens: async (filters = {}) => {
    try {
      let query = supabase
        .from('traveller_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.verified !== undefined) {
        query = query.eq('is_verified', filters.verified)
      }
      if (filters.onboarded !== undefined) {
        query = query.eq('onboarded', filters.onboarded)
      }
      if (filters.nationality) {
        query = query.eq('nationality', filters.nationality)
      }
      if (filters.destination) {
        query = query.ilike('destination', `%${filters.destination}%`)
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Transform data to include derived fields
      return (data || []).map(citizen => ({
        ...citizen,
        full_name: `${citizen.first_name || ''} ${citizen.last_name || ''}`.trim(),
        last_seen: citizen.updated_at || citizen.created_at
      }))
    } catch (error) {
      console.error('Error fetching citizens:', error)
      throw new Error('Failed to fetch citizens: ' + error.message)
    }
  },

  // Search citizens
  searchCitizens: async (searchTerm, limit = 50) => {
    try {
      if (!searchTerm.trim()) {
        return citizenAPI.getCitizens()
      }

      const { data, error } = await supabase
        .from('traveller_profiles')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,digital_id.ilike.%${searchTerm}%,nationality.ilike.%${searchTerm}%,destination.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map(citizen => ({
        ...citizen,
        full_name: `${citizen.first_name || ''} ${citizen.last_name || ''}`.trim(),
        last_seen: citizen.updated_at || citizen.created_at
      }))
    } catch (error) {
      console.error('Error searching citizens:', error)
      throw new Error('Failed to search citizens: ' + error.message)
    }
  },

  // Get citizen by ID
  getCitizenById: async (citizenId) => {
    try {
      const { data, error } = await supabase
        .from('traveller_profiles')
        .select('*')
        .eq('id', citizenId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Citizen not found')
        }
        throw error
      }

      return {
        ...data,
        full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        last_seen: data.updated_at || data.created_at
      }
    } catch (error) {
      console.error('Error fetching citizen:', error)
      throw error
    }
  },

  // Get citizens by verification status
  getCitizensByVerification: async (isVerified = true) => {
    try {
      const { data, error } = await supabase
        .from('traveller_profiles')
        .select('*')
        .eq('is_verified', isVerified)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(citizen => ({
        ...citizen,
        full_name: `${citizen.first_name || ''} ${citizen.last_name || ''}`.trim(),
        last_seen: citizen.updated_at || citizen.created_at
      }))
    } catch (error) {
      console.error('Error fetching citizens by verification:', error)
      throw new Error('Failed to fetch citizens: ' + error.message)
    }
  },

  // Update citizen verification status (police only)
  updateCitizenVerification: async (citizenId, isVerified, notes = null) => {
    try {
      const updateData = { 
        is_verified: isVerified,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('traveller_profiles')
        .update(updateData)
        .eq('id', citizenId)
        .select()
        .single()

      if (error) throw error

      return {
        ...data,
        full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        last_seen: data.updated_at || data.created_at
      }
    } catch (error) {
      console.error('Error updating citizen verification:', error)
      throw new Error('Failed to update verification status: ' + error.message)
    }
  },

  // Get citizen statistics
  getCitizenStats: async () => {
    try {
      const [totalResult, verifiedResult, onboardedResult, recentResult] = await Promise.all([
        supabase
          .from('traveller_profiles')
          .select('id', { count: 'exact' }),
        supabase
          .from('traveller_profiles')
          .select('id', { count: 'exact' })
          .eq('is_verified', true),
        supabase
          .from('traveller_profiles')
          .select('id', { count: 'exact' })
          .eq('onboarded', true),
        supabase
          .from('traveller_profiles')
          .select('id', { count: 'exact' })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ])

      return {
        total: totalResult.count || 0,
        verified: verifiedResult.count || 0,
        onboarded: onboardedResult.count || 0,
        recent: recentResult.count || 0
      }
    } catch (error) {
      console.error('Error fetching citizen stats:', error)
      throw new Error('Failed to fetch statistics: ' + error.message)
    }
  },

  // Get citizens by nationality (for reporting)
  getCitizensByNationality: async () => {
    try {
      const { data, error } = await supabase
        .from('traveller_profiles')
        .select('nationality')
        .not('nationality', 'is', null)

      if (error) throw error

      // Count by nationality
      const nationalityCounts = {}
      data.forEach(citizen => {
        const nationality = citizen.nationality
        nationalityCounts[nationality] = (nationalityCounts[nationality] || 0) + 1
      })

      return Object.entries(nationalityCounts)
        .map(([nationality, count]) => ({ nationality, count }))
        .sort((a, b) => b.count - a.count)
    } catch (error) {
      console.error('Error fetching nationality stats:', error)
      throw new Error('Failed to fetch nationality statistics: ' + error.message)
    }
  },

  // Subscribe to real-time citizen updates
  subscribeToCitizenUpdates: (callback) => {
    try {
      const subscription = supabase
        .channel('citizen-updates')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'traveller_profiles'
          },
          (payload) => {
            console.log('Citizen update received:', payload)
            callback(payload)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    } catch (error) {
      console.error('Error subscribing to citizen updates:', error)
      throw new Error('Failed to subscribe to updates: ' + error.message)
    }
  }
}

// Chat-related APIs
export const chatAPI = {
  // Get or create conversation between police and citizen
  getOrCreateConversation: async (policeId, citizenId) => {
    try {
      // First, try to find existing conversation
      const { data: existingConv, error: searchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('police_id', policeId)
        .eq('citizen_id', citizenId)
        .single()

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError
      }

      if (existingConv) {
        return existingConv
      }

      // Create new conversation if none exists
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert([
          {
            police_id: policeId,
            citizen_id: citizenId,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (createError) throw createError

      return newConv
    } catch (error) {
      console.error('Error getting/creating conversation:', error)
      throw new Error('Failed to initialize conversation: ' + error.message)
    }
  },

  // Get conversation messages
  getConversationMessages: async (conversationId, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:user_profiles(id, name, role)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw new Error('Failed to fetch messages: ' + error.message)
    }
  },

  // Send message
  sendMessage: async (conversationId, senderId, message, messageType = 'text') => {
    try {
      const messageData = {
        conversation_id: conversationId,
        sender_id: senderId,
        message: message.trim(),
        message_type: messageType,
        created_at: new Date().toISOString(),
        read_at: null
      }

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select(`
          *,
          sender:user_profiles(id, name, role)
        `)
        .single()

      if (error) throw error

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      return data
    } catch (error) {
      console.error('Error sending message:', error)
      throw new Error('Failed to send message: ' + error.message)
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (conversationId, userId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('read_at', null)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error marking messages as read:', error)
      throw new Error('Failed to mark messages as read: ' + error.message)
    }
  },

  // Get conversations for a user (police officer)
  getUserConversations: async (userId, limit = 20) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          citizen:traveller_profiles(id, first_name, last_name, email, nationality, is_verified),
          police:user_profiles(id, name),
          last_message:messages(id, message, created_at, sender_id)
        `)
        .eq('police_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map(conv => ({
        ...conv,
        unread_count: 0, // Will be populated by separate query
        citizen: {
          ...conv.citizen,
          full_name: `${conv.citizen?.first_name || ''} ${conv.citizen?.last_name || ''}`.trim()
        }
      }))
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw new Error('Failed to fetch conversations: ' + error.message)
    }
  },

  // Get unread message count for conversation
  getUnreadCount: async (conversationId, userId) => {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('read_at', null)

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
  },

  // Subscribe to real-time messages for a conversation
  subscribeToMessages: (conversationId, callback) => {
    try {
      const subscription = supabase
        .channel(`messages-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          async (payload) => {
            // Fetch complete message data with sender info
            const { data: messageWithSender } = await supabase
              .from('messages')
              .select(`
                *,
                sender:user_profiles(id, name, role)
              `)
              .eq('id', payload.new.id)
              .single()

            callback(messageWithSender || payload.new)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    } catch (error) {
      console.error('Error subscribing to messages:', error)
      throw new Error('Failed to subscribe to messages: ' + error.message)
    }
  },

  // Close/Archive conversation
  closeConversation: async (conversationId, reason = null) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          close_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error closing conversation:', error)
      throw new Error('Failed to close conversation: ' + error.message)
    }
  }
}

// Alert and notification APIs
export const alertAPI = {
  // Create alert for citizen
  createAlert: async (citizenId, policeId, alertType, priority, message, metadata = null) => {
    try {
      const alertData = {
        citizen_id: citizenId,
        police_id: policeId,
        alert_type: alertType, // 'verification_required', 'suspicious_activity', 'document_issue', etc.
        priority: priority, // 'low', 'medium', 'high', 'urgent'
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
        status: 'active',
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('alerts')
        .insert([alertData])
        .select(`
          *,
          citizen:traveller_profiles(id, first_name, last_name, nationality),
          police:user_profiles(id, name)
        `)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error creating alert:', error)
      throw new Error('Failed to create alert: ' + error.message)
    }
  },

  // Get alerts for police dashboard
  getAlerts: async (filters = {}) => {
    try {
      let query = supabase
        .from('alerts')
        .select(`
          *,
          citizen:traveller_profiles(id, first_name, last_name, nationality, email),
          police:user_profiles(id, name)
        `)
        .order('created_at', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.policeId) {
        query = query.eq('police_id', filters.policeId)
      }
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map(alert => ({
        ...alert,
        citizen: {
          ...alert.citizen,
          full_name: `${alert.citizen?.first_name || ''} ${alert.citizen?.last_name || ''}`.trim()
        },
        metadata: alert.metadata ? JSON.parse(alert.metadata) : null
      }))
    } catch (error) {
      console.error('Error fetching alerts:', error)
      throw new Error('Failed to fetch alerts: ' + error.message)
    }
  },

  // Update alert status
  updateAlertStatus: async (alertId, status, resolution = null) => {
    try {
      const updateData = {
        status, // 'active', 'resolved', 'dismissed'
        updated_at: new Date().toISOString()
      }

      if (status === 'resolved' && resolution) {
        updateData.resolution = resolution
        updateData.resolved_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('alerts')
        .update(updateData)
        .eq('id', alertId)
        .select(`
          *,
          citizen:traveller_profiles(id, first_name, last_name, nationality),
          police:user_profiles(id, name)
        `)
        .single()

      if (error) throw error

      return {
        ...data,
        citizen: {
          ...data.citizen,
          full_name: `${data.citizen?.first_name || ''} ${data.citizen?.last_name || ''}`.trim()
        },
        metadata: data.metadata ? JSON.parse(data.metadata) : null
      }
    } catch (error) {
      console.error('Error updating alert:', error)
      throw new Error('Failed to update alert: ' + error.message)
    }
  }
}

// Export all APIs
export default {
  ...citizenAPI,
  chat: chatAPI,
  alerts: alertAPI
}
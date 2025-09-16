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
  }
}

// Export all APIs
export default {
  ...citizenAPI,
  chat: chatAPI
}
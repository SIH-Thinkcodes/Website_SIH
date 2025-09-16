import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Users,
  Search,
  Send,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { chatAPI, citizenAPI } from '../../api/citizenAPI';

const PoliceInterface = () => {
  const [citizens, setCitizens] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch current police officer details
  const getCurrentUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setError('Failed to load user information');
    }
  };

  // Fetch citizens from traveller_profiles table
  const fetchCitizens = async () => {
    try {
      setLoading(true);
      setError(null);

      const citizensData = await citizenAPI.getCitizens();
      setCitizens(citizensData);
    } catch (error) {
      console.error('Error fetching citizens:', error);
      setError('Failed to load citizens. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize chat with a citizen
  // Enhanced startChat function with better real-time handling
  const startChat = async (citizen) => {
    if (!currentUser) {
      setError('User not authenticated');
      return;
    }

    try {
      setActiveChat(citizen);
      setMessages([]);
      setActiveConversation(null);

      // Get or create conversation
      const conversation = await chatAPI.getOrCreateConversation(currentUser.id, citizen.id);
      setActiveConversation(conversation);

      // Fetch messages for this conversation
      const conversationMessages = await chatAPI.getConversationMessages(conversation.id);
      setMessages(conversationMessages);

      // Mark messages as read
      await chatAPI.markMessagesAsRead(conversation.id, currentUser.id);

      // Subscribe to real-time messages
      const channel = supabase
        .channel(`conversation-${conversation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversation.id}`
          },
          (payload) => {
            const newMessage = payload.new;
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(msg => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          }
        )
        .subscribe();

      // Store channel reference for cleanup
      setActiveChannel(channel);

      // Clean up function
      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    } catch (error) {
      console.error('Error starting chat:', error);
      setError('Failed to start conversation');
    }
  };

  // Add state for active channel
  const [activeChannel, setActiveChannel] = useState(null);

  // Enhanced useEffect for cleanup
  useEffect(() => {
    return () => {
      // Cleanup subscription when component unmounts
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, [activeChannel]);

  // Alternative: Direct Supabase subscription in useEffect
  useEffect(() => {
    let channel = null;

    if (activeConversation) {
      // Subscribe to real-time updates for the active conversation
      channel = supabase
        .channel(`messages-${activeConversation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${activeConversation.id}`
          },
          (payload) => {
            const newMessage = payload.new;

            // Only add if it's not from the current user (to avoid duplicates from sendMessage)
            if (newMessage.sender_id !== currentUser?.id) {
              setMessages(prev => {
                if (prev.some(msg => msg.id === newMessage.id)) {
                  return prev;
                }
                return [...prev, newMessage];
              });
            }
          }
        )
        .subscribe();
    }

    // Cleanup function
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [activeConversation, currentUser?.id]);

  // Enhanced sendMessage function
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !currentUser || sendingMessage) return;

    try {
      setSendingMessage(true);

      // Create temporary message for immediate UI update
      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: newMessage,
        sender_id: currentUser.id,
        conversation_id: activeConversation.id,
        created_at: new Date().toISOString(),
        isTemporary: true
      };

      // Add temporary message to UI
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      // Send message to server
      const sentMessage = await chatAPI.sendMessage(
        activeConversation.id,
        currentUser.id,
        newMessage
      );

      // Replace temporary message with real message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempMessage.id ? sentMessage : msg
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');

      // Remove temporary message on error
      setMessages(prev =>
        prev.filter(msg => msg.id !== tempMessage.id)
      );

      // Restore message in input
      setNewMessage(newMessage);
    } finally {
      setSendingMessage(false);
    }
  };
  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    getCurrentUser();
    fetchCitizens();
  }, []);

  const filteredCitizens = citizens.filter(citizen => {
    const fullName = `${citizen.first_name || ''} ${citizen.last_name || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return fullName.includes(searchLower) ||
      (citizen.email && citizen.email.toLowerCase().includes(searchLower)) ||
      (citizen.nationality && citizen.nationality.toLowerCase().includes(searchLower)) ||
      (citizen.destination && citizen.destination.toLowerCase().includes(searchLower)) ||
      (citizen.digital_id && citizen.digital_id.toLowerCase().includes(searchLower));
  });

  const refreshCitizens = () => {
    fetchCitizens();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isPoliceMessage = (message) => {
    return message.sender_id === currentUser?.id ||
      (message.sender && message.sender.role === 'police');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 px-6 py-4 shadow-xl flex items-center space-x-3">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
          <span className="text-white/90">Loading citizens...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 w-12 h-12 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Data</h3>
          <p className="text-white/80 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              refreshCitizens();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar - Citizens List */}
      <div className="w-1/3 bg-white/10 backdrop-blur-md/10 backdrop-blur-md border-r border-white/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="text-blue-600 w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold text-white">Police Dashboard</h1>
                {currentUser && (
                  <p className="text-sm text-white/80">
                    {currentUser.name} • Badge: {currentUser.badge_number || 'N/A'}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={refreshCitizens}
              className="p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-lg"
              title="Refresh citizens list"
            >
              <Clock className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search citizens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/60"
            />
          </div>
        </div>

        {/* Citizens List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-sm font-medium text-white/80">
                Citizens ({filteredCitizens.length})
              </span>
              <Users className="text-white/60 w-4 h-4" />
            </div>

            {filteredCitizens.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto text-white/40 w-12 h-12 mb-3" />
                <p className="text-white/70">
                  {searchTerm ? 'No citizens match your search' : 'No citizens found'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              filteredCitizens.map((citizen) => (
                <div
                  key={citizen.id}
                  onClick={() => startChat(citizen)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${activeChat?.id === citizen.id
                      ? 'bg-blue-500/20 border-l-4 border-blue-400'
                      : 'hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-white truncate">
                          {citizen.first_name || 'Unknown'} {citizen.last_name || ''}
                        </h3>
                        {citizen.is_verified ? (
                          <CheckCircle className="text-green-500 w-4 h-4 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="text-yellow-500 w-4 h-4 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-sm text-white/80 truncate">{citizen.email || 'No email'}</p>

                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <MapPin className="text-white/60 w-3 h-3" />
                          <span className="text-xs text-white/70">{citizen.destination || 'No destination'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="text-white/60 w-3 h-3" />
                          <span className="text-xs text-white/70">
                            {citizen.last_seen ? formatDate(citizen.last_seen) : 'Unknown'}
                          </span>
                        </div>
                      </div>

                      {citizen.digital_id && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            ID: {citizen.digital_id}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {(activeChat.first_name?.[0] || '?')}{(activeChat.last_name?.[0] || '')}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {activeChat.first_name || 'Unknown'} {activeChat.last_name || ''}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-white/80">
                      <span>{activeChat.nationality || 'Unknown nationality'}</span>
                      <span>•</span>
                      <span>{activeChat.destination || 'No destination'}</span>
                      {activeChat.digital_id && (
                        <>
                          <span>•</span>
                          <span>ID: {activeChat.digital_id}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveChat(null);
                      setActiveConversation(null);
                      setMessages([]);
                    }}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-white/70 mt-8">
                  <MessageCircle className="mx-auto w-12 h-12 mb-2 text-white/40" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${isPoliceMessage(message) ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isPoliceMessage(message)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/20 text-white backdrop-blur-sm border border-white/30'
                        }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${isPoliceMessage(message) ? 'text-blue-100' : 'text-white/70'
                          }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white/10 backdrop-blur-md border-t border-white/20 p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/60"
                  onKeyPress={handleKeyPress}
                  disabled={sendingMessage}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          // No Chat Selected
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto text-white/60 w-16 h-16 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Select a citizen to start chatting
              </h3>
              <p className="text-white/80">
                Choose from the list of citizens on the left to begin a conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliceInterface;
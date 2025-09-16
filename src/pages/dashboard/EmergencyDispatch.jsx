import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { 
  Phone, MapPin, Clock, AlertTriangle, User, CheckCircle, 
  UserCheck, MessageSquare, Users, ArrowUp, RefreshCw, 
  PhoneCall, Filter, Search, Globe, Check, X, Loader, 
  Shield, Badge, Activity, Bell
} from 'lucide-react';

// Multilingual translations (unchanged)
const translations = {
  en: {
    title: "Emergency Dispatch Center",
    activeAlerts: "Active Emergency Alerts",
    filterBy: "Filter by",
    searchPlaceholder: "Search by tourist name or ID...",
    allStatus: "All Status",
    allTypes: "All Types",
    allPriority: "All Priority",
    new: "New",
    acknowledged: "Acknowledged",
    assigned: "Assigned",
    inProgress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    medicalEmergency: "Medical Emergency",
    securityThreat: "Security Threat",
    missingPerson: "Missing Person",
    naturalDisaster: "Natural Disaster",
    sos: "SOS",
    panicButton: "Panic Button",
    touristId: "Tourist ID",
    location: "Location",
    time: "Time",
    actions: "Actions",
    acknowledge: "Acknowledge",
    assignUnit: "Assign Unit",
    changePriority: "Change Priority",
    sendMessage: "Send Message",
    callTourist: "Call Tourist",
    contactFamily: "Contact Family",
    viewDetails: "View Details",
    assignedTo: "Assigned to",
    handledBy: "Currently Handled by",
    lastActionBy: "Last Action by",
    emergencyContacts: "Emergency Contacts",
    emergencyAlert: "EMERGENCY ALERT",
    newEmergencyReceived: "NEW EMERGENCY RECEIVED",
    acknowledgeToClose: "Click ACKNOWLEDGE to close this alert",
    quickMessages: {
      help: "Help is on the way. Please stay calm and remain at your current location.",
      safe: "You are safe now. Police are nearby. Please follow officer instructions.",
      calm: "Please stay calm. We are tracking your location and help is coming.",
      wait: "Please wait at a safe location. Emergency responders are en route."
    },
    priorityLevels: {
      critical: "Critical - Immediate Response",
      high: "High - Urgent Response", 
      medium: "Medium - Standard Response",
      low: "Low - Routine Response"
    },
    statusUpdated: "Status updated successfully",
    messageSent: "Message sent to tourist",
    familyContacted: "Emergency contacts notified",
    selectUnit: "Select Unit",
    unitAssigned: "Unit assigned successfully",
    close: "Close",
    send: "Send",
    contact: "Contact All",
    relation: "Relation",
    phone: "Phone",
    sending: "Sending...",
    calling: "Calling...",
    contacting: "Contacting...",
    acknowledging: "Processing...",
    selectPriority: "Select Priority Level",
    priorityChanged: "Priority level updated"
  }
};

const EmergencyDispatch = ({ profile }) => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const [notification, setNotification] = useState(null);
  const [emergencyPopup, setEmergencyPopup] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const t = translations[language] || translations.en;

  // Available units for assignment (unchanged)
  const availableUnits = [
    'Unit-01 (Patrol Car)', 'Unit-02 (Motorcycle)', 'Unit-03 (Emergency Response)',
    'Unit-04 (Beach Patrol)', 'Unit-05 (Tourist Police)', 'Medical Unit-01', 'Rescue Unit-01'
  ];

  // Priority levels with descriptions (unchanged)
  const priorityLevels = [
    { value: 'Critical', label: 'Critical', description: 'Life-threatening emergency requiring immediate response', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    { value: 'High', label: 'High', description: 'Serious situation requiring urgent attention', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { value: 'Medium', label: 'Medium', description: 'Standard emergency response required', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    { value: 'Low', label: 'Low', description: 'Non-urgent situation, routine response', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
  ];

  // Utility functions (unchanged)
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-400/30';
      default: return 'bg-white/20 text-white/80 border-white/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-red-600 text-white';
      case 'acknowledged': return 'bg-yellow-600 text-white';
      case 'assigned': return 'bg-blue-600 text-white';
      case 'in progress': return 'bg-purple-600 text-white';
      case 'resolved': return 'bg-green-600 text-white';
      case 'closed': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getAlertIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'medical emergency': return '🚑';
      case 'security threat': return '🚨';
      case 'missing person': return '🔍';
      case 'natural disaster': return '🌊';
      case 'sos': return '🆘';
      case 'panic button': return '⚠️';
      default: return '📢';
    }
  };

  useEffect(() => {
    loadAlerts();

    // Set up Supabase real-time subscription
    const channel = supabase
      .channel('realtime-emergency-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emergency_alerts',
          filter: "status=eq.New"
        },
        (payload) => {
          console.log('Real-time INSERT received:', JSON.stringify(payload, null, 2));
          if (payload.eventType === 'INSERT' && payload.new && payload.new.status === 'New') {
            console.log('Setting popup for new alert:', payload.new);
            setEmergencyPopup(payload.new);
            setPopupVisible(true);
            loadAlerts(); // Refresh alerts after setting popup
          } else {
            console.warn('Unexpected payload or status:', payload);
          }
        }
      )
      .subscribe((status, error) => {
        console.log('Subscription status:', status);
        if (error) {
          console.error('Subscription error:', error);
          showNotification('Failed to subscribe to real-time alerts', 'error');
        }
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to emergency_alerts real-time updates');
        }
      });

    // Debug subscription state
    console.log('Initializing subscription for emergency_alerts');

    return () => {
      console.log('Cleaning up subscription for realtime-emergency-alerts');
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    console.log('Popup state:', { popupVisible, emergencyPopup });
    applyFilters();
  }, [alerts, statusFilter, typeFilter, priorityFilter, searchTerm, popupVisible, emergencyPopup]);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log('Loaded alerts:', data);
      setAlerts(data || []);

      // Fallback: Trigger popup for new alerts if subscription fails
      const newAlert = data?.find(alert => alert.status === 'New' && !popupVisible);
      if (newAlert && !emergencyPopup) {
        console.log('Fallback: Triggering popup for new alert:', newAlert);
        setEmergencyPopup(newAlert);
        setPopupVisible(true);
      }
    } catch (error) {
      console.error('Error loading alerts:', error.message);
      showNotification('Error loading alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...alerts];
    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status?.toLowerCase() === statusFilter);
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.alert_type?.toLowerCase() === typeFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.priority_level?.toLowerCase() === priorityFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.tourist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.tourist_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredAlerts(filtered);
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const acknowledgeEmergencyPopup = async () => {
    if (!emergencyPopup) return;
    setLoadingState(emergencyPopup.id, 'popup-acknowledge', true);
    try {
      const updateData = {
        status: 'Acknowledged',
        acknowledged_at: new Date().toISOString(),
        current_handling_officer_id: profile?.id,
        current_handling_officer_name: profile?.name,
        last_action_by_officer_id: profile?.id,
        last_action_by_officer_name: profile?.name,
        last_action_timestamp: new Date().toISOString(),
        response_actions: [
          ...(emergencyPopup.response_actions || []),
          {
            action: 'Status Changed to Acknowledged',
            officer_id: profile?.id,
            officer_name: profile?.name,
            timestamp: new Date().toISOString()
          }
        ]
      };

      const { error } = await supabase
        .from('emergency_alerts')
        .update(updateData)
        .eq('id', emergencyPopup.id);

      if (error) throw error;
      console.log('Popup acknowledged, closing...');
      setPopupVisible(false);
      setEmergencyPopup(null);
      loadAlerts();
      showNotification(t.statusUpdated, 'success');

      if (typeof window !== 'undefined' && 'Audio' in window) {
        try {
          const audio = new Audio('/sounds/alert.wav');
          audio.play().catch(e => console.log('Audio playback failed:', e));
        } catch (e) {
          console.log('Audio not supported');
        }
      }
    } catch (error) {
      console.error('Error acknowledging emergency:', error.message);
      showNotification('Error acknowledging emergency', 'error');
    } finally {
      setLoadingState(emergencyPopup.id, 'popup-acknowledge', false);
    }
  };

  // Test function to trigger popup manually
  const testPopup = () => {
    const testAlert = {
      id: 'test-id',
      tourist_name: 'Emily Chen',
      tourist_id: 'TID002',
      tourist_phone: '+91-9123456789',
      tourist_nationality: 'Singapore',
      alert_type: 'SOS',
      priority_level: 'Critical',
      location_address: '123 Test St',
      alert_message: 'Test emergency',
      created_at: new Date().toISOString(),
      status: 'New'
    };
    console.log('Testing popup with:', testAlert);
    setEmergencyPopup(testAlert);
    setPopupVisible(true);
  };

  // Remaining state management and action functions (unchanged)
  const setLoadingState = (alertId, action, isLoading) => {
    setActionLoading(prev => ({
      ...prev,
      [`${alertId}-${action}`]: isLoading
    }));
  };

  const isActionLoading = (alertId, action) => {
    return actionLoading[`${alertId}-${action}`] || false;
  };

  // Remaining action functions (assignUnit, changePriority, etc.) unchanged
  const updateAlertWithOfficerInfo = async (alertId, updateData, actionDescription) => {
    const officerInfo = {
      current_handling_officer_id: profile?.id,
      current_handling_officer_name: profile?.name,
      last_action_by_officer_id: profile?.id,
      last_action_by_officer_name: profile?.name,
      last_action_timestamp: new Date().toISOString()
    };

    const currentAlert = alerts.find(a => a.id === alertId);
    const responseActions = currentAlert?.response_actions || [];
    
    const updatedActions = [
      ...responseActions,
      {
        action: actionDescription,
        officer_id: profile?.id,
        officer_name: profile?.name,
        timestamp: new Date().toISOString(),
        ...updateData.actionData || {}
      }
    ];

    const finalUpdateData = {
      ...updateData,
      ...officerInfo,
      response_actions: updatedActions
    };

    delete finalUpdateData.actionData;
    return finalUpdateData;
  };

  const updateAlertStatus = async (alertId, newStatus, additionalData = {}) => {
    setLoadingState(alertId, 'acknowledge', true);
    try {
      const updateData = {
        status: newStatus,
        ...additionalData,
        actionData: { status_change: `Changed to ${newStatus}` }
      };

      if (newStatus === 'Acknowledged') {
        updateData.acknowledged_at = new Date().toISOString();
      } else if (newStatus === 'Resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const finalUpdateData = await updateAlertWithOfficerInfo(alertId, updateData, `Status Changed to ${newStatus}`);
      const { data, error } = await supabase
        .from('emergency_alerts')
        .update(finalUpdateData)
        .eq('id', alertId)
        .select();

      if (error) throw error;
      await loadAlerts();
      showNotification(t.statusUpdated, 'success');
    } catch (error) {
      console.error('Error updating alert:', error.message);
      showNotification('Error updating status: ' + error.message, 'error');
    } finally {
      setLoadingState(alertId, 'acknowledge', false);
    }
  };

  const changePriority = async () => {
    if (!selectedAlert || !selectedPriority) return;
    setLoadingState(selectedAlert.id, 'priority', true);
    try {
      const updateData = {
        priority_level: selectedPriority,
        actionData: { 
          priority_change: `Changed from ${selectedAlert.priority_level} to ${selectedPriority}`,
          previous_priority: selectedAlert.priority_level,
          new_priority: selectedPriority
        }
      };

      const finalUpdateData = await updateAlertWithOfficerInfo(
        selectedAlert.id, 
        updateData, 
        `Priority Changed to ${selectedPriority}`
      );

      const { error } = await supabase
        .from('emergency_alerts')
        .update(finalUpdateData)
        .eq('id', selectedAlert.id);

      if (error) throw error;
      await loadAlerts();
      setShowPriorityModal(false);
      setSelectedPriority('');
      showNotification(t.priorityChanged, 'success');
    } catch (error) {
      console.error('Error changing priority:', error.message);
      showNotification('Error changing priority', 'error');
    } finally {
      setLoadingState(selectedAlert.id, 'priority', false);
    }
  };

  const assignUnit = async () => {
    if (!selectedAlert || !selectedUnit) return;
    setLoadingState(selectedAlert.id, 'assign', true);
    try {
      const updateData = {
        status: 'Assigned',
        assigned_unit_name: selectedUnit,
        actionData: { 
          unit: selectedUnit,
          assignment_type: 'Unit Assignment'
        }
      };

      const finalUpdateData = await updateAlertWithOfficerInfo(
        selectedAlert.id, 
        updateData, 
        `Unit Assigned: ${selectedUnit}`
      );

      const { error } = await supabase
        .from('emergency_alerts')
        .update(finalUpdateData)
        .eq('id', selectedAlert.id);

      if (error) throw error;
      await loadAlerts();
      setShowAssignModal(false);
      setSelectedUnit('');
      showNotification(t.unitAssigned, 'success');
    } catch (error) {
      console.error('Error assigning unit:', error.message);
      showNotification('Error assigning unit', 'error');
    } finally {
      setLoadingState(selectedAlert.id, 'assign', false);
    }
  };

  const sendQuickMessage = async (message) => {
    if (!selectedAlert) return;
    setLoadingState(selectedAlert.id, 'message', true);
    try {
      console.log(`Sending message to ${selectedAlert.tourist_phone}: ${message}`);
      const updateData = {
        actionData: {
          message: message,
          phone: selectedAlert.tourist_phone,
          message_type: 'Quick Message'
        }
      };

      const finalUpdateData = await updateAlertWithOfficerInfo(
        selectedAlert.id, 
        updateData, 
        `Quick Message Sent`
      );

      const { error } = await supabase
        .from('emergency_alerts')
        .update({ response_actions: finalUpdateData.response_actions })
        .eq('id', selectedAlert.id);

      if (error) throw error;
      await loadAlerts();
      setShowMessageModal(false);
      showNotification(`${t.messageSent} (${selectedAlert.tourist_phone})`, 'success');
    } catch (error) {
      console.error('Error sending message:', error.message);
      showNotification('Error sending message', 'error');
    } finally {
      setLoadingState(selectedAlert.id, 'message', false);
    }
  };

  const contactEmergencyContacts = async () => {
    if (!selectedAlert) return;
    setLoadingState(selectedAlert.id, 'contact', true);
    try {
      console.log(`Contacting emergency contacts for ${selectedAlert.tourist_name}`);
      const contacts = selectedAlert?.emergency_contacts ? JSON.parse(selectedAlert.emergency_contacts) : [];
      const updateData = {
        actionData: {
          contacts: contacts,
          contactCount: contacts.length,
          contact_type: 'Emergency Contacts'
        }
      };

      const finalUpdateData = await updateAlertWithOfficerInfo(
        selectedAlert.id, 
        updateData, 
        `Emergency Contacts Notified (${contacts.length} contacts)`
      );

      const { error } = await supabase
        .from('emergency_alerts')
        .update({ response_actions: finalUpdateData.response_actions })
        .eq('id', selectedAlert.id);

      if (error) throw error;
      await loadAlerts();
      setShowContactModal(false);
      showNotification(`${t.familyContacted} (${contacts.length} contacts)`, 'success');
    } catch (error) {
      console.error('Error contacting family:', error.message);
      showNotification('Error contacting emergency contacts', 'error');
    } finally {
      setLoadingState(selectedAlert.id, 'contact', false);
    }
  };

  const callTourist = async (phone) => {
    setLoadingState(selectedAlert?.id || 'call', 'call', true);
    try {
      console.log(`Initiating call to tourist: ${phone}`);
      window.open(`tel:${phone}`);
      if (selectedAlert) {
        const updateData = {
          actionData: {
            phone: phone,
            call_type: 'Tourist Call'
          }
        };

        const finalUpdateData = await updateAlertWithOfficerInfo(
          selectedAlert.id, 
          updateData, 
          `Called Tourist: ${phone}`
        );

        const { error } = await supabase
          .from('emergency_alerts')
          .update({ response_actions: finalUpdateData.response_actions })
          .eq('id', selectedAlert.id);

        if (error) throw error;
        await loadAlerts();
      }
      showNotification(`Calling ${phone}`, 'success');
    } catch (error) {
      console.error('Error initiating call:', error.message);
      showNotification('Error initiating call', 'error');
    } finally {
      setLoadingState(selectedAlert?.id || 'call', 'call', false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-white/80">Loading emergency alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Test Button for Popup */}
      <div className="p-4">
        <button
          onClick={testPopup}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Test Popup
        </button>
      </div>

      {/* Emergency Alert Popup */}
      {popupVisible && emergencyPopup && (
        <div className="fixed inset-0 bg-red-600 z-[1000] flex items-center justify-center animate-pulse">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 p-8 border-4 border-red-600">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <Bell className="w-16 h-16 text-red-600 animate-bounce mr-4" />
                <div>
                  <h1 className="text-4xl font-bold text-red-600 mb-2">{t.emergencyAlert}</h1>
                  <p className="text-xl text-red-500">{t.newEmergencyReceived}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-4">
                <span className="text-4xl">{getAlertIcon(emergencyPopup.alert_type)}</span>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-red-800 mb-2">{emergencyPopup.tourist_name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-red-700">
                    <div>
                      <p><strong>ID:</strong> {emergencyPopup.tourist_id}</p>
                      <p><strong>Phone:</strong> {emergencyPopup.tourist_phone}</p>
                      <p><strong>Nationality:</strong> {emergencyPopup.tourist_nationality}</p>
                    </div>
                    <div>
                      <p><strong>Type:</strong> {emergencyPopup.alert_type}</p>
                      <p><strong>Priority:</strong> <span className="font-bold text-red-800">{emergencyPopup.priority_level}</span></p>
                      <p><strong>Time:</strong> {formatTime(emergencyPopup.created_at)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-red-800"><strong>Location:</strong></p>
                    <p className="text-red-700 text-sm">{emergencyPopup.location_address}</p>
                  </div>
                  <div className="mt-4 bg-red-100 p-3 rounded border border-red-200">
                    <p className="text-red-800"><strong>Message:</strong></p>
                    <p className="text-red-700">{emergencyPopup.alert_message}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-6 text-lg">{t.acknowledgeToClose}</p>
              <button
                onClick={acknowledgeEmergencyPopup}
                disabled={isActionLoading(emergencyPopup.id, 'popup-acknowledge')}
                className="bg-red-600 text-white px-12 py-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-bold text-xl flex items-center justify-center mx-auto transition-colors"
              >
                {isActionLoading(emergencyPopup.id, 'popup-acknowledge') ? (
                  <>
                    <Loader className="w-6 h-6 mr-3 animate-spin" />
                    {t.acknowledging}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 mr-3" />
                    {t.acknowledge.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 
          notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          {notification.type === 'success' && <Check className="w-5 h-5" />}
          {notification.type === 'error' && <X className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Remaining JSX (header, filters, alerts list, modals) unchanged */}
      <div className="p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
              <div className="flex items-center space-x-6 text-sm">
                <span className="text-white/80">{t.activeAlerts}: <span className="font-semibold text-blue-300">{filteredAlerts.length}</span></span>
                <span className="text-white/40">•</span>
                <span className="text-white/80">Critical: <span className="font-semibold text-red-300">{filteredAlerts.filter(a => a.priority_level === 'Critical').length}</span></span>
                <span className="text-white/80">New: <span className="font-semibold text-orange-300">{filteredAlerts.filter(a => a.status === 'New').length}</span></span>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
              <Globe className="w-4 h-4 text-white/80" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm font-medium text-white"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="ta">தமிழ்</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-white/60" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/60"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            >
              <option value="all">{t.allStatus}</option>
              <option value="new">{t.new}</option>
              <option value="acknowledged">{t.acknowledged}</option>
              <option value="assigned">{t.assigned}</option>
              <option value="in progress">{t.inProgress}</option>
              <option value="resolved">{t.resolved}</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            >
              <option value="all">{t.allTypes}</option>
              <option value="medical emergency">{t.medicalEmergency}</option>
              <option value="security threat">{t.securityThreat}</option>
              <option value="missing person">{t.missingPerson}</option>
              <option value="natural disaster">{t.naturalDisaster}</option>
              <option value="sos">{t.sos}</option>
              <option value="panic button">{t.panicButton}</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2.5 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            >
              <option value="all">{t.allPriority}</option>
              <option value="critical">{t.critical}</option>
              <option value="high">{t.high}</option>
              <option value="medium">{t.medium}</option>
              <option value="low">{t.low}</option>
            </select>
            <button
              onClick={loadAlerts}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className={`bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 border-l-4 ${
              alert.priority_level === 'Critical' ? 'border-l-red-500' : 
              alert.priority_level === 'High' ? 'border-l-orange-500' : 
              alert.priority_level === 'Medium' ? 'border-l-yellow-500' : 'border-l-green-500'
            } border-r border-t border-b border-gray-200`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{getAlertIcon(alert.alert_type)}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{alert.tourist_name}</h3>
                        <div className="flex items-center space-x-3 text-sm text-white/80">
                          <span className="font-medium">{alert.tourist_id}</span>
                          <span>•</span>
                          <span>{alert.tourist_nationality}</span>
                          <span>•</span>
                          <span className="font-mono">{alert.tourist_phone}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(alert.priority_level)}`}>
                          {alert.priority_level}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                    </div>
                    {alert.current_handling_officer_name && (
                      <div className="mb-4">
                        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 backdrop-blur-sm">
                          <div className="flex items-center space-x-2 text-sm">
                            <Shield className="w-4 h-4 text-blue-300" />
                            <span className="text-blue-300 font-medium">{t.handledBy}:</span>
                            <span className="text-white font-semibold">{alert.current_handling_officer_name}</span>
                          </div>
                          {alert.last_action_by_officer_name && alert.last_action_timestamp && (
                            <div className="flex items-center space-x-2 text-xs text-blue-300 mt-1">
                              <Activity className="w-3 h-3" />
                              <span>{t.lastActionBy}: {alert.last_action_by_officer_name}</span>
                              <span>•</span>
                              <span>{formatTime(alert.last_action_timestamp)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                        <p className="text-sm font-medium text-white/80 mb-1 flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-white/60" />
                          {t.location}
                        </p>
                        <p className="text-white text-sm">{alert.location_address}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                        <p className="text-sm font-medium text-white/80 mb-1 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-white/60" />
                          {t.time}
                        </p>
                        <p className="text-white text-sm">{formatTime(alert.created_at)}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-white/80 mb-2">Alert Message:</p>
                      <div className="bg-yellow-500/20 border border-yellow-400/30 p-3 rounded-lg backdrop-blur-sm">
                        <p className="text-white text-sm">{alert.alert_message}</p>
                      </div>
                    </div>
                    {alert.assigned_unit_name && (
                      <div className="mb-4">
                        <div className="bg-green-500/20 border border-green-400/30 p-3 rounded-lg backdrop-blur-sm">
                          <p className="text-sm text-green-300">
                            <UserCheck className="w-4 h-4 inline mr-2" />
                            {t.assignedTo}: <span className="font-semibold text-white">{alert.assigned_unit_name}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {alert.status === 'New' && (
                      <button
                        onClick={() => updateAlertStatus(alert.id, 'Acknowledged')}
                        disabled={isActionLoading(alert.id, 'acknowledge')}
                        className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 flex items-center justify-center text-sm font-medium transition-colors"
                      >
                        {isActionLoading(alert.id, 'acknowledge') ? (
                          <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            {t.acknowledging}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {t.acknowledge}
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setShowAssignModal(true);
                      }}
                      disabled={isActionLoading(alert.id, 'assign')}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center text-sm font-medium transition-colors"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      {t.assignUnit}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setSelectedPriority(alert.priority_level);
                        setShowPriorityModal(true);
                      }}
                      disabled={isActionLoading(alert.id, 'priority')}
                      className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center justify-center text-sm font-medium transition-colors"
                      title={t.changePriority}
                    >
                      {isActionLoading(alert.id, 'priority') ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowUp className="w-4 h-4 mr-1" />
                          Priority
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setShowMessageModal(true);
                      }}
                      disabled={isActionLoading(alert.id, 'message')}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center text-sm font-medium transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </button>
                    <button
                      onClick={() => callTourist(alert.tourist_phone)}
                      disabled={isActionLoading(alert.id, 'call')}
                      className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center text-sm font-medium transition-colors"
                    >
                      {isActionLoading(alert.id, 'call') ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Calling...
                        </>
                      ) : (
                        <>
                          <PhoneCall className="w-4 h-4 mr-2" />
                          Call
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setShowContactModal(true);
                      }}
                      disabled={isActionLoading(alert.id, 'contact')}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center text-sm font-medium transition-colors"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Contacts
                    </button>
                  </div>
                  {alert.response_actions && alert.response_actions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/20">
                      <p className="text-sm font-medium text-white/80 mb-2">Recent Actions:</p>
                      <div className="space-y-1">
                        {alert.response_actions.slice(-3).map((action, index) => (
                          <div key={index} className="flex items-center justify-between text-sm bg-white/10 backdrop-blur-sm p-2 rounded border border-white/20">
                            <div className="flex items-center">
                              <Check className="w-3 h-3 mr-2 text-green-300" />
                              <span className="text-white">{action.action}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-white/60">
                              {action.officer_name && (
                                <span className="flex items-center">
                                  <Badge className="w-3 h-3 mr-1" />
                                  {action.officer_name}
                                </span>
                              )}
                              <span>{formatTime(action.timestamp)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-8">
              <AlertTriangle className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Emergency Alerts</h3>
              <p className="text-white/80">No emergency alerts match your current filters.</p>
            </div>
          </div>
        )}
        {showPriorityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 w-full max-w-md shadow-2xl border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">{t.changePriority}</h3>
              <div className="mb-6">
                <div className="bg-blue-500/20 border border-blue-400/30 p-3 rounded-lg mb-4 backdrop-blur-sm">
                  <p className="text-sm text-blue-300 mb-1">Tourist:</p>
                  <p className="font-semibold text-white">{selectedAlert?.tourist_name}</p>
                  <p className="text-sm text-blue-300">Current Priority: <span className="font-semibold text-white">{selectedAlert?.priority_level}</span></p>
                </div>
                <label className="block text-sm font-medium text-white/80 mb-3">{t.selectPriority}:</label>
                <div className="space-y-2">
                  {priorityLevels.map((priority) => (
                    <label key={priority.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={selectedPriority === priority.value}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 p-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white">{priority.label}</span>
                          {selectedPriority === priority.value && <Check className="w-4 h-4 text-green-300" />}
                        </div>
                        <p className="text-sm text-white/80">{priority.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={changePriority}
                  disabled={!selectedPriority || selectedPriority === selectedAlert?.priority_level || isActionLoading(selectedAlert?.id, 'priority')}
                  className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 font-medium transition-colors flex items-center justify-center"
                >
                  {isActionLoading(selectedAlert?.id, 'priority') ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Priority'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowPriorityModal(false);
                    setSelectedPriority('');
                  }}
                  className="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg hover:bg-white/30 font-medium transition-colors border border-white/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 w-full max-w-md shadow-2xl border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">{t.assignUnit}</h3>
              <div className="mb-6">
                <div className="bg-blue-500/20 border border-blue-400/30 p-3 rounded-lg mb-4 backdrop-blur-sm">
                  <p className="text-sm text-blue-300 mb-1">Tourist:</p>
                  <p className="font-semibold text-white">{selectedAlert?.tourist_name}</p>
                  <p className="text-sm text-blue-300">{selectedAlert?.tourist_id}</p>
                </div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t.selectUnit}:</label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="">Choose available unit...</option>
                  {availableUnits.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={assignUnit}
                  disabled={!selectedUnit || isActionLoading(selectedAlert?.id, 'assign')}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors flex items-center justify-center"
                >
                  {isActionLoading(selectedAlert?.id, 'assign') ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Unit'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedUnit('');
                  }}
                  className="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg hover:bg-white/30 font-medium transition-colors border border-white/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 w-full max-w-lg shadow-2xl border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">{t.sendMessage}</h3>
              <div className="mb-6">
                <div className="bg-green-500/20 border border-green-400/30 p-3 rounded-lg mb-4 backdrop-blur-sm">
                  <p className="text-sm text-green-300 mb-1">Sending to:</p>
                  <p className="font-semibold text-white">{selectedAlert?.tourist_name}</p>
                  <p className="text-sm text-green-300 font-mono">{selectedAlert?.tourist_phone}</p>
                </div>
                <p className="text-sm font-medium text-white/80 mb-3">Quick Messages:</p>
                <div className="space-y-2">
                  {Object.entries(t.quickMessages || {}).map(([key, message]) => (
                    <button
                      key={key}
                      onClick={() => sendQuickMessage(message)}
                      disabled={isActionLoading(selectedAlert?.id, 'message')}
                      className="w-full text-left p-3 bg-white/10 border border-white/30 rounded-lg hover:bg-white/20 disabled:bg-white/5 text-sm transition-colors text-white"
                    >
                      {message}
                    </button>
                  ))}
                </div>
                {isActionLoading(selectedAlert?.id, 'message') && (
                  <div className="mt-4 flex items-center justify-center py-3">
                    <Loader className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                    <span className="text-blue-600 font-medium">{t.sending}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                disabled={isActionLoading(selectedAlert?.id, 'message')}
                className="w-full bg-white/20 text-white py-2 px-4 rounded-lg hover:bg-white/30 font-medium transition-colors border border-white/30"
              >
                Close
              </button>
            </div>
          </div>
        )}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 w-full max-w-md shadow-2xl border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">{t.emergencyContacts}</h3>
              <div className="mb-6">
                <div className="bg-red-500/20 border border-red-400/30 p-3 rounded-lg mb-4 backdrop-blur-sm">
                  <p className="text-sm text-red-300 mb-1">Tourist:</p>
                  <p className="font-semibold text-white">{selectedAlert?.tourist_name}</p>
                  <p className="text-sm text-red-300">{selectedAlert?.tourist_id}</p>
                </div>
                {selectedAlert?.emergency_contacts ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-white/80">Emergency Contacts:</p>
                    {JSON.parse(selectedAlert.emergency_contacts).map((contact, index) => (
                      <div key={index} className="border border-white/30 rounded-lg p-3 bg-white/10 backdrop-blur-sm">
                        <p className="font-semibold text-white">{contact.name}</p>
                        <p className="text-sm text-white/80 mb-1">{contact.relation}</p>
                        <p className="text-sm text-blue-300 font-mono">{contact.phone}</p>
                      </div>
                    ))}
                    {isActionLoading(selectedAlert?.id, 'contact') && (
                      <div className="flex items-center justify-center py-3">
                        <Loader className="w-5 h-5 animate-spin text-red-600 mr-2" />
                        <span className="text-red-600 font-medium">{t.contacting}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-white/60">
                    <Users className="w-12 h-12 mx-auto mb-2 text-white/40" />
                    <p>No emergency contacts available</p>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                {selectedAlert?.emergency_contacts && (
                  <button
                    onClick={contactEmergencyContacts}
                    disabled={isActionLoading(selectedAlert?.id, 'contact')}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium transition-colors flex items-center justify-center"
                  >
                    {isActionLoading(selectedAlert?.id, 'contact') ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Contacting...
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 mr-2" />
                        Contact All
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowContactModal(false)}
                  disabled={isActionLoading(selectedAlert?.id, 'contact')}
                  className="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg hover:bg-white/30 font-medium transition-colors border border-white/30"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyDispatch;
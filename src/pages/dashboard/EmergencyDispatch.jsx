import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { 
  Phone, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  User, 
  CheckCircle, 
  UserCheck, 
  MessageSquare,
  Users,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  PhoneCall,
  Filter,
  Search,
  Globe,
  Check,
  X,
  Loader,
  Shield,
  ChevronDown,
  Badge,
  Activity
} from 'lucide-react';

// Multilingual translations
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
  
  // Loading states for actions
  const [actionLoading, setActionLoading] = useState({});
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const t = translations[language] || translations.en;

  // Available units for assignment
  const availableUnits = [
    'Unit-01 (Patrol Car)',
    'Unit-02 (Motorcycle)',
    'Unit-03 (Emergency Response)',
    'Unit-04 (Beach Patrol)',
    'Unit-05 (Tourist Police)',
    'Medical Unit-01',
    'Rescue Unit-01'
  ];

  // Priority levels with descriptions
  const priorityLevels = [
    { value: 'Critical', label: 'Critical', description: 'Life-threatening emergency requiring immediate response', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    { value: 'High', label: 'High', description: 'Serious situation requiring urgent attention', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { value: 'Medium', label: 'Medium', description: 'Standard emergency response required', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    { value: 'Low', label: 'Low', description: 'Non-urgent situation, routine response', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
  ];

  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Status colors
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

  // Alert type icons
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
    // Set up real-time subscription
    const subscription = supabase
      .channel('emergency_alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_alerts' }, () => {
        loadAlerts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Apply filters whenever alerts or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [alerts, statusFilter, typeFilter, priorityFilter, searchTerm]);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...alerts];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status.toLowerCase() === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.alert_type.toLowerCase() === typeFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.priority_level.toLowerCase() === priorityFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.tourist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.tourist_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  };

  const setLoadingState = (alertId, action, isLoading) => {
    setActionLoading(prev => ({
      ...prev,
      [`${alertId}-${action}`]: isLoading
    }));
  };

  const isActionLoading = (alertId, action) => {
    return actionLoading[`${alertId}-${action}`] || false;
  };

  const updateAlertWithOfficerInfo = async (alertId, updateData, actionDescription) => {
    const officerInfo = {
      current_handling_officer_id: profile?.id,
      current_handling_officer_name: profile?.name,
      last_action_by_officer_id: profile?.id,
      last_action_by_officer_name: profile?.name,
      last_action_timestamp: new Date().toISOString()
    };

    // Add officer info to response actions
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

    delete finalUpdateData.actionData; // Remove the temporary actionData
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

      const { error } = await supabase
        .from('emergency_alerts')
        .update(finalUpdateData)
        .eq('id', alertId);

      if (error) throw error;

      console.log('Alert updated successfully:', data);
      
      await loadAlerts();
      showNotification(t.statusUpdated, 'success');
    } catch (error) {
      console.error('Error updating alert:', error);
      showNotification('Error updating status', 'error');
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
      console.error('Error changing priority:', error);
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
      console.error('Error assigning unit:', error);
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
      console.error('Error sending message:', error);
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
      console.error('Error contacting family:', error);
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

        const { data: updatedData, error } = await supabase
          .from('emergency_alerts')
          .update({ response_actions: finalUpdateData.response_actions })
          .eq('id', selectedAlert.id)
          .select();

        if (error) throw error;
        await loadAlerts();
      }
      
      showNotification(`Calling ${phone}`, 'success');
    } catch (error) {
      showNotification('Error initiating call', 'error');
    } finally {
      setLoadingState(selectedAlert?.id || 'call', 'call', false);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading emergency alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
              <div className="flex items-center space-x-6 text-sm">
                <span className="text-gray-600">{t.activeAlerts}: <span className="font-semibold text-blue-600">{filteredAlerts.length}</span></span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600">Critical: <span className="font-semibold text-red-600">{filteredAlerts.filter(a => a.priority_level === 'Critical').length}</span></span>
                <span className="text-gray-600">New: <span className="font-semibold text-orange-600">{filteredAlerts.filter(a => a.status === 'New').length}</span></span>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
              <Globe className="w-4 h-4 text-gray-600" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm font-medium"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="ta">தமிழ்</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className={`bg-white rounded-lg shadow-sm border-l-4 ${
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {alert.tourist_name}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
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

                    {/* Officer Information */}
                    {alert.current_handling_officer_name && (
                      <div className="mb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-700 font-medium">{t.handledBy}:</span>
                            <span className="text-blue-900 font-semibold">{alert.current_handling_officer_name}</span>
                          </div>
                          {alert.last_action_by_officer_name && alert.last_action_timestamp && (
                            <div className="flex items-center space-x-2 text-xs text-blue-600 mt-1">
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
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {t.location}
                        </p>
                        <p className="text-gray-900 text-sm">{alert.location_address}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {t.time}
                        </p>
                        <p className="text-gray-900 text-sm">{formatTime(alert.created_at)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Alert Message:</p>
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <p className="text-gray-900 text-sm">{alert.alert_message}</p>
                      </div>
                    </div>

                    {alert.assigned_unit_name && (
                      <div className="mb-4">
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <p className="text-sm text-green-700">
                            <UserCheck className="w-4 h-4 inline mr-2" />
                            {t.assignedTo}: <span className="font-semibold">{alert.assigned_unit_name}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-4">
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

                  {/* Response Actions Log */}
                  {alert.response_actions && alert.response_actions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-2">Recent Actions:</p>
                      <div className="space-y-1">
                        {alert.response_actions.slice(-3).map((action, index) => (
                          <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                            <div className="flex items-center">
                              <Check className="w-3 h-3 mr-2 text-green-500" />
                              <span className="text-gray-700">{action.action}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Emergency Alerts</h3>
              <p className="text-gray-600">No emergency alerts match your current filters.</p>
            </div>
          </div>
        )}

        {/* Priority Change Modal */}
        {showPriorityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t.changePriority}</h3>
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-700 mb-1">Tourist:</p>
                  <p className="font-semibold text-blue-900">{selectedAlert?.tourist_name}</p>
                  <p className="text-sm text-blue-600">Current Priority: <span className="font-semibold">{selectedAlert?.priority_level}</span></p>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t.selectPriority}:</label>
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
                      <div className={`flex-1 p-3 rounded-lg border ${priority.borderColor} ${priority.bgColor}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold ${priority.color}`}>{priority.label}</span>
                          {selectedPriority === priority.value && <Check className="w-4 h-4 text-green-600" />}
                        </div>
                        <p className={`text-sm ${priority.color} opacity-80`}>{priority.description}</p>
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
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Unit Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t.assignUnit}</h3>
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-700 mb-1">Tourist:</p>
                  <p className="font-semibold text-blue-900">{selectedAlert?.tourist_name}</p>
                  <p className="text-sm text-blue-600">{selectedAlert?.tourist_id}</p>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.selectUnit}:</label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t.sendMessage}</h3>
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
                  <p className="text-sm text-green-700 mb-1">Sending to:</p>
                  <p className="font-semibold text-green-900">{selectedAlert?.tourist_name}</p>
                  <p className="text-sm text-green-600 font-mono">{selectedAlert?.tourist_phone}</p>
                </div>
                
                <p className="text-sm font-medium text-gray-700 mb-3">Quick Messages:</p>
                <div className="space-y-2">
                  {Object.entries(t.quickMessages || {}).map(([key, message]) => (
                    <button
                      key={key}
                      onClick={() => sendQuickMessage(message)}
                      disabled={isActionLoading(selectedAlert?.id, 'message')}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 text-sm transition-colors"
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
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Contact Family Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t.emergencyContacts}</h3>
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
                  <p className="text-sm text-red-700 mb-1">Tourist:</p>
                  <p className="font-semibold text-red-900">{selectedAlert?.tourist_name}</p>
                  <p className="text-sm text-red-600">{selectedAlert?.tourist_id}</p>
                </div>
                
                {selectedAlert?.emergency_contacts ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Emergency Contacts:</p>
                    {JSON.parse(selectedAlert.emergency_contacts).map((contact, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <p className="font-semibold text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-600 mb-1">{contact.relation}</p>
                        <p className="text-sm text-blue-600 font-mono">{contact.phone}</p>
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
                  <div className="text-center py-6 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
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
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium transition-colors"
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
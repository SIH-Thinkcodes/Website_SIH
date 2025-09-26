import React, { useState, useEffect } from 'react';
import { 
  Phone, MapPin, Clock, AlertTriangle, User, CheckCircle, 
  UserCheck, MessageSquare, Users, ArrowUp, RefreshCw, 
  PhoneCall, Filter, Search, Globe, Check, X, Loader, 
  Shield, Badge, Activity, Bell, Eye, Map, AlertCircle,
  Calendar, Star, Navigation
} from 'lucide-react';

// Mock supabase for demo
const mockSupabase = {
  from: () => ({
    select: () => ({
      order: () => Promise.resolve({ 
        data: [
          {
            id: '1',
            tourist_id: 'TID002',
            tourist_name: 'Chirag Khairnar',
            tourist_phone: '9130841341',
            tourist_nationality: 'Indian',
            alert_type: 'SOS',
            priority_level: 'Critical',
            location_lat: 12.82205700,
            location_lng: 80.04368510,
            location_address: 'Current Location',
            alert_message: 'Emergency assistance needed',
            status: 'Acknowledged',
            created_at: '2025-09-16T16:01:18Z',
            acknowledged_at: '2025-09-16T16:01:32Z',
            current_handling_officer_name: 'Police Singham',
            emergency_contacts: JSON.stringify([
              { name: 'Rajesh Khairnar', relation: 'Father', phone: '+91-9876543210' },
              { name: 'Priya Khairnar', relation: 'Mother', phone: '+91-9876543211' }
            ]),
            response_actions: [
              { action: 'Status Changed to Acknowledged', officer_name: 'Police Singham', timestamp: '2025-09-16T16:01:32Z' }
            ]
          }
        ], 
        error: null 
      })
    }),
    update: () => ({
      eq: () => Promise.resolve({ error: null })
    })
  }),
  channel: () => ({
    on: () => ({ subscribe: () => {} })
  }),
  removeChannel: () => {}
};

// Translations
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

const EmergencyDispatch = ({ profile = { id: '1', name: 'Demo Officer' } }) => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
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

  // Available units for assignment
  const availableUnits = [
    'Unit-01 (Patrol Car)', 'Unit-02 (Motorcycle)', 'Unit-03 (Emergency Response)',
    'Unit-04 (Beach Patrol)', 'Unit-05 (Tourist Police)', 'Medical Unit-01', 'Rescue Unit-01'
  ];

  // Priority levels with descriptions
  const priorityLevels = [
    { value: 'Critical', label: 'Critical', description: 'Life-threatening emergency requiring immediate response', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    { value: 'High', label: 'High', description: 'Serious situation requiring urgent attention', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { value: 'Medium', label: 'Medium', description: 'Standard emergency response required', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    { value: 'Low', label: 'Low', description: 'Non-urgent situation, routine response', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
  ];

  // Reverse geocoding function
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        // Clean up the address to make it more readable
        const parts = data.display_name.split(',');
        if (parts.length > 3) {
          return parts.slice(0, 3).join(', ') + '...';
        }
        return data.display_name;
      }
      
      return `${lat}, ${lng}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat}, ${lng}`;
    }
  };

  // Process location data
  const processLocationData = async (alert) => {
    if (alert.location_lat && alert.location_lng && 
        (alert.location_address === "Current Location" || !alert.location_address)) {
      const address = await reverseGeocode(alert.location_lat, alert.location_lng);
      return { ...alert, location_address: address };
    }
    return alert;
  };

  // Utility functions
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-red-600 text-white animate-pulse';
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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'short',
      timeStyle: 'medium'
    });
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alerts, statusFilter, typeFilter, priorityFilter, searchTerm]);

  const loadAlerts = async () => {
    try {
      const { data, error } = await mockSupabase
        .from('emergency_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process location data for each alert
      const processedAlerts = await Promise.all(
        (data || []).map(alert => processLocationData(alert))
      );
      
      setAlerts(processedAlerts);
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

  // Action loading helpers
  const setLoadingState = (alertId, action, isLoading) => {
    setActionLoading(prev => ({
      ...prev,
      [`${alertId}-${action}`]: isLoading
    }));
  };

  const isActionLoading = (alertId, action) => {
    return actionLoading[`${alertId}-${action}`] || false;
  };

  // Mock action functions
  const updateAlertStatus = async (alertId, newStatus) => {
    setLoadingState(alertId, 'acknowledge', true);
    setTimeout(() => {
      setLoadingState(alertId, 'acknowledge', false);
      showNotification(t.statusUpdated, 'success');
    }, 1000);
  };

  const callTourist = (phone) => {
    window.open(`tel:${phone}`);
    showNotification(`Calling ${phone}`, 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-lg text-white/80">Loading emergency alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-3 backdrop-blur-md border ${
          notification.type === 'success' ? 'bg-green-500/90 text-white border-green-400/50' : 
          notification.type === 'error' ? 'bg-red-500/90 text-white border-red-400/50' : 
          'bg-blue-500/90 text-white border-blue-400/50'
        }`}>
          {notification.type === 'success' && <Check className="w-5 h-5" />}
          {notification.type === 'error' && <X className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3 flex items-center">
                <Shield className="w-10 h-10 mr-4 text-blue-400" />
                {t.title}
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-400/20">
                  <div className="text-blue-300 text-xs uppercase tracking-wide font-semibold">Total Alerts</div>
                  <div className="text-2xl font-bold text-white">{filteredAlerts.length}</div>
                </div>
                <div className="bg-red-500/20 rounded-lg p-3 border border-red-400/20">
                  <div className="text-red-300 text-xs uppercase tracking-wide font-semibold">Critical</div>
                  <div className="text-2xl font-bold text-white">{filteredAlerts.filter(a => a.priority_level === 'Critical').length}</div>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-3 border border-yellow-400/20">
                  <div className="text-yellow-300 text-xs uppercase tracking-wide font-semibold">New</div>
                  <div className="text-2xl font-bold text-white">{filteredAlerts.filter(a => a.status === 'New').length}</div>
                </div>
                <div className="bg-green-500/20 rounded-lg p-3 border border-green-400/20">
                  <div className="text-green-300 text-xs uppercase tracking-wide font-semibold">Resolved</div>
                  <div className="text-2xl font-bold text-white">{filteredAlerts.filter(a => a.status === 'Resolved').length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-white/60" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm"
            >
              <option value="all" className="bg-gray-800">{t.allStatus}</option>
              <option value="new" className="bg-gray-800">{t.new}</option>
              <option value="acknowledged" className="bg-gray-800">{t.acknowledged}</option>
              <option value="assigned" className="bg-gray-800">{t.assigned}</option>
              <option value="in progress" className="bg-gray-800">{t.inProgress}</option>
              <option value="resolved" className="bg-gray-800">{t.resolved}</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm"
            >
              <option value="all" className="bg-gray-800">{t.allTypes}</option>
              <option value="medical emergency" className="bg-gray-800">{t.medicalEmergency}</option>
              <option value="security threat" className="bg-gray-800">{t.securityThreat}</option>
              <option value="missing person" className="bg-gray-800">{t.missingPerson}</option>
              <option value="natural disaster" className="bg-gray-800">{t.naturalDisaster}</option>
              <option value="sos" className="bg-gray-800">{t.sos}</option>
              <option value="panic button" className="bg-gray-800">{t.panicButton}</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm"
            >
              <option value="all" className="bg-gray-800">{t.allPriority}</option>
              <option value="critical" className="bg-gray-800">{t.critical}</option>
              <option value="high" className="bg-gray-800">{t.high}</option>
              <option value="medium" className="bg-gray-800">{t.medium}</option>
              <option value="low" className="bg-gray-800">{t.low}</option>
            </select>
            <button
              onClick={loadAlerts}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center transition-all duration-200 font-semibold shadow-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Alerts Grid */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              {/* Alert Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-4xl">{getAlertIcon(alert.alert_type)}</div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">{alert.tourist_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-white/70">
                          <span className="bg-white/10 px-3 py-1 rounded-full font-mono">{alert.tourist_id}</span>
                          <span className="flex items-center"><Globe className="w-4 h-4 mr-1" />{alert.tourist_nationality}</span>
                          <span className="flex items-center"><Phone className="w-4 h-4 mr-1" />{alert.tourist_phone}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${getPriorityColor(alert.priority_level)}`}>
                          {alert.priority_level}
                        </span>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                    </div>

                    {/* Officer Information */}
                    {alert.current_handling_officer_name && (
                      <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5 text-blue-300" />
                          <div>
                            <div className="text-blue-200 text-sm">{t.handledBy}</div>
                            <div className="text-white font-semibold">{alert.current_handling_officer_name}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Location and Time Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                        <div className="flex items-center text-white/80 mb-2">
                          <Navigation className="w-5 h-5 mr-2 text-blue-400" />
                          <span className="font-medium">{t.location}</span>
                        </div>
                        <p className="text-white text-sm leading-relaxed">{alert.location_address}</p>
                        {alert.location_lat && alert.location_lng && (
                          <div className="mt-2 text-xs text-white/60 font-mono">
                            {alert.location_lat}, {alert.location_lng}
                          </div>
                        )}
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                        <div className="flex items-center text-white/80 mb-2">
                          <Calendar className="w-5 h-5 mr-2 text-green-400" />
                          <span className="font-medium">{t.time}</span>
                        </div>
                        <p className="text-white text-sm">{formatTime(alert.created_at)}</p>
                      </div>
                    </div>

                    {/* Alert Message */}
                    <div className="bg-yellow-500/10 border border-yellow-400/20 p-4 rounded-xl mb-4">
                      <div className="flex items-center text-yellow-300 mb-2">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Alert Message</span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">{alert.alert_message}</p>
                    </div>

                    {/* Assigned Unit */}
                    {alert.assigned_unit_name && (
                      <div className="bg-green-500/10 border border-green-400/20 p-4 rounded-xl mb-4">
                        <div className="flex items-center text-green-300">
                          <UserCheck className="w-5 h-5 mr-2" />
                          <span className="text-sm">{t.assignedTo}: </span>
                          <span className="font-semibold text-white ml-1">{alert.assigned_unit_name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-white/5">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {alert.status === 'New' && (
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'Acknowledged')}
                      disabled={isActionLoading(alert.id, 'acknowledge')}
                      className="bg-yellow-600 text-white px-4 py-2.5 rounded-lg hover:bg-yellow-700 disabled:bg-gray-500 flex items-center justify-center text-sm font-medium transition-all duration-200 shadow-lg"
                    >
                      {isActionLoading(alert.id, 'acknowledge') ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
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
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm font-medium transition-all duration-200 shadow-lg"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Assign
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAlert(alert);
                      setShowMessageModal(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 flex items-center justify-center text-sm font-medium transition-all duration-200 shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </button>
                  <button
                    onClick={() => callTourist(alert.tourist_phone)}
                    className="bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 flex items-center justify-center text-sm font-medium transition-all duration-200 shadow-lg"
                  >
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Call
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAlert(alert);
                      setShowContactModal(true);
                    }}
                    className="bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 flex items-center justify-center text-sm font-medium transition-all duration-200 shadow-lg"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Contacts
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAlert(alert);
                      setShowDetailsModal(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 flex items-center justify-center text-sm font-medium transition-all duration-200 shadow-lg"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Details
                  </button>
                </div>

                {/* Recent Actions */}
                {alert.response_actions && alert.response_actions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm font-medium text-white/80 mb-3 flex items-center">
                      <Activity className="w-4 h-4 mr-2 text-blue-400" />
                      Recent Actions
                    </p>
                    <div className="space-y-2">
                      {alert.response_actions.slice(-2).map((action, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                          <div className="flex items-center">
                            <Check className="w-4 h-4 mr-2 text-green-400" />
                            <span className="text-white">{action.action}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-white/60">
                            {action.officer_name && (
                              <span className="flex items-center bg-white/10 px-2 py-1 rounded-full">
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
          ))}
        </div>

        {/* No Alerts Message */}
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-12">
              <AlertTriangle className="w-20 h-20 text-white/40 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-3">No Emergency Alerts</h3>
              <p className="text-white/70 text-lg">No emergency alerts match your current filters.</p>
            </div>
          </div>
        )}

        {/* Emergency Contacts Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-red-400" />
                {t.emergencyContacts}
              </h3>
              
              <div className="mb-6">
                <div className="bg-red-500/20 border border-red-400/30 p-4 rounded-xl mb-6">
                  <p className="text-red-300 text-sm mb-1">Tourist Information:</p>
                  <p className="font-semibold text-white text-lg">{selectedAlert?.tourist_name}</p>
                  <p className="text-red-300 text-sm">{selectedAlert?.tourist_id}</p>
                </div>

                {(() => {
                  let contacts = [];
                  
                  try {
                    if (selectedAlert?.emergency_contacts) {
                      if (Array.isArray(selectedAlert.emergency_contacts)) {
                        contacts = selectedAlert.emergency_contacts;
                      } else if (typeof selectedAlert.emergency_contacts === 'string') {
                        contacts = JSON.parse(selectedAlert.emergency_contacts);
                        if (!Array.isArray(contacts)) {
                          contacts = [];
                        }
                      }
                    }
                  } catch (error) {
                    console.error('Contact processing error:', error);
                    contacts = [];
                  }

                  return contacts && contacts.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-white/80 mb-4">
                        Emergency Contacts ({contacts.length}):
                      </p>
                      {contacts.map((contact, index) => (
                        <div key={index} className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-white text-lg mb-1">
                                {contact.name || 'Unknown Name'}
                              </p>
                              <p className="text-white/70 text-sm mb-2">
                                {contact.relation || contact.relationship || 'Unknown Relation'}
                              </p>
                              <p className="text-blue-300 font-mono text-sm">
                                {contact.phone || contact.phone_number || 'No Phone'}
                              </p>
                            </div>
                            <button
                              onClick={() => callTourist(contact.phone || contact.phone_number)}
                              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      <Users className="w-16 h-16 mx-auto mb-4 text-white/40" />
                      <p className="text-lg">No emergency contacts available</p>
                      <p className="text-sm mt-2 text-white/40">
                        Contact information not provided by tourist
                      </p>
                    </div>
                  );
                })()}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 bg-white/20 text-white py-3 px-4 rounded-xl hover:bg-white/30 font-medium transition-colors border border-white/30"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Unit Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <UserCheck className="w-6 h-6 mr-3 text-blue-400" />
                {t.assignUnit}
              </h3>
              
              <div className="mb-6">
                <div className="bg-blue-500/20 border border-blue-400/30 p-4 rounded-xl mb-6">
                  <p className="text-blue-300 text-sm mb-1">Tourist:</p>
                  <p className="font-semibold text-white text-lg">{selectedAlert?.tourist_name}</p>
                  <p className="text-blue-300 text-sm">{selectedAlert?.tourist_id}</p>
                </div>
                
                <label className="block text-sm font-medium text-white/80 mb-3">{t.selectUnit}:</label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm"
                >
                  <option value="" className="bg-gray-800">Choose available unit...</option>
                  {availableUnits.map((unit) => (
                    <option key={unit} value={unit} className="bg-gray-800">{unit}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedUnit('');
                    showNotification('Unit assigned successfully', 'success');
                  }}
                  disabled={!selectedUnit}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-500 font-medium transition-colors"
                >
                  Assign Unit
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedUnit('');
                  }}
                  className="flex-1 bg-white/20 text-white py-3 px-4 rounded-xl hover:bg-white/30 font-medium transition-colors border border-white/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <MessageSquare className="w-6 h-6 mr-3 text-green-400" />
                {t.sendMessage}
              </h3>
              
              <div className="mb-6">
                <div className="bg-green-500/20 border border-green-400/30 p-4 rounded-xl mb-6">
                  <p className="text-green-300 text-sm mb-1">Sending to:</p>
                  <p className="font-semibold text-white text-lg">{selectedAlert?.tourist_name}</p>
                  <p className="text-green-300 font-mono text-sm">{selectedAlert?.tourist_phone}</p>
                </div>
                
                <p className="text-sm font-medium text-white/80 mb-4">Quick Messages:</p>
                <div className="space-y-3">
                  {Object.entries(t.quickMessages || {}).map(([key, message]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setShowMessageModal(false);
                        showNotification(`Message sent to ${selectedAlert?.tourist_phone}`, 'success');
                      }}
                      className="w-full text-left p-4 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 text-sm transition-colors text-white leading-relaxed"
                    >
                      {message}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => setShowMessageModal(false)}
                className="w-full bg-white/20 text-white py-3 px-4 rounded-xl hover:bg-white/30 font-medium transition-colors border border-white/30"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Eye className="w-6 h-6 mr-3 text-indigo-400" />
                Alert Details
              </h3>
              
              {selectedAlert && (
                <div className="space-y-6">
                  {/* Tourist Information */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-400" />
                      Tourist Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-white/70">Name:</p>
                        <p className="text-white font-semibold">{selectedAlert.tourist_name}</p>
                      </div>
                      <div>
                        <p className="text-white/70">ID:</p>
                        <p className="text-white font-semibold">{selectedAlert.tourist_id}</p>
                      </div>
                      <div>
                        <p className="text-white/70">Phone:</p>
                        <p className="text-white font-semibold">{selectedAlert.tourist_phone}</p>
                      </div>
                      <div>
                        <p className="text-white/70">Nationality:</p>
                        <p className="text-white font-semibold">{selectedAlert.tourist_nationality}</p>
                      </div>
                    </div>
                  </div>

                  {/* Alert Information */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                      Alert Information
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/70">Type:</p>
                          <p className="text-white font-semibold">{selectedAlert.alert_type}</p>
                        </div>
                        <div>
                          <p className="text-white/70">Priority:</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getPriorityColor(selectedAlert.priority_level)}`}>
                            {selectedAlert.priority_level}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white/70 mb-2">Message:</p>
                        <div className="bg-yellow-500/10 border border-yellow-400/20 p-3 rounded-lg">
                          <p className="text-white">{selectedAlert.alert_message}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-white/70 mb-2">Location:</p>
                        <div className="bg-blue-500/10 border border-blue-400/20 p-3 rounded-lg">
                          <p className="text-white mb-2">{selectedAlert.location_address}</p>
                          {selectedAlert.location_lat && selectedAlert.location_lng && (
                            <p className="text-blue-300 text-xs font-mono">
                              Coordinates: {selectedAlert.location_lat}, {selectedAlert.location_lng}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-green-400" />
                      Timeline
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Created:</span>
                        <span className="text-white">{formatTime(selectedAlert.created_at)}</span>
                      </div>
                      {selectedAlert.acknowledged_at && (
                        <div className="flex justify-between">
                          <span className="text-white/70">Acknowledged:</span>
                          <span className="text-white">{formatTime(selectedAlert.acknowledged_at)}</span>
                        </div>
                      )}
                      {selectedAlert.resolved_at && (
                        <div className="flex justify-between">
                          <span className="text-white/70">Resolved:</span>
                          <span className="text-white">{formatTime(selectedAlert.resolved_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full bg-white/20 text-white py-3 px-4 rounded-xl hover:bg-white/30 font-medium transition-colors border border-white/30"
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
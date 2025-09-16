import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Shield, Users, CheckCircle, Clock, LogOut, UserCheck, UserX, Eye, X, FileText, Phone, MapPin, Badge as BadgeIcon, Building, AlertCircle, Plane, Calendar, User } from 'lucide-react'
import { authAPI, travellerAPI } from '../../utils/supabase'

 

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel, confirmText, cancelText }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-xl max-w-md w-full p-6 border border-white/20">
        <p className="text-white mb-6">{message}</p>
        <div className="flex space-x-4">
          <button
            onClick={onConfirm}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            aria-label={confirmText}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30"
            aria-label={cancelText}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Officer Card Component
const OfficerCard = ({ officer, currentView, actionLoading, onReview, onApprove, onReject }) => {
  const getUnitDisplayName = (unit) => {
    const unitNames = {
      patrol: 'Patrol Unit',
      motorcycle: 'Motorcycle Unit',
      emergency: 'Emergency Response Unit',
      beach: 'Beach Patrol Unit',
      tourist: 'Tourist Police Unit',
    };
    return unitNames[unit] || unit || 'N/A';
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      <div className="flex justify-between items-start">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
          <div>
            <p className="font-semibold text-white">{officer.name}</p>
            <p className="text-sm text-white/80">{officer.email}</p>
            <p className="text-xs text-white/60 mt-1">
              Applied: {new Date(officer.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-white/80">Badge & Unit</p>
            <p className="font-medium text-white">{officer.badge_number}</p>
            <p className="text-sm text-white/80">{getUnitDisplayName(officer.unit)}</p>
          </div>
          <div>
            <p className="text-sm text-white/80">Station</p>
            <p className="font-medium text-white">{officer.station}</p>
          </div>
          <div>
            <p className="text-sm text-white/80">Mobile</p>
            <p className="font-medium text-white">{officer.mobile_number || 'N/A'}</p>
          </div>
        </div>
        <div className="flex flex-col space-y-2 ml-4">
          <button
            onClick={() => onReview(officer)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center space-x-1 transition-colors"
            aria-label={`Review officer ${officer.name}`}
          >
            <Eye className="w-3 h-3" />
            <span>Review</span>
          </button>
          {currentView === 'pending-officers' && (
            <>
              <button
                onClick={() => onApprove(officer.id)}
                disabled={actionLoading === officer.id}
                className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50 transition-colors"
                aria-label={`Approve officer ${officer.name}`}
              >
                <CheckCircle className="w-3 h-3" />
                <span>{actionLoading === officer.id ? 'Loading...' : 'Approve'}</span>
              </button>
              <button
                onClick={() => onReject(officer.id)}
                disabled={actionLoading === officer.id}
                className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50 transition-colors"
                aria-label={`Reject officer ${officer.name}`}
              >
                <UserX className="w-3 h-3" />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Traveller Card Component
const TravellerCard = ({ traveller, currentView, actionLoading, onReview, onVerify, onReject }) => {
  const getDocumentTypeDisplayName = (docType) => {
    const docTypes = {
      passport: 'Passport',
      visa: 'Visa',
      driving_license: 'Driving License',
      national_id: 'National ID',
      aadhar: 'Aadhar Card',
    };
    return docTypes[docType] || docType || 'N/A';
  };

  const fullName = `${traveller.first_name || ''} ${traveller.middle_name || ''} ${traveller.last_name || ''}`.trim();

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      <div className="flex justify-between items-start">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
          <div>
            <p className="font-semibold text-white">{fullName}</p>
            <p className="text-sm text-white/80">{traveller.email}</p>
            <p className="text-xs text-white/60 mt-1">
              Applied: {new Date(traveller.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-white/80">Nationality</p>
            <p className="font-medium text-white">{traveller.nationality || 'N/A'}</p>
            <p className="text-sm text-white/80">Phone: {traveller.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-white/80">Document</p>
            <p className="font-medium text-white">{getDocumentTypeDisplayName(traveller.document_type)}</p>
            <p className="text-sm text-white/80">{traveller.document_number || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-white/80">Destination</p>
            <p className="font-medium text-white">{traveller.destination || 'N/A'}</p>
            {traveller.travel_start_date && (
              <p className="text-sm text-white/80">From: {traveller.travel_start_date}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-2 ml-4">
          <button
            onClick={() => onReview(traveller)}
            className="bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 text-sm font-medium flex items-center space-x-1 transition-colors"
            aria-label={`Review traveller ${fullName}`}
          >
            <Eye className="w-3 h-3" />
            <span>Review</span>
          </button>
          {currentView === 'pending-travellers' && (
            <>
              <button
                onClick={() => onVerify(traveller.id)}
                disabled={actionLoading === traveller.id}
                className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50 transition-colors"
                aria-label={`Verify traveller ${fullName}`}
              >
                <CheckCircle className="w-3 h-3" />
                <span>{actionLoading === traveller.id ? 'Verifying...' : 'Verify & Generate ID'}</span>
              </button>
              <button
                onClick={() => onReject(traveller.id)}
                disabled={actionLoading === traveller.id}
                className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50 transition-colors"
                aria-label={`Reject traveller ${fullName}`}
              >
                <UserX className="w-3 h-3" />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ profile, onLogout }) => {
  const [currentView, setCurrentView] = useState('pending-officers');
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [selectedTraveller, setSelectedTraveller] = useState(null);
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [showTravellerModal, setShowTravellerModal] = useState(false);
  
  // Dashboard statistics state
  // Stats removed from UI; keep minimal placeholders disabled
  // Removed stats state (not used)
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [pendingTravellers, setPendingTravellers] = useState([]);
  const [verifiedTravellers, setVerifiedTravellers] = useState([]);
  const [pendingOfficers, setPendingOfficers] = useState([]);
  const [activeOfficers, setActiveOfficers] = useState([]);
  const [loadingTravellers, setLoadingTravellers] = useState(false);
  const [loadingOfficers, setLoadingOfficers] = useState(false);
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  });
  const [imageError, setImageError] = useState({ officer: false, traveller: false });

  // Derived totals (kept for potential future use)
  // const totalOfficers = (pendingOfficers?.length || 0) + (activeOfficers?.length || 0)
  // const totalTravellers = (pendingTravellers?.length || 0) + (verifiedTravellers?.length || 0)

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  // Stats section removed; keep no-op to preserve structure
  const fetchDashboardStats = async () => {}

  // Function to refresh dashboard data (no-op)
  // Removed refresh handler (not used)

  // Fetch dashboard stats on component mount
  useEffect(() => {
    fetchDashboardStats()
  }, [])

  // Set up real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardStats()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    setLoadingTravellers(true);
    setLoadingOfficers(true);
    try {
      const [pending, verified, pendingOfficersData, activeOfficersData] = await Promise.all([
        travellerAPI.getPendingTravellers(),
        travellerAPI.getVerifiedTravellers(),
        authAPI.getPendingOfficers(),
        authAPI.getActiveOfficers(),
      ]);
      setPendingTravellers(pending);
      setVerifiedTravellers(verified);
      setPendingOfficers(pendingOfficersData);
      setActiveOfficers(activeOfficersData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoadingTravellers(false);
      setLoadingOfficers(false);
    }
  };

  const showConfirmation = (message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel') => {
    setConfirmation({ isOpen: true, message, onConfirm, confirmText, cancelText });
  };

  const handleApproveOfficer = (officerId) => {
    showConfirmation(
      'Are you sure you want to approve this officer?',
      async () => {
        setActionLoading(officerId);
        setError('');
        try {
          await authAPI.verifyOfficer(officerId);
          await loadData();
          setConfirmation({ isOpen: false });
          if (showOfficerModal) {
            setShowOfficerModal(false);
            setSelectedOfficer(null);
          }
        } catch (err) {
          setError('Failed to approve officer: ' + err.message);
        } finally {
          setActionLoading(null);
        }
      },
      'Approve',
      'Cancel'
    );
  };

  const handleRejectOfficer = (officerId) => {
    showConfirmation(
      'Are you sure you want to reject this officer? This action cannot be undone.',
      async () => {
        setActionLoading(officerId);
        setError('');
        try {
          await authAPI.rejectOfficer(officerId);
          await loadData();
          setConfirmation({ isOpen: false });
          if (showOfficerModal) {
            setShowOfficerModal(false);
            setSelectedOfficer(null);
          }
        } catch (err) {
          setError('Failed to reject officer: ' + err.message);
        } finally {
          setActionLoading(null);
        }
      },
      'Reject',
      'Cancel'
    );
  };

  const handleVerifyTraveller = (travellerId) => {
    showConfirmation(
      'Are you sure you want to verify this traveller? This will generate a blockchain Digital ID.',
      async () => {
        setActionLoading(travellerId);
        setError('');
        try {
          await travellerAPI.verifyTraveller(travellerId);
          await loadData();
          setConfirmation({ isOpen: false });
          if (showTravellerModal) {
            setShowTravellerModal(false);
            setSelectedTraveller(null);
          }
    } catch (err) {
          setError('Failed to verify traveller: ' + err.message);
    } finally {
          setActionLoading(null);
        }
      },
      'Verify',
      'Cancel'
    );
  };

  const handleRejectTraveller = (travellerId) => {
    showConfirmation(
      'Are you sure you want to reject this traveller? This action cannot be undone.',
      async () => {
        setActionLoading(travellerId);
        setError('');
        try {
          await travellerAPI.rejectTraveller(travellerId);
          await loadData();
          setConfirmation({ isOpen: false });
          if (showTravellerModal) {
            setShowTravellerModal(false);
            setSelectedTraveller(null);
          }
        } catch (err) {
          setError('Failed to reject traveller: ' + err.message);
        } finally {
          setActionLoading(null);
        }
      },
      'Reject',
      'Cancel'
    );
  };

  const openOfficerModal = (officer) => {
    setSelectedOfficer(officer);
    setShowOfficerModal(true);
    setImageError((prev) => ({ ...prev, officer: false }));
  };

  const openTravellerModal = (traveller) => {
    setSelectedTraveller(traveller);
    setShowTravellerModal(true);
    setImageError((prev) => ({ ...prev, traveller: false }));
  };

  const closeOfficerModal = () => {
    setSelectedOfficer(null);
    setShowOfficerModal(false);
  };

  const closeTravellerModal = () => {
    setSelectedTraveller(null);
    setShowTravellerModal(false);
  };

  const getUnitDisplayName = (unit) => {
    const unitNames = {
      patrol: 'Patrol Unit',
      motorcycle: 'Motorcycle Unit',
      emergency: 'Emergency Response Unit',
      beach: 'Beach Patrol Unit',
      tourist: 'Tourist Police Unit',
    };
    return unitNames[unit] || unit || 'N/A';
  };

  const getIdTypeDisplayName = (idType) => {
    const idTypes = {
      aadhar: 'Aadhar Card',
      passport: 'Passport',
      driving_license: 'Driving License',
      employee_id: 'Employee ID',
      voter_id: 'Voter ID',
    };
    return idTypes[idType] || idType || 'N/A';
  };

  const getDocumentTypeDisplayName = (docType) => {
    const docTypes = {
      passport: 'Passport',
      visa: 'Visa',
      driving_license: 'Driving License',
      national_id: 'National ID',
      aadhar: 'Aadhar Card',
    };
    return docTypes[docType] || docType || 'N/A';
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-red-500 w-12 h-12 mx-auto mb-4" />
          <p className="text-white font-semibold">Profile data is missing</p>
          <p className="text-white/80">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Welcome to Police Admin Portal</h1>
              <p className="text-sm text-white/80">Administrator Dashboard</p>
            </div>
          </div>
        </div>

        {/* Left Sidebar Navigation (moved from top tabs) */}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Dashboard Stats Section removed as requested */}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <aside className="md:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/20 p-3 md:p-4 sticky top-24">
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentView('pending-officers')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'pending-officers'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-white/80 hover:text-white hover:bg-white/20'
                  }`}
                  aria-current={currentView === 'pending-officers' ? 'page' : undefined}
                >
                  <span className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>Pending Officers</span></span>
                  <span className="text-xs font-semibold text-orange-700">{pendingOfficers?.length || 0}</span>
                </button>
                <button
                  onClick={() => setCurrentView('active-officers')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'active-officers'
                      ? 'bg-green-100 text-green-700'
                      : 'text-white/80 hover:text-white hover:bg-white/20'
                  }`}
                  aria-current={currentView === 'active-officers' ? 'page' : undefined}
                >
                  <span className="flex items-center space-x-2"><UserCheck className="w-4 h-4" /><span>Active Officers</span></span>
                  <span className="text-xs font-semibold text-green-700">{activeOfficers?.length || 0}</span>
                </button>
                <button
                  onClick={() => setCurrentView('pending-travellers')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'pending-travellers'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-white/80 hover:text-white hover:bg-white/20'
                  }`}
                  aria-current={currentView === 'pending-travellers' ? 'page' : undefined}
                >
                  <span className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>Pending Travellers</span></span>
                  <span className="text-xs font-semibold text-purple-700">{pendingTravellers?.length || 0}</span>
                </button>
                <button
                  onClick={() => setCurrentView('verified-travellers')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'verified-travellers'
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-white/80 hover:text-white hover:bg-white/20'
                  }`}
                  aria-current={currentView === 'verified-travellers' ? 'page' : undefined}
                >
                  <span className="flex items-center space-x-2"><Plane className="w-4 h-4" /><span>Verified Travellers</span></span>
                  <span className="text-xs font-semibold text-teal-700">{verifiedTravellers?.length || 0}</span>
                </button>
              </div>
            </div>
            
            {/* Admin Details Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/20 p-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white text-sm">{profile.name}</p>
                  <p className="text-xs text-white/80 capitalize">{profile.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                  aria-label="Log out"
                >
                  Logout
                </button>
              </div>
            </div>
          </aside>
          <section className="md:col-span-9">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-sm p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Pending Officers</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingOfficers?.length || 0}</p>
                  </div>
                  <Clock className="text-orange-500 w-8 h-8" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-sm p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Active Officers</p>
                    <p className="text-2xl font-bold text-green-600">{activeOfficers?.length || 0}</p>
                  </div>
                  <CheckCircle className="text-green-500 w-8 h-8" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-sm p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Verified Travellers</p>
                    <p className="text-2xl font-bold text-teal-600">{verifiedTravellers?.length || 0}</p>
                  </div>
                  <Plane className="text-teal-500 w-8 h-8" />
                </div>
              </div>
            </div>

        {/* Dynamic Content Based on Current View */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/20">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-lg font-bold text-white">
              {currentView === 'pending-officers' && 'Pending Officer Approvals'}
              {currentView === 'active-officers' && 'Active Police Officers'}
              {currentView === 'pending-travellers' && 'Pending Traveller Verifications'}
              {currentView === 'verified-travellers' && 'Verified Travellers'}
            </h2>
            <p className="text-white/80 mt-1">
              {currentView === 'pending-officers' && 'Review and approve new police officer registrations'}
              {currentView === 'active-officers' && 'Manage and monitor active police officers in the system'}
              {currentView === 'pending-travellers' && 'Review and verify traveller profiles to generate Digital IDs'}
              {currentView === 'verified-travellers' && 'Manage and monitor verified travellers with Digital IDs'}
            </p>
          </div>
          
          <div className="p-6">
            {currentView === 'pending-officers' && (
              loadingOfficers ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white/80">Loading officers...</p>
                </div>
              ) : pendingOfficers && pendingOfficers.length > 0 ? (
                <div className="space-y-4">
                  {pendingOfficers.map((officer) => (
                    <OfficerCard
                      key={officer.id || `pending-officer-${Math.random()}`}
                      officer={officer}
                      currentView={currentView}
                      actionLoading={actionLoading}
                      onReview={openOfficerModal}
                      onApprove={handleApproveOfficer}
                      onReject={handleRejectOfficer}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="text-white/60 w-12 h-12 mx-auto mb-4" />
                  <p className="text-white/80">No pending officer approvals</p>
                </div>
              )
            )}

            {currentView === 'active-officers' && (
              loadingOfficers ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white/80">Loading officers...</p>
                </div>
              ) : activeOfficers && activeOfficers.length > 0 ? (
                <div className="space-y-4">
                  {activeOfficers.map((officer) => (
                    <OfficerCard
                      key={officer.id || `active-officer-${Math.random()}`}
                      officer={{ ...officer, is_verified: true }}
                      currentView={currentView}
                      actionLoading={actionLoading}
                      onReview={openOfficerModal}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="text-white/60 w-12 h-12 mx-auto mb-4" />
                  <p className="text-white/80">No active officers found</p>
                </div>
              )
            )}

            {currentView === 'pending-travellers' && (
              loadingTravellers ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white/80">Loading travellers...</p>
                </div>
              ) : pendingTravellers && pendingTravellers.length > 0 ? (
                <div className="space-y-4">
                  {pendingTravellers.map((traveller) => (
                    <TravellerCard
                      key={traveller.id || `pending-traveller-${Math.random()}`}
                      traveller={traveller}
                      currentView={currentView}
                      actionLoading={actionLoading}
                      onReview={openTravellerModal}
                      onVerify={handleVerifyTraveller}
                      onReject={handleRejectTraveller}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="text-white/60 w-12 h-12 mx-auto mb-4" />
                  <p className="text-white/80">No pending traveller verifications</p>
                </div>
              )
            )}

            {currentView === 'verified-travellers' && (
              loadingTravellers ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white/80">Loading travellers...</p>
                </div>
              ) : verifiedTravellers && verifiedTravellers.length > 0 ? (
                <div className="space-y-4">
                  {verifiedTravellers.map((traveller) => (
                    <TravellerCard
                      key={traveller.id || `verified-traveller-${Math.random()}`}
                      traveller={{ ...traveller, is_verified: true }}
                      currentView={currentView}
                      actionLoading={actionLoading}
                      onReview={openTravellerModal}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Plane className="text-white/60 w-12 h-12 mx-auto mb-4" />
                  <p className="text-white/80">No verified travellers found</p>
                </div>
              )
            )}
          </div>
        </div>
          </section>
        </div>
      </main>

      {/* Officer Details Modal */}
      {showOfficerModal && selectedOfficer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-6 border-b border-white/20 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Officer Details</h3>
              <button
                onClick={closeOfficerModal}
                className="text-white/60 hover:text-white/80"
                aria-label="Close officer details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div>
                    <label className="text-sm text-white/80">Full Name</label>
                    <p className="font-medium text-white">{selectedOfficer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Email</label>
                    <p className="font-medium text-white">{selectedOfficer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Mobile Number</label>
                    <p className="font-medium text-white flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {selectedOfficer.mobile_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Registration Date</label>
                    <p className="font-medium text-white">
                      {new Date(selectedOfficer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <BadgeIcon className="w-4 h-4 mr-2" />
                  Professional Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div>
                    <label className="text-sm text-white/80">Badge Number</label>
                    <p className="font-medium text-white">{selectedOfficer.badge_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Station</label>
                    <p className="font-medium text-white flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      {selectedOfficer.station || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Unit</label>
                    <p className="font-medium text-white">{getUnitDisplayName(selectedOfficer.unit)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Status</label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${selectedOfficer.is_verified ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      <span className={`text-sm font-medium ${selectedOfficer.is_verified ? 'text-green-700' : 'text-orange-700'}`}>
                        {selectedOfficer.is_verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  ID Verification
                </h4>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm text-white/80">ID Type</label>
                      <p className="font-medium text-white">{getIdTypeDisplayName(selectedOfficer.official_id_type)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/80">ID Number</label>
                      <p className="font-medium text-white">{selectedOfficer.official_id_number || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/80 mb-2 block">Uploaded Document</label>
                    {selectedOfficer.official_id_image_url && !imageError.officer ? (
                      <div className="border border-white/30 rounded-lg p-2 bg-white/10 backdrop-blur-sm">
                        <img
                          src={selectedOfficer.official_id_image_url}
                          alt="Official ID Document"
                          className="max-w-full h-auto rounded-md shadow-sm max-h-96 mx-auto"
                          onError={() => setImageError((prev) => ({ ...prev, officer: true }))}
                        />
                      </div>
                    ) : (
                      <div className="border border-slate-300 rounded-lg p-8 text-center text-white/60">
                        <FileText className="w-8 h-8 mx-auto mb-2" />
                        <p>{imageError.officer ? 'Unable to load image' : 'No document uploaded'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!selectedOfficer.is_verified && currentView === 'pending-officers' && (
                <div className="flex space-x-4 pt-4 border-t border-white/20">
                  <button
                    onClick={() => handleApproveOfficer(selectedOfficer.id)}
                    disabled={actionLoading === selectedOfficer.id}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
                    aria-label="Approve officer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{actionLoading === selectedOfficer.id ? 'Approving...' : 'Approve Officer'}</span>
                  </button>
                  <button
                    onClick={() => handleRejectOfficer(selectedOfficer.id)}
                    disabled={actionLoading === selectedOfficer.id}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
                    aria-label="Reject officer"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Reject Application</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Traveller Details Modal */}
      {showTravellerModal && selectedTraveller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-6 border-b border-white/20 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Traveller Details</h3>
              <button
                onClick={closeTravellerModal}
                className="text-white/60 hover:text-white/80"
                aria-label="Close traveller details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div>
                    <label className="text-sm text-white/80">Full Name</label>
                    <p className="font-medium text-white">
                      {`${selectedTraveller.first_name || ''} ${selectedTraveller.middle_name || ''} ${selectedTraveller.last_name || ''}`.trim()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Email</label>
                    <p className="font-medium text-white">{selectedTraveller.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Phone Number</label>
                    <p className="font-medium text-white flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {selectedTraveller.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Nationality</label>
                    <p className="font-medium text-white">{selectedTraveller.nationality || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Registration Date</label>
                    <p className="font-medium text-white">
                      {new Date(selectedTraveller.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Status</label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${selectedTraveller.is_verified ? 'bg-teal-500' : 'bg-purple-500'}`}></div>
                      <span className={`text-sm font-medium ${selectedTraveller.is_verified ? 'text-teal-700' : 'text-purple-700'}`}>
                        {selectedTraveller.is_verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <Plane className="w-4 h-4 mr-2" />
                  Travel Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div>
                    <label className="text-sm text-white/80">Destination</label>
                    <p className="font-medium text-white flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {selectedTraveller.destination || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Travel Start Date</label>
                    <p className="font-medium text-white flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {selectedTraveller.travel_start_date || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Travel End Date</label>
                    <p className="font-medium text-white flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {selectedTraveller.travel_end_date || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Emergency Contact</label>
                    <p className="font-medium text-white">{selectedTraveller.emergency_contact_name || 'N/A'}</p>
                    <p className="text-sm text-white/80">{selectedTraveller.emergency_contact_number || ''}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Document Information
                </h4>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm text-white/80">Document Type</label>
                      <p className="font-medium text-white">{getDocumentTypeDisplayName(selectedTraveller.document_type)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/80">Document Number</label>
                      <p className="font-medium text-white">{selectedTraveller.document_number || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/80 mb-2 block">Uploaded Document</label>
                    {selectedTraveller.document_url && !imageError.traveller ? (
                      <div className="border border-white/30 rounded-lg p-2 bg-white/10 backdrop-blur-sm">
                        <img
                          src={selectedTraveller.document_url}
                          alt="Travel Document"
                          className="max-w-full h-auto rounded-md shadow-sm max-h-96 mx-auto"
                          onError={() => setImageError((prev) => ({ ...prev, traveller: true }))}
                        />
                      </div>
                    ) : (
                      <div className="border border-slate-300 rounded-lg p-8 text-center text-white/60">
                        <FileText className="w-8 h-8 mx-auto mb-2" />
                        <p>{imageError.traveller ? 'Unable to load image' : 'No document uploaded'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedTraveller.is_verified && selectedTraveller.digital_id && (
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Blockchain Information
                  </h4>
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-teal-600">Digital ID</label>
                        <p className="font-mono font-bold text-teal-800">#{selectedTraveller.digital_id}</p>
                      </div>
                      <div>
                        <label className="text-sm text-teal-600">Wallet Address</label>
                        <p className="font-mono text-xs text-teal-800 break-all">{selectedTraveller.blockchain_wallet_address || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-teal-600">Transaction Hash</label>
                        <a
                          href={`${import.meta.env.VITE_BLOCKCHAIN_EXPLORER_URL}${selectedTraveller.blockchain_transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-teal-600 hover:text-teal-800 underline break-all"
                        >
                          {selectedTraveller.blockchain_transaction_hash || 'N/A'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!selectedTraveller.is_verified && currentView === 'pending-travellers' && (
                <div className="flex space-x-4 pt-4 border-t border-white/20">
                  <button
                    onClick={() => handleVerifyTraveller(selectedTraveller.id)}
                    disabled={actionLoading === selectedTraveller.id}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
                    aria-label="Verify traveller"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{actionLoading === selectedTraveller.id ? 'Verifying...' : 'Verify & Generate ID'}</span>
                  </button>
                  <button
                    onClick={() => handleRejectTraveller(selectedTraveller.id)}
                    disabled={actionLoading === selectedTraveller.id}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
                    aria-label="Reject traveller"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Reject Application</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        message={confirmation.message}
        onConfirm={confirmation.onConfirm}
        onCancel={() => setConfirmation({ isOpen: false })}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
      />
    </div>
  );
};

AdminDashboard.propTypes = {
  profile: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};

OfficerCard.propTypes = {
  officer: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    badge_number: PropTypes.string,
    station: PropTypes.string,
    unit: PropTypes.string,
    mobile_number: PropTypes.string,
    created_at: PropTypes.string,
    is_verified: PropTypes.bool,
    official_id_type: PropTypes.string,
    official_id_number: PropTypes.string,
    official_id_image_url: PropTypes.string,
  }).isRequired,
  currentView: PropTypes.string.isRequired,
  actionLoading: PropTypes.string,
  onReview: PropTypes.func.isRequired,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
};

TravellerCard.propTypes = {
  traveller: PropTypes.shape({
    id: PropTypes.string,
    first_name: PropTypes.string,
    middle_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    nationality: PropTypes.string,
    phone: PropTypes.string,
    document_type: PropTypes.string,
    document_number: PropTypes.string,
    destination: PropTypes.string,
    travel_start_date: PropTypes.string,
    created_at: PropTypes.string,
    is_verified: PropTypes.bool,
    document_url: PropTypes.string,
    digital_id: PropTypes.string,
    blockchain_wallet_address: PropTypes.string,
    blockchain_transaction_hash: PropTypes.string,
  }).isRequired,
  currentView: PropTypes.string.isRequired,
  actionLoading: PropTypes.string,
  onReview: PropTypes.func.isRequired,
  onVerify: PropTypes.func,
  onReject: PropTypes.func,
};

export default AdminDashboard;

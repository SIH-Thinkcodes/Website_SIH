import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { travellerAPI } from '../../utils/supabase';
import { Search, User, Plane, MapPin, Phone, Mail, BadgeCheck, XCircle, Shield, Eye, AlertTriangle, Clock, FileText, RefreshCw, Calendar, Hash } from 'lucide-react';

// Tourist Profile Modal Component
const TouristProfileModal = ({ traveller, isOpen, onClose, onVerify, onUnverify, onReject }) => {
  if (!traveller || !isOpen) return null;

  const fullName = `${traveller.first_name || ''} ${traveller.middle_name || ''} ${traveller.last_name || ''}`.trim();
  const isVerified = traveller.is_verified || false;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4`}>
      <div className="bg-white/10 backdrop-blur-xl rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20">
        {/* Modal Header */}
        <div className="bg-white/10 border-b border-white/20 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-400/30">
                  <User className="w-6 h-6 text-blue-300" />
                </div>
                Traveller Profile
              </h2>
              <p className="text-white/80 mt-1">Complete details for {fullName || 'Unknown Traveller'}</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="bg-white/10 backdrop-blur-sm p-4 border-b border-white/20">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-blue-300" />
                Personal Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Full Name</p>
                  <p className="font-semibold text-white text-lg">{fullName || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Email Address</p>
                  <p className="font-medium text-white break-words">{traveller.email || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Phone Number</p>
                  <p className="font-medium text-white">{traveller.phone || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Nationality</p>
                  <p className="font-semibold text-white">{traveller.nationality || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Account Created</p>
                  <p className="text-sm text-white/70 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {traveller.created_at ? new Date(traveller.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Not available'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Last Updated</p>
                  <p className="text-sm text-white/70 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {traveller.updated_at ? new Date(traveller.updated_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Information */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="bg-white/10 backdrop-blur-sm p-4 border-b border-white/20">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                <Plane className="w-5 h-5 text-green-600" />
                Travel Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Destination</p>
                  <p className="font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="truncate">{traveller.destination || 'Not specified'}</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Travel Start Date</p>
                  <p className="font-medium text-white">
                    {traveller.travel_start_date ? new Date(traveller.travel_start_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Not set'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Travel End Date</p>
                  <p className="font-medium text-white">
                    {traveller.travel_end_date ? new Date(traveller.travel_end_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Not set'}
                  </p>
                </div>
                <div className="xl:col-span-3 border-t border-white/20 pt-4 mt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-3">Emergency Contact</p>
                  <div className="bg-white/10 rounded-lg p-4 space-y-2 border border-white/20">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="font-semibold text-white">{traveller.emergency_contact_name || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-white/70">{traveller.emergency_contact_number || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="bg-white/10 backdrop-blur-sm p-4 border-b border-white/20">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-purple-600" />
                Document Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Document Type</p>
                  <p className="font-semibold text-white">{traveller.document_type || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Document Number</p>
                  <p className="font-mono font-medium text-white">{traveller.document_number || 'Not provided'}</p>
                </div>
              </div>
              {traveller.document_url && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Document Image</p>
                  <div className="bg-white/10 rounded-lg p-4 border-2 border-dashed border-white/20">
                    <img
                      src={traveller.document_url}
                      alt="Document"
                      className="w-full max-w-md mx-auto h-48 object-contain rounded-md shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden flex-col items-center justify-center py-8 text-white/60">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm">Unable to load document image</p>
                    </div>
                    <div className="mt-4 text-center">
                      <a
                        href={traveller.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Document
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Information */}
          {traveller.digital_id && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
              <div className="bg-white/10 backdrop-blur-sm p-4 border-b border-white/20">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                  <Shield className="w-5 h-5 text-amber-600" />
                  Blockchain Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Digital ID</p>
                    <p className="font-mono font-bold text-amber-600 text-xl flex items-center gap-2">
                      <Hash className="w-5 h-5" />
                      {traveller.digital_id}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Wallet Address</p>
                    <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                      <p className="font-mono text-xs text-white break-all">
                        {traveller.blockchain_wallet_address || 'Not available'}
                      </p>
                      {traveller.blockchain_wallet_address && (
                        <button
                          onClick={() => copyToClipboard(traveller.blockchain_wallet_address)}
                          className="mt-2 text-xs text-amber-300 hover:text-amber-200 font-medium"
                        >
                          Copy Address
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Transaction Hash</p>
                    <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                      <p className="font-mono text-xs text-white break-all mb-2">
                        {traveller.blockchain_transaction_hash || 'Not available'}
                      </p>
                      {traveller.blockchain_transaction_hash && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => copyToClipboard(traveller.blockchain_transaction_hash)}
                            className="text-xs text-amber-300 hover:text-amber-200 font-medium"
                          >
                            Copy Hash
                          </button>
                          <a
                            href={`https://www.oklink.com/amoy/tx/${traveller.blockchain_transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-300 hover:text-blue-200 font-medium inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View on Explorer
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status and Actions */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="bg-white/10 backdrop-blur-sm p-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">Status & Actions</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${isVerified ? 'bg-green-500' : 'bg-orange-500'} flex-shrink-0`} />
                  <div>
                    <p className="font-semibold text-white text-lg">
                      {isVerified ? 'Verified Traveller' : 'Pending Verification'}
                    </p>
                    <p className="text-sm text-white/80">
                      {isVerified ? 'This traveller has been verified and has full access to services' : 'This traveller is awaiting verification approval'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                  {isVerified ? (
                    <button
                      className="flex items-center gap-2 px-4 py-2 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/20 transition-colors font-medium"
                      onClick={() => onUnverify(traveller.id)}
                    >
                      <XCircle className="w-4 h-4" />
                      Unverify
                    </button>
                  ) : (
                    <>
                      <button
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        onClick={() => onVerify(traveller.id)}
                      >
                        <BadgeCheck className="w-4 h-4" />
                        Verify Traveller
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/20 transition-colors font-medium"
                        onClick={() => onReject(traveller.id)}
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main TouristSearch Component
const TouristSearch = ({ profile, onLogout, onNavigate }) => {
  const { verifyTraveller, rejectTraveller } = useAuth();
  const [travellers, setTravellers] = useState([]);
  const [filteredTravellers, setFilteredTravellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    nationality: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTraveller, setSelectedTraveller] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const travellersPerPage = 9;

  // Fetch travellers
  const fetchTourists = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await travellerAPI.getVerifiedTravellers();
      console.log('Fetched travellers:', data);
      if (!Array.isArray(data)) {
        console.error('Invalid data from server:', data);
        throw new Error('Received invalid data from server');
      }
      setTravellers(data);
      setFilteredTravellers(data);
    } catch (err) {
      console.error('Error fetching travellers:', err);
      setError(err.message || 'Failed to fetch travellers');
      setTravellers([]);
      setFilteredTravellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourists();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let result = [...travellers];
    
    if (searchTerm) {
      result = result.filter(traveller =>
        traveller.digital_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${traveller.first_name || ''} ${traveller.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        traveller.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.nationality) {
      result = result.filter(traveller => 
        traveller.nationality?.toLowerCase().includes(filters.nationality.toLowerCase())
      );
    }

    if (filters.status) {
      const isVerified = filters.status === 'verified';
      result = result.filter(traveller => traveller.is_verified === isVerified);
    }

    if (filters.startDate) {
      result = result.filter(traveller => 
        traveller.travel_start_date && new Date(traveller.travel_start_date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      result = result.filter(traveller => 
        traveller.travel_end_date && new Date(traveller.travel_end_date) <= new Date(filters.endDate)
      );
    }

    setFilteredTravellers(result);
    setCurrentPage(1);
  }, [searchTerm, filters, travellers]);

  // Pagination logic
  const indexOfLastTraveller = currentPage * travellersPerPage;
  const indexOfFirstTraveller = indexOfLastTraveller - travellersPerPage;
  const currentTravellers = filteredTravellers.slice(indexOfFirstTraveller, indexOfLastTraveller);
  const totalPages = Math.ceil(filteredTravellers.length / travellersPerPage);

  const handleVerify = async (travellerId) => {
    try {
      await verifyTraveller(travellerId);
      setNotification({ type: 'success', message: 'Traveller verified successfully!' });
      fetchTourists();
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to verify traveller: ' + error.message });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUnverify = async (travellerId) => {
    try {
      await supabase
        .from('traveller_profiles')
        .update({ is_verified: false })
        .eq('id', travellerId);
      setNotification({ type: 'success', message: 'Traveller unverified successfully!' });
      fetchTourists();
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to unverify traveller: ' + error.message });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReject = async (travellerId) => {
    try {
      await rejectTraveller(travellerId);
      setNotification({ type: 'success', message: 'Traveller rejected and removed!' });
      fetchTourists();
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to reject traveller: ' + error.message });
    }
    setTimeout(() => setNotification(null), 3000);
    closeModal();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      nationality: '',
      startDate: '',
      endDate: '',
      status: ''
    });
    setSearchTerm('');
  };

  const openModal = (traveller) => {
    setSelectedTraveller(traveller);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTraveller(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
              <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-400/30">
                <Search className="w-8 h-8 text-blue-300" />
              </div>
              Traveller Management
            </h1>
            <p className="text-white/80 mt-2">Search, filter, and manage traveller profiles</p>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <BadgeCheck className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              {notification.message}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-white/70 mb-2">Search Travellers</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or digital ID..."
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-white placeholder-white/60"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-white"
              >
                <option value="">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Nationality</label>
              <input
                type="text"
                name="nationality"
                value={filters.nationality}
                onChange={handleFilterChange}
                placeholder="e.g., American"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Travel Dates</label>
              <div className="space-y-2">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-white text-sm"
                />
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-white text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Filter Summary and Clear */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span className="font-medium">Results:</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                {filteredTravellers.length} travellers
              </span>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-white/80 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-semibold">Error Loading Data</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredTravellers.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Search className="w-10 h-10 text-white/60" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Travellers Found</h3>
            <p className="text-white/80 mb-6">Try adjusting your search terms or filters to find travellers.</p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Traveller Cards */}
        {!loading && !error && filteredTravellers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {currentTravellers.map(traveller => {
                const fullName = `${traveller.first_name || ''} ${traveller.last_name || ''}`.trim();
                const isVerified = traveller.is_verified;
                
                return (
                  <div key={traveller.id} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 overflow-hidden group">
                    {/* Card Header */}
                    <div className={`p-6 ${isVerified ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-r from-orange-500/20 to-amber-500/20'} backdrop-blur-sm`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1 truncate">
                            {fullName || 'Unknown Traveller'}
                          </h3>
                          <p className="text-sm text-white/80 truncate">{traveller.nationality || 'Nationality not specified'}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isVerified 
                            ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                            : 'bg-orange-500/20 text-orange-300 border border-orange-400/30'
                        }`}>
                          {isVerified ? 'VERIFIED' : 'PENDING'}
                        </div>
                      </div>
                      
                      {/* Digital ID Badge */}
                      {traveller.digital_id && (
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-blue-300 flex-shrink-0" />
                            <span className="text-sm font-medium text-white/70">Digital ID:</span>
                            <span className="font-mono font-bold text-blue-300">{traveller.digital_id}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                          <span className="text-white truncate">{traveller.email || 'No email provided'}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-white/60 flex-shrink-0" />
                          <span className="text-white truncate">{traveller.destination || 'No destination set'}</span>
                        </div>
                        
                        {traveller.travel_start_date && (
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-white/60 flex-shrink-0" />
                            <span className="text-white">
                              {new Date(traveller.travel_start_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                              {traveller.travel_end_date && (
                                <span className="text-white/60">
                                  {' - '}
                                  {new Date(traveller.travel_end_date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        
                        {traveller.phone && (
                          <div className="flex items-center gap-3 text-sm">
                            <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                            <span className="text-white">{traveller.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 border-t border-white/20">
                        <button
                          onClick={() => openModal(traveller)}
                          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold group-hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                          View Full Profile
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-white/80">
                    Showing {indexOfFirstTraveller + 1} to {Math.min(indexOfLastTraveller, filteredTravellers.length)} of {filteredTravellers.length} travellers
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30 transition-colors text-white"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal */}
        <TouristProfileModal
          traveller={selectedTraveller}
          isOpen={isModalOpen}
          onClose={closeModal}
          onVerify={handleVerify}
          onUnverify={handleUnverify}
          onReject={handleReject}
        />
      </div>
    </div>
  );
};

export default TouristSearch;
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { travellerAPI } from '../../utils/supabase';
import { Search, User, Plane, MapPin, Phone, Mail, BadgeCheck, XCircle, Shield, Eye, AlertTriangle, Clock, FileText, RefreshCw } from 'lucide-react';

// Tourist Profile Modal Component
const TouristProfileModal = ({ traveller, isOpen, onClose, onVerify, onUnverify, onReject }) => {
  if (!traveller || !isOpen) return null;

  const fullName = `${traveller.first_name || ''} ${traveller.middle_name || ''} ${traveller.last_name || ''}`.trim();
  const isVerified = traveller.is_verified || false;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <User className="w-6 h-6 text-blue-600" />
            Traveller Profile
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <XCircle className="w-7 h-7" />
          </button>
        </div>
        <p className="text-gray-600 mb-8">Details for {fullName || 'Unknown'}</p>

        <div className="space-y-8">
          {/* Personal Information */}
          <div className="border rounded-lg bg-white shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="font-semibold text-gray-900">{fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{traveller.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{traveller.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nationality</p>
                <p className="font-semibold text-gray-900">{traveller.nationality || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-sm text-gray-900">
                  {traveller.created_at ? new Date(traveller.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Updated</p>
                <p className="text-sm text-gray-900">
                  {traveller.updated_at ? new Date(traveller.updated_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Travel Information */}
          <div className="border rounded-lg bg-white shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Plane className="w-5 h-5 text-blue-600" />
                Travel Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Destination</p>
                <p className="font-semibold text-gray-900">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {traveller.destination || 'N/A'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p className="font-semibold text-gray-900">
                  {traveller.travel_start_date ? new Date(traveller.travel_start_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <p className="font-semibold text-gray-900">
                  {traveller.travel_end_date ? new Date(traveller.travel_end_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="lg:col-span-3">
                <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{traveller.emergency_contact_name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{traveller.emergency_contact_number || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div className="border rounded-lg bg-white shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <BadgeCheck className="w-5 h-5 text-blue-600" />
                Document Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Document Type</p>
                <p className="font-semibold text-gray-900">{traveller.document_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Document Number</p>
                <p className="font-semibold text-gray-900">{traveller.document_number || 'N/A'}</p>
              </div>
              {traveller.document_url && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-2">Document</p>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img
                      src={traveller.document_url}
                      alt="Document"
                      className="max-w-full h-48 object-contain rounded-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden text-center py-4 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p>Unable to load document</p>
                    </div>
                    <a
                      href={traveller.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm underline transition-colors"
                    >
                      View Full Document
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Information */}
          {traveller.digital_id && (
            <div className="border rounded-lg bg-white shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Blockchain Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Digital ID</p>
                  <p className="font-mono font-bold text-blue-600 text-lg">#{traveller.digital_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Wallet Address</p>
                  <p className="font-mono text-xs text-gray-900 break-all truncate max-w-full">
                    {traveller.blockchain_wallet_address || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Transaction Hash</p>
                  <div className="space-y-1">
                    <p className="font-mono text-xs text-gray-900 break-all truncate max-w-full">
                      {traveller.blockchain_transaction_hash || 'N/A'}
                    </p>
                    {traveller.blockchain_transaction_hash && (
                      <a
                        href={`https://www.oklink.com/amoy/tx/${traveller.blockchain_transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs underline inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        View on Explorer
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status and Actions */}
          <div className="border rounded-lg bg-white shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Status & Actions</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isVerified ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <div>
                    <p className="font-medium text-gray-900">Verification Status</p>
                    <p className="text-sm text-gray-500">
                      {isVerified ? 'Verified - Active traveller' : 'Pending - Awaiting verification'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isVerified ? (
                    <>
                      <button
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm flex items-center gap-1 hover:bg-gray-100 transition-colors"
                        onClick={() => onUnverify(traveller.id)}
                        title="Mark traveller as unverified, restricting access"
                      >
                        <XCircle className="w-4 h-4" />
                        Unverify
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1 hover:bg-blue-700 transition-colors"
                        onClick={() => onVerify(traveller.id)}
                        title="Verify traveller and generate digital ID"
                      >
                        <BadgeCheck className="w-4 h-4" />
                        Verify
                      </button>
                      <button
                        className="border border-red-300 text-red-700 px-4 py-2 rounded-md text-sm flex items-center gap-1 hover:bg-red-50 transition-colors"
                        onClick={() => onReject(traveller.id)}
                        title="Reject traveller and delete profile"
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
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTraveller, setSelectedTraveller] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const travellersPerPage = 6;

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
        traveller.nationality?.toLowerCase() === filters.nationality.toLowerCase()
      );
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleVerify = async (travellerId) => {
    try {
      await verifyTraveller(travellerId);
      setNotification({ type: 'success', message: 'Traveller verified successfully' });
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
      setNotification({ type: 'success', message: 'Traveller unverified successfully' });
      fetchTourists();
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to unverify traveller: ' + error.message });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReject = async (travellerId) => {
    try {
      await rejectTraveller(travellerId);
      setNotification({ type: 'success', message: 'Traveller rejected successfully' });
      fetchTourists();
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to reject traveller: ' + error.message });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (traveller) => {
    setSelectedTraveller(traveller);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTraveller(null);
    setIsModalOpen(false);
  };

  const retryFetch = () => {
    fetchTourists();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Traveller Search</h1>
          <div className="flex gap-4">
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Dashboard
            </button>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notification.message}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by Digital ID or Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search travellers..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
              <input
                type="text"
                name="nationality"
                value={filters.nationality}
                onChange={handleFilterChange}
                placeholder="e.g., Indian"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travel Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <button
              onClick={retryFetch}
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTravellers.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No travellers found. Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Traveller List */}
        {!loading && !error && filteredTravellers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentTravellers.map(traveller => (
              <div key={traveller.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {`${traveller.first_name || ''} ${traveller.last_name || ''}`.trim() || 'Unknown'}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${traveller.is_verified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {traveller.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2"><Mail className="w-4 h-4 inline mr-1" /> {traveller.email || 'N/A'}</p>
                <p className="text-sm text-gray-600 mb-2"><MapPin className="w-4 h-4 inline mr-1" /> {traveller.destination || 'N/A'}</p>
                <p className="text-sm text-gray-600 mb-4"><Shield className="w-4 h-4 inline mr-1" /> Digital ID: {traveller.digital_id || 'N/A'}</p>
                <button
                  onClick={() => openModal(traveller)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredTravellers.length > 0 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {page}
              </button>
            ))}
          </div>
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
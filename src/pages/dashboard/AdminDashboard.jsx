import { useState, useEffect } from 'react'
import { Shield, Users, CheckCircle, Clock, LogOut, UserCheck, UserX, Eye, X, FileText, Phone, MapPin, Badge as BadgeIcon, Building, AlertCircle } from 'lucide-react'
import { User } from 'lucide-react'
const AdminDashboard = ({ profile, onLogout, onApproveOfficer, onRejectOfficer, pendingOfficers, activeOfficers }) => {
  const [currentView, setCurrentView] = useState('pending')
  const [selectedOfficer, setSelectedOfficer] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')

  const totalOfficers = (pendingOfficers?.length || 0) + (activeOfficers?.length || 0)

  const handleApproveOfficer = async (officerId) => {
    if (!confirm('Are you sure you want to approve this officer?')) return

    setActionLoading(officerId)
    setError('')
    
    try {
      await onApproveOfficer(officerId)
    } catch (err) {
      setError('Failed to approve officer: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectOfficer = async (officerId) => {
    if (!confirm('Are you sure you want to reject this officer? This action cannot be undone.')) return

    setActionLoading(officerId)
    setError('')
    
    try {
      await onRejectOfficer(officerId)
    } catch (err) {
      setError('Failed to reject officer: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const openOfficerModal = (officer) => {
    setSelectedOfficer(officer)
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedOfficer(null)
    setShowModal(false)
  }

  const getUnitDisplayName = (unit) => {
    const unitNames = {
      patrol: 'Patrol Unit',
      motorcycle: 'Motorcycle Unit',
      emergency: 'Emergency Response Unit',
      beach: 'Beach Patrol Unit',
      tourist: 'Tourist Police Unit'
    }
    return unitNames[unit] || unit || 'N/A'
  }

  const getIdTypeDisplayName = (idType) => {
    const idTypes = {
      aadhar: 'Aadhar Card',
      passport: 'Passport',
      driving_license: 'Driving License',
      employee_id: 'Employee ID',
      voter_id: 'Voter ID'
    }
    return idTypes[idType] || idType || 'N/A'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Police Admin Portal</h1>
              <p className="text-sm text-slate-600">Administrator Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-semibold text-slate-800">{profile?.name}</p>
              <p className="text-sm text-slate-600 capitalize">{profile?.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-1 py-2">
              <button
                onClick={() => setCurrentView('pending')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'pending'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Pending Approvals ({pendingOfficers?.length || 0})</span>
              </button>
              <button
                onClick={() => setCurrentView('active')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Active Officers ({activeOfficers?.length || 0})</span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-orange-600">{pendingOfficers?.length || 0}</p>
              </div>
              <Clock className="text-orange-500 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Officers</p>
                <p className="text-2xl font-bold text-green-600">{activeOfficers?.length || 0}</p>
              </div>
              <CheckCircle className="text-green-500 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Officers</p>
                <p className="text-2xl font-bold text-blue-600">{totalOfficers}</p>
              </div>
              <Users className="text-blue-500 w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Dynamic Content Based on Current View */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">
              {currentView === 'pending' ? 'Pending Officer Approvals' : 'Active Police Officers'}
            </h2>
            <p className="text-slate-600 mt-1">
              {currentView === 'pending' 
                ? 'Review and approve new police officer registrations'
                : 'Manage and monitor active police officers in the system'
              }
            </p>
          </div>
          
          <div className="p-6">
            {currentView === 'pending' ? (
              // Pending Officers Section
              pendingOfficers && pendingOfficers.length > 0 ? (
                <div className="space-y-4">
                  {pendingOfficers.map((officer) => (
                    <div key={officer.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                          <div>
                            <p className="font-semibold text-slate-800">{officer.name}</p>
                            <p className="text-sm text-slate-600">{officer.email}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Applied: {new Date(officer.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Badge & Unit</p>
                            <p className="font-medium text-slate-800">{officer.badge_number}</p>
                            <p className="text-sm text-slate-600">{getUnitDisplayName(officer.unit)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Station</p>
                            <p className="font-medium text-slate-800">{officer.station}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Mobile</p>
                            <p className="font-medium text-slate-800">{officer.mobile_number || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => openOfficerModal(officer)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Review</span>
                          </button>
                          <button
                            onClick={() => handleApproveOfficer(officer.id)}
                            disabled={actionLoading === officer.id}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>{actionLoading === officer.id ? 'Loading...' : 'Approve'}</span>
                          </button>
                          <button
                            onClick={() => handleRejectOfficer(officer.id)}
                            disabled={actionLoading === officer.id}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
                          >
                            <UserX className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="text-slate-400 w-12 h-12 mx-auto mb-4" />
                  <p className="text-slate-600">No pending officer approvals</p>
                </div>
              )
            ) : (
              // Active Officers Section
              activeOfficers && activeOfficers.length > 0 ? (
                <div className="space-y-4">
                  {activeOfficers.map((officer) => (
                    <div key={officer.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                          <div>
                            <p className="font-semibold text-slate-800">{officer.name}</p>
                            <p className="text-sm text-slate-600">{officer.email}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs font-medium text-green-700">Active</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Badge Number</p>
                            <p className="font-medium text-slate-800">{officer.badge_number || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Station & Unit</p>
                            <p className="font-medium text-slate-800">{officer.station || 'N/A'}</p>
                            <p className="text-sm text-slate-600">{getUnitDisplayName(officer.unit)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Mobile</p>
                            <p className="font-medium text-slate-800">{officer.mobile_number || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Verified</p>
                            <p className="text-sm font-medium text-slate-800">
                              {new Date(officer.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <button 
                            onClick={() => openOfficerModal(officer)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Profile</span>
                          </button>
                          <button className="bg-slate-600 text-white px-3 py-1.5 rounded-md hover:bg-slate-700 text-sm font-medium flex items-center space-x-1">
                            <UserX className="w-3 h-3" />
                            <span>Suspend</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="text-slate-400 w-12 h-12 mx-auto mb-4" />
                  <p className="text-slate-600">No active officers found</p>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {/* Officer Details Modal */}
      {showModal && selectedOfficer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Officer Details</h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm text-slate-600">Full Name</label>
                    <p className="font-medium text-slate-800">{selectedOfficer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Email</label>
                    <p className="font-medium text-slate-800">{selectedOfficer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Mobile Number</label>
                    <p className="font-medium text-slate-800 flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {selectedOfficer.mobile_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Registration Date</label>
                    <p className="font-medium text-slate-800">
                      {new Date(selectedOfficer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <BadgeIcon className="w-4 h-4 mr-2" />
                  Professional Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm text-slate-600">Badge Number</label>
                    <p className="font-medium text-slate-800">{selectedOfficer.badge_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Station</label>
                    <p className="font-medium text-slate-800 flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      {selectedOfficer.station || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Unit</label>
                    <p className="font-medium text-slate-800">
                      {getUnitDisplayName(selectedOfficer.unit)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Status</label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${selectedOfficer.is_verified ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      <span className={`text-sm font-medium ${selectedOfficer.is_verified ? 'text-green-700' : 'text-orange-700'}`}>
                        {selectedOfficer.is_verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID Information */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  ID Verification
                </h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm text-slate-600">ID Type</label>
                      <p className="font-medium text-slate-800">
                        {getIdTypeDisplayName(selectedOfficer.official_id_type)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">ID Number</label>
                      <p className="font-medium text-slate-800">{selectedOfficer.official_id_number || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* ID Document Image */}
                  <div>
                    <label className="text-sm text-slate-600 mb-2 block">Uploaded Document</label>
                    {selectedOfficer.official_id_image_url ? (
                      <div className="border border-slate-300 rounded-lg p-2 bg-white">
                        <img
                          src={selectedOfficer.official_id_image_url}
                          alt="Official ID Document"
                          className="max-w-full h-auto rounded-md shadow-sm max-h-96 mx-auto"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'block'
                          }}
                        />
                        <div className="hidden text-center py-8 text-slate-500">
                          <FileText className="w-8 h-8 mx-auto mb-2" />
                          <p>Unable to load image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-slate-300 rounded-lg p-8 text-center text-slate-500">
                        <FileText className="w-8 h-8 mx-auto mb-2" />
                        <p>No document uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Pending Officers */}
              {!selectedOfficer.is_verified && currentView === 'pending' && (
                <div className="flex space-x-4 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      closeModal()
                      handleApproveOfficer(selectedOfficer.id)
                    }}
                    disabled={actionLoading === selectedOfficer.id}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{actionLoading === selectedOfficer.id ? 'Approving...' : 'Approve Officer'}</span>
                  </button>
                  <button
                    onClick={() => {
                      closeModal()
                      handleRejectOfficer(selectedOfficer.id)
                    }}
                    disabled={actionLoading === selectedOfficer.id}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
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
    </div>
  )
}

export default AdminDashboard
import { useState, useEffect } from 'react'
import { FileText, Plus, Search, Filter, Eye, Edit, CheckCircle, Clock, AlertCircle, User, MapPin, Calendar, Phone, Mail, Save, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { firAPI } from '../../utils/supabase'

const FIRGenerator = () => {
  const { profile } = useAuth()
  const [currentView, setCurrentView] = useState('list') // 'list', 'create', 'view', 'edit'
  const [firs, setFirs] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    crime_type: '',
    date_from: '',
    date_to: ''
  })
  const [selectedFIR, setSelectedFIR] = useState(null)
  const [formData, setFormData] = useState({
    complainant_name: '',
    complainant_phone: '',
    complainant_email: '',
    complainant_address: '',
    incident_date: '',
    incident_time: '',
    incident_location: '',
    crime_type: '',
    incident_description: '',
    witness_details: '',
    evidence_description: '',
    status: 'filed'
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const crimeTypes = [
    'Theft', 'Robbery', 'Burglary', 'Assault', 'Fraud', 'Cyber Crime',
    'Domestic Violence', 'Drug Offense', 'Vandalism', 'Trespassing',
    'Harassment', 'Kidnapping', 'Murder', 'Rape', 'Other'
  ]

  const statusOptions = [
    { value: 'filed', label: 'Filed', color: 'blue' },
    { value: 'under_investigation', label: 'Under Investigation', color: 'yellow' },
    { value: 'charges_filed', label: 'Charges Filed', color: 'purple' },
    { value: 'closed', label: 'Closed', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' }
  ]

  useEffect(() => {
    loadFIRs()
  }, [])

  const loadFIRs = async () => {
    setLoading(true)
    try {
      let data
      if (profile?.role === 'admin') {
        data = await firAPI.getAllFIRs()
      } else {
        data = await firAPI.getFIRsByOfficer(profile?.id)
      }
      setFirs(data)
    } catch (error) {
      console.error('Error loading FIRs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const data = await firAPI.searchFIRs(searchTerm, filters)
      setFirs(data)
    } catch (error) {
      console.error('Error searching FIRs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFIR = async (e) => {
    e.preventDefault()
    setErrors({})
    
    // Validation
    const newErrors = {}
    if (!formData.complainant_name) newErrors.complainant_name = 'Complainant name is required'
    if (!formData.complainant_phone) newErrors.complainant_phone = 'Phone number is required'
    if (!formData.incident_date) newErrors.incident_date = 'Incident date is required'
    if (!formData.incident_time) newErrors.incident_time = 'Incident time is required'
    if (!formData.incident_location) newErrors.incident_location = 'Incident location is required'
    if (!formData.crime_type) newErrors.crime_type = 'Crime type is required'
    if (!formData.incident_description) newErrors.incident_description = 'Incident description is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      // Generate FIR number
      const firNumber = `FIR-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      
      const firData = {
        ...formData,
        fir_number: firNumber,
        officer_id: profile.id,
        officer_name: profile.name,
        officer_badge: profile.badge_number,
        officer_station: profile.station,
        created_at: new Date().toISOString()
      }

      await firAPI.createFIR(firData)
      setSuccessMessage('FIR created successfully!')
      setCurrentView('list')
      loadFIRs()
      resetForm()
    } catch (error) {
      console.error('Error creating FIR:', error)
      setErrors({ submit: 'Failed to create FIR. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      complainant_name: '',
      complainant_phone: '',
      complainant_email: '',
      complainant_address: '',
      incident_date: '',
      incident_time: '',
      incident_location: '',
      crime_type: '',
      incident_description: '',
      witness_details: '',
      evidence_description: '',
      status: 'filed'
    })
    setErrors({})
    setSuccessMessage('')
  }

  const handleViewFIR = (fir) => {
    setSelectedFIR(fir)
    setCurrentView('view')
  }

  const handleEditFIR = (fir) => {
    setSelectedFIR(fir)
    setFormData({
      complainant_name: fir.complainant_name || '',
      complainant_phone: fir.complainant_phone || '',
      complainant_email: fir.complainant_email || '',
      complainant_address: fir.complainant_address || '',
      incident_date: fir.incident_date || '',
      incident_time: fir.incident_time || '',
      incident_location: fir.incident_location || '',
      crime_type: fir.crime_type || '',
      incident_description: fir.incident_description || '',
      witness_details: fir.witness_details || '',
      evidence_description: fir.evidence_description || '',
      status: fir.status || 'filed'
    })
    setCurrentView('edit')
  }

  const handleUpdateFIR = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await firAPI.updateFIRStatus(selectedFIR.id, formData.status)
      setSuccessMessage('FIR updated successfully!')
      setCurrentView('list')
      loadFIRs()
    } catch (error) {
      console.error('Error updating FIR:', error)
      setErrors({ submit: 'Failed to update FIR. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status)
    return statusObj ? statusObj.color : 'gray'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'filed': return <FileText className="w-4 h-4" />
      case 'under_investigation': return <Clock className="w-4 h-4" />
      case 'charges_filed': return <AlertCircle className="w-4 h-4" />
      case 'closed': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (currentView === 'create' || currentView === 'edit') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {currentView === 'create' ? 'Create New FIR' : 'Edit FIR'}
                </h2>
                <p className="text-slate-600 mt-1">
                  {currentView === 'create' 
                    ? 'Fill in the details to create a new First Information Report'
                    : 'Update the FIR details and status'
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentView('list')
                  resetForm()
                }}
                className="bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={currentView === 'create' ? handleCreateFIR : handleUpdateFIR} className="p-6">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-medium">{errors.submit}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Complainant Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                  Complainant Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.complainant_name}
                    onChange={(e) => setFormData({...formData, complainant_name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.complainant_name ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Enter complainant's full name"
                  />
                  {errors.complainant_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.complainant_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.complainant_phone}
                    onChange={(e) => setFormData({...formData, complainant_phone: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.complainant_phone ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors.complainant_phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.complainant_phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.complainant_email}
                    onChange={(e) => setFormData({...formData, complainant_email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.complainant_address}
                    onChange={(e) => setFormData({...formData, complainant_address: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Enter complete address"
                  />
                </div>
              </div>

              {/* Incident Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                  Incident Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Incident Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.incident_date}
                      onChange={(e) => setFormData({...formData, incident_date: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.incident_date ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.incident_date && (
                      <p className="text-red-500 text-sm mt-1">{errors.incident_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Incident Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.incident_time}
                      onChange={(e) => setFormData({...formData, incident_time: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.incident_time ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.incident_time && (
                      <p className="text-red-500 text-sm mt-1">{errors.incident_time}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Incident Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.incident_location}
                    onChange={(e) => setFormData({...formData, incident_location: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.incident_location ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Enter incident location"
                  />
                  {errors.incident_location && (
                    <p className="text-red-500 text-sm mt-1">{errors.incident_location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Crime Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.crime_type}
                    onChange={(e) => setFormData({...formData, crime_type: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.crime_type ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Select crime type</option>
                    {crimeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.crime_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.crime_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Incident Description */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">
                Incident Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Incident Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.incident_description}
                    onChange={(e) => setFormData({...formData, incident_description: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.incident_description ? 'border-red-500' : 'border-slate-300'
                    }`}
                    rows="4"
                    placeholder="Provide detailed description of the incident"
                  />
                  {errors.incident_description && (
                    <p className="text-red-500 text-sm mt-1">{errors.incident_description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Witness Details
                  </label>
                  <textarea
                    value={formData.witness_details}
                    onChange={(e) => setFormData({...formData, witness_details: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="List any witnesses and their contact information"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Evidence Description
                  </label>
                  <textarea
                    value={formData.evidence_description}
                    onChange={(e) => setFormData({...formData, evidence_description: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Describe any physical evidence or documentation"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('list')
                  resetForm()
                }}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : (currentView === 'create' ? 'Create FIR' : 'Update FIR')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (currentView === 'view' && selectedFIR) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">FIR Details</h2>
                <p className="text-slate-600 mt-1">FIR Number: {selectedFIR.fir_number}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditFIR(selectedFIR)}
                  className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentView('list')}
                  className="bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Complainant Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Complainant Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Name</p>
                    <p className="font-medium text-slate-800">{selectedFIR.complainant_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Phone</p>
                    <p className="font-medium text-slate-800">{selectedFIR.complainant_phone}</p>
                  </div>
                  {selectedFIR.complainant_email && (
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium text-slate-800">{selectedFIR.complainant_email}</p>
                    </div>
                  )}
                  {selectedFIR.complainant_address && (
                    <div>
                      <p className="text-sm text-slate-600">Address</p>
                      <p className="font-medium text-slate-800">{selectedFIR.complainant_address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Incident Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Incident Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Date & Time</p>
                    <p className="font-medium text-slate-800">
                      {formatDate(selectedFIR.incident_date)} at {selectedFIR.incident_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Location</p>
                    <p className="font-medium text-slate-800">{selectedFIR.incident_location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Crime Type</p>
                    <p className="font-medium text-slate-800">{selectedFIR.crime_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(selectedFIR.status)}-100 text-${getStatusColor(selectedFIR.status)}-700`}>
                        {statusOptions.find(s => s.value === selectedFIR.status)?.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Description */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Incident Description</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-800 whitespace-pre-wrap">{selectedFIR.incident_description}</p>
              </div>
            </div>

            {/* Additional Details */}
            {(selectedFIR.witness_details || selectedFIR.evidence_description) && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedFIR.witness_details && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Witness Details</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-slate-800 whitespace-pre-wrap">{selectedFIR.witness_details}</p>
                    </div>
                  </div>
                )}
                {selectedFIR.evidence_description && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Evidence Description</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-slate-800 whitespace-pre-wrap">{selectedFIR.evidence_description}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Officer Information */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-2">Filed By</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-slate-800">
                  <strong>{selectedFIR.officer_name}</strong> (Badge: {selectedFIR.officer_badge})<br />
                  Station: {selectedFIR.officer_station}<br />
                  Filed on: {formatDate(selectedFIR.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">E-FIR Generator</h1>
          <p className="text-slate-600 mt-1">Digital First Information Report management system</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setCurrentView('create')
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New FIR</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search FIRs..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Crime Type</label>
            <select
              value={filters.crime_type}
              onChange={(e) => setFilters({...filters, crime_type: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {crimeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* FIR List */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">FIR Reports</h2>
          <p className="text-slate-600 mt-1">Manage and track First Information Reports</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading FIRs...</p>
          </div>
        ) : firs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="text-slate-400 w-12 h-12 mx-auto mb-4" />
            <p className="text-slate-600">No FIRs found</p>
            <p className="text-slate-500 text-sm mt-1">Create your first FIR to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {firs.map((fir) => (
              <div key={fir.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="font-semibold text-slate-800">{fir.fir_number}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(fir.status)}-100 text-${getStatusColor(fir.status)}-700 flex items-center space-x-1`}>
                        {getStatusIcon(fir.status)}
                        <span>{statusOptions.find(s => s.value === fir.status)?.label}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                      <div>
                        <p><strong>Complainant:</strong> {fir.complainant_name}</p>
                        <p><strong>Crime:</strong> {fir.crime_type}</p>
                      </div>
                      <div>
                        <p><strong>Location:</strong> {fir.incident_location}</p>
                        <p><strong>Date:</strong> {formatDate(fir.incident_date)}</p>
                      </div>
                      <div>
                        <p><strong>Officer:</strong> {fir.officer_name}</p>
                        <p><strong>Station:</strong> {fir.officer_station}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleViewFIR(fir)}
                      className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditFIR(fir)}
                      className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FIRGenerator
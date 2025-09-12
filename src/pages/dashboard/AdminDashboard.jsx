import { useState, useEffect } from 'react'
import { Shield, Users, CheckCircle, Clock, LogOut, UserCheck, UserX, Eye } from 'lucide-react'

const AdminDashboard = ({ profile, onLogout, onApproveOfficer, pendingOfficers, activeOfficers }) => {
  const [currentView, setCurrentView] = useState('pending')

  const totalOfficers = (pendingOfficers?.length || 0) + (activeOfficers?.length || 0)

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
              className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"
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
                    <div key={officer.id} className="bg-slate-50 rounded-lg p-4 flex justify-between items-center">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <p className="font-semibold text-slate-800">{officer.name}</p>
                          <p className="text-sm text-slate-600">{officer.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Badge Number</p>
                          <p className="font-medium text-slate-800">{officer.badge_number}</p>
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
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => onApproveOfficer(officer.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium flex items-center space-x-2">
                          <UserX className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
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
              verifiedPoliceOfficers && verifiedPoliceOfficers.length > 0 ? (
                <div className="space-y-4">
                  {verifiedPoliceOfficers.map((officer) => (
                    <div key={officer.id} className="bg-slate-50 rounded-lg p-4 flex justify-between items-center">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                        <div>
                          <p className="font-semibold text-slate-800">{officer.name}</p>
                          <p className="text-sm text-slate-600">{officer.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Badge Number</p>
                          <p className="font-medium text-slate-800">{officer.badge_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Station</p>
                          <p className="font-medium text-slate-800">{officer.station}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Mobile</p>
                          <p className="font-medium text-slate-800">{officer.mobile_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Status</p>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-700">Active</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center space-x-2">
                          <Eye className="w-4 h-4" />
                          <span>View Profile</span>
                        </button>
                        <button className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 text-sm font-medium flex items-center space-x-2">
                          <UserX className="w-4 h-4" />
                          <span>Suspend</span>
                        </button>
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
    </div>
  )
}

export default AdminDashboard
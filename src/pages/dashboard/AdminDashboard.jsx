import { useState, useEffect } from 'react'
import { Shield, Users, CheckCircle, Clock, LogOut } from 'lucide-react'

const AdminDashboard = ({ profile, onLogout, onApproveOfficer, pendingOfficers }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
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
                <p className="text-sm text-slate-600">Verified Officers</p>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
              <CheckCircle className="text-green-500 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Officers</p>
                <p className="text-2xl font-bold text-blue-600">{pendingOfficers?.length || 0}</p>
              </div>
              <Users className="text-blue-500 w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Pending Approvals Section */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">Pending Officer Approvals</h2>
            <p className="text-slate-600 mt-1">Review and approve new police officer registrations</p>
          </div>
          
          <div className="p-6">
            {pendingOfficers && pendingOfficers.length > 0 ? (
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
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        Approve
                      </button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="text-slate-400 w-12 h-12 mx-auto mb-4" />
                <p className="text-slate-600">No pending officer approvals</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
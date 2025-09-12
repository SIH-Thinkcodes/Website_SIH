import { Shield, CheckCircle, Clock, AlertCircle, LogOut, Lock } from 'lucide-react'

const PoliceDashboard = ({ profile, onLogout, isVerified }) => {
  if (!isVerified) {
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
                <h1 className="text-xl font-bold text-slate-800">Police Officer Portal</h1>
                <p className="text-sm text-slate-600">Officer Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-slate-800">{profile?.name}</p>
                <div className="flex items-center space-x-2">
                  <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                    Pending Verification
                  </div>
                </div>
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

        {/* Main Content - Verification Pending */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-200">
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="text-orange-600 w-10 h-10" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-4">Account Under Review</h1>
              <p className="text-slate-600 mb-8 text-lg">
                Your police officer account is currently being reviewed by the administrator. 
                You'll gain full access to the system once your profile is verified.
              </p>
              
              {/* Profile Summary */}
              <div className="bg-slate-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-slate-800 mb-4">Your Registration Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm text-slate-600">Name</p>
                    <p className="font-medium text-slate-800">{profile?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-medium text-slate-800">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Badge Number</p>
                    <p className="font-medium text-slate-800">{profile?.badge_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Station</p>
                    <p className="font-medium text-slate-800">{profile?.station}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>What happens next?</strong><br />
                  The administrator will review your credentials and approve your account within 24-48 hours. 
                  You'll receive an email notification once approved.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

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
              <h1 className="text-xl font-bold text-slate-800">Police Officer Portal</h1>
              <p className="text-sm text-slate-600">Officer Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-semibold text-slate-800">{profile?.name}</p>
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Officer
                </div>
              </div>
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

      {/* Main Content - Verified Officer Dashboard */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Cases</p>
                <p className="text-2xl font-bold text-blue-600">0</p>
              </div>
              <Shield className="text-blue-500 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Reports Filed</p>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
              <CheckCircle className="text-green-500 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-orange-600">0</p>
              </div>
              <AlertCircle className="text-orange-500 w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Welcome to Police Portal</h2>
          <p className="text-slate-600">
            Your account has been verified and you now have full access to all police portal features.
            Use the navigation menu to access case management, reports, and other tools.
          </p>
        </div>
      </main>
    </div>
  )
}

export default PoliceDashboard
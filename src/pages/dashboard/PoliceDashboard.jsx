import { useState } from 'react'
import { Shield, CheckCircle, Clock, AlertCircle, LogOut, Lock, Search, Phone, FileText, MessageCircle, Users, Menu, X, MapPin, User } from 'lucide-react'

// Import page components
import TouristSearch from './TouristSearch'
import EmergencyDispatch from './EmergencyDispatch'
import FIRGenerator from './FIRGenerator'
import CitizenChat from './CitizenChat'
import MissingPersons from './MissingPersons'
import TouristHeatMap from './TouristHeatMap'

const PoliceDashboard = ({ profile, onLogout, isVerified }) => {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

const navigationItems = [
  { id: 'dashboard', name: 'Dashboard', icon: Shield },
  { id: 'tourist-search', name: 'Tourist Search', icon: Search },
  { id: 'tourist-heatmap', name: 'Tourist Analytics', icon: MapPin },
  { id: 'emergency-dispatch', name: 'Emergency Dispatch', icon: Phone },
  { id: 'fir-generator', name: 'E-FIR Generator', icon: FileText },
  { id: 'citizen-chat', name: 'Citizen Support Chat', icon: MessageCircle },
  { id: 'missing-persons', name: 'Missing Persons Registry', icon: Users },
]

const renderPage = () => {
  switch (currentPage) {
    case 'tourist-search':
      return <TouristSearch profile={profile} />
    case 'tourist-heatmap':
      return <TouristHeatMap profile={profile} />
    case 'emergency-dispatch':
      return <EmergencyDispatch profile={profile} />
    case 'fir-generator':
      return <FIRGenerator profile={profile} />
    case 'citizen-chat':
      return <CitizenChat profile={profile} />
    case 'missing-persons':
      return <MissingPersons profile={profile} />
    default:
      return <DashboardHome />
  }
}

  const DashboardHome = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Cases</p>
              <p className="text-xl lg:text-2xl font-bold text-blue-600">0</p>
            </div>
            <Shield className="text-blue-500 w-6 h-6 lg:w-8 lg:h-8" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Reports Filed</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600">0</p>
            </div>
            <CheckCircle className="text-green-500 w-6 h-6 lg:w-8 lg:h-8" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-blue-100 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Tasks</p>
              <p className="text-xl lg:text-2xl font-bold text-orange-600">0</p>
            </div>
            <AlertCircle className="text-orange-500 w-6 h-6 lg:w-8 lg:h-8" />
          </div>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 lg:p-8 text-center max-w-4xl mx-auto w-full">
        <h2 className="text-lg lg:text-xl font-bold text-slate-800 mb-2">Welcome to Police Portal</h2>
        <p className="text-sm lg:text-base text-slate-600 mb-4 lg:mb-6">
          Your account has been verified and you now have full access to all police portal features.
          Use the navigation menu to access case management, reports, and other tools.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 text-left">
          <div className="bg-slate-50 rounded-lg p-3 lg:p-4">
            <p className="text-xs text-slate-500">Officer</p>
            <p className="font-medium text-slate-800 text-sm lg:text-base">{profile?.name || '—'}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 lg:p-4">
            <p className="text-xs text-slate-500">Badge / Station</p>
            <p className="font-medium text-slate-800 text-sm lg:text-base">{profile?.badge_number || '—'}{profile?.station ? ` · ${profile.station}` : ''}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 lg:p-4 sm:col-span-2 lg:col-span-1">
            <p className="text-xs text-slate-500">Today</p>
            <p className="font-medium text-slate-800 text-sm lg:text-base">{new Date().toLocaleDateString()} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>
    </div>
  )

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white/85 backdrop-blur-lg shadow-sm border-b border-blue-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center">
                <Shield className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Police Officer Portal</h1>
                <p className="text-xs text-slate-600">Officer Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="font-semibold text-slate-800 text-sm">{profile?.name}</p>
                <div className="flex items-center justify-end">
                  <div className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    Pending Verification
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-50 text-red-600 p-1.5 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Left Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-xl shadow-lg border-r border-slate-200/50 z-40 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-100/50">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Police Portal</h1>
              <p className="text-xs text-slate-600">Officer Dashboard</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 transform ${
                  currentPage === item.id
                    ? 'bg-blue-100/90 text-blue-700 shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 hover:scale-[1.02]'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">{profile?.name}</p>
              <div className="flex items-center">
                <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile Sidebar Close Button */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed top-4 right-4 z-50 lg:hidden p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-200"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-blue-100/50 sticky top-0 z-20">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100/70 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-slate-800">Welcome to Police Portal</h2>
            </div>
            <div className="hidden sm:flex items-center space-x-4 text-sm text-slate-600">
              <span>{new Date().toLocaleDateString()}</span>
              <span>•</span>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-6">
          {renderPage()}
        </main>
      </div>
      

    </div>
  )
}

export default PoliceDashboard
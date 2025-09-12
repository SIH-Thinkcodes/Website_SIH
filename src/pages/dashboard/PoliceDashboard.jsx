import { useState } from 'react'
import { Shield, CheckCircle, Clock, AlertCircle, LogOut, Lock, Search, Phone, FileText, MessageCircle, Users, Menu, X } from 'lucide-react'

// Import page components
import TouristSearch from './TouristSearch'
import EmergencyDispatch from './EmergencyDispatch'
import FIRGenerator from './FIRGenerator'
import CitizenChat from './CitizenChat'
import MissingPersons from './MissingPersons'

const PoliceDashboard = ({ profile, onLogout, isVerified }) => {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Shield },
    { id: 'tourist-search', name: 'Tourist Search', icon: Search },
    { id: 'emergency-dispatch', name: 'Emergency Dispatch', icon: Phone },
    { id: 'fir-generator', name: 'E-FIR Generator', icon: FileText },
    { id: 'citizen-chat', name: 'Citizen Support Chat', icon: MessageCircle },
    { id: 'missing-persons', name: 'Missing Persons Registry', icon: Users },
  ]

  const renderPage = () => {
    switch (currentPage) {
      case 'tourist-search':
        return <TouristSearch />
      case 'emergency-dispatch':
        return <EmergencyDispatch />
      case 'fir-generator':
        return <FIRGenerator />
      case 'citizen-chat':
        return <CitizenChat />
      case 'missing-persons':
        return <MissingPersons />
      default:
        return <DashboardHome />
    }
  }

  const DashboardHome = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Welcome Card */}
      <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-blue-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Welcome to Police Portal</h2>
        <p className="text-slate-600">
          Your account has been verified and you now have full access to all police portal features.
          Use the navigation menu to access case management, reports, and other tools.
        </p>
      </div>
    </div>
  )

  if (!isVerified) {
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
      {/* Sticky Header with Blur */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
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

        {/* Navigation Bar */}
        <nav className="border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-1 overflow-x-auto py-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:block">{item.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">Navigation</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <nav className="p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        currentPage === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  )
                })}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  )
}

export default PoliceDashboard
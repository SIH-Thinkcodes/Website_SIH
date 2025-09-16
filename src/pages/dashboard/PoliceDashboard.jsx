import { useState, useEffect } from 'react'
import { Shield, CheckCircle, Clock, AlertCircle, LogOut, Lock, Search, Phone, FileText, MessageCircle, Users, Menu, X, MapPin, User, Globe, RefreshCw } from 'lucide-react'
import { dashboardAPI } from '../../utils/supabase'

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
  const [language, setLanguage] = useState('english')
  
  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState({
    activeCases: 0,
    totalReports: 0,
    pendingTasks: 0,
    recentActivity: []
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Function to fetch dashboard statistics
  const fetchDashboardStats = async () => {
    if (!profile?.id) return
    
    try {
      setStatsLoading(true)
      setStatsError(null)
      
      const stats = await dashboardAPI.getDashboardStats(profile.id)
      setDashboardStats(stats)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setStatsError('Failed to load dashboard data')
    } finally {
      setStatsLoading(false)
    }
  }

  // Function to refresh dashboard data
  const refreshDashboard = () => {
    fetchDashboardStats()
  }

  // Fetch dashboard stats on component mount and when profile changes
  useEffect(() => {
    if (profile?.id && isVerified) {
      fetchDashboardStats()
    }
  }, [profile?.id, isVerified])

  // Set up real-time updates every 30 seconds
  useEffect(() => {
    if (!profile?.id || !isVerified) return

    const interval = setInterval(() => {
      fetchDashboardStats()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [profile?.id, isVerified])

  // Language options
  const languageOptions = [
    { code: 'english', name: 'English', native: 'English' },
    { code: 'hindi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'tamil', name: 'Tamil', native: 'தமிழ்' },
    { code: 'gujarati', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'bengali', name: 'Bengali', native: 'বাংলা' }
  ]

  // Translation object
  const translations = {
    english: {
      dashboard: 'Dashboard',
      touristSearch: 'Tourist Search',
      touristAnalytics: 'Tourist Analytics',
      emergencyDispatch: 'Emergency Dispatch',
      firGenerator: 'E-FIR Generator',
      citizenChat: 'Citizen Support Chat',
      missingPersons: 'Missing Persons Registry',
      policePortal: 'Police Portal',
      officerDashboard: 'Officer Dashboard',
      activeCases: 'Active Cases',
      reportsFiled: 'Reports Filed',
      pendingTasks: 'Pending Tasks',
      welcomeToPolicePortal: 'Welcome to Police Portal',
      accountVerified: 'Your account has been verified and you now have full access to all police portal features. Use the navigation menu to access case management, reports, and other tools.',
      officer: 'Officer',
      badgeStation: 'Badge / Station',
      today: 'Today',
      verified: 'Verified',
      logout: 'Logout',
      accountUnderReview: 'Account Under Review',
      accountReviewText: 'Your police officer account is currently being reviewed by the administrator. You\'ll gain full access to the system once your profile is verified.',
      registrationDetails: 'Your Registration Details',
      name: 'Name',
      email: 'Email',
      badgeNumber: 'Badge Number',
      station: 'Station',
      whatHappensNext: 'What happens next?',
      nextStepsText: 'The administrator will review your credentials and approve your account within 24-48 hours. You\'ll receive an email notification once approved.',
      pendingVerification: 'Pending Verification'
    },
    hindi: {
      dashboard: 'डैशबोर्ड',
      touristSearch: 'पर्यटक खोज',
      touristAnalytics: 'पर्यटक विश्लेषण',
      emergencyDispatch: 'आपातकालीन प्रेषण',
      firGenerator: 'ई-एफआईआर जेनरेटर',
      citizenChat: 'नागरिक सहायता चैट',
      missingPersons: 'लापता व्यक्ति रजिस्ट्री',
      policePortal: 'पुलिस पोर्टल',
      officerDashboard: 'अधिकारी डैशबोर्ड',
      activeCases: 'सक्रिय मामले',
      reportsFiled: 'दायर रिपोर्ट',
      pendingTasks: 'लंबित कार्य',
      welcomeToPolicePortal: 'पुलिस पोर्टल में आपका स्वागत है',
      accountVerified: 'आपके खाते को सत्यापित कर दिया गया है और अब आपके पास पुलिस पोर्टल की सभी सुविधाओं तक पूर्ण पहुंच है। केस प्रबंधन, रिपोर्ट और अन्य उपकरणों तक पहुंचने के लिए नेविगेशन मेनू का उपयोग करें।',
      officer: 'अधिकारी',
      badgeStation: 'बैज / स्टेशन',
      today: 'आज',
      verified: 'सत्यापित',
      logout: 'लॉगआउट',
      accountUnderReview: 'खाता समीक्षा के अधीन',
      accountReviewText: 'आपका पुलिस अधिकारी खाता वर्तमान में प्रशासक द्वारा समीक्षा के अधीन है। आपके प्रोफाइल के सत्यापित होने के बाद आपको सिस्टम तक पूर्ण पहुंच मिल जाएगी।',
      registrationDetails: 'आपके पंजीकरण विवरण',
      name: 'नाम',
      email: 'ईमेल',
      badgeNumber: 'बैज नंबर',
      station: 'स्टेशन',
      whatHappensNext: 'आगे क्या होगा?',
      nextStepsText: 'प्रशासक आपकी साख की समीक्षा करेगा और 24-48 घंटों के भीतर आपके खाते को मंजूरी देगा। मंजूरी मिलने पर आपको ईमेल सूचना प्राप्त होगी।',
      pendingVerification: 'लंबित सत्यापन'
    },
    tamil: {
      dashboard: 'டாஷ்போர்டு',
      touristSearch: 'சுற்றுலா தேடல்',
      touristAnalytics: 'சுற்றுலா பகுப்பாய்வு',
      emergencyDispatch: 'அவசர அனுப்பீடு',
      firGenerator: 'ஈ-எஃப்ஐஆர் ஜெனரேட்டர்',
      citizenChat: 'குடிமக்கள் ஆதரவு அரட்டை',
      missingPersons: 'காணாமல் போனவர்கள் பதிவேடு',
      policePortal: 'காவல் போர்டல்',
      officerDashboard: 'அதிகாரி டாஷ்போர்டு',
      activeCases: 'செயலில் உள்ள வழக்குகள்',
      reportsFiled: 'தாக்கல் செய்யப்பட்ட அறிக்கைகள்',
      pendingTasks: 'நிலுவையில் உள்ள பணிகள்',
      welcomeToPolicePortal: 'காவல் போர்டலுக்கு வரவேற்கிறோம்',
      accountVerified: 'உங்கள் கணக்கு சரிபார்க்கப்பட்டது மற்றும் இப்போது காவல் போர்டலின் அனைத்து அம்சங்களுக்கும் முழு அணுகல் உள்ளது. வழக்கு மேலாண்மை, அறிக்கைகள் மற்றும் பிற கருவிகளுக்கு அணுக நவிகேஷன் மெனுவைப் பயன்படுத்தவும்.',
      officer: 'அதிகாரி',
      badgeStation: 'பேட்ஜ் / நிலையம்',
      today: 'இன்று',
      verified: 'சரிபார்க்கப்பட்டது',
      logout: 'வெளியேறு',
      accountUnderReview: 'கணக்கு மறுஆய்வில்',
      accountReviewText: 'உங்கள் காவல் அதிகாரி கணக்கு தற்போது நிர்வாகியால் மறுஆய்வு செய்யப்படுகிறது. உங்கள் சுயவிவரம் சரிபார்க்கப்பட்டவுடன் கணினிக்கு முழு அணுகல் கிடைக்கும்.',
      registrationDetails: 'உங்கள் பதிவு விவரங்கள்',
      name: 'பெயர்',
      email: 'மின்னஞ்சல்',
      badgeNumber: 'பேட்ஜ் எண்',
      station: 'நிலையம்',
      whatHappensNext: 'அடுத்து என்ன நடக்கும்?',
      nextStepsText: 'நிர்வாகி உங்கள் சான்றுகளை மறுஆய்வு செய்து 24-48 மணிநேரங்களுக்குள் உங்கள் கணக்கை அனுமதிப்பார். அனுமதிக்கப்பட்டவுடன் உங்களுக்கு மின்னஞ்சல் அறிவிப்பு கிடைக்கும்.',
      pendingVerification: 'நிலுவையில் உள்ள சரிபார்ப்பு'
    },
    gujarati: {
      dashboard: 'ડેશબોર્ડ',
      touristSearch: 'પ્રવાસી શોધ',
      touristAnalytics: 'પ્રવાસી વિશ્લેષણ',
      emergencyDispatch: 'અત્યાજયક ડિસ્પેચ',
      firGenerator: 'ઈ-એફઆઈઆર જનરેટર',
      citizenChat: 'નાગરિક સહાય ચેટ',
      missingPersons: 'ગુમ થયેલા વ્યક્તિઓનું રજિસ્ટર',
      policePortal: 'પોલીસ પોર્ટલ',
      officerDashboard: 'અધિકારી ડેશબોર્ડ',
      activeCases: 'સક્રિય કેસ',
      reportsFiled: 'દાખલ કરેલા અહેવાલો',
      pendingTasks: 'બાકી કાર્યો',
      welcomeToPolicePortal: 'પોલીસ પોર્ટલમાં આપનું સ્વાગત છે',
      accountVerified: 'તમારા એકાઉન્ટની ચકાસણી થઈ ગઈ છે અને હવે તમારી પાસે પોલીસ પોર્ટલની બધી સુવિધાઓની સંપૂર્ણ પહોંચ છે। કેસ મેનેજમેન્ટ, અહેવાલો અને અન્ય સાધનોની પહોંચ માટે નેવિગેશન મેનુનો ઉપયોગ કરો।',
      officer: 'અધિકારી',
      badgeStation: 'બેજ / સ્ટેશન',
      today: 'આજે',
      verified: 'ચકાસાયેલ',
      logout: 'લોગઆઉટ',
      accountUnderReview: 'એકાઉન્ટ સમીક્ષા હેઠળ',
      accountReviewText: 'તમારું પોલીસ અધિકારી એકાઉન્ટ હાલમાં એડમિનિસ્ટ્રેટર દ્વારા સમીક્ષા હેઠળ છે। તમારી પ્રોફાઇલ ચકાસાયા પછી તમને સિસ્ટમની સંપૂર્ણ પહોંચ મળશે।',
      registrationDetails: 'તમારી નોંધણીની વિગતો',
      name: 'નામ',
      email: 'ઈમેઇલ',
      badgeNumber: 'બેજ નંબર',
      station: 'સ્ટેશન',
      whatHappensNext: 'આગળ શું થશે?',
      nextStepsText: 'એડમિનિસ્ટ્રેટર તમારી ક્રેડેન્શિયલ્સની સમીક્ષા કરશે અને 24-48 કલાકમાં તમારા એકાઉન્ટને મંજૂરી આપશે। મંજૂરી મળ્યા પછી તમને ઈમેઇલ સૂચના મળશે।',
      pendingVerification: 'બાકી ચકાસણી'
    },
    bengali: {
      dashboard: 'ড্যাশবোর্ড',
      touristSearch: 'পর্যটক অনুসন্ধান',
      touristAnalytics: 'পর্যটক বিশ্লেষণ',
      emergencyDispatch: 'জরুরি প্রেরণ',
      firGenerator: 'ই-এফআইআর জেনারেটর',
      citizenChat: 'নাগরিক সহায়তা চ্যাট',
      missingPersons: 'নিখোঁজ ব্যক্তি রেজিস্ট্রি',
      policePortal: 'পুলিশ পোর্টাল',
      officerDashboard: 'অফিসার ড্যাশবোর্ড',
      activeCases: 'সক্রিয় মামলা',
      reportsFiled: 'দায়ের করা রিপোর্ট',
      pendingTasks: 'মুলতবি কাজ',
      welcomeToPolicePortal: 'পুলিশ পোর্টালে স্বাগতম',
      accountVerified: 'আপনার অ্যাকাউন্ট যাচাই করা হয়েছে এবং এখন আপনার কাছে পুলিশ পোর্টালের সমস্ত বৈশিষ্ট্যের সম্পূর্ণ অ্যাক্সেস রয়েছে। কেস ম্যানেজমেন্ট, রিপোর্ট এবং অন্যান্য সরঞ্জামে অ্যাক্সেস করতে নেভিগেশন মেনু ব্যবহার করুন।',
      officer: 'অফিসার',
      badgeStation: 'ব্যাজ / স্টেশন',
      today: 'আজ',
      verified: 'যাচাইকৃত',
      logout: 'লগআউট',
      accountUnderReview: 'অ্যাকাউন্ট পর্যালোচনাধীন',
      accountReviewText: 'আপনার পুলিশ অফিসার অ্যাকাউন্ট বর্তমানে প্রশাসক দ্বারা পর্যালোচনাধীন। আপনার প্রোফাইল যাচাই হওয়ার পর আপনি সিস্টেমে সম্পূর্ণ অ্যাক্সেস পাবেন।',
      registrationDetails: 'আপনার নিবন্ধনের বিবরণ',
      name: 'নাম',
      email: 'ইমেইল',
      badgeNumber: 'ব্যাজ নম্বর',
      station: 'স্টেশন',
      whatHappensNext: 'এরপর কী হবে?',
      nextStepsText: 'প্রশাসক আপনার পরিচয়পত্র পর্যালোচনা করবেন এবং 24-48 ঘন্টার মধ্যে আপনার অ্যাকাউন্ট অনুমোদন করবেন। অনুমোদিত হলে আপনি ইমেইল বিজ্ঞপ্তি পাবেন।',
      pendingVerification: 'মুলতবি যাচাইকরণ'
    }
  }

  const t = translations[language]

const navigationItems = [
  { id: 'dashboard', name: t.dashboard, icon: Shield },
  { id: 'tourist-search', name: t.touristSearch, icon: Search },
  { id: 'tourist-heatmap', name: t.touristAnalytics, icon: MapPin },
  { id: 'emergency-dispatch', name: t.emergencyDispatch, icon: Phone },
  { id: 'fir-generator', name: t.firGenerator, icon: FileText },
  { id: 'citizen-chat', name: t.citizenChat, icon: MessageCircle },
  { id: 'missing-persons', name: t.missingPersons, icon: Users },
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
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-4 lg:p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">{t.activeCases}</p>
              {statsLoading ? (
                <div className="animate-pulse bg-slate-200 h-6 w-12 rounded"></div>
              ) : (
                <p className="text-xl lg:text-2xl font-bold text-white">
                  {statsError ? '—' : dashboardStats.activeCases}
                </p>
              )}
            </div>
            <Shield className="text-white/80 w-6 h-6 lg:w-8 lg:h-8" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-4 lg:p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">{t.reportsFiled}</p>
              {statsLoading ? (
                <div className="animate-pulse bg-white/20 h-6 w-12 rounded"></div>
              ) : (
                <p className="text-xl lg:text-2xl font-bold text-white">
                  {statsError ? '—' : dashboardStats.totalReports}
                </p>
              )}
            </div>
            <CheckCircle className="text-white/80 w-6 h-6 lg:w-8 lg:h-8" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-4 lg:p-6 border border-white/20 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">{t.pendingTasks}</p>
              {statsLoading ? (
                <div className="animate-pulse bg-white/20 h-6 w-12 rounded"></div>
              ) : (
                <p className="text-xl lg:text-2xl font-bold text-white">
                  {statsError ? '—' : dashboardStats.pendingTasks}
                </p>
              )}
            </div>
            <AlertCircle className="text-white/80 w-6 h-6 lg:w-8 lg:h-8" />
          </div>
        </div>
      </div>

      {/* Refresh Button and Last Updated */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshDashboard}
            disabled={statsLoading}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {lastUpdated && (
            <span className="text-xs text-slate-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        {statsError && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg">
            {statsError}
          </div>
        )}
      </div>

      {/* Welcome Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 lg:p-8 text-center max-w-4xl mx-auto w-full">
        <h2 className="text-lg lg:text-xl font-bold text-white mb-2">{t.welcomeToPolicePortal}</h2>
        <p className="text-sm lg:text-base text-white/80 mb-4 lg:mb-6">
          {t.accountVerified}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 text-left">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 border border-white/20">
            <p className="text-xs text-white/60">{t.officer}</p>
            <p className="font-medium text-white text-sm lg:text-base">{profile?.name || '—'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 border border-white/20">
            <p className="text-xs text-white/60">{t.badgeStation}</p>
            <p className="font-medium text-white text-sm lg:text-base">{profile?.badge_number || '—'}{profile?.station ? ` · ${profile.station}` : ''}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 sm:col-span-2 lg:col-span-1 border border-white/20">
            <p className="text-xs text-white/60">{t.today}</p>
            <p className="font-medium text-white text-sm lg:text-base">{new Date().toLocaleDateString()} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>
    </div>
  )

  if (!isVerified) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-white/85 backdrop-blur-lg shadow-sm border-b border-blue-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center">
                <Shield className="text-white w-5 h-5" />
              </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">{t.policePortal}</h1>
              <p className="text-xs text-slate-600">{t.officerDashboard}</p>
            </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="font-semibold text-slate-800 text-sm">{profile?.name}</p>
                <div className="flex items-center justify-end">
                  <div className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {t.pendingVerification}
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
              <h1 className="text-2xl font-bold text-slate-800 mb-4">{t.accountUnderReview}</h1>
              <p className="text-slate-600 mb-8 text-lg">
                {t.accountReviewText}
              </p>
              
              {/* Profile Summary */}
              <div className="bg-slate-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-slate-800 mb-4">{t.registrationDetails}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm text-slate-600">{t.name}</p>
                    <p className="font-medium text-slate-800">{profile?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{t.email}</p>
                    <p className="font-medium text-slate-800">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{t.badgeNumber}</p>
                    <p className="font-medium text-slate-800">{profile?.badge_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{t.station}</p>
                    <p className="font-medium text-slate-800">{profile?.station}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>{t.whatHappensNext}</strong><br />
                  {t.nextStepsText}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Fixed Left Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-xl shadow-lg border-r border-white/20 z-40 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{t.policePortal}</h1>
              <p className="text-xs text-white/70">{t.officerDashboard}</p>
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
                    ? 'bg-white/20 text-white shadow-sm scale-[1.02]'
                    : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-[1.02]'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{profile?.name}</p>
              <div className="flex items-center">
                <div className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full text-xs font-medium flex items-center border border-green-400/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t.verified}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-red-500/20 text-red-300 p-2 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-2 border border-red-400/30"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">{t.logout}</span>
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
        <header className="bg-white/10 backdrop-blur-xl shadow-sm border-b border-white/20 sticky top-0 z-20">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-lg font-semibold text-white">{t.welcomeToPolicePortal}</h2>
            </div>
            <div className="hidden sm:flex items-center space-x-4 text-sm text-white/80">
              <span>{new Date().toLocaleDateString()}</span>
              <span>•</span>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-xs font-medium text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none pr-8"
                >
                  {languageOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.native}
                    </option>
                  ))}
                </select>
                <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/60 pointer-events-none" />
              </div>
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
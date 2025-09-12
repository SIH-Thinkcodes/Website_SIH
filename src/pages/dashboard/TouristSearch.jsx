import { Search } from 'lucide-react'

const TouristSearch = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
        <Search className="text-blue-600 w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Tourist Search</h1>
      <p className="text-slate-600 text-lg mb-8 max-w-md">
        Advanced search and verification system for tourist information and documentation.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4">
        <p className="text-blue-800 font-semibold">Coming Soon</p>
        <p className="text-blue-700 text-sm mt-1">This feature is currently under development</p>
      </div>
    </div>
  )
}

export default TouristSearch
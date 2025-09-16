import { Users } from 'lucide-react'

const MissingPersons = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-orange-500/20 w-24 h-24 rounded-full flex items-center justify-center mb-6 border border-orange-400/30">
        <Users className="text-orange-300 w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">Missing Persons Registry</h1>
      <p className="text-white/80 text-lg mb-8 max-w-md">
        Comprehensive database and tracking system for missing persons cases and inactive citizen reports.
      </p>
      <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg px-6 py-4 backdrop-blur-md">
        <p className="text-orange-300 font-semibold">Coming Soon</p>
        <p className="text-orange-200 text-sm mt-1">This feature is currently under development</p>
      </div>
    </div>
  )
}

export default MissingPersons
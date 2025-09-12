import { Phone } from 'lucide-react'

const EmergencyDispatch = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
        <Phone className="text-red-600 w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Emergency Dispatch</h1>
      <p className="text-slate-600 text-lg mb-8 max-w-md">
        Real-time emergency response coordination and dispatch management system.
      </p>
      <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-4">
        <p className="text-red-800 font-semibold">Coming Soon</p>
        <p className="text-red-700 text-sm mt-1">This feature is currently under development</p>
      </div>
    </div>
  )
}

export default EmergencyDispatch
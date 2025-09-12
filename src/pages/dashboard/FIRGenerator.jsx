import { FileText } from 'lucide-react'

const FIRGenerator = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
        <FileText className="text-green-600 w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-4">E-FIR Generator</h1>
      <p className="text-slate-600 text-lg mb-8 max-w-md">
        Digital First Information Report generation and management system for streamlined case filing.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4">
        <p className="text-green-800 font-semibold">Coming Soon</p>
        <p className="text-green-700 text-sm mt-1">This feature is currently under development</p>
      </div>
    </div>
  )
}

export default FIRGenerator
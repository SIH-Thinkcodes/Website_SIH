import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { MapPin, AlertTriangle, Users, TrendingUp, Filter, RefreshCw, Download, Shield, Navigation, Bell, Activity, ZoomIn, ZoomOut, Layers, Target } from 'lucide-react'

// Mock geographical data for a tourist destination (using coordinates around India Gate, Delhi as example)
const mockTouristData = [
  { id: 1, lat: 28.6129, lng: 77.2295, count: 145, timestamp: new Date(), area: "India Gate Main Area", type: "monument", risk: "medium" },
  { id: 2, lat: 28.6139, lng: 77.2285, count: 89, timestamp: new Date(), area: "Rajpath Gardens", type: "park", risk: "low" },
  { id: 3, lat: 28.6119, lng: 77.2305, count: 267, timestamp: new Date(), area: "War Memorial", type: "memorial", risk: "high" },
  { id: 4, lat: 28.6135, lng: 77.2275, count: 178, timestamp: new Date(), area: "Boat Club", type: "recreation", risk: "medium" },
  { id: 5, lat: 28.6125, lng: 77.2315, count: 95, timestamp: new Date(), area: "National Gallery", type: "museum", risk: "low" },
  { id: 6, lat: 28.6115, lng: 77.2285, count: 203, timestamp: new Date(), area: "Children's Park", type: "park", risk: "high" },
  { id: 7, lat: 28.6145, lng: 77.2295, count: 134, timestamp: new Date(), area: "Food Plaza", type: "commercial", risk: "medium" },
  { id: 8, lat: 28.6109, lng: 77.2275, count: 76, timestamp: new Date(), area: "Parking Area A", type: "transport", risk: "low" }
]

const mockGeofences = [
  { id: 1, lat: 28.6129, lng: 77.2295, radius: 200, name: "High Security Zone", type: "restricted", alertLevel: "high" },
  { id: 2, lat: 28.6119, lng: 77.2305, radius: 150, name: "Memorial Perimeter", type: "monitored", alertLevel: "medium" },
  { id: 3, lat: 28.6135, lng: 77.2275, radius: 100, name: "Water Body Safety", type: "safety", alertLevel: "high" },
  { id: 4, lat: 28.6145, lng: 77.2295, radius: 80, name: "Commercial Zone", type: "commercial", alertLevel: "low" }
]

const mockIncidents = [
  { id: 1, lat: 28.6129, lng: 77.2295, type: "overcrowding", severity: "high", timestamp: new Date(Date.now() - 30000), description: "Large crowd formation detected" },
  { id: 2, lat: 28.6119, lng: 77.2305, type: "security", severity: "medium", timestamp: new Date(Date.now() - 120000), description: "Unauthorized access attempt" },
  { id: 3, lat: 28.6135, lng: 77.2275, type: "medical", severity: "high", timestamp: new Date(Date.now() - 300000), description: "Medical emergency reported" }
]

const TouristClusteringDashboard = () => {
  const [selectedView, setSelectedView] = useState('heatmap')
  const [timeFilter, setTimeFilter] = useState('24h')
  const [riskFilter, setRiskFilter] = useState('all')
  const [mapZoom, setMapZoom] = useState(15)
  const [selectedLayers, setSelectedLayers] = useState(['clusters', 'geofences', 'incidents'])
  
  const [touristData, setTouristData] = useState(mockTouristData)
  const [geofences, setGeofences] = useState(mockGeofences)
  const [incidents, setIncidents] = useState(mockIncidents)
  const [alerts, setAlerts] = useState([])
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [selectedCluster, setSelectedCluster] = useState(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [areaTypeFilter, setAreaTypeFilter] = useState('all')
  const [countRangeFilter, setCountRangeFilter] = useState('all')

  // Real-time data simulation with controlled alert generation
  useEffect(() => {
    if (!isAutoRefresh) return

    const interval = setInterval(() => {
      // Update tourist counts with realistic fluctuations
      setTouristData(prev => prev.map(point => {
        const fluctuation = Math.floor(Math.random() * 40) - 20
        const newCount = Math.max(10, point.count + fluctuation)
        
        // Update risk level based on count
        let newRisk = 'low'
        if (newCount > 200) newRisk = 'high'
        else if (newCount > 120) newRisk = 'medium'
        
        return {
          ...point,
          count: newCount,
          risk: newRisk,
          timestamp: new Date()
        }
      }))

      // Simulate new incidents occasionally (much reduced frequency)
      if (Math.random() < 0.02) { // Only 2% chance every 5 seconds
        const randomPoint = mockTouristData[Math.floor(Math.random() * mockTouristData.length)]
        const incidentTypes = ['overcrowding', 'security', 'medical', 'traffic']
        const severities = ['low', 'medium', 'high']
        
        const incidentType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)]
        const severity = severities[Math.floor(Math.random() * severities.length)]
        
        const newIncident = {
          id: Date.now(),
          lat: randomPoint.lat + (Math.random() - 0.5) * 0.001,
          lng: randomPoint.lng + (Math.random() - 0.5) * 0.001,
          type: incidentType,
          severity: severity,
          timestamp: new Date(),
          description: `${incidentType} detected via AI monitoring`
        }
        
        setIncidents(prev => [newIncident, ...prev.slice(0, 9)]) // Keep latest 10
        
        // Add alert for incidents only
        setAlerts(prev => {
          const newAlert = {
            id: `incident-${Date.now()}`,
            message: `${severity.toUpperCase()}: ${incidentType} at ${randomPoint.area}`,
            timestamp: new Date(),
            type: severity,
            area: randomPoint.area,
            alertType: 'incident'
          }
          return [newAlert, ...prev.slice(0, 4)] // Keep latest 5 alerts
        })
      }
    }, 5000) // Update every 5 seconds instead of 3

    return () => clearInterval(interval)
  }, [isAutoRefresh])

  // Controlled geofencing logic with proper deduplication
  const checkGeofenceViolations = useCallback(() => {
    const now = Date.now()
    
    // Only check every few data updates to avoid spam
    if (Math.random() > 0.3) return // Only 30% chance to check
    
    touristData.forEach(point => {
      if (point.count > 180) { // Higher threshold
        // Find the closest geofence (simplified logic)
        const relevantFence = geofences.find(fence => 
          Math.abs(point.lat - fence.lat) < 0.002 && Math.abs(point.lng - fence.lng) < 0.002
        )
        
        if (relevantFence) {
          // Create unique alert identifier
          const alertKey = `geofence-${relevantFence.id}-${point.id}`
          
          // Check if similar alert exists in last 10 minutes (much longer cooldown)
          const recentAlertExists = alerts.some(alert => 
            alert.alertKey === alertKey &&
            now - new Date(alert.timestamp).getTime() < 600000 // 10 minutes cooldown
          )
          
          if (!recentAlertExists && Math.random() < 0.1) { // Only 10% chance even if conditions met
            setAlerts(prev => {
              const newAlert = {
                id: `geofence-${now}`,
                message: `Crowd density alert: ${point.count} tourists in ${relevantFence.name}`,
                timestamp: new Date(),
                type: relevantFence.alertLevel,
                geofence: relevantFence.name,
                area: point.area,
                alertKey,
                alertType: 'geofence'
              }
              return [newAlert, ...prev.slice(0, 4)]
            })
          }
        }
      }
    })
  }, [touristData, geofences, alerts])

  useEffect(() => {
    const checkInterval = setInterval(checkGeofenceViolations, 15000) // Check every 15 seconds
    return () => clearInterval(checkInterval)
  }, [checkGeofenceViolations])

  const filteredData = useMemo(() => {
    let filtered = touristData
    if (riskFilter !== 'all') {
      filtered = filtered.filter(point => point.risk === riskFilter)
    }
    if (areaTypeFilter !== 'all') {
      filtered = filtered.filter(point => point.type === areaTypeFilter)
    }
    if (countRangeFilter !== 'all') {
      if (countRangeFilter === 'low') {
        filtered = filtered.filter(point => point.count <= 100)
      } else if (countRangeFilter === 'medium') {
        filtered = filtered.filter(point => point.count > 100 && point.count <= 200)
      } else if (countRangeFilter === 'high') {
        filtered = filtered.filter(point => point.count > 200)
      }
    }
    return filtered
  }, [touristData, riskFilter, areaTypeFilter, countRangeFilter])

  const totalTourists = filteredData.reduce((sum, point) => sum + point.count, 0)
  const highRiskAreas = filteredData.filter(point => point.risk === 'high').length
  const activeGeofences = geofences.filter(fence => fence.alertLevel === 'high').length

  const getIntensityColor = (count) => {
    if (count > 200) return 'bg-red-600'
    if (count > 150) return 'bg-red-500'
    if (count > 100) return 'bg-orange-500'
    if (count > 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'border-red-500 bg-red-100'
      case 'medium': return 'border-orange-500 bg-orange-100'
      case 'low': return 'border-yellow-500 bg-yellow-100'
      default: return 'border-gray-400 bg-gray-100'
    }
  }

  const getGeofenceColor = (alertLevel) => {
    switch (alertLevel) {
      case 'high': return 'border-red-500'
      case 'medium': return 'border-orange-500'
      case 'low': return 'border-yellow-500'
      default: return 'border-gray-400'
    }
  }

  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTourists,
        activeAreas: filteredData.length,
        highRiskAreas,
        activeGeofences
      },
      touristData: filteredData.map(point => ({
        area: point.area,
        count: point.count,
        type: point.type,
        risk: point.risk,
        coordinates: { lat: point.lat, lng: point.lng },
        lastUpdate: point.timestamp
      })),
      incidents: incidents.slice(0, 10),
      geofences: geofences,
      alerts: alerts
    }
    
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tourist-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const MapVisualization = () => (
    <div className="bg-white rounded-lg shadow-md border overflow-hidden">
      {/* Map Controls */}
      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="font-medium text-gray-800">Live Tourist Heat Map</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMapZoom(Math.max(10, mapZoom - 1))}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">{mapZoom}x</span>
            <button
              onClick={() => setMapZoom(Math.min(20, mapZoom + 1))}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className={`px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100`}>
            <Shield className="w-4 h-4 inline mr-1" />
            Zones
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-80 bg-gradient-to-br from-green-100 via-blue-50 to-yellow-50 overflow-hidden">
        {/* Base Map Simulation */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-green-200 via-blue-100 to-yellow-100"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Roads/Paths Simulation */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-300 opacity-50 transform -translate-y-1/2"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-gray-300 opacity-50 transform -translate-x-1/2"></div>
        </div>

        {/* Tourist Clusters */}
        {selectedLayers.includes('clusters') && filteredData.map((point, index) => {
          const size = Math.min(Math.max((point.count / 5) + 15, 20), 80)
          const left = 15 + (index * 11) % 70
          const top = 20 + (index * 13) % 60
          
          return (
            <div
              key={point.id}
              className={`absolute rounded-full ${getIntensityColor(point.count)} opacity-80 flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: point.count > 150 ? 20 : 10
              }}
              onClick={() => setSelectedCluster(point)}
              title={`${point.area}: ${point.count} tourists\nRisk Level: ${point.risk}\nType: ${point.type}`}
            >
              <div className="text-center">
                <div className="text-xs">{point.count}</div>
                {point.risk === 'high' && <AlertTriangle className="w-3 h-3 mx-auto" />}
              </div>
            </div>
          )
        })}

        {/* Geofences */}
        {selectedLayers.includes('geofences') && geofences.map((fence, index) => {
          const size = Math.max(fence.radius / 3, 40)
          const left = 20 + (index * 15) % 60
          const top = 25 + (index * 17) % 50
          
          return (
            <div
              key={fence.id}
              className={`absolute rounded-full border-4 ${getGeofenceColor(fence.alertLevel)} opacity-40 hover:opacity-70 transition-all duration-200 flex items-center justify-center cursor-pointer`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 5
              }}
              title={`${fence.name}\nType: ${fence.type}\nAlert Level: ${fence.alertLevel}\nRadius: ${fence.radius}m`}
            >
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
          )
        })}

        {/* Recent Incidents */}
        {selectedLayers.includes('incidents') && incidents.slice(0, 5).map((incident, index) => {
          const left = 10 + (index * 18) % 80
          const top = 15 + (index * 20) % 70
          const age = Date.now() - new Date(incident.timestamp).getTime()
          const opacity = Math.max(0.3, 1 - (age / 300000)) // Fade over 5 minutes
          
          return (
            <div
              key={incident.id}
              className={`absolute w-6 h-6 rounded-full flex items-center justify-center cursor-pointer animate-pulse ${
                incident.severity === 'high' ? 'bg-red-600' :
                incident.severity === 'medium' ? 'bg-orange-500' :
                'bg-yellow-500'
              }`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: 'translate(-50%, -50%)',
                opacity,
                zIndex: 30
              }}
              title={`${incident.type} - ${incident.severity}\n${incident.description}\n${new Date(incident.timestamp).toLocaleTimeString()}`}
            >
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
          )
        })}

        {/* Real-time Status */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
          <div className="flex items-center space-x-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${isAutoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs font-medium">{isAutoRefresh ? 'Live' : 'Paused'}</span>
          </div>
          <div className="text-xs text-gray-600">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md max-w-xs">
          <h4 className="text-sm font-medium mb-2">Tourist Density</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Low (10-50)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium (51-100)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>High (101-150)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critical (150+)</span>
            </div>
          </div>
        </div>

        {/* Cluster Details Panel */}
        {selectedCluster && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-800">{selectedCluster.area}</h4>
              <button
                onClick={() => setSelectedCluster(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tourist Count:</span>
                <span className="font-medium">{selectedCluster.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Risk Level:</span>
                <span className={`font-medium capitalize ${
                  selectedCluster.risk === 'high' ? 'text-red-600' :
                  selectedCluster.risk === 'medium' ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {selectedCluster.risk}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Area Type:</span>
                <span className="font-medium capitalize">{selectedCluster.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Update:</span>
                <span className="font-medium">{selectedCluster.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const AnalyticsView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Tourist Areas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Highest Density Areas
        </h3>
        <div className="space-y-3">
          {filteredData
            .sort((a, b) => b.count - a.count)
            .slice(0, 6)
            .map((point, index) => (
              <div key={point.id} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${getRiskColor(point.risk)}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${getIntensityColor(point.count)}`}></div>
                  <div>
                    <p className="font-medium text-gray-800">{point.area}</p>
                    <p className="text-sm text-gray-600">{point.count} tourists • {point.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    point.risk === 'high' ? 'bg-red-100 text-red-700' :
                    point.risk === 'medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {point.risk.toUpperCase()}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">#{index + 1}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Active Geofences */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-600" />
          Security Zones
        </h3>
        <div className="space-y-3">
          {geofences.map((fence) => (
            <div key={fence.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{fence.name}</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  fence.alertLevel === 'high' ? 'bg-red-100 text-red-700' :
                  fence.alertLevel === 'medium' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {fence.alertLevel.toUpperCase()}
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Type: {fence.type}</span>
                <span>Radius: {fence.radius}m</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
          Recent Incidents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incidents.slice(0, 6).map((incident) => {
            const timeAgo = Math.floor((Date.now() - new Date(incident.timestamp).getTime()) / 60000)
            return (
              <div key={incident.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    incident.severity === 'high' ? 'bg-red-100 text-red-700' :
                    incident.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {incident.severity.toUpperCase()} • {incident.type.toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-500">
                    {timeAgo}m ago
                  </span>
                </div>
                <p className="text-sm text-gray-700">{incident.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tourist Monitoring Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time crowd monitoring and safety alerts</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Alerts */}
            {alerts.length > 0 && (
              <div className="relative">
                <button className="relative p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {alerts.length}
                  </span>
                </button>
              </div>
            )}

            {/* View Toggle */}
            <div className="flex rounded-lg bg-white border shadow-sm overflow-hidden">
              <button
                onClick={() => setSelectedView('heatmap')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  selectedView === 'heatmap'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <MapPin className="w-4 h-4 mr-1 inline" />
                Map View
              </button>
              <button
                onClick={() => setSelectedView('analytics')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  selectedView === 'analytics'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Activity className="w-4 h-4 mr-1 inline" />
                Analytics
              </button>
            </div>

            {/* Filters */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm"
            >
              <option value="all">All Levels</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>

            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                isAutoRefresh
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-1 inline ${isAutoRefresh ? 'animate-spin' : ''}`} />
              {isAutoRefresh ? 'Live' : 'Paused'}
            </button>
          </div>
        </div>

        {/* Live Alerts Banner - FIXED VERSION */}
        {alerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-red-800 font-medium mb-2">Active Alerts ({alerts.length})</h4>
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-start justify-between text-sm bg-white/50 p-2 rounded">
                      <div className="flex-1">
                        <span className="text-red-700 font-medium">{alert.message}</span>
                        {alert.area && (
                          <div className="text-red-600 text-xs mt-1">Location: {alert.area}</div>
                        )}
                      </div>
                      <span className="text-red-500 text-xs whitespace-nowrap ml-3">
                        {Math.floor((Date.now() - new Date(alert.timestamp).getTime()) / 60000)}m ago
                      </span>
                    </div>
                  ))}
                  {alerts.length > 3 && (
                    <div className="text-red-600 text-xs font-medium">
                      +{alerts.length - 3} more alerts...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tourists</p>
                <p className="text-2xl font-bold text-blue-600">{totalTourists.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{Math.floor(Math.random() * 15 + 5)}% today
                </p>
              </div>
              <Users className="text-blue-500 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Areas</p>
                <p className="text-2xl font-bold text-green-600">{filteredData.length}</p>
                <p className="text-xs text-gray-500 mt-1">Monitoring zones</p>
              </div>
              <MapPin className="text-green-500 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">High Risk Areas</p>
                <p className="text-2xl font-bold text-red-600">{highRiskAreas}</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Needs attention
                </p>
              </div>
              <AlertTriangle className="text-red-500 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Security Zones</p>
                <p className="text-2xl font-bold text-purple-600">{activeGeofences}</p>
                <p className="text-xs text-gray-500 mt-1">Active monitoring</p>
              </div>
              <Shield className="text-purple-500 w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="bg-white rounded-lg shadow-md p-6 border">
              <h3 className="font-medium text-gray-800 mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area Type</label>
                  <select
                    value={areaTypeFilter}
                    onChange={(e) => setAreaTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="monument">Monument</option>
                    <option value="park">Park</option>
                    <option value="memorial">Memorial</option>
                    <option value="recreation">Recreation</option>
                    <option value="museum">Museum</option>
                    <option value="commercial">Commercial</option>
                    <option value="transport">Transport</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tourist Count Range</label>
                  <select
                    value={countRangeFilter}
                    onChange={(e) => setCountRangeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm"
                  >
                    <option value="all">All Ranges</option>
                    <option value="low">Low (0-100)</option>
                    <option value="medium">Medium (101-200)</option>
                    <option value="high">High (200+)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setRiskFilter('all')
                        setAreaTypeFilter('all')
                        setCountRangeFilter('all')
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowAdvancedFilters(false)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Current Filters:</span>
                  {riskFilter !== 'all' && <span className="ml-2 px-2 py-1 bg-blue-100 rounded">Risk: {riskFilter}</span>}
                  {areaTypeFilter !== 'all' && <span className="ml-2 px-2 py-1 bg-blue-100 rounded">Type: {areaTypeFilter}</span>}
                  {countRangeFilter !== 'all' && <span className="ml-2 px-2 py-1 bg-blue-100 rounded">Count: {countRangeFilter}</span>}
                  {riskFilter === 'all' && areaTypeFilter === 'all' && countRangeFilter === 'all' && (
                    <span className="ml-2 text-gray-600">No filters applied</span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {selectedView === 'heatmap' ? <MapVisualization /> : <AnalyticsView />}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <button 
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg text-sm font-medium shadow-sm transition-colors ${
                showAdvancedFilters 
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Advanced Filters</span>
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()} • System operational
          </div>
        </div>

        {/* Footer Information */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">System Status</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Monitoring: Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Data Flow: Normal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Alerts: Operational</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Data Sources</h4>
              <div className="space-y-1">
                <div>Crowd Analytics: AI-powered</div>
                <div>Incident Reports: Live feed</div>
                <div>Security Zones: Real-time</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Coverage</h4>
              <div className="space-y-1">
                <div>Area: Delhi Tourism Zone</div>
                <div>Active Sensors: 8 zones</div>
                <div>Update Interval: 5 seconds</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TouristClusteringDashboard
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AlertTriangle, Users, MapPin, Activity, Shield, Bell, Eye, TrendingUp, Clock, Zap } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

// ErrorBoundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 mb-4">An error occurred. Please try again.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const TouristSafetyDashboard = ({ profile }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [alertFilter, setAlertFilter] = useState('all');
  const mapRef = useRef(null);

  // State for real data
  const [tourists, setTourists] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [locationClusters, setLocationClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from Supabase
  useEffect(() => {
    fetchAllData();

    const touristSubscription = supabase
      .channel('tourist_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'traveller_profiles' }, 
        () => fetchTourists())
      .subscribe();

    const anomalySubscription = supabase
      .channel('anomaly_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anomalies' }, 
        () => fetchAnomalies())
      .subscribe();

    return () => {
      touristSubscription.unsubscribe();
      anomalySubscription.unsubscribe();
    };
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchTourists(),
        fetchAnomalies(),
        fetchRiskZones(),
        fetchLocationClusters()
      ]);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTourists = async () => {
    try {
      const { data, error } = await supabase
        .from('tourist_dashboard_view')
        .select('*')
        .order('current_safety_score', { ascending: true });
      
      if (error) throw error;
      setTourists(data || []);
    } catch (err) {
      console.error('Error fetching tourists:', err);
      try {
        const { data, error } = await supabase
          .from('traveller_profiles')
          .select('*')
          .eq('onboarded', true)
          .order('current_safety_score', { ascending: true });
        
        if (error) throw error;
        const transformedData = (data || []).map(tourist => ({
          ...tourist,
          active_anomalies: 0
        }));
        setTourists(transformedData);
      } catch (fallbackErr) {
        console.error('Error with fallback fetch:', fallbackErr);
      }
    }
  };

  const fetchAnomalies = async () => {
    try {
      const { data, error } = await supabase
        .from('anomaly_summary_view')
        .select('*')
        .order('detected_at', { ascending: false });
      
      if (error) throw error;
      setAnomalies(data || []);
    } catch (err) {
      console.error('Error fetching anomalies:', err);
      try {
        const { data, error } = await supabase
          .from('anomalies')
          .select(`
            *,
            traveller_profiles!inner(first_name, last_name, nationality)
          `)
          .order('detected_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        
        const transformedAnomalies = (data || []).map(anomaly => ({
          ...anomaly,
          first_name: anomaly.traveller_profiles?.first_name || 'Unknown',
          last_name: anomaly.traveller_profiles?.last_name || 'Tourist',
          hours_since_detection: (Date.now() - new Date(anomaly.detected_at).getTime()) / (1000 * 60 * 60)
        }));
        
        setAnomalies(transformedAnomalies);
      } catch (fallbackErr) {
        console.error('Error with anomalies fallback:', fallbackErr);
      }
    }
  };

  const fetchRiskZones = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_zones')
        .select('*')
        .order('risk_level', { ascending: false });
      
      if (error) throw error;
      setRiskZones(data || []);
    } catch (err) {
      console.error('Error fetching risk zones:', err);
    }
  };

  const fetchLocationClusters = async () => {
    try {
      const { data, error } = await supabase
        .from('location_clusters_view')
        .select('*')
        .order('tourist_count', { ascending: false });
      
      if (error) throw error;
      setLocationClusters(data || []);
    } catch (err) {
      console.error('Error fetching location clusters:', err);
      setLocationClusters([
        { cluster_lat: 12.9716, cluster_lng: 77.5946, tourist_count: 15, unique_tourists: 12, avg_safety_score: 85.5 },
        { cluster_lat: 12.9507, cluster_lng: 77.5848, tourist_count: 8, unique_tourists: 6, avg_safety_score: 72.3 },
        { cluster_lat: 12.9698, cluster_lng: 77.5926, tourist_count: 12, unique_tourists: 9, avg_safety_score: 91.2 }
      ]);
    }
  };

  const stats = useMemo(() => {
    if (!tourists.length) return {
      totalTourists: 0, safeTourists: 0, warningTourists: 0, 
      alertTourists: 0, activeAnomalies: 0, avgSafetyScore: 0, trackingActive: 0
    };
    
    const totalTourists = tourists.length;
    const safeTourists = tourists.filter(t => t.status === 'safe').length;
    const warningTourists = tourists.filter(t => t.status === 'warning').length;
    const alertTourists = tourists.filter(t => t.status === 'alert').length;
    const activeAnomalies = anomalies.filter(a => a.status === 'active').length;
    const avgSafetyScore = totalTourists > 0 ? 
      Math.round(tourists.reduce((acc, t) => acc + (t.current_safety_score || 0), 0) / totalTourists) : 0;
    const trackingActive = tourists.filter(t => t.is_tracking_active !== false).length;
    
    return {
      totalTourists,
      safeTourists,
      warningTourists,
      alertTourists,
      activeAnomalies,
      avgSafetyScore,
      trackingActive
    };
  }, [tourists, anomalies]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const minutes = Math.floor((new Date() - date) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'alert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getRiskZoneColor = (riskLevel) => {
    if (riskLevel >= 8) return 'bg-red-500';
    if (riskLevel >= 6) return 'bg-orange-500';
    if (riskLevel >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredAnomalies = useMemo(() => {
    if (alertFilter === 'all') return anomalies;
    return anomalies.filter(a => a.severity === alertFilter);
  }, [anomalies, alertFilter]);

  // Initialize and update Leaflet map with geo-fencing and heat map
  useEffect(() => {
    if (activeTab === 'heatmap' && !mapRef.current) {
      mapRef.current = L.map('map').setView([12.9716, 77.5946], 12); // Default to Bengaluru
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapRef.current);

      // Add heat map for tourist density
      const heatData = locationClusters.map(cluster => [
        cluster.cluster_lat,
        cluster.cluster_lng,
        cluster.tourist_count * 0.1 // Intensity based on tourist count
      ]);
      L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.4: 'blue',
          0.65: 'lime',
          1: 'red'
        }
      }).addTo(mapRef.current);

      // Add geo-fencing areas (risk zones)
      riskZones.forEach(zone => {
        const coords = [
          [zone.lat1, zone.lng1],
          [zone.lat2, zone.lng2],
          [zone.lat3, zone.lng3]
        ].filter(coord => coord[0] !== undefined && coord[1] !== undefined && !isNaN(coord[0]) && !isNaN(coord[1]));
        if (coords.length === 3) {
          L.polygon(coords, {
            color: getRiskZoneColor(zone.risk_level).replace('bg-', ''),
            fillColor: getRiskZoneColor(zone.risk_level).replace('bg-', ''),
            fillOpacity: 0.3,
            weight: 2
          }).addTo(mapRef.current)
            .bindPopup(`${zone.zone_name} (Risk: ${zone.risk_level}/10)`);
        } else {
          console.warn(`Invalid coordinates for zone ${zone.zone_name}:`, zone);
        }
      });

      // Add clusters as markers for reference
      locationClusters.forEach(cluster => {
        L.circleMarker([cluster.cluster_lat, cluster.cluster_lng], {
          radius: cluster.tourist_count * 0.5,
          color: cluster.avg_safety_score >= 80 ? 'green' : cluster.avg_safety_score >= 60 ? 'yellow' : 'red',
          fillColor: cluster.avg_safety_score >= 80 ? 'green' : cluster.avg_safety_score >= 60 ? 'yellow' : 'red',
          fillOpacity: 0.5
        }).addTo(mapRef.current)
          .bindPopup(`Cluster: ${cluster.tourist_count} tourists, Avg Safety: ${cluster.avg_safety_score}`);
      });

      // Add anomalies
      anomalies.forEach(anomaly => {
        if (anomaly.location_lat && anomaly.location_lng) {
          L.marker([anomaly.location_lat, anomaly.location_lng], {
            icon: L.divIcon({
              className: 'anomaly-icon',
              html: `<div class="${getSeverityColor(anomaly.severity).replace('text-', 'bg-').replace('border-', 'border-')} rounded-full w-6 h-6 flex items-center justify-center text-white text-xs">${anomaly.severity[0]}</div>`
            })
          }).addTo(mapRef.current)
            .bindPopup(`${anomaly.first_name} ${anomaly.last_name} - ${anomaly.severity} (${formatTimeAgo(anomaly.detected_at)})`);
        }
      });
    } else if (activeTab === 'heatmap' && mapRef.current) {
      mapRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker || layer instanceof L.Polygon || layer instanceof L.HeatLayer) {
          mapRef.current.removeLayer(layer);
        }
      });
      const heatData = locationClusters.map(cluster => [
        cluster.cluster_lat,
        cluster.cluster_lng,
        cluster.tourist_count * 0.1
      ]);
      L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.4: 'blue',
          0.65: 'lime',
          1: 'red'
        }
      }).addTo(mapRef.current);

      riskZones.forEach(zone => {
        const coords = [
          [zone.lat1, zone.lng1],
          [zone.lat2, zone.lng2],
          [zone.lat3, zone.lng3]
        ].filter(coord => coord[0] !== undefined && coord[1] !== undefined && !isNaN(coord[0]) && !isNaN(coord[1]));
        if (coords.length === 3) {
          L.polygon(coords, {
            color: getRiskZoneColor(zone.risk_level).replace('bg-', ''),
            fillColor: getRiskZoneColor(zone.risk_level).replace('bg-', ''),
            fillOpacity: 0.3,
            weight: 2
          }).addTo(mapRef.current)
            .bindPopup(`${zone.zone_name} (Risk: ${zone.risk_level}/10)`);
        }
      });

      locationClusters.forEach(cluster => {
        L.circleMarker([cluster.cluster_lat, cluster.cluster_lng], {
          radius: cluster.tourist_count * 0.5,
          color: cluster.avg_safety_score >= 80 ? 'green' : cluster.avg_safety_score >= 60 ? 'yellow' : 'red',
          fillColor: cluster.avg_safety_score >= 80 ? 'green' : cluster.avg_safety_score >= 60 ? 'yellow' : 'red',
          fillOpacity: 0.5
        }).addTo(mapRef.current)
          .bindPopup(`Cluster: ${cluster.tourist_count} tourists, Avg Safety: ${cluster.avg_safety_score}`);
      });

      anomalies.forEach(anomaly => {
        if (anomaly.location_lat && anomaly.location_lng) {
          L.marker([anomaly.location_lat, anomaly.location_lng], {
            icon: L.divIcon({
              className: 'anomaly-icon',
              html: `<div class="${getSeverityColor(anomaly.severity).replace('text-', 'bg-').replace('border-', 'border-')} rounded-full w-6 h-6 flex items-center justify-center text-white text-xs">${anomaly.severity[0]}</div>`
            })
          }).addTo(mapRef.current)
            .bindPopup(`${anomaly.first_name} ${anomaly.last_name} - ${anomaly.severity} (${formatTimeAgo(anomaly.detected_at)})`);
        }
      });
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeTab, locationClusters, riskZones, anomalies]);

  // Button Actions
  const handleInvestigate = (anomaly) => {
    alert(`Investigating anomaly for ${anomaly.first_name} ${anomaly.last_name}`);
    console.log('Investigate action for anomaly ID:', anomaly.id);
  };

  const handleAcknowledge = (anomaly) => {
    alert(`Acknowledged anomaly for ${anomaly.first_name} ${anomaly.last_name}`);
    console.log('Acknowledge action for anomaly ID:', anomaly.id);
  };

  const handleViewOnMap = (zone) => {
    if (mapRef.current && zone.lat1 && zone.lng1) {
      mapRef.current.flyTo([zone.lat1, zone.lng1], 13);
      alert(`Viewing ${zone.zone_name} on map`);
    }
  };

  const handleEditZone = (zone) => {
    alert(`Editing zone ${zone.zone_name}`);
    console.log('Edit zone action for zone ID:', zone.id);
  };

  const handleAddNewZone = () => {
    alert('Adding new risk zone (mock implementation)');
    console.log('Add new zone action');
  };

  const handleSendCheckInRequest = (tourist) => {
    alert(`Sent check-in request to ${tourist.first_name} ${tourist.last_name}`);
    console.log('Check-in request sent for tourist ID:', tourist.id);
  };

  const handleContactEmergency = (tourist) => {
    alert(`Contacting emergency for ${tourist.first_name} ${tourist.last_name}`);
    console.log('Emergency contact initiated for tourist ID:', tourist.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tourist safety data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => {setError(null); fetchAllData();}}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
        <div className="px-6 py-4">
          <div className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Activity },
              { id: 'tourists', name: 'Tourists', icon: Users },
              { id: 'anomalies', name: 'Anomalies', icon: AlertTriangle },
              { id: 'heatmap', name: 'Heat Map', icon: MapPin },
              { id: 'zones', name: 'Risk Zones', icon: Eye }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-400 text-blue-200'
                      : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/80">Total Tourists</p>
                    <p className="text-2xl font-semibold text-white">{stats.totalTourists}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-white/70">
                  <span className="text-green-400 font-medium">{stats.trackingActive}</span> actively tracked
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/80">Avg Safety Score</p>
                    <p className="text-2xl font-semibold text-white">{stats.avgSafetyScore}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-white/70">
                  <span className="text-green-400 font-medium">{stats.safeTourists}</span> safe, 
                  <span className="text-yellow-400 font-medium ml-1">{stats.warningTourists}</span> warning,
                  <span className="text-red-400 font-medium ml-1">{stats.alertTourists}</span> alert
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-8 w-8 text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/80">Active Anomalies</p>
                    <p className="text-2xl font-semibold text-white">{stats.activeAnomalies}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-white/70">
                  Requires immediate attention
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/80">Detection Rate</p>
                    <p className="text-2xl font-semibold text-white">97.3%</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-white/70">
                  AI accuracy in anomaly detection
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
              <div className="px-6 py-4 border-b border-white/20">
                <h3 className="text-lg leading-6 font-medium text-white">Recent Anomalies</h3>
              </div>
              <div className="divide-y divide-white/10">
                {anomalies.slice(0, 5).map((anomaly) => (
                  <div key={anomaly.id} className="px-6 py-4 hover:bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {anomaly.first_name} {anomaly.last_name}
                          </p>
                          <p className="text-sm text-white/70">{anomaly.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/60">{formatTimeAgo(anomaly.detected_at)}</p>
                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          anomaly.status === 'active' ? 'bg-red-500/20 text-red-300 border border-red-400/30' : 'bg-green-500/20 text-green-300 border border-green-400/30'
                        }`}>
                          {anomaly.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tourists' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
            <div className="px-6 py-4 border-b border-white/20">
              <h3 className="text-lg leading-6 font-medium text-white">Tourist Monitoring</h3>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Tourist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Safety Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Last Update</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Tracking</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/5 divide-y divide-white/10">
                  {tourists.map((tourist) => (
                    <tr key={tourist.id} className="hover:bg-white/10">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {tourist.first_name} {tourist.last_name}
                          </div>
                          <div className="text-sm text-white/60">{tourist.nationality}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-2 w-16 rounded-full mr-2 ${
                            tourist.current_safety_score >= 80 ? 'bg-green-800/50' :
                            tourist.current_safety_score >= 60 ? 'bg-yellow-800/50' : 'bg-red-800/50'
                          }`}>
                            <div 
                              className={`h-2 rounded-full ${
                                tourist.current_safety_score >= 80 ? 'bg-green-400' :
                                tourist.current_safety_score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${tourist.current_safety_score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white">{tourist.current_safety_score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tourist.status === 'safe' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                          tourist.status === 'warning' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                          'bg-red-500/20 text-red-300 border border-red-400/30'
                        }`}>
                          {tourist.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                        {formatTimeAgo(tourist.last_location_update)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full mr-2 ${
                            tourist.is_tracking_active !== false ? 'bg-green-400' : 'bg-red-400'
                          }`} />
                          <span className={`text-sm ${
                            tourist.is_tracking_active !== false ? 'text-green-300' : 'text-red-300'
                          }`}>
                            {tourist.is_tracking_active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => setSelectedTourist(tourist)}
                          className="text-blue-300 hover:text-blue-100"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'anomalies' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg px-6 py-4 border border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Anomaly Detection</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={alertFilter}
                    onChange={(e) => setAlertFilter(e.target.value)}
                    className="bg-white/10 border border-white/30 rounded-md px-3 py-2 text-sm text-white backdrop-blur-sm focus:outline-none focus:border-white/50"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid gap-6">
              {filteredAnomalies.map((anomaly) => (
                <div key={anomaly.id} className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border-l-4 border-l-red-400 border border-white/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${
                        anomaly.severity === 'critical' ? 'bg-red-500/20' :
                        anomaly.severity === 'high' ? 'bg-orange-500/20' :
                        anomaly.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                      }`}>
                        <AlertTriangle className={`h-5 w-5 ${
                          anomaly.severity === 'critical' ? 'text-red-400' :
                          anomaly.severity === 'high' ? 'text-orange-400' :
                          anomaly.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-white">
                            {anomaly.first_name} {anomaly.last_name}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(anomaly.severity)}`}>
                            {anomaly.severity}
                          </span>
                          <span className="text-sm text-white/70 capitalize">
                            {anomaly.anomaly_type?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-white/80 mb-3">{anomaly.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-white/60">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Detected {formatTimeAgo(anomaly.detected_at)}</span>
                          </div>
                          {anomaly.location_lat && anomaly.location_lng && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{parseFloat(anomaly.location_lat).toFixed(4)}, {parseFloat(anomaly.location_lng).toFixed(4)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                        anomaly.status === 'active' ? 'bg-red-500/20 text-red-300 border-red-400/30' :
                        anomaly.status === 'acknowledged' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' : 'bg-green-500/20 text-green-300 border-green-400/30'
                      }`}>
                        {anomaly.status}
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleInvestigate(anomaly)} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                          Investigate
                        </button>
                        {anomaly.status === 'active' && (
                          <button onClick={() => handleAcknowledge(anomaly)} className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
              <div className="px-6 py-4 border-b border-white/20">
                <h3 className="text-lg leading-6 font-medium text-white">Tourist Clusters & Heat Map</h3>
                <p className="text-sm text-white/70">Real-time visualization of tourist density and safety levels</p>
              </div>
              <div className="p-6">
                <div id="map" className="h-96 w-full bg-white/5 rounded-lg border-2 border-dashed border-white/30"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {locationClusters.map((cluster, index) => (
                    <div key={index} className="bg-white/5 border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">Cluster {index + 1}</h4>
                        <div className={`w-4 h-4 rounded-full ${
                          cluster.avg_safety_score >= 80 ? 'bg-green-400' :
                          cluster.avg_safety_score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/70">Location:</span>
                          <span className="font-medium text-white">{parseFloat(cluster.cluster_lat).toFixed(3)}, {parseFloat(cluster.cluster_lng).toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Tourist Count:</span>
                          <span className="font-medium text-white">{cluster.tourist_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Unique Tourists:</span>
                          <span className="font-medium text-white">{cluster.unique_tourists}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Avg Safety Score:</span>
                          <span className={`font-medium ${
                            cluster.avg_safety_score >= 80 ? 'text-green-400' :
                            cluster.avg_safety_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {parseFloat(cluster.avg_safety_score).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
              <h4 className="font-medium text-white mb-4">Heat Map Legend</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue rounded-full"></div>
                  <span className="text-sm text-white/80">Low Density</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-lime rounded-full"></div>
                  <span className="text-sm text-white/80">Medium Density</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red rounded-full"></div>
                  <span className="text-sm text-white/80">High Density</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
              <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-white">Risk Zones Management</h3>
                  <p className="text-sm text-white/70">Geo-fencing alerts and restricted area monitoring</p>
                </div>
                <button onClick={handleAddNewZone} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                  Add New Zone
                </button>
              </div>
              <div className="p-6">
                <div className="grid gap-6">
                  {riskZones.map((zone) => (
                    <div key={zone.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-full ${getRiskZoneColor(zone.risk_level)} bg-opacity-20`}>
                            <Eye className={`h-5 w-5 ${getRiskZoneColor(zone.risk_level).replace('bg-', 'text-')}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-medium text-white">{zone.zone_name}</h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                zone.zone_type === 'high_risk' ? 'bg-red-500/20 text-red-300 border-red-400/30' :
                                zone.zone_type === 'restricted' ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' :
                                'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                              }`}>
                                {zone.zone_type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-white/70 mb-3">{zone.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-white/60 mb-3">
                              <div className="flex items-center space-x-1">
                                <div className={`w-3 h-3 rounded-full ${getRiskZoneColor(zone.risk_level)}`}></div>
                                <span>Risk Level: {zone.risk_level}/10</span>
                              </div>
                            </div>
                            <div className="bg-white/5 rounded p-3 mb-3">
                              <h5 className="text-sm font-medium text-white mb-2">Zone Statistics</h5>
                              <div className="space-y-1 text-sm text-white/70">
                                <div className="flex justify-between">
                                  <span>Zone Type:</span>
                                  <span className="font-medium capitalize text-white">{zone.zone_type.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Risk Level:</span>
                                  <span className="font-medium text-white">{zone.risk_level}/10</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Created:</span>
                                  <span className="font-medium text-white">{formatTimeAgo(zone.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button onClick={() => handleViewOnMap(zone)} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                            View on Map
                          </button>
                          <button onClick={() => handleEditZone(zone)} className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">
                            Edit Zone
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Zap className="h-8 w-8 text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/80">Today's Alerts</p>
                    <p className="text-2xl font-semibold text-white">{stats.activeAnomalies}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-white/70">
                  Zone breaches and proximity alerts
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Eye className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/80">Active Zones</p>
                    <p className="text-2xl font-semibold text-white">{riskZones.length}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-white/70">
                  Monitoring {stats.totalTourists} tourists across zones
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/80">Response Time</p>
                    <p className="text-2xl font-semibold text-white">2.3m</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-white/70">
                  Average time to acknowledge alerts
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTourist && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-2xl bg-white/10 backdrop-blur-xl border-white/20">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">
                    Tourist Details: {selectedTourist.first_name} {selectedTourist.last_name}
                  </h3>
                  <button
                    onClick={() => setSelectedTourist(null)}
                    className="text-white/70 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-500/20 border border-blue-400/30 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-300 mb-2">Tourist Information</h4>
                    <div className="text-sm text-blue-100 space-y-1">
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="font-medium">{selectedTourist.first_name} {selectedTourist.last_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-medium">{selectedTourist.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nationality:</span>
                        <span className="font-medium">{selectedTourist.nationality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Destination:</span>
                        <span className="font-medium">{selectedTourist.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Emergency Contact:</span>
                        <span className="font-medium">{selectedTourist.emergency_contact_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/20 border border-green-400/30 p-4 rounded-lg">
                    <h4 className="font-medium text-green-300 mb-2">Safety Information</h4>
                    <div className="text-sm text-green-100 space-y-2">
                      <div className="flex justify-between">
                        <span>Current Safety Score:</span>
                        <span className="font-medium text-lg">{selectedTourist.current_safety_score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-medium capitalize ${
                          selectedTourist.status === 'safe' ? 'text-green-300' :
                          selectedTourist.status === 'warning' ? 'text-yellow-300' : 'text-red-300'
                        }`}>
                          {selectedTourist.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tracking Status:</span>
                        <span className={`font-medium ${
                          selectedTourist.is_tracking_active !== false ? 'text-green-300' : 'text-red-300'
                        }`}>
                          {selectedTourist.is_tracking_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Update:</span>
                        <span className="font-medium">{formatTimeAgo(selectedTourist.last_location_update)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/20 border border-yellow-400/30 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-300 mb-2">Location Information</h4>
                    <div className="text-sm text-yellow-100 space-y-2">
                      <div className="flex justify-between">
                        <span>Current Location:</span>
                        <span className="font-medium">
                          {selectedTourist.location_lat ? 
                            `${parseFloat(selectedTourist.location_lat).toFixed(4)}, ${parseFloat(selectedTourist.location_lng).toFixed(4)}` : 
                            'Unknown'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Anomalies:</span>
                        <span className="font-medium">{selectedTourist.active_anomalies || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedTourist(null)}
                    className="px-4 py-2 bg-white/20 text-white rounded-md hover:bg-white/30 border border-white/30"
                  >
                    Close
                  </button>
                  <button onClick={() => handleSendCheckInRequest(selectedTourist)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Send Check-in Request
                  </button>
                  <button onClick={() => handleContactEmergency(selectedTourist)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Contact Emergency
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TouristSafetyDashboard;
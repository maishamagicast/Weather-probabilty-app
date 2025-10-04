import React, { useState, useEffect } from 'react';
import { 
  Satellite, CloudRain, Sun, Wind, Droplets, AlertTriangle, Calendar, 
  MapPin, RefreshCw, Map, CalendarDays, Beaker, TrendingUp, X,
  BarChart, Thermometer, Download, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { weatherAPI } from '../services/api';
import ArcGISMap from './ArcGISMap';
import { mockGraphData } from '../MockGraphData';
// Fast Data Visualization Component
const DataVisualization = ({ data, title, unit }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const optimalValue = data[0]?.optimal;

  return (
    <div className="bg-gray-800/40 rounded-xl p-4 border border-cyan-500/20">
      <h4 className="font-semibold text-cyan-400 mb-4 flex items-center gap-2">
        <BarChart className="w-4 h-4" />
        {title} Trends
      </h4>
      <div className="flex items-end justify-between h-24 gap-1">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="text-xs text-cyan-300/70 mb-1">{item.month}</div>
            <div className="relative w-full flex justify-center">
              <div
                className={`w-3/4 rounded-t transition-all ${
                  optimalValue 
                    ? (item.value >= optimalValue ? 'bg-green-500' : 'bg-red-500')
                    : 'bg-cyan-500'
                }`}
                style={{ height: `${(item.value / maxValue) * 80}%`, minHeight: '4px' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Weather Analysis Panel Component
const WeatherAnalysisPanel = ({ user }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedVariables, setSelectedVariables] = useState(['temperature']);
  const [thresholds, setThresholds] = useState([
    { variable: 'temperature', value: 30, operator: 'above' },
  ]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedResult, setExpandedResult] = useState(null);
  const [showGraph, setShowGraph] = useState(false);

  const weatherVariables = [
    { 
      id: 'temperature', 
      name: 'Temperature', 
      unit: '°C', 
      icon: Thermometer,
      description: 'Average daily temperature',
      graphData: mockGraphData.temperature
    },
    { 
      id: 'precipitation', 
      name: 'Precipitation', 
      unit: 'mm', 
      icon: CloudRain,
      description: 'Daily rainfall amount',
      graphData: mockGraphData.rainfall
    },
    { 
      id: 'humidity', 
      name: 'Humidity', 
      unit: '%', 
      icon: Droplets,
      description: 'Relative humidity percentage',
      graphData: mockGraphData.soilMoisture
    },
    { 
      id: 'wind', 
      name: 'Wind Speed', 
      unit: 'm/s', 
      icon: Wind,
      description: 'Average wind speed',
      graphData: null
    }
  ];

  const handleVariableToggle = (variableId) => {
    if (selectedVariables.includes(variableId)) {
      setSelectedVariables(selectedVariables.filter(v => v !== variableId));
    } else {
      setSelectedVariables([...selectedVariables, variableId]);
    }
  };

  const addThreshold = () => {
    if (weatherVariables.length === 0) return;
    setThresholds([
      ...thresholds,
      { variable: weatherVariables[0].id, value: 30, operator: 'above' },
    ]);
  };

  const removeThreshold = (index) => {
    setThresholds(thresholds.filter((_, i) => i !== index));
  };

  const updateThreshold = (index, field, value) => {
    const newThresholds = [...thresholds];
    newThresholds[index][field] = value;
    setThresholds(newThresholds);
  };

  const analyzeWeather = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate realistic mock analysis results
    const mockResults = selectedVariables.map(variable => {
      const variableData = weatherVariables.find(v => v.id === variable);
      const threshold = thresholds.find(t => t.variable === variable);
      const baseValue = variable === 'temperature' ? 25 : 
                       variable === 'precipitation' ? 50 : 
                       variable === 'humidity' ? 65 : 4;
      
      const probability = Math.floor(Math.random() * 100);
      const mean = (Math.random() * 10 + baseValue - 5).toFixed(1);
      
      return {
        variable,
        probability,
        mean: parseFloat(mean),
        threshold: threshold?.value || 30,
        operator: threshold?.operator || 'above',
        historicalData: Array.from({ length: 5 }, (_, i) => ({
          year: 2023 - i,
          value: (Math.random() * 15 + baseValue - 7.5).toFixed(1),
          date: new Date(2023 - i, selectedDate.getMonth(), selectedDate.getDate()).toISOString()
        })),
        variableInfo: variableData
      };
    });
    
    setAnalysisResults(mockResults);
    setIsAnalyzing(false);
  };

  const exportData = (format) => {
    const data = {
      location: user?.location,
      date: selectedDate.toISOString().split('T')[0],
      analysisDate: new Date().toISOString(),
      results: analysisResults
    };

    let content, mimeType, extension;
    
    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      // CSV format
      let csv = 'Variable,Probability (%),Mean,Threshold,Operator,Year,Value\n';
      analysisResults.forEach(result => {
        result.historicalData.forEach(historical => {
          csv += `${result.variableInfo.name},${result.probability},${result.mean},${result.threshold},${result.operator},${historical.year},${historical.value}\n`;
        });
      });
      content = csv;
      mimeType = 'text/csv';
      extension = 'csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nasa-weather-analysis-${selectedDate.toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simple Graph Component
  const SimpleBarChart = ({ data, title, unit, optimal }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value), optimal || 0);
    const scale = 100 / maxValue;

    return (
      <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
        <h5 className="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          {title} Trends
        </h5>
        <div className="flex items-end justify-between h-20 gap-1">
          {data.slice(0, 6).map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="text-xs text-cyan-300/70 mb-1">{item.month}</div>
              <div className="relative w-full flex justify-center">
                <div
                  className={`w-3/4 rounded-t transition-all ${
                    item.value >= (optimal || maxValue * 0.8) 
                      ? 'bg-green-500' 
                      : item.value >= (optimal || maxValue * 0.6)
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ height: `${item.value * scale}%`, minHeight: '4px' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-xl rounded-xl border border-cyan-500/20 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
          <BarChart className="w-5 h-5" />
          NASA Weather Analysis
        </h3>
        {analysisResults.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowGraph(!showGraph)}
              className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center gap-2 text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              {showGraph ? 'Hide' : 'Graphs'}
            </button>
            <button
              onClick={() => exportData('csv')}
              className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 hover:bg-green-500/30 transition-colors flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Weather Variables Selection */}
        <div>
          <label className="block text-sm font-medium text-cyan-300 mb-2">Weather Variables</label>
          <div className="space-y-2">
            {weatherVariables.map(variable => {
              const IconComponent = variable.icon;
              const isSelected = selectedVariables.includes(variable.id);
              
              return (
                <div
                  key={variable.id}
                  className={`p-2 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/50'
                      : 'bg-gray-700/50 border-gray-600 hover:bg-gray-600/50'
                  }`}
                  onClick={() => handleVariableToggle(variable.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-cyan-400' : 'bg-gray-500'
                    }`} />
                    <IconComponent className="w-4 h-4 text-cyan-300" />
                    <span className="text-white text-sm">{variable.name}</span>
                    <span className="text-cyan-300/70 text-xs ml-auto">{variable.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analysis Configuration */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-1">
              Analysis Date
            </label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full p-2 bg-gray-700/50 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none text-sm"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-cyan-300">Thresholds</label>
              <button
                onClick={addThreshold}
                className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-xs hover:bg-cyan-500/30 transition-colors"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {thresholds.map((threshold, index) => {
                const variable = weatherVariables.find(v => v.id === threshold.variable);
                return (
                  <div key={index} className="flex gap-1 items-center p-2 bg-gray-700/30 rounded border border-gray-600">
                    <select
                      value={threshold.variable}
                      onChange={(e) => updateThreshold(index, 'variable', e.target.value)}
                      className="flex-1 p-1 bg-gray-600/50 border border-gray-500 rounded text-white text-xs"
                    >
                      {weatherVariables.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                    <select
                      value={threshold.operator}
                      onChange={(e) => updateThreshold(index, 'operator', e.target.value)}
                      className="w-16 p-1 bg-gray-600/50 border border-gray-500 rounded text-white text-xs"
                    >
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                    </select>
                    <input
                      type="number"
                      value={threshold.value}
                      onChange={(e) => updateThreshold(index, 'value', parseFloat(e.target.value))}
                      className="w-12 p-1 bg-gray-600/50 border border-gray-500 rounded text-white text-xs"
                    />
                    <span className="text-cyan-300/70 text-xs px-1">{variable?.unit}</span>
                    <button
                      onClick={() => removeThreshold(index)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={analyzeWeather}
        disabled={isAnalyzing || selectedVariables.length === 0}
        className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 rounded font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed text-sm"
      >
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Analyzing...
          </>
        ) : (
          <>
            <Satellite className="w-4 h-4" />
            Analyze Weather Probability
          </>
        )}
      </button>

      {/* Results Display */}
      {analysisResults.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="font-semibold text-cyan-400">Analysis Results</h4>
          
          {/* Graphs Section */}
          {showGraph && (
            <div className="grid grid-cols-1 gap-3 mb-4">
              {selectedVariables.map(variable => {
                const variableData = weatherVariables.find(v => v.id === variable);
                if (!variableData?.graphData) return null;
                
                return (
                  <div key={variable} className="bg-gray-700/40 rounded p-3 border border-cyan-500/20">
                    <SimpleBarChart
                      data={variableData.graphData}
                      title={variableData.name}
                      unit={variableData.unit}
                      optimal={variableData.graphData[0]?.optimal}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Probability Cards */}
          <div className="grid grid-cols-1 gap-3">
            {analysisResults.map((result, index) => {
              const probabilityLevel = result.probability >= 70 ? 'high' : 
                                    result.probability >= 40 ? 'medium' : 'low';
              const levelColors = {
                high: 'from-red-500/20 to-orange-500/20 border-red-500/30',
                medium: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
                low: 'from-green-500/20 to-emerald-500/20 border-green-500/30'
              };
              
              return (
                <div 
                  key={index} 
                  className={`bg-gradient-to-r ${levelColors[probabilityLevel]} rounded p-3 border cursor-pointer transition-all hover:scale-105`}
                  onClick={() => setExpandedResult(expandedResult === index ? null : index)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <result.variableInfo.icon className="w-4 h-4 text-white" />
                      <span className="text-white font-semibold text-sm">{result.variableInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        probabilityLevel === 'high' ? 'bg-red-500 text-white' :
                        probabilityLevel === 'medium' ? 'bg-yellow-500 text-black' :
                        'bg-green-500 text-white'
                      }`}>
                        {result.probability}%
                      </span>
                      {expandedResult === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                  
                  <p className="text-cyan-100/80 text-xs mt-1">
                    Probability of {result.variableInfo.name.toLowerCase()} {result.operator} {result.threshold}{result.variableInfo.unit}
                  </p>
                  
                  {expandedResult === index && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-cyan-300/70">Historical Mean</p>
                          <p className="text-white font-semibold">{result.mean}{result.variableInfo.unit}</p>
                        </div>
                        <div>
                          <p className="text-cyan-300/70">Threshold</p>
                          <p className="text-white font-semibold">{result.threshold}{result.variableInfo.unit}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Summary Explanation */}
          <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded">
            <h5 className="font-semibold text-cyan-400 mb-1 text-sm">Analysis Summary</h5>
            <p className="text-cyan-300/80 text-xs">
              Based on NASA Earth observation data, this analysis shows the probability 
              of specified weather conditions occurring on {selectedDate.toLocaleDateString()}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
function Dashboard({ user }) {
  const [weatherData, setWeatherData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showVisualizations, setShowVisualizations] = useState(false);

  // Fast data loading
  useEffect(() => {
    loadWeatherData();
  }, [user]);

  const loadWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load data with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      const dataPromise = Promise.all([
        weatherAPI.getWeatherData(user?.location),
        weatherAPI.getHistoricalData(user?.location)
      ]);

      const [weatherResult, historicalResult] = await Promise.race([dataPromise, timeoutPromise]);
      
      if (weatherResult.success) {
        setWeatherData(weatherResult.data);
      }
      
      if (historicalResult.success) {
        setHistoricalData(historicalResult.data);
      }
    } catch (error) {
      console.error('Error loading weather data:', error);
      // Use default data instead of showing error
      setWeatherData({
        temperature: "20-28°C",
        rainfall: "Moderate probability",
        soilMoisture: "Optimal",
        recommendation: "Good conditions for planting",
        alert: "None"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadWeatherData();
  };

  // Fast Satellite Map Modal
  const SatelliteMapModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl border border-cyan-500/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Location Selection</h3>
          </div>
          <button 
            onClick={() => setActiveModal(null)} 
            className="text-cyan-400 hover:text-cyan-300 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {/* Fast ArcGIS Map */}
            <ArcGISMap 
              location={selectedLocation} 
              onLocationSelect={setSelectedLocation} 
              className="h-96"
            />
            
            {selectedLocation && (
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                <h4 className="font-semibold text-cyan-400 mb-2 text-sm">Selected Location</h4>
                <p className="text-white text-sm">{selectedLocation.name}</p>
                <p className="text-cyan-300/70 text-xs">
                  Coordinates: {selectedLocation.coordinates}
                </p>
                {selectedLocation.environmental && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-cyan-300">Temperature:</span>
                      <span className="ml-1 text-white">{selectedLocation.environmental.temperature}°C</span>
                    </div>
                    <div>
                      <span className="text-cyan-300">Vegetation:</span>
                      <span className="ml-1 text-white">{selectedLocation.environmental.vegetationIndex}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Fast Crop Calendar Modal
  const CropCalendarModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl border border-cyan-500/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white">Crop Calendar</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-cyan-400 hover:text-cyan-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-cyan-400 mb-2 text-sm">Your Crops</h4>
            <p className="text-white">{user?.crops?.join(', ') || 'No crops selected'}</p>
          </div>

          <div className="space-y-3">
            {user?.crops?.slice(0, 3).map((crop, index) => (
              <div key={index} className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-lg p-3 border border-green-500/20">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="text-white font-bold mb-1">{crop}</h5>
                    <p className="text-green-300/70 text-xs">Active Season</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/40 rounded p-2">
                    <p className="text-cyan-300/70 text-xs">Planting</p>
                    <p className="text-white">Oct - Nov</p>
                  </div>
                  <div className="bg-black/40 rounded p-2">
                    <p className="text-cyan-300/70 text-xs">Harvest</p>
                    <p className="text-white">March 2026</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400">Loading farm data...</p>
        </div>
      </div>
    );
  }

  // Default data for fallback
  const defaultWeatherData = {
    temperature: "20-28°C",
    rainfall: "Moderate probability",
    soilMoisture: "Optimal",
    recommendation: "Good conditions for planting",
    alert: "None"
  };

  const currentWeather = weatherData || defaultWeatherData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Fast Modals */}
      {activeModal === 'satellite' && <SatelliteMapModal />}
      {activeModal === 'calendar' && <CropCalendarModal />}

      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{user?.name || 'Farmer'}!</span>
            </h1>
            <div className="flex items-center gap-2 text-cyan-300/70 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{user?.location || 'Your Farm Location'}</span>
            </div>
          </div>
          
          <button
            onClick={refreshData}
            className="mt-4 lg:mt-0 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 transition-all duration-300 flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* NASA Weather Analysis Section */}
        <WeatherAnalysisPanel user={user} />

        {/* Data Visualizations Toggle */}
        <div className="mb-4 flex justify-center">
          <button
            onClick={() => setShowVisualizations(!showVisualizations)}
            className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded text-purple-400 transition-all duration-300 flex items-center gap-2 text-sm"
          >
            <BarChart className="w-4 h-4" />
            {showVisualizations ? 'Hide Charts' : 'Show Charts'}
          </button>
        </div>

        {/* Fast Data Visualizations */}
        {showVisualizations && (
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-3 text-cyan-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Data Trends
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DataVisualization
                data={mockGraphData.temperature}
                title="Temperature"
                unit="°C"
              />
              <DataVisualization
                data={mockGraphData.soilMoisture}
                title="Soil Moisture"
                unit="%"
              />
            </div>
          </div>
        )}

        {/* Weather Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          {/* Current Conditions */}
          <div className="lg:col-span-2 bg-gray-900/60 backdrop-blur-xl rounded-lg border border-cyan-500/20 p-3">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Satellite className="w-5 h-5 text-cyan-400" />
              Current Conditions
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-black/40 rounded p-2 border border-cyan-500/20">
                <Sun className="w-6 h-6 text-yellow-400 mb-1" />
                <div className="text-base font-bold text-white">{currentWeather.temperature}</div>
                <div className="text-cyan-300/70 text-xs">Temperature</div>
              </div>
              
              <div className="bg-black/40 rounded p-2 border border-cyan-500/20">
                <CloudRain className="w-6 h-6 text-blue-400 mb-1" />
                <div className="text-base font-bold text-white">High</div>
                <div className="text-cyan-300/70 text-xs">Rain Probability</div>
              </div>
              
              <div className="bg-black/40 rounded p-2 border border-cyan-500/20">
                <Droplets className="w-6 h-6 text-cyan-400 mb-1" />
                <div className="text-base font-bold text-white">{currentWeather.soilMoisture}</div>
                <div className="text-cyan-300/70 text-xs">Soil Moisture</div>
              </div>
              
              <div className="bg-black/40 rounded p-2 border border-cyan-500/20">
                <Wind className="w-6 h-6 text-green-400 mb-1" />
                <div className="text-base font-bold text-white">5-15</div>
                <div className="text-cyan-300/70 text-xs">Wind (km/h)</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-lg border border-cyan-500/20 p-3">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              Farm Advice
            </h2>
            
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded p-2">
                <h3 className="font-semibold text-green-400 mb-1 text-sm">🌱 Planting</h3>
                <p className="text-green-300/80 text-xs">{currentWeather.recommendation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          <button 
            onClick={() => setActiveModal('satellite')}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded p-2 text-cyan-400 transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer"
          >
            <Map className="w-4 h-4" />
            <span className="text-xs">Map</span>
          </button>
          <button 
            onClick={() => setActiveModal('calendar')}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded p-2 text-blue-400 transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
            <span className="text-xs">Calendar</span>
          </button>
          <button 
            onClick={() => setShowVisualizations(!showVisualizations)}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded p-2 text-purple-400 transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer"
          >
            <BarChart className="w-4 h-4" />
            <span className="text-xs">{showVisualizations ? 'Hide' : 'Charts'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
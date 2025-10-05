import React, { useState } from 'react';
import { 
  BarChart3, Thermometer, CloudRain, Droplets, Wind, 
  Download, FileText, ChevronDown, ChevronUp, X, Satellite 
} from 'lucide-react';
import { dashboardAPI } from '../services/requests';

const WeatherAnalysisPanel = ({ user, latitude, longitude }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedVariables, setSelectedVariables] = useState(['temperature']);
  const [thresholds, setThresholds] = useState([
    { variable: 'temperature', value: 30, operator: 'above' },
  ]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedResult, setExpandedResult] = useState(null);
const formatDateForNASA = (date) => {
  // Ensure it's a Date object → convert to ISO string → "YYYY-MM-DD" → remove dashes
  return new Date(date).toISOString().split("T")[0].replace(/-/g, "");
};

  const weatherVariables = [
    { id: 'temperature', name: 'Temperature', unit: '°C', icon: Thermometer, description: 'Average daily temperature' },
    { id: 'precipitation', name: 'Precipitation', unit: 'mm', icon: CloudRain, description: 'Daily rainfall amount' },
    { id: 'humidity', name: 'Humidity', unit: '%', icon: Droplets, description: 'Relative humidity percentage' },
    { id: 'wind', name: 'Wind Speed', unit: 'm/s', icon: Wind, description: 'Average wind speed' }
  ];

  const handleVariableToggle = (variableId) => {
    setSelectedVariables(prev => 
      prev.includes(variableId) ? prev.filter(v => v !== variableId) : [...prev, variableId]
    );
  };

  const addThreshold = () => {
    if (weatherVariables.length === 0) return;
    setThresholds(prev => [...prev, { variable: weatherVariables[0].id, value: 30, operator: 'above' }]);
  };

  const removeThreshold = (index) => setThresholds(prev => prev.filter((_, i) => i !== index));

  const updateThreshold = (index, field, value) => {
    setThresholds(prev => {
      const newThresholds = [...prev];
      newThresholds[index][field] = value;
      return newThresholds;
    });
  };

  // Fetch NASA 5-year historical data
  const fetchHistoricalData = async () => {
    if (!user?.location) return;

    setIsAnalyzing(true);

    try {
      const payload = {
        latitude,
        longitude,
        month: selectedDate.getMonth() + 1,
        day: selectedDate.getDate(),
        year: selectedDate.getFullYear(),
      };

      console.log("🛰️ Fetching NASA historical data with payload:", payload);

      const res = await dashboardAPI.getNasaData(payload);

      console.log("📡 Raw NASA API response:", res);

      if (res.success && res.data) {
        const results = selectedVariables.map(variableId => {
          const variableInfo = weatherVariables.find(v => v.id === variableId);
          const historicalValues = res.data[variableId] || [];

          const mean = historicalValues.length > 0
            ? Math.round(historicalValues.reduce((sum, v) => sum + v.value, 0) / historicalValues.length)
            : null;

          const thresholdObj = thresholds.find(t => t.variable === variableId);

          return {
            variable: variableId,
            probability: null,
            mean,
            threshold: thresholdObj?.value || 30,
            operator: thresholdObj?.operator || 'above',
            historicalData: historicalValues,
            variableInfo,
          };
        });

        setAnalysisResults(results);
        console.log("✅ Processed historical results:", results);
      } else {
        console.error("❌ Failed to fetch NASA data. Response error:", res.error || "Unknown error");
      }
    } catch (error) {
      console.error("💥 Exception occurred while fetching NASA data:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analyze weather against thresholds
  const analyzeWeather = async () => {
    setIsAnalyzing(true);

    try {
      const payload = {
        latitude: latitude || 0,
        longitude: longitude || 0,
        start_date: formatDateForNASA(selectedDate),  // "2025-10-05" → "20251005"
        end_date: formatDateForNASA(selectedDate),
        thresholds: {},
      };

      thresholds.forEach(t => {
        if (selectedVariables.includes(t.variable)) {
          payload.thresholds[t.variable] = { value: t.value, operator: t.operator };
        }
      });

      console.log("🛰️ Sending payload for weather analysis:", payload);

      const res = await dashboardAPI.getAnalysisResults(payload);
      console.log("📡 Raw analysis API response:", res);

      if (res.success && res.data) {
        const data = res.data.data ? JSON.parse(res.data.data) : res.data;

        const results = Object.entries(data).map(([variable, probability]) => {
          const variableInfo = weatherVariables.find(v => v.id === variable);
          const threshold = thresholds.find(t => t.variable === variable);

          return {
            variable,
            probability: parseInt(probability),
            mean: null,
            threshold: threshold?.value || 30,
            operator: threshold?.operator || 'above',
            historicalData: [],
            variableInfo,
          };
        });

        setAnalysisResults(results);
        console.log("✅ Analysis results processed:", results);
      } else {
        console.error("❌ Backend returned an error:", res.error || "Unknown error");
      }
    } catch (error) {
      console.error("💥 Exception occurred while analyzing weather:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export results to JSON or CSV
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
      let csv = 'Variable,Probability (%),Mean,Threshold,Operator,Year,Value\n';
      analysisResults.forEach(result => {
        result.historicalData.forEach(h => {
          csv += `${result.variableInfo.name},${result.probability},${result.mean},${result.threshold},${result.operator},${h.year},${h.value}\n`;
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

  return (
    <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          NASA Weather Probability Analysis
        </h3>
        {analysisResults.length > 0 && (
          <div className="flex gap-2">
            <button onClick={() => exportData('csv')} className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={() => exportData('json')} className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" /> JSON
            </button>
          </div>
        )}
      </div>

      {/* Variables & Thresholds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weather Variables */}
        <div>
          <label className="block text-sm font-medium text-cyan-300 mb-3">Weather Variables</label>
          <div className="space-y-2">
            {weatherVariables.map(variable => {
              const Icon = variable.icon;
              const isSelected = selectedVariables.includes(variable.id);
              return (
                <div key={variable.id} className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-600/50'}`} onClick={() => handleVariableToggle(variable.id)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-gray-500'}`} />
                    <Icon className="w-4 h-4 text-cyan-300" />
                    <div className="flex-1">
                      <span className="text-white">{variable.name}</span>
                      <p className="text-cyan-300/70 text-xs">{variable.description}</p>
                    </div>
                    <span className="text-cyan-300/70 text-sm">{variable.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thresholds */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">Analysis Date (Day of Year)</label>
            <input type="date" value={selectedDate.toISOString().split('T')[0]} onChange={(e) => setSelectedDate(new Date(e.target.value))} className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none" />
            <p className="text-cyan-300/70 text-xs mt-1">
              Day {Math.floor((selectedDate - new Date(selectedDate.getFullYear(), 0, 0)) / (1000*60*60*24))} of {selectedDate.getFullYear()}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-cyan-300">Probability Thresholds</label>
              <button onClick={addThreshold} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors">+ Add Threshold</button>
            </div>
            <div className="space-y-2">
              {thresholds.map((threshold, index) => {
                const variable = weatherVariables.find(v => v.id === threshold.variable);
                return (
                  <div key={index} className="flex gap-2 items-center p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                    <select value={threshold.variable} onChange={(e) => updateThreshold(index, 'variable', e.target.value)} className="flex-1 p-2 bg-gray-600/50 border border-gray-500 rounded text-white text-sm">
                      {weatherVariables.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <select value={threshold.operator} onChange={(e) => updateThreshold(index, 'operator', e.target.value)} className="w-24 p-2 bg-gray-600/50 border border-gray-500 rounded text-white text-sm">
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                    </select>
                    <input type="number" value={threshold.value} onChange={(e) => updateThreshold(index, 'value', parseFloat(e.target.value))} className="w-20 p-2 bg-gray-600/50 border border-gray-500 rounded text-white text-sm" />
                    <span className="text-cyan-300/70 text-sm px-2">{variable?.unit}</span>
                    <button onClick={() => removeThreshold(index)} className="p-1 text-red-400 hover:text-red-300 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <button 
        onClick={analyzeWeather} 
        disabled={isAnalyzing || selectedVariables.length === 0}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Analyzing NASA Data...
          </>
        ) : (
          <>
            <Satellite className="w-5 h-5" />
            Analyze Weather Probability
          </>
        )}
      </button>

{/* Add this directly under it
<div className="mt-3 text-center">
  <button
    onClick={() => onOpenSatellite && onOpenSatellite()}
    className="px-4 py-2 bg-purple-600/20 border border-purple-500/40 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-all text-sm"
  >
    🌍 View NASA Satellite Map
  </button>
</div> */}


      {/* Results Display */}
      {analysisResults.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-cyan-400">Analysis Results</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className={`bg-gradient-to-r ${levelColors[probabilityLevel]} rounded-xl p-4 border cursor-pointer transition-all hover:scale-105`}
                  onClick={() => setExpandedResult(expandedResult === index ? null : index)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      {/* <result.variableInfo.icon className="w-4 h-4 text-white" /> */}
                      {/* <span className="text-white font-semibold">{result.variableInfo.name}</span> */}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${
                        probabilityLevel === 'high' ? 'bg-red-500 text-white' :
                        probabilityLevel === 'medium' ? 'bg-yellow-500 text-black' :
                        'bg-green-500 text-white'
                      }`}>
                        {result.probability}%
                      </span>
                      {expandedResult === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                  
                  <p className="text-cyan-100/80 text-sm mb-2">
                    Probability of {result.variableInfo.name.toLowerCase()} {result.operator} {result.threshold}{result.variableInfo.unit}
                  </p>
                  
                  {expandedResult === index && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-cyan-300/70">Historical Mean</p>
                          <p className="text-white font-semibold">{result.mean}{result.variableInfo.unit}</p>
                        </div>
                        <div>
                          <p className="text-cyan-300/70">Threshold</p>
                          <p className="text-white font-semibold">{result.threshold}{result.variableInfo.unit}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-cyan-300/70 text-sm mb-2">10-Year Historical Data:</p>
                        <div className="max-h-32 overflow-y-auto">
                          {result.historicalData.map((data, idx) => (
                            <div key={idx} className="flex justify-between text-xs py-1 border-b border-white/10">
                              <span>{data.year}</span>
                              <span>{data.value}{result.variableInfo.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Summary Explanation */}
          <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">Analysis Summary</h5>
            <p className="text-cyan-300/80 text-sm">
              Based on 10 years of NASA Earth observation data, this analysis shows the probability 
              of specified weather conditions occurring on {selectedDate.toLocaleDateString()}. 
              The probabilities are calculated using historical patterns from NASA's satellite 
              observations and climate models.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherAnalysisPanel;



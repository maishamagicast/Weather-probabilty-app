// src/components/NasaWorldView.jsx
import React from 'react';
import { X, RefreshCw, ExternalLink } from 'lucide-react';

export default function NasaWorldView({ onClose, location }) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  
  // Construct NASA Worldview URL with coordinates if available
  const getNasaWorldViewUrl = () => {
    let baseUrl = "https://worldview.earthdata.nasa.gov/";
    
    if (location?.lat && location?.lon) {
      // NASA Worldview supports direct coordinates in the URL
      baseUrl += `?v=${location.lon - 5},${location.lat - 5},${location.lon + 5},${location.lat + 5}`;
    }
    
    return baseUrl;
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const openInNewTab = () => {
    window.open(getNasaWorldViewUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-cyan-500/30 bg-gray-900/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">NASA</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-cyan-400">
              NASA Worldview Satellite
            </h2>
            {location && (
              <p className="text-sm text-cyan-300/70">
                Viewing: {location.placeName || `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={openInNewTab}
            className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose} 
            className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-400">Loading NASA Worldview...</p>
            <p className="text-cyan-300/70 text-sm mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-red-400 font-bold text-lg mb-2">Failed to Load</h3>
            <p className="text-cyan-300/70 mb-4">
              Unable to load NASA Worldview. This could be due to network restrictions or NASA server issues.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={handleRefresh}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={openInNewTab}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NASA Worldview Iframe */}
      <iframe
        src={getNasaWorldViewUrl()}
        title="NASA Worldview Satellite Imagery"
        className="flex-1 w-full border-none"
        allowFullScreen
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />

      {/* Footer Info */}
      <div className="p-3 bg-gray-900/80 border-t border-cyan-500/30">
        <div className="flex justify-between items-center text-sm text-cyan-300/70">
          <span>NASA's Earth Observing System Data and Information System (EOSDIS)</span>
          <span>Data may take time to load</span>
        </div>
      </div>
    </div>
  );
}
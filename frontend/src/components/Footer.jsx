import React from 'react';
import { Satellite, ExternalLink } from 'lucide-react';

function Footer() {
  const handleLinkClick = (e, url) => {
    e.preventDefault();
    // Show a tooltip or message that external links would open here
    console.log(`Would navigate to: ${url}`);
  };

  return (
    <footer className="border-t border-cyan-500/20 bg-black/40 backdrop-blur-xl mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-md">
                <Satellite className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white">AGRI-SPACE</span>
            </div>
            <p className="text-sm text-cyan-300/70">
              Advanced weather probability analysis using NASA satellite data for smart farming decisions.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-white">Data Sources</h4>
            <ul className="space-y-2 text-sm text-cyan-300/70">
              <li className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                NASA POWER
              </li>
              <li className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                MODIS Satellite
              </li>
              <li className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                AIRS System
              </li>
              <li className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                GPM Mission
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-white">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://power.larc.nasa.gov/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-300/70 hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  NASA POWER API
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://earthdata.nasa.gov/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-300/70 hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  NASA Earth Data
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.nasa.gov/mission_pages/GPM/main/index.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-300/70 hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  GPM Documentation
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <button 
                  onClick={(e) => handleLinkClick(e, '/api-docs')}
                  className="text-cyan-300/70 hover:text-cyan-400 transition-colors"
                >
                  API Reference
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-white">About</h4>
            <p className="text-sm text-cyan-300/70 mb-3">
              Built for NASA Space Apps Challenge 2024
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-cyan-300/70">
                Empowering farmers with satellite-powered weather intelligence for sustainable agriculture.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-cyan-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center text-sm text-cyan-300/50">
              © {new Date().getFullYear()} AGRI-SPACE. Powered by NASA Earth Observation Data.
            </p>
            <div className="flex gap-6 text-sm">
              <button 
                onClick={(e) => handleLinkClick(e, '/privacy')}
                className="text-cyan-300/70 hover:text-cyan-400 transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={(e) => handleLinkClick(e, '/terms')}
                className="text-cyan-300/70 hover:text-cyan-400 transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={(e) => handleLinkClick(e, '/contact')}
                className="text-cyan-300/70 hover:text-cyan-400 transition-colors"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
import React from 'react';
import { Satellite } from 'lucide-react';

function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-md">
                <Satellite className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">NASA Earth Observer</span>
            </div>
            <p className="text-sm text-gray-600">
              Advanced weather probability analysis using NASA satellite data.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Data Sources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>NASA POWER</li>
              <li>MODIS</li>
              <li>AIRS</li>
              <li>GPM</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">API Reference</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <p className="text-sm text-gray-600">Built for NASA Space Apps Challenge</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} NASA Earth Observer</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
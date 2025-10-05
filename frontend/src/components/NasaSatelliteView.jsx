import React from 'react';
import { X } from 'lucide-react';

export default function NasaSatelliteView({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-cyan-500/30 bg-gray-900/80">
        <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
          🛰 NASA Earth Satellite View
        </h2>
        <button onClick={onClose} className="text-cyan-400 hover:text-cyan-300">
          <X className="w-6 h-6" />
        </button>
      </div>
      <iframe
        src="https://worldview.earthdata.nasa.gov/"
        title="NASA Worldview"
        className="flex-1 w-full border-none"
        allowFullScreen
      />
    </div>
  );
}

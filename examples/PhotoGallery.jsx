// @requires-asset ./cat.png
import { useState } from 'react';
import { Heart, Download, ZoomIn, ZoomOut, Image } from 'lucide-react';

function PhotoGallery() {
  const [liked, setLiked] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = './assets/cat.png';
    link.download = 'cute-cat.png';
    link.click();
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-600">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Image className="text-gray-300" size={28} />
        <h2 className="text-2xl font-bold text-gray-200">
          Photo Gallery
        </h2>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mb-6 overflow-hidden">
        <div className="flex justify-center">
          <img 
            src="./assets/cat.png" 
            alt="Cute cat" 
            className="max-w-full h-auto rounded-lg transition-transform duration-300"
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button 
          onClick={zoomOut}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <ZoomOut size={16} />
          Zoom Out
        </button>
        
        <button 
          onClick={zoomIn}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <ZoomIn size={16} />
          Zoom In
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setLiked(!liked)}
          className={`flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-lg transition-all duration-200 ${
            liked 
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-600 hover:bg-gray-500 text-white'
          }`}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          {liked ? 'Liked!' : 'Like'}
        </button>
        
        <button 
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <Download size={16} />
          Download
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          📸 Demonstrating @requires-asset functionality
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Zoom: {Math.round(zoom * 100)}% | {liked ? '❤️ Liked' : '🤍 Not liked'}
        </p>
      </div>
    </div>
  );
}

export default PhotoGallery;

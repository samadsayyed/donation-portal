import React, { useState, useEffect } from 'react';
import { Globe2, Info, Map, Navigation, Camera } from 'lucide-react';

const VirtualTourApp = () => {
  const [currentLocation, setCurrentLocation] = useState('entrance');
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  // Sample tour locations data
  const locations = {
    entrance: {
      title: 'Main Entrance',
      description: 'Welcome to our virtual campus tour. The grand entrance features modern architecture with a diamond-cut glass facade.',
      details: 'Built in 2020, this LEED-certified building welcomes thousands of visitors annually.',
      hotspots: ['lobby', 'courtyard']
    },
    lobby: {
      title: 'Main Lobby',
      description: 'A spacious lobby with contemporary furnishings and interactive information kiosks.',
      details: 'The lobby hosts regular exhibitions and student showcases.',
      hotspots: ['entrance', 'hallway']
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe2 className="text-blue-400" />
            <span className="text-white font-bold text-xl">Virtual Campus Tour</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Map className="text-white" size={20} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Navigation className="text-white" size={20} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Camera className="text-white" size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        {/* 360 Viewer Container */}
        <div className="relative w-full h-[600px] bg-black/30 rounded-xl overflow-hidden backdrop-blur-sm border border-white/10">
          <div className="absolute inset-0">
            <img 
              src="https://images.pexels.com/photos/7919/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="360 View"
              className="w-full h-full object-cover opacity-80"
            />
          </div>

          {/* Location Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md p-4">
            <h2 className="text-white text-2xl font-bold">
              {locations[currentLocation].title}
            </h2>
            <p className="text-gray-200 mt-2">
              {locations[currentLocation].description}
            </p>
          </div>

          {/* Navigation Hotspots */}
          {locations[currentLocation].hotspots.map((spot, index) => (
            <button
              key={spot}
              className="absolute p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 transition-all hover:scale-110"
              style={{
                top: `${30 + (index * 15)}%`,
                left: `${20 + (index * 20)}%`
              }}
              onClick={() => setCurrentLocation(spot)}
            >
              <div className="w-3 h-3 bg-blue-400 rounded-full" />
            </button>
          ))}
        </div>

        {/* Details Panel */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-white text-xl font-bold flex items-center gap-2">
              <Info size={20} className="text-blue-400" />
              Location Details
            </h3>
            <p className="text-gray-200 mt-4">
              {locations[currentLocation].details}
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-white text-xl font-bold">Facilities</h3>
            <ul className="mt-4 space-y-2">
              <li className="text-gray-200">• Modern Study Areas</li>
              <li className="text-gray-200">• High-speed WiFi</li>
              <li className="text-gray-200">• Conference Rooms</li>
            </ul>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-white text-xl font-bold">Quick Stats</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-blue-400 text-2xl font-bold">2,500</div>
                <div className="text-gray-200 text-sm">Daily Visitors</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 text-2xl font-bold">45,000</div>
                <div className="text-gray-200 text-sm">Square Feet</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTourApp;
"use client";

import React from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface UrbanInfrastructureMapProps {
  center?: [number, number];
}

const UrbanInfrastructureMap: React.FC<UrbanInfrastructureMapProps> = ({ center = [12.8406, 80.1534] }) => {
  // Mock data for congestion zones
  const congestionZones = [
    { id: 1, pos: [12.8412, 80.1538] as [number, number], radius: 300, level: 'High', color: '#ef4444', label: 'Main Gate Congestion' },
    { id: 2, pos: [12.8385, 80.1560] as [number, number], radius: 200, level: 'Medium', color: '#f59e0b', label: 'Back Road Traffic' },
    { id: 3, pos: [13.0850, 80.2101] as [number, number], radius: 400, level: 'Low', color: '#10b981', label: 'Anna Nagar Flow' },
    { id: 4, pos: [12.8450, 80.1500] as [number, number], radius: 250, level: 'High', color: '#ef4444', label: 'Market Area Blockage' },
  ];

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl z-0 relative group">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {congestionZones.map(zone => (
          <Circle 
            key={zone.id}
            center={zone.pos}
            radius={zone.radius}
            pathOptions={{ 
              fillColor: zone.color, 
              color: zone.color, 
              weight: 2, 
              fillOpacity: 0.4 
            }}
          >
            <Popup>
              <div className="p-2">
                <p className="font-black text-xs uppercase tracking-widest mb-1">{zone.label}</p>
                <p className="text-[10px] font-bold text-slate-500">Congestion Level: <span style={{ color: zone.color }}>{zone.level}</span></p>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
      
      <div className="absolute top-4 left-4 z-[400] bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-xl">
        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Infrastructure Legend</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[8px] font-bold text-white uppercase">Heavy Congestion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[8px] font-bold text-white uppercase">Moderate Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-bold text-white uppercase">Smooth Flow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrbanInfrastructureMap;
"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Target } from 'lucide-react';

// Custom Picker Icon using string template
const pickerIconMarkup = `
  <div class="relative flex items-center justify-center">
    <div class="absolute w-12 h-12 rounded-full bg-emerald-500/20 animate-pulse"></div>
    <div class="relative w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white transform -rotate-45">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white transform rotate-45"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  </div>
`;

const PickerIcon = L.divIcon({
  html: pickerIconMarkup,
  className: 'custom-picker-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

const MapEvents = ({ onChange }: { onChange: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ lat, lng, onChange }) => {
  return (
    <div className="h-[350px] w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl z-0 relative">
      <MapContainer 
        center={[lat, lng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <ChangeView center={[lat, lng]} />
        <MapEvents onChange={onChange} />
        <Marker position={[lat, lng]} icon={PickerIcon} />
      </MapContainer>
      
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-100">
          <Target className="w-5 h-5 text-emerald-600" />
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-2xl">
        <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">
          Tap map to adjust coordinates
        </p>
      </div>
    </div>
  );
};

export default LocationPicker;
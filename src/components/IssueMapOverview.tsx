"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Issue } from '@/backend/types';
import { Badge } from './ui/badge';
import { MapPin, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Custom Marker Creator
const createCustomIcon = (status: string, priority: string) => {
  const color = status === 'Resolved' ? '#10b981' : 
                status === 'In Progress' ? '#3b82f6' : 
                priority === 'High' ? '#ef4444' : '#f59e0b';

  const iconMarkup = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      <div className="absolute w-8 h-8 rounded-full animate-ping opacity-20" style={{ backgroundColor: color }} />
      <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white transform -rotate-45 hover:rotate-0 transition-transform duration-300" style={{ backgroundColor: color }}>
        <div className="transform rotate-45">
          {status === 'Resolved' ? <CheckCircle2 className="text-white w-5 h-5" /> : 
           status === 'In Progress' ? <Clock className="text-white w-5 h-5" /> : 
           <AlertCircle className="text-white w-5 h-5" />}
        </div>
      </div>
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: 'custom-map-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

interface IssueMapOverviewProps {
  issues: Issue[];
  center?: [number, number];
}

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center[0], center[1], map]);
  return null;
};

const IssueMapOverview: React.FC<IssueMapOverviewProps> = ({ issues, center: externalCenter }) => {
  const defaultCenter: [number, number] = [12.8406, 80.1534];
  const center: [number, number] = externalCenter 
    ? externalCenter 
    : (issues.length > 0 ? [issues[0].location.lat, issues[0].location.lng] : defaultCenter);

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden border-4 border-white shadow-2xl z-0 relative group">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* Modern Voyager Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <ChangeView center={center} />
        {issues.map(issue => (
          <Marker 
            key={issue.id} 
            position={[issue.location.lat, issue.location.lng]}
            icon={createCustomIcon(issue.status, issue.priority)}
          >
            <Popup className="custom-popup">
              <div className="p-3 space-y-3 min-w-[200px] bg-white rounded-2xl">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-slate-100">{issue.category}</Badge>
                  <Badge className={`text-[10px] px-2 py-0.5 rounded-lg ${
                    issue.status === 'Resolved' ? 'bg-emerald-500' : 
                    issue.status === 'In Progress' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}>{issue.status}</Badge>
                </div>
                <h4 className="font-black text-slate-900 m-0 leading-tight">{issue.title}</h4>
                <p className="text-xs text-slate-500 m-0 line-clamp-2 font-medium">{issue.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase border-t pt-2 mt-2">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span className="truncate">{issue.location.address.split(',')[0]}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Tactical Overlay UI */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-xl pointer-events-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-black text-white uppercase tracking-widest">Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[8px] font-black text-white uppercase tracking-widest">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[8px] font-black text-white uppercase tracking-widest">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueMapOverview;
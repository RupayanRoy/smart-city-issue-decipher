"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Issue } from '@/backend/types';
import { Badge } from './ui/badge';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface IssueMapOverviewProps {
  issues: Issue[];
  center?: [number, number];
}

// Component to handle map view updates when issues or center change
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center[0], center[1], map]); // Use individual coordinates to avoid reference issues
  return null;
};

const IssueMapOverview: React.FC<IssueMapOverviewProps> = ({ issues, center: externalCenter }) => {
  // Default to a central location if no issues exist
  const defaultCenter: [number, number] = [12.8406, 80.1534];
  
  // Use external center if provided, otherwise center on the most recent issue
  const center: [number, number] = externalCenter 
    ? externalCenter 
    : (issues.length > 0 ? [issues[0].location.lat, issues[0].location.lng] : defaultCenter);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} />
        {issues.map(issue => (
          <Marker key={issue.id} position={[issue.location.lat, issue.location.lng]}>
            <Popup>
              <div className="p-1 space-y-2 min-w-[150px]">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm m-0 truncate">{issue.title || issue.category}</h4>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">{issue.status}</Badge>
                </div>
                <p className="text-xs text-slate-600 m-0 line-clamp-2">{issue.description}</p>
                <div className="text-[10px] text-slate-400 font-bold uppercase border-t pt-1 mt-1">
                  {issue.location.address.split(',')[0]}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default IssueMapOverview;
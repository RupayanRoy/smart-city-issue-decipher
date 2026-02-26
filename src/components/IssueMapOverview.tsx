"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Issue } from '@/backend/types';
import { Badge } from './ui/badge';

interface IssueMapOverviewProps {
  issues: Issue[];
}

const IssueMapOverview: React.FC<IssueMapOverviewProps> = ({ issues }) => {
  const center: [number, number] = issues.length > 0 
    ? [issues[0].location.lat, issues[0].location.lng] 
    : [40.7128, -74.0060];

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {issues.map(issue => (
          <Marker key={issue.id} position={[issue.location.lat, issue.location.lng]}>
            <Popup>
              <div className="p-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm m-0">{issue.title}</h4>
                  <Badge variant="outline" className="text-[10px] px-1 py-0">{issue.status}</Badge>
                </div>
                <p className="text-xs text-slate-600 m-0 line-clamp-2">{issue.description}</p>
                <div className="text-[10px] text-slate-400">
                  {issue.location.address}
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
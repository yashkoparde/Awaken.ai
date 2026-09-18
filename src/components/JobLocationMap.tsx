import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Building2, DollarSign, ExternalLink } from 'lucide-react';

export interface LocalJobOpening {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  lat: number;
  lng: number;
  type: 'Full-time' | 'Remote' | 'Hybrid';
  distance: string;
}

interface JobMapProps {
  city: string;
  roleTitle: string;
  jobs: LocalJobOpening[];
  centerCoords: [number, number];
}

export default function JobLocationMap({ city, roleTitle, jobs, centerCoords }: JobMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // If map instance already exists, remove it before reinitializing
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: centerCoords,
      zoom: 12,
      zoomControl: true,
      attributionControl: false
    });

    // Dark-themed Map tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Custom Marker Icon
    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background: #2563eb;
          border: 2px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 0 14px rgba(37,99,235,0.6);
        ">
          <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16]
    });

    // Add Markers for each local job opening
    jobs.forEach((job) => {
      const marker = L.marker([job.lat, job.lng], { icon: customIcon }).addTo(map);
      
      const popupHtml = `
        <div style="
          background: #090d16;
          color: #f8fafc;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          font-family: inherit;
          min-width: 200px;
        ">
          <div style="font-size: 13px; font-weight: 800; color: #60a5fa; margin-bottom: 2px;">
            ${job.title}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #ffffff; margin-bottom: 6px;">
            🏢 ${job.company}
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">
            📍 ${job.location} (${job.distance})
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #34d399; margin-bottom: 6px;">
            💰 ${job.salary}
          </div>
          <div style="display: inline-block; font-size: 9px; text-transform: uppercase; font-weight: 800; padding: 2px 6px; background: rgba(37,99,235,0.2); color: #93c5fd; border-radius: 4px;">
            ${job.type}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'dark-leaflet-popup'
      });
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerCoords, jobs]);

  return (
    <div className="space-y-4">
      {/* Map Container Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Verified Openings in <span className="text-blue-400">{city}</span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Interactive Leaflet GIS radar matching <span className="text-emerald-400 font-semibold">{roleTitle}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase font-mono px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-bold">
            {jobs.length} Active Positions Geocoded
          </span>
        </div>
      </div>

      {/* Actual Leaflet Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl h-[280px] bg-slate-950 z-0">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        <div className="absolute bottom-2 left-2 z-[400] bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[9px] text-slate-400 font-mono">
          Powered by OpenStreetMap & Leaflet GIS
        </div>
      </div>

      {/* Local Opportunities Mini List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-3.5 bg-slate-950/50 hover:bg-slate-950/80 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all flex justify-between items-start"
          >
            <div className="space-y-1">
              <p className="text-xs font-bold text-white leading-snug">{job.title}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <span className="text-slate-300 font-semibold">{job.company}</span>
                <span>•</span>
                <span>{job.location}</span>
                <span>•</span>
                <span className="text-blue-400">{job.distance}</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-400">{job.salary}</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white/5 text-slate-300 border border-white/5">
              {job.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

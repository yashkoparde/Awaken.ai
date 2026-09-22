import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Building2, ExternalLink } from 'lucide-react';

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
  selectedJobId?: string;
  onSelectJob?: (job: LocalJobOpening) => void;
}

export default function JobLocationMap({ 
  city, 
  roleTitle, 
  jobs, 
  centerCoords,
  selectedJobId,
  onSelectJob 
}: JobMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map centered on coordinates
    const map = L.map(mapContainerRef.current, {
      center: centerCoords,
      zoom: 12,
      zoomControl: true,
      attributionControl: false
    });

    // Dark-themed tiles with warm amber/orange tinge overlay CSS applied via container
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    markersRef.current = {};

    // Custom Amber / Warm Orange Marker Icon Generator
    const createMarkerIcon = (isSelected: boolean) => {
      const bg = isSelected ? '#ea580c' : '#c2410c';
      const shadow = isSelected ? 'rgba(234,88,12,0.45)' : 'rgba(194,65,12,0.3)';
      const size = isSelected ? 32 : 26;
      const border = isSelected ? '2px solid #ffffff' : '1.5px solid #fed7aa';

      return L.divIcon({
        className: 'custom-orange-leaflet-marker',
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background: ${bg};
            border: ${border};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            box-shadow: 0 2px 8px ${shadow}, 0 1px 3px rgba(0,0,0,0.5);
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2 + 4)]
      });
    };

    // Add Markers for each localized job opening
    jobs.forEach((job) => {
      const isSelected = job.id === selectedJobId;
      const marker = L.marker([job.lat, job.lng], { 
        icon: createMarkerIcon(isSelected) 
      }).addTo(map);

      const popupHtml = `
        <div style="
          background: #090d16;
          color: #f8fafc;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(249,115,22,0.35);
          font-family: inherit;
          min-width: 220px;
        ">
          <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #f97316; margin-bottom: 4px;">
            Radar Geocoded Job
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #ffffff; margin-bottom: 4px; line-height: 1.3;">
            ${job.title}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #fb923c; margin-bottom: 6px;">
            🏢 ${job.company}
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 6px;">
            📍 ${job.location} • ${job.distance}
          </div>
          <div style="font-size: 12px; font-weight: 800; color: #34d399; margin-bottom: 8px;">
            ${job.salary}
          </div>
          <div style="display: inline-block; font-size: 9px; text-transform: uppercase; font-weight: 800; padding: 3px 8px; background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.3); color: #fdba74; border-radius: 6px;">
            ${job.type}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'dark-leaflet-popup'
      });

      marker.on('click', () => {
        if (onSelectJob) onSelectJob(job);
      });

      markersRef.current[job.id] = marker;
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerCoords, jobs]);

  // Handle selected job highlighting
  useEffect(() => {
    if (selectedJobId && markersRef.current[selectedJobId] && mapInstanceRef.current) {
      const marker = markersRef.current[selectedJobId];
      marker.openPopup();
      mapInstanceRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.5 });
    }
  }, [selectedJobId]);

  return (
    <div className="relative w-full h-full min-h-[340px] md:min-h-[460px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
      {/* Leaflet Map Canvas with Soft Orange Tinge filter */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full min-h-[340px] md:min-h-[460px] leaflet-orange-tinge z-0" 
      />

      {/* Floating Status Badge */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg text-[10px] text-slate-300 font-mono font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>India Live Radar: {city}</span>
      </div>

      {/* Bottom Metadata Info */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[9px] text-slate-400 font-mono flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span>OpenStreetMap Leaflet GIS (No API Key Required)</span>
      </div>
    </div>
  );
}

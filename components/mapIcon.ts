'use client'
import L from "leaflet"

export function createLucideMarkerIcon(iconColor = '#FF0000') {
  return L.divIcon({
    html: `
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="${iconColor}" 
        stroke-width="4" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-2 h-2 rounded-full bg-white"></div>
      </div>
    `,
    className: 'custom-marker-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24], // Point at bottom center
    popupAnchor: [0, -24]
  })
}
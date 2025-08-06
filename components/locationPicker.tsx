'use client';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

export function LocationPicker({ 
  onLocationChange 
}: {
  onLocationChange: (lat: number, lng: number) => void
}) {
  const [position, setPosition] = useState<[number, number] | null>(null)

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng])
        onLocationChange(e.latlng.lat, e.latlng.lng)
      },
    })

    return position ? <Marker position={position} /> : null
  }

  return (
    <div className="h-[300px]">
      <MapContainer center={[40.7128, -74.0060]} zoom={13} style={{ height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
      </MapContainer>
    </div>
  )
}
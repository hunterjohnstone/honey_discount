'use client';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import { createLucideMarkerIcon } from './mapIcon';

function LocationMarker({ position, setPosition, reverseGeocode }: { 
  position: [number, number] | null, 
  setPosition: (pos: [number, number]) => void,
  reverseGeocode: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      reverseGeocode(newPos[0], newPos[1]);
    }
  });

  return position ? (
    <Marker position={position}>
      <Popup>Your promotion location</Popup>
    </Marker>
  ) : null;
}

function AddSearchToMap({ onSearch }: { 
  onSearch: (result: any) => void 
}) {
  const map = useMapEvents({});
  const providerRef = useRef(new OpenStreetMapProvider());
  
  useEffect(() => {
    const handleResult = (e: any) => {
      onSearch(e.location);
    };

    map.on('geosearch/showlocation', handleResult);

    return () => {
      map.off('geosearch/showlocation', handleResult);
    };
  }, [map, onSearch]);

  return null;
}

export function LocationForm({ 
  value,
  onChange 
}: {
  value?: { address: string, coordinates: [number, number] };
  onChange: (location: { address: string, coordinates: [number, number] }) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(
    value?.coordinates ? [value.coordinates[0], value.coordinates[1]] : null
  );
  const [address, setAddress] = useState(value?.address || '');
  const mapRef = useRef<any>(null);
  const providerRef = useRef(new OpenStreetMapProvider());

  useEffect(() => {
    L.Marker.prototype.options.icon = createLucideMarkerIcon('#FF0000');
    setMounted(true);
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setAddress(data.display_name);
        onChange({
          address: data.display_name,
          coordinates: [lng, lat]
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {mounted ? (
        <div className="h-64 w-full z-40 rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={[37.177336, -3.598557]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <AddSearchToMap onSearch={(result) => {
              const newPos: [number, number] = [result.y, result.x];
              setPosition(newPos);
              setAddress(result.label);
              onChange({
                address: result.label,
                coordinates: [result.x, result.y]
              });
            }} />
            <LocationMarker 
              position={position} 
              setPosition={setPosition} 
              reverseGeocode={reverseGeocode} 
            />
          </MapContainer>
          {address}
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}
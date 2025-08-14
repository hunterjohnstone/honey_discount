import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";


// types.ts
export interface LocationResult {
  address: string;
  latitude: number;
  longitude: number;
}

export type MapboxGeocoderEvent = {
  result: {
    place_name: string;
    center: [number, number]; // [longitude, latitude]
  };
};

// Mapbox CSS overrides to match Tailwind
const MAPBOX_CSS_OVERRIDES = `
  .mapboxgl-ctrl-geocoder {
    border-radius: 0.5rem !important;
    border-color: #d1d5db !important;
    box-shadow: none !important;
    width: 100% !important;
    font-size: 0.875rem !important;
  }
`;

interface AddressAutocompleteProps {
  onSelect: (location: LocationResult) => void;
  onError?: (error: Error) => void;
  accessToken: string;
}

const AddressAutocomplete = ({ onSelect, accessToken }: AddressAutocompleteProps) => {
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);

  useEffect(() => {
    if (!geocoderContainerRef.current || geocoderRef.current) return;

    const geocoder = new MapboxGeocoder({
      accessToken,
      types: "address",
      placeholder: "Enter your address",
      marker: false,
      flyTo: false,
    });

    geocoder.on("result", (e: MapboxGeocoderEvent) => {
      const [longitude, latitude] = e.result.center;
      onSelect({ address: e.result.place_name, latitude, longitude });
    });

    // Attach to container *once*
    geocoder.addTo(geocoderContainerRef.current);
    geocoderRef.current = geocoder;

    return () => {
      geocoderRef.current?.off("result", () => {return null});
      geocoderContainerRef.current?.removeChild(
        geocoderContainerRef.current.firstChild as Node
      );
    };
  }, [accessToken, onSelect]);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">Address *</label>
      {/* Single container for Mapbox to inject into */}
      <div ref={geocoderContainerRef} className="w-full" />
    </div>
  );
};

export default AddressAutocomplete;
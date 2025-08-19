import React, { useEffect, useRef } from "react";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

export interface LocationResult {
  address: string;
  latitude: number;
  longitude: number;
}

export type MapboxGeocoderEvent = {
  result: {
    place_name: string;
    center: [number, number];
  };
};

const MAPBOX_CSS_OVERRIDES = `
  .mapboxgl-ctrl-geocoder {
    border-radius: 0.5rem !important;
    border: 1px solid !important;
    box-shadow: none !important;
    width: 100% !important;
    font-size: 0.875rem !important;
    height: 42px !important;
    padding: 0 !important;
    transition: all 0.2s !important;
  }
  .mapboxgl-ctrl-geocoder--input {
    height: 100% !important;
    padding: 0.5rem 2.5rem 0.5rem 0.75rem !important;
    border-radius: 0.5rem !important;
  }
  .mapboxgl-ctrl-geocoder .mapboxgl-ctrl-geocoder--pin-right > * {
    position: absolute !important;
    right: 0.75rem !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    margin-top: 0 !important;
  }
  .mapboxgl-ctrl-geocoder--icon-search {
    left: auto !important;
    right: 2.5rem !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
  }
  .mapboxgl-ctrl-geocoder--icon-close {
    width: 16px !important;
    height: 16px !important;
    margin-top: 0 !important;
  }
  .mapboxgl-ctrl-geocoder--button {
    padding: 0 !important;
    margin: 0 !important;
  }
  .mapboxgl-ctrl-geocoder--suggestions {
    border-radius: 0.5rem !important;
    margin-top: 0.25rem !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
  }
  .mapboxgl-ctrl-geocoder.mapboxgl-ctrl-geocoder--collapsed {
    width: 100% !important;
    min-width: 100% !important;
  }
`;

interface AddressAutocompleteProps {
  onSelect: (location: LocationResult) => void;
  onError?: (error: Error) => void;
  accessToken: string;
  error?: boolean;
}

const AddressAutocomplete = ({ 
  onSelect, 
  accessToken,
  error = false 
}: AddressAutocompleteProps) => {
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);

  useEffect(() => {
    if (!geocoderContainerRef.current || geocoderRef.current) return;
    // Inject the CSS overrides
    const styleElement = document.createElement('style');
    styleElement.innerHTML = MAPBOX_CSS_OVERRIDES;
    document.head.appendChild(styleElement);

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

    geocoder.addTo(geocoderContainerRef.current);
    geocoderRef.current = geocoder;

    return () => {
      geocoderRef.current?.off("result", () => { return null });
      geocoderContainerRef.current?.removeChild(
        geocoderContainerRef.current.firstChild as Node
      );
      document.head.removeChild(styleElement);
    };
  }, [accessToken, onSelect, error]);

  return (
    <div className="space-y-1">
      <div 
        ref={geocoderContainerRef} 
        className={`w-full ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 mapboxgl-ctrl-geocoder mapboxgl-ctrl-geocoder--input mapboxgl-ctrl-geocoder .mapboxgl-ctrl-geocoder--pin-right mapboxgl-ctrl-geocoder--icon-search mapboxgl-ctrl-geocoder--icon-close mapboxgl-ctrl-geocoder--button mapboxgl-ctrl-geocoder--suggestions mapboxgl-ctrl-geocoder.mapboxgl-ctrl-geocoder--collapsed`}
      />
      {error && <p className="mt-1 text-sm text-red-600">Address is required</p>}
    </div>
  );
};

export default AddressAutocomplete;
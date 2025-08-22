import React, { useEffect, useRef, useState } from "react";
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


interface AddressAutocompleteProps {
  onSelect: (location: LocationResult) => void;
  onError?: (error: Error) => void;
  accessToken: string;
  error?: boolean;
}

const AddressAutocomplete = ({ 
  onSelect, 
  accessToken,
}: AddressAutocompleteProps) => {
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


    useEffect(() => {
    if (!mounted || !geocoderContainerRef.current || geocoderRef.current) return;

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
      geocoderRef.current?.off("result", () => null);
      if (geocoderContainerRef.current?.firstChild) {
        geocoderContainerRef.current.removeChild(geocoderContainerRef.current.firstChild);
      }
    };
  }, [mounted, accessToken, onSelect]);

    if (!mounted) return <div className="h-[42px]" ></div>;


  return (
    <div className="space-y-1 z-5">
      <div 
        ref={geocoderContainerRef} 
        className={'w-full border-gray-300 z-5'}
      />
    </div>
  );
};

export default AddressAutocomplete;
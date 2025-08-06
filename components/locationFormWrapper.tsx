'use client'

import dynamic from 'next/dynamic';

const LocationForm = dynamic(
  () => import('@/components/locationForm').then((mod) => mod.LocationForm),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
    Loading map...
  </div>
  }
)

export default function LocationFormWrapper(props: any) {
  return (
    <LocationForm {...props} />
)
}
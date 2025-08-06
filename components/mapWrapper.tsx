'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(
  () => import('@/components/map').then((mod) => mod.Map),
  { 
    ssr: false,
    loading: () =>       
    <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
  }
)

export default function MapWrapper(props: any) {
  return <Map {...props} />
}
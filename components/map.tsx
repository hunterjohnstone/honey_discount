'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Promotion } from '@/app/(dashboard)/promotionForms/types'
import { createLucideMarkerIcon } from './mapIcon'
import Link from 'next/link'
import { RatingDisplay } from '@/app/(dashboard)/startDisplay'

export function Map({ promotions }: { promotions: Promotion[] }) {
  
  const markerIcon = createLucideMarkerIcon('#FF0000') //Red

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border">
      <MapContainer 
        center={[37.177336, -3.598557]} 
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {promotions.map(promo => (
          (promo.mapLocation && (
            <Marker 
            key={promo.id} 
            position={[promo.mapLocation[0], promo.mapLocation[1]]}
            icon={markerIcon}
          >
            <Popup>
              <Link
                  href={{pathname: `/${promo.id}`}}
              >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute top-2 right-2 bg-red-600 text-white text-sm font-bold px-2.5 py-1 rounded-full z-10 shadow-md transform rotate-6 hover:rotate-0 transition-transform">
                  {`${promo.discount} OFF`}
                </div>
                <img
                  src={promo.imageUrl}
                  alt={promo.title}
                  // className="w-full h-full object-cover"
                />
              </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{promo.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg font-medium text-sm">
                        €{promo.price}
                      </span>
                    </div>
                  </div>
                  <RatingDisplay 
                    averageRating={promo.starAverage} 
                    reviewCount={promo.numReviews} 
                    size="sm"
                  />
                  {/* <p className="text-gray-600 mb-3 pt-2">{promo.description}</p> */}
                </div>
              </Link>

            </Popup>
          </Marker>
          ))
        ))}
      </MapContainer>
    </div>
  )
}
'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Promotion } from '@/app/(dashboard)/promotionForms/types'
import { createLucideMarkerIcon } from './mapIcon'
import Link from 'next/link'
import { RatingDisplay } from '@/app/(dashboard)/startDisplay'
import UUIDImage from './UuidImage'
import { useTranslation } from '@/hooks/useTranslation'
import { useState } from 'react'
import { generateMapLinks } from './mapLink'

export function Map({ promotions }: { promotions: Promotion[] }) {
  const t = useTranslation();
  const markerIcon = createLucideMarkerIcon('#FF0000')
  const [showMapOptions, setShowMapOptions] = useState<{lat: number, lng: number, label: string} | null>(null)

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border">
      <MapContainer 
        center={[37.177336, -3.598557]} 
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className='z-10'
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {promotions.map(promotion => (
          promotion.mapLocation && (
            <Marker 
              key={promotion.id} 
              position={[promotion.mapLocation[0], promotion.mapLocation[1]]}
              icon={markerIcon}
            >
              <Popup>
                <div className="w-50"> {/* Reduced from w-64 */}
                  <Link
                    href={{pathname: `/${promotion.id}`}}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
                  >
                    {/* Image container - reduced height */}
                    <div className="h-36 overflow-hidden relative"> {/* Reduced from h-48 */}
                      {promotion.discount !== 'NaN%' && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-sm font-bold px-2.5 py-1 rounded-full z-10 shadow-md transform rotate-6 hover:rotate-0 transition-transform">
                          {`${promotion.discount} ${t('off')}`}
                        </div>
                      )}
                      <UUIDImage
                        uuid={promotion.imageLocation!}
                        alt={promotion.title}
                        fill
                        className="w-full h-full object-cover"
                        fallbackSrc="/default-product.jpg"
                      />
                    </div>
                    
                    {/* Content - reduced padding and smaller text */}
                    <div className="p-3"> {/* Reduced from p-4 */}
                      <div className="flex justify-between items-start mb-1"> {/* Reduced mb-2 to mb-1 */}
                        {/* Title with smaller text */}
                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2"> {/* Reduced from text-xl, added line-clamp */}
                          {promotion.title}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2"> {/* Added flex-shrink and ml */}
                          {promotion.oldPrice && (
                            <span className="text-gray-600 line-through text-sm"> {/* Reduced from text-md */}
                              €{promotion.oldPrice}
                            </span>
                          )}
                          {(promotion.price || promotion.oldPrice) && (
                            <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs"> {/* Reduced padding and text size */}
                              €{promotion.price}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Rating - ensure it fits */}
                      <RatingDisplay 
                        averageRating={promotion.starAverage} 
                        reviewCount={promotion.numReviews} 
                        size="sm"
                      />
                    </div>
                  </Link>
                  
                  {/* Open in Maps Button - smaller */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMapOptions({
                        lat: promotion.mapLocation![0],
                        lng: promotion.mapLocation![1],
                        label: promotion.title
                      });
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer border border-blue-200 rounded-lg py-1.5 px-2 text-xs font-medium transition-colors" 
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t('open_in_maps')}
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {/* Map Options Modal */}
      {showMapOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-4">{t('open_in_maps')}</h3>
            <div className="space-y-3">
              <a
                href={generateMapLinks(showMapOptions.lat, showMapOptions.lng, showMapOptions.label).google}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
              >
                <img src="/google.png" alt="Google Maps" className="w-6 h-6" />
                <span>Google Maps</span>
              </a>
              
              <a
                href={generateMapLinks(showMapOptions.lat, showMapOptions.lng, showMapOptions.label).apple}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
              >
                <img src="/apple.png" alt="Apple Maps" className="w-6 h-6" />
                <span>Apple Maps</span>
              </a>
            </div>
            <button
              onClick={() => setShowMapOptions(null)}
              className="cursor-pointer w-full mt-4 text-gray-500 hover:text-gray-700"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
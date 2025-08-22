'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';


interface UUIDImageProps {
  uuid: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  optimize?: boolean;
  fill?: boolean;
}

export default function UUIDImage({ 
    uuid, 
    alt, 
    width, 
    height, 
    className, 
    fallbackSrc = '/default-image.jpg',
    optimize = true,
    fill = false
}: UUIDImageProps) {
  const [error, setError] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      if (!uuid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Construct the API URL with query parameters
        const apiUrl = `/api/get_image?uuid=${encodeURIComponent(uuid)}${optimize && width && height ? `&w=${width}&h=${height}&q=80` : ''}`;

        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);

          setObjectUrl(url);
        } else {
          setObjectUrl('https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60')
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching image:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    // Clean up object URL on unmount
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [uuid, width, height, optimize]);

  if (loading) {
    return (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
    );
  }
if (!uuid || error || !objectUrl) {
    return fill ? (
      <Image
        src={fallbackSrc}
        alt={alt}
        fill
        className={className}
        style={{ objectFit: 'cover' }}
      />
    ) : (
      <Image
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  // Use Next.js Image for better optimization when possible
  if (!fill && width && height) {
    return (
      <Image
        src={objectUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setError(true)}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  // Fallback to regular img for responsive/fill layouts
  return (
    <img
      src={objectUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      style={fill ? { objectFit: 'cover' } : { width, height, objectFit: 'cover' }}
    />
  );
}
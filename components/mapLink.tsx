export const generateMapLinks = (lat: number, lng: number, label?: string) => {
  // Encode the label for URLs
  const encodedLabel = encodeURIComponent(label || 'Location');
  
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodedLabel}`,
    apple: `https://maps.apple.com/?q=${lat},${lng}&t=m&name=${encodedLabel}`,
    openStreet: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`
  };
};
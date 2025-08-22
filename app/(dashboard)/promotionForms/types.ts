export type InputPromotionSchema = {
    id: string;
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    category: string;
    startDate: string;
    endDate: string;
    location: string;
    isActive: boolean;
    numReviews: number;
    starAverage: string;
    userId: number;
  };

  export type GeoJSONPoint = {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat] for GeoJSON spec
  };
  export type Promotion = {
    id: string;
    title: string;
    description: string;
    price: string | undefined;
    oldPrice: string | undefined;
    imageUrl: string | undefined;
    category: string;
    startDate: string | undefined;
    endDate: string | undefined;
    reported: [];
    location: string;
    isActive: boolean;
    starAverage: number;
    mapLocation: [number, number] | undefined;
    numReviews: number;
    userId: number;
    longDescription: string;
    discount: string;
    website: string | undefined
    imageLocation: string | undefined;
  };

  export const basePromoObject: Promotion = {
    id: '',
    userId: 1,
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'food',
    startDate: new Date().toISOString(),
    endDate: undefined,
    reported: [],
    location: 'granada',
    starAverage: 0,
    numReviews: 0,
    longDescription: "",
    mapLocation: undefined,
    isActive: true,
    discount: "0%",
    oldPrice: "",
    website: undefined,
    imageLocation: undefined,
  };
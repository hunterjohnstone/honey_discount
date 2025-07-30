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

  export type Promotion = {
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
    starAverage: number;
    numReviews: number;
    userId: number;
    longDescription: string;
    discount: string;
  };

  export const basePromoObject: Promotion = {
    id: '',
    userId: 1,
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'food',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: 'granada',
    starAverage: 0,
    numReviews: 0,
    longDescription: "",
    isActive: true,
    discount: "0%"
  };
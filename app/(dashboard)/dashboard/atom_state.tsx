import { atom } from "jotai";

export type Promotion = {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    startDate: string;
    endDate: string;
    location: string;
    isActive: boolean;
  };

export const promotionsAtomState = atom<Promotion[]>([
    {
        id: '',
        title: '',
        description: '',
        price: 0,
        imageUrl: '',
        category: 'food',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: '',
        isActive: false
    }
  ]
);

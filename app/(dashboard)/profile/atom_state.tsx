import { atom } from "jotai";
import { Promotion } from "../promotionForms/types";

export const promotionsAtomState = atom<Promotion[]>([
    {
        id: '',
        title: '',
        description: '',
        oldPrice: '0.0',
        price: "0.0",
        imageUrl: '',
        category: 'food',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: 'granada',
        mapLocation: [0,0],
        imageLocation: undefined,
        isActive: true,
        numReviews: 0,
        starAverage: 0,
        userId: 1,
        reported: [],
        longDescription: "",
        discount: "0%",
        website: "",
    }
  ]
);

export const editPromotionState = atom<Promotion>({
  id: '',
  title: '',
  description: '',
  price: "0.0",
  oldPrice: '0.0',
  imageUrl: '',
  category: 'food',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  location: 'granada',
  mapLocation: [0,0],
  isActive: true,
  numReviews: 0,
  imageLocation: undefined,
  reported: [],
  starAverage: 0.0,
  userId: 1,
  longDescription: "",
  discount: "0%",
  website: "",

});
export const isEditingPromotionAtom = atom<Boolean>(false);
export const isAddingPromotionAtom = atom<Boolean>(false);
export const isReportingAtom = atom<Boolean>(false);

import { atom } from "jotai";
import { Promotion } from "../promotionForms/types";

export const promotionsAtomState = atom<Promotion[]>([
    {
        id: '',
        title: '',
        description: '',
        price: "0.0",
        imageUrl: '',
        category: 'food',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: 'granada',
        isActive: true,
        numReviews: 0,
        starAverage: 0,
        userId: 1,
        longDescription: "",
        discount: "0%"
    }
  ]
);

export const editPromotionState = atom<Promotion>({
  id: '',
  title: '',
  description: '',
  price: "0.0",
  imageUrl: '',
  category: 'food',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  location: 'granada',
  isActive: true,
  numReviews: 0,
  starAverage: 0.0,
  userId: 1,
  longDescription: "",
  discount: "0%",
});
export const isEditingPromotionAtom = atom<Boolean>(false);
export const isAddingPromotionAtom = atom<Boolean>(false);

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { promotionsAtomState } from '../profile/atom_state';
import { RatingDisplay } from '../startDisplay';
import { ReviewForm } from '../profile/review-form';

type Promotion = {
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
  starAverage: number;
  numReviews: number;
  userId: number;
};

export default function PromotionPage() {
  const router = useRouter();
  const id = useParams().id as string
  
  const promotionsAtom = useAtomValue<Promotion[]>(promotionsAtomState);
  const [promotion, setPromotionDisplay] = useState<Promotion | null>(null);

//   const { data: user } = useSWR<User>('/api/user', fetcher);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const myPromotion = promotionsAtom.find(promotion => 
          promotion.id === id
        );
        if (!myPromotion) {
          return;
        }
        setPromotionDisplay(myPromotion);
      } catch (error) {
        console.log("error")
        return;
      }

    }
    fetchData();

  }, [id, promotionsAtom, router]);

  if (!promotion) {
    console.log("cant find promotion by ID")
    return;
  }

  return (
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
  <div className="flex items-center gap-4 mb-6">
    <button 
      onClick={() => router.back()}
      className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
      Back to Promotions
    </button>
    <span className="text-gray-400">|</span>
    <span className="text-gray-600">Discovery</span>
  </div>

<div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
    <div className="h-64 overflow-hidden">
        <img
        src={promotion.imageUrl}
        alt={promotion.title}
        className="w-full h-full object-cover"
        />
    </div>
    <div className="p-6">
        <div className="flex justify-between items-start mb-4">
            <div className="flex">
                <h1 className="pr-5 text-2xl font-bold text-gray-800">{promotion.title}</h1>
                <RatingDisplay averageRating={promotion.starAverage} reviewCount={promotion.numReviews} size="md" />
            </div>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-lg font-medium">
                ${promotion.price}
            </span>
            </div>
            <p className="text-gray-600 mb-4">{promotion.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {promotion.category}
            </span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {promotion.location}
            </span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                Ends: {new Date(promotion.endDate).toLocaleDateString()}
            </span>
            </div>
        </div>
    </div>
    <ReviewForm productId={parseInt(promotion.id)}></ReviewForm>
</div>

  )};
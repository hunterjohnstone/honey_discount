'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { promotionsAtomState } from '../atom_state';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import { ReviewForm } from '../review-form';
import { ProductSchema, transformPromotionObject } from '../../transform';
import z from 'zod';

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
};

type Comment = {
  id: String,
  name: String
  text: String,
  date: String,
};

const fetcher = (url: string) => fetch(url).then((r) => r.json()); 

export default function PromotionPage() {
  const router = useRouter();
  const id = useParams().id as string
  
  const promotionsAtom = useAtomValue<Promotion[]>(promotionsAtomState);
  const [promotion, setPromotionDisplay] = useState<Promotion | null>(null);

  const { data: user } = useSWR<User>('/api/user', fetcher);

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

  if (!user) {
    console.log("cant find user ID")
    return;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button 
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
      >
        ← Back to Promotions
      </button>

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
            <h1 className="text-2xl font-bold text-gray-800">{promotion.title}</h1>
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


        <ReviewForm 
          productId={parseInt(promotion.id)}
          userId={user.id}
          />
  </div>
  )};
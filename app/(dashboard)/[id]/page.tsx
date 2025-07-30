'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RatingDisplay } from '../startDisplay';
import { ReviewForm } from '../profile/review-form';
import { Promotion } from '../promotionForms/types';

export default function PromotionPage() {
  const router = useRouter();
  const id = useParams().id as string
  
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchPromotion();
  }, []);

  const fetchPromotion = async () => {
    try {
      const response = await fetch('/api/product/get_data');
      if (!response.ok) throw new Error('Failed to fetch promotions');
      const data: Promotion[] = await response.json();
      const promo = data.find(promotion => promotion.id.toString() === id.toString());
      if (!promo) {
        throw new Error('Promotion not found');
      }
      setPromotion(promo);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading || !promotion) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
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
  <div className="h-64 overflow-hidden relative">
  {/* Discount Ribbon - Top Right Corner */}
  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold px-3 py-2 rounded-md shadow-lg z-10 transform rotate-3 hover:rotate-0 transition-transform">
    <div className="flex items-center gap-1">
      <span className="text-sm">SAVE</span>
      <span className="text-lg">{promotion.discount}</span>
    </div>
    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-700 rotate-45 transform -z-10"></div>
  </div>
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
          €{promotion.price}
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
      
      {/* Long Description Section */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Description</h2>
        <div className="prose max-w-none text-gray-600">
          {promotion.longDescription ? (
            <p className="whitespace-pre-line leading-relaxed">
              {promotion.longDescription}
            </p>
          ) : (
            <p className="text-gray-400 italic">No additional details provided</p>
          )}
        </div>
      </div>
    </div>
  </div>
  
  <ReviewForm productId={parseInt(promotion.id)}></ReviewForm>
</div>

  )};
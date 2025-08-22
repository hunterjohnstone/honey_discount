'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RatingDisplay } from '../startDisplay';
import { ReviewForm } from '../profile/review-form';
import { Promotion } from '../promotionForms/types';
import ReportForm from '../promotionForms/reportForm';
import { useSetAtom } from 'jotai';
import { isReportingAtom } from '../profile/atom_state';
import MapWrapper from '@/components/mapWrapper';
import { useTranslation } from '@/hooks/useTranslation';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import UUIDImage from '@/components/UuidImage';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PromotionPage() {
  const router = useRouter();
  const id = useParams().id as string
  const t  = useTranslation();
  
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const setIsReporting = useSetAtom(isReportingAtom);

  const { data: user } = useSWR<User>('/api/user', fetcher);

  useEffect(() => {
    window.scrollTo({ top: 4, behavior: 'smooth' })
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
      {t('back_to_promotions')}
    </button>
    <span className="text-gray-400">|</span>
    <span className="text-gray-600">{t('discovery')}</span>
  </div>

  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="relative w-full overflow-hidden">

      {/* if theres a discouhnt display the red flag */}
      {promotion.discount !== "NaN%" && (
      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold px-3 py-2 rounded-md shadow-lg z-10 transform rotate-3 hover:rotate-0 transition-transform">
        <div className="flex items-center gap-1">
          <span className="text-sm">{t('save')}</span>
          <span className="text-lg">{promotion.discount}</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-700 rotate-45 transform -z-10"></div>
      </div>
      )}
      <div className="w-full" style={{ maxHeight: '400px' }}>
        <UUIDImage
          uuid={promotion.imageLocation!}
          alt={promotion.title}
          fill
          // width={300}
          // height={200} // 800x533 maintains 3:2 ratio
          className="w-full h-full object-cover"
          fallbackSrc="/default-product.jpg"
        />
        </div>
      </div>

      {/* <img
        src={promotion.imageUrl}
        alt={promotion.title}
        className="w-full h-full object-cover"
      /> */}
    </div>
              
    <div className="p-4 sm:p-6">
      {/* Header section - stacked on mobile */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0 sm:pr-5">
            {promotion.title}
          </h1>
          <div className='mt-2'>
          <RatingDisplay
            averageRating={promotion.starAverage} 
            reviewCount={promotion.numReviews} 
            size={window.innerWidth < 640 ? "sm" : "md"} 
          />
          </div>
        </div>
        
        {/* Right-aligned elements - stays right but stacks internally on mobile */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 line-through text-lg">
              €{promotion.oldPrice}
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-base sm:text-lg font-medium">
              €{promotion.price}
            </span>
          </div>
          {/* Add Website Link Here */}
          {promotion.website && (
            <a 
              href={promotion.website.startsWith('http') ? promotion.website : `https://${promotion.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {t('visit_website')}
            </a>
          )}
          {user && (
            <button 
              className="text-xs sm:text-sm text-gray-500 cursor-pointer hover:text-red-500 flex items-center gap-1 transition-colors"
              onClick={() => setIsReporting(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Report Promotion
            </button>
          )}
        </div>
      </div>

      <p className="text-sm sm:text-base text-gray-600 mb-4">
        {promotion.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs sm:text-sm">
          {promotion.category}
        </span>
        {promotion.endDate &&         
        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs sm:text-sm">
          {t('ends')}: {new Date(promotion.endDate).toLocaleDateString()}
        </span>}
      </div>
      
      <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-4 sm:pt-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
          {t('description')}
        </h2>
        <div className="prose max-w-none text-gray-600">
          {promotion.longDescription ? (
            <p className="text-sm sm:text-base whitespace-pre-line leading-relaxed">
              {promotion.longDescription}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-gray-400 italic">
              {t('no_additional_details')}
            </p>
          )}
        </div>
    </div>

    {promotion.mapLocation !== null && <MapWrapper promotions={[promotion]}/>}
  </div>
  <ReviewForm productId={parseInt(promotion.id)}></ReviewForm>
  <ReportForm productId={parseInt(promotion.id)} ></ReportForm>
</div>

  )};
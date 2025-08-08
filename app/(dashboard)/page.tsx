"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Error from 'next/error';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import Link from 'next/link';
import { useAtom, useSetAtom } from 'jotai';
import { isAddingPromotionAtom, promotionsAtomState } from './profile/atom_state';
import { RatingDisplay } from './startDisplay';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Promotion } from './promotionForms/types';
import AddPromoForm from './promotionForms/addPromoForm';
import { Pagination } from '@/components/ui/pagination';
import { usePromotions } from './hooks/usePromo';
import MapWrapper from '@/components/mapWrapper';
import { MapPinIcon, XIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const DiscoverPage = () => {
  const router = useRouter();

  const {
    data: promotions,
    loading,
    error,
    pagination,
    fetchData,
  } = usePromotions()

  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [isAddingPromotion, setIsAddingPromotion] = useAtom(isAddingPromotionAtom);
  const [showMapModal, setShowMapModal] = useState(false);
  
  //Allow calls to API and use user body
  const {data: user } = useSWR<User>('/api/user', fetcher)

  //Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const t = useTranslation();

  useEffect(() => {
    fetchData();
    setFilteredPromotions(promotions)
  }, []);

  const handlePageChange = (page: number) => {
    fetchData(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    // Apply filters
    let results = [...promotions];
    if (categoryFilter !== 'all') {
      results = results.filter(p => p.category === categoryFilter);
    }
    if (locationFilter !== 'all') {
      results = results.filter(p => p.location === locationFilter);
    }
    const priceNum = 
    results = results.filter(p => parseFloat(p.price) >= priceRange[0] && parseFloat(p.price) <= priceRange[1]);
    
    setFilteredPromotions(results);
  }, [categoryFilter, locationFilter, priceRange, promotions]);

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <Head>
        <title>Discover Promotions</title>
        <meta name="description" content="Find the latest promotions and deals" />
      </Head>
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => setShowMapModal(true)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
          >
            <MapPinIcon className="w-5 h-5" />
            {t('map')}
          </Button>
            <Button
            onClick={() => (
              !user ?  router.push('/sign-up') :
              setIsAddingPromotion(true))}
            className="cursor-pointer"
          >
            {t("add new promotion")}
          </Button>
        </div>
        

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">{t('filters')}</h2>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setLocationFilter('all');
                setPriceRange([0, 200]);
              }}
              className="cursor-pointer text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              {t('clear_all_filters')}
            </button>
          </div>

          <div 
            className="grid gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))'
            }}
          >            
          {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('category')}</label>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all appearance-none bg-white"
                >
                  <option value="all">{t('all_categories')}</option>
                  <option value="food">{t('food_dining')}</option>
                  <option value="fitness">{t('fitness')}</option>
                  <option value="electronics">{t('electronics')}</option>
                  <option value="retail">{t('retail')}</option>
                  <option value="services">{t('services')}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg 
                    className="h-5 w-5 text-gray-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('price_range')}: <span className="font-semibold">€{priceRange[0]} - €{priceRange[1]}</span>
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>€0</span>
                  <span>€80</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isAddingPromotion && user && <AddPromoForm userId={user.id} onSuccess={fetchData}></AddPromoForm>}

        {/* MAPP */}
        {showMapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={() => setShowMapModal(false)}
            />            
            <div className="relative z-10 w-full max-w-6xl bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="flex justify-between items-center p-2 border-b">
                <button 
                  onClick={() => setShowMapModal(false)}
                  className="cursor-pointer p-2 text-gray-500 hover:text-gray-700"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="h-[70vh]">
                <MapWrapper promotions={filteredPromotions} />
              </div>
              
              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={() => setShowMapModal(false)}
                  className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* TODO: Move this section to a seperate component (also put spinner in the center)  */}
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
          {filteredPromotions.length > 0 ? (
            <div 
                className="grid gap-6"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))'
                }}
              >
                {filteredPromotions.map((promotion) => (
              <div key={promotion.id} className="w-full">
                <Link 
                  href={{pathname: `/${promotion.id}`}}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block h-full"
              >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute top-2 right-2 bg-red-600 text-white text-sm font-bold px-2.5 py-1 rounded-full z-10 shadow-md transform rotate-6 hover:rotate-0 transition-transform">
                  {`${promotion.discount} ${t('off')}`}
                </div>
                <img
                  src={promotion.imageUrl}
                  alt={promotion.title}
                  className="w-full h-full object-cover"
                />
              </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{promotion.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 line-through text-md">
                        €{promotion.oldPrice}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg font-medium text-sm">
                        €{promotion.price}
                      </span>
                    </div>
                  </div>
                  <RatingDisplay 
                    averageRating={promotion.starAverage} 
                    reviewCount={promotion.numReviews} 
                    size="sm"
                  />
                  <p className="text-gray-600 mb-3 pt-2">{promotion.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      {promotion.category}
                    </span>
                    {/* <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      {promotion.location}
                    </span> */}
                    {
                      promotion.endDate &&
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                        {new Date(promotion.endDate).toLocaleDateString()}
                      </span>
                    }
                  </div>
                </div>
              </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-600">{t('no_promotions_found')}</h3>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setLocationFilter('all');
                setPriceRange([0, 200]);
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              {t('clear_all_filters')}
            </button>
          </div>
        )}
        </div>
        )}
      </main>
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        className="my-8 justify-center"
      />
    </div>
  );
};

export default DiscoverPage;

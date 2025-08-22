"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import Link from 'next/link';
import { useAtom } from 'jotai';
import { isAddingPromotionAtom } from './profile/atom_state';
import { RatingDisplay } from './startDisplay';
import { Button } from '@/components/ui/button';
import { Promotion } from './promotionForms/types';
import AddPromoForm from './promotionForms/addPromoForm';
import { Pagination } from '@/components/ui/pagination';
import { usePromotions } from './hooks/usePromo';
import MapWrapper from '@/components/mapWrapper';
import { FilterIcon, MapPinIcon, StarIcon, XIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import UUIDImage from '@/components/UuidImage';

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const DiscoverPage = () => {

  const {
    data: promotions,
    allData,
    loading,
    error,
    pagination,
    fetchData,
    fetchAllData
  } = usePromotions();

  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [isAddingPromotion, setIsAddingPromotion] = useAtom(isAddingPromotionAtom);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  
  //Allow calls to API and use user body
  const {data: user } = useSWR<User>('/api/user', fetcher)

  //Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [locationFilter, setLocationFilter] = useState<string>('all');
  
  //filter modal
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const priceOptions = [0, 5, 10, 15, 20, 30, 40, 50, 60,70,80,90,100,120,140,150];


  const t = useTranslation();

  useEffect(() => {
    if (promotions.length > 0) {
      setFilteredPromotions(promotions);
    }

  }, [promotions]);

  const handlePageChange = (page: number) => {
    fetchData(page);
    window.scrollTo({ top: 0, behavior: 'smooth' })
  };

  // When map button/feature is clicked
  const handleMapClick = async () => {
    setMapLoading(true);
    try {
      await fetchAllData();
      setShowMapModal(true);
    } finally {
      setMapLoading(false);
    }
  };


  useEffect(() => {
    // Apply filters
    let results = [...promotions];
    if (categoryFilter !== 'all') {
      results = results.filter(p => p.category === categoryFilter);
    }
    if (locationFilter !== 'all') {
      results = results.filter(p => p.location === locationFilter);
    }

  results = results.filter(p => p.price ? parseFloat(p.price) >= priceRange[0] && parseFloat(p.price) <= priceRange[1] : p);

  if (ratingFilter) {
    results = results.filter(p => p.starAverage >= ratingFilter);
  }

    setFilteredPromotions(results);
  }, [categoryFilter, locationFilter, priceRange, promotions, ratingFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <Head>
        <title>Discover Promotions</title>
        <meta name="description" content="Find the latest promotions and deals" />
      </Head>
      <main className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  await handleMapClick();
                  setShowMapModal(true);
                }}
                className="gap-2 cursor-pointer"
              >
                <MapPinIcon className="w-4 h-4" />
                {t('map')}
              </Button>
            </div>
            {user && (
            <Button onClick={() => (setIsAddingPromotion(true))} className='cursor-pointer'>
              {t("add new promotion")}
            </Button>
            )}

          </div>
        

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4">
          {/* <div className="flex flex-col flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">{t('category')}</h2>
          </div> */}

          <div 
            className="grid gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))'
            }}
          >

          {/* Category Filter */}
          <div>
            {/* <label className="block text-sm font-medium text-gray-700 mb-2">{t('category')}</label> */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { value: 'all', icon: 'Globe', label: t('all_categories') },
                { value: 'food', icon: 'Utensils', label: t('food_dining') },
                { value: 'fitness', icon: 'Dumbbell', label: t('fitness') },
                { value: 'electronics', icon: 'Smartphone', label: t('electronics') },
                { value: 'retail', icon: 'ShoppingBag', label: t('retail') },
                { value: 'services', icon: 'Scissors', label: t('services') },
              ].map((item) => {
                const IconComponent = require('lucide-react')[item.icon];
                return (
                  <button
                    key={item.value}
                    onClick={() => setCategoryFilter(item.value)}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg transition-all
                      border hover:border-gray-300 cursor-pointer
                      ${categoryFilter === item.value
                        ? 'bg-blue-50 border-blue-300 text-blue-600 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600'}
                    `}
                    aria-label={item.label}
                  >
                    <IconComponent className="w-5 h-5 mb-1" />
                    <span className="text-xs text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          </div>
        </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <Button
              onClick={() => setShowFiltersModal(true)}
              variant="outline"
              className="gap-2 cursor-pointer"
            >
              <FilterIcon className="w-4 h-4" />
              {t('filters')}
            </Button>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setLocationFilter('all');
                setPriceRange([0, 200]);
              }}
              className="pl-4 cursor-pointer text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              {t('clear_all_filters')}
            </button>

            </div>
          </div>

        {showFiltersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred Background */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowFiltersModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative z-50 bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">{t('filters')}</h2>
              <button 
                onClick={() => setShowFiltersModal(false)}
                className="cursor-pointer p-1 rounded-full hover:bg-gray-100"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Filters Content */}
            <div className="p-6 space-y-6">
              {/* Price Range Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  {t('price_range')}
                </h3>
                
                {/* Price */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {t('min_price')}
                      </label>
                      <select
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg"
                      >
                        {priceOptions.map(price => (
                          <option key={`min-${price}`} value={price}>
                            €{price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {t('max_price')}
                      </label>
                      <select
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg"
                      >
                        {priceOptions.map(price => (
                          <option key={`max-${price}`} value={price}>
                            €{price}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  {t('categories')}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'all', icon: 'Globe', label: t('all_categories') },
                    { value: 'food', icon: 'Utensils', label: t('food_dining') },
                    { value: 'fitness', icon: 'Dumbbell', label: t('fitness') },
                    { value: 'electronics', icon: 'Smartphone', label: t('electronics') },
                    { value: 'retail', icon: 'ShoppingBag', label: t('retail') },
                    { value: 'services', icon: 'Scissors', label: t('services') },
                  ].map((item) => {
                    const IconComponent = require('lucide-react')[item.icon];
                    return (
                      <button
                        key={item.value}
                        onClick={() => setCategoryFilter(item.value)}
                        className={`
                          cursor-pointer flex flex-col items-center p-3 rounded-lg border transition-colors
                          ${categoryFilter === item.value
                            ? 'bg-blue-50 border-blue-300 text-blue-600'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}
                        `}
                      >
                        <IconComponent className="w-5 h-5 mb-1" />
                        <span className="text-xs">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  {t('minimum_rating')}
                </h3>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                      className={`
                        cursor-pointer p-2 rounded-lg border transition-colors
                        ${ratingFilter && star <= ratingFilter
                          ? 'bg-yellow-50 border-yellow-300 text-yellow-500'
                          : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}
                      `}
                    >
                      <StarIcon className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Apply/Clear Buttons */}
            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-between">
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setMinPrice(0);
                  setMaxPrice(150);
                  setRatingFilter(null);
                }}
                className="cursor-pointer px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {t('clear_all')}
              </button>
              <Button
                onClick={() => {
                  setPriceRange([minPrice, maxPrice]);
                  setShowFiltersModal(false);
                }}
                className="cursor-pointer px-4 py-2 rounded-lg"
              >
                {t('apply_filters')}
              </Button>
            </div>
          </div>
        </div>
      )}
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
                <MapWrapper promotions={allData} />
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
        {loading.page ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
          {filteredPromotions.length > 0 ? (
            <div 
                className="grid gap-6"
                style={{
                      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, clamp(250px, 30vw, 300px)), 1fr)'
                }}
              >
                {filteredPromotions.map((promotion) => (
              <div key={promotion.id} className="w-full">
                <Link 
                  href={{pathname: `/${promotion.id}`}}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block h-full"
              >
              <div className="h-48 overflow-hidden relative">
                {/* TODO: tech debt  - fix below. now it is stored in the DB as a string with percentage not good*/}
                {promotion.discount !== 'NaN%' && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-sm font-bold px-2.5 py-1 rounded-full z-10 shadow-md transform rotate-6 hover:rotate-0 transition-transform">
                  {`${promotion.discount} ${t('off')}`}
                </div>
                ) }
                  <UUIDImage
                    uuid={promotion.imageLocation!}
                    alt={promotion.title}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                    fallbackSrc="/default-product.jpg"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{promotion.title}</h3>
                    <div className="flex items-center gap-2">
                      {promotion.oldPrice && (
                      <span className="text-gray-700 line-through text-md">
                        €{promotion.oldPrice}
                      </span>
                      )}
                      {/* TODO: tech debt below. need to fix 'price' defualt value. This will work for now butthis logic is counter-intuitive */}
                      {(promotion.price || promotion.oldPrice) && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg font-medium text-sm">
                        €{promotion.price}
                      </span>
                      )}
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

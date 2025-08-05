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
  
  //Allow calls to API and use user body
  const {data: user } = useSWR<User>('/api/user', fetcher)

  //Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [locationFilter, setLocationFilter] = useState<string>('all');

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
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Discover Promotions</title>
        <meta name="description" content="Find the latest promotions and deals" />
      </Head>

      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Discover Promotions</h1>
              <Button
              onClick={() => (
                !user ?  router.push('/sign-up') :
                setIsAddingPromotion(true))}
              className="cursor-pointer"
            >
              Add New Promotion
            </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setLocationFilter('all');
                setPriceRange([0, 200]);
              }}
              className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear all filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="food">Food & Dining</option>
                  <option value="fitness">Fitness</option>
                  <option value="electronics">Electronics</option>
                  <option value="retail">Retail</option>
                  <option value="services">Services</option>
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
            
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="relative">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className={`block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all appearance-none bg-white bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem_1.25rem]`}
                >
                  <option value="all">All Locations</option>
                  <option value="granada">Granada</option>
                  <option value="sevilla">Sevilla</option>
                  <option value="madrid">Madrid</option>
                  <option value="suburbs">Suburbs</option>
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
                Price Range: <span className="font-semibold">€{priceRange[0]} - €{priceRange[1]}</span>
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>€0</span>
                  <span>€200</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isAddingPromotion && user && <AddPromoForm userId={user.id} onSuccess={fetchData}></AddPromoForm>}

        {/* TODO: Move this section to a seperate component (also put spinner in the center)  */}
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
          {filteredPromotions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromotions.map((promotion) => (
              <div key={promotion.id} className="w-full">
                <Link 
                  href={{pathname: `/${promotion.id}`}}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block h-full"
              >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute top-2 right-2 bg-red-600 text-white text-sm font-bold px-2.5 py-1 rounded-full z-10 shadow-md transform rotate-6 hover:rotate-0 transition-transform">
                  {`${promotion.discount} OFF`}
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
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      {promotion.location}
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
            <h3 className="text-xl font-medium text-gray-600">No promotions found matching your filters</h3>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setLocationFilter('all');
                setPriceRange([0, 200]);
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Clear all filters
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

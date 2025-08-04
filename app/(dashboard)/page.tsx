"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import z from 'zod';
import Error from 'next/error';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import Link from 'next/link';
import { useAtom, useSetAtom } from 'jotai';
import { isAddingPromotionAtom, promotionsAtomState } from './profile/atom_state';
import { ProductSchema, transformPromotionObject } from './transform';
import { RatingDisplay } from './startDisplay';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AddPromotionSection from './promotionForms/addPromotion';
import { basePromoObject, Promotion } from './promotionForms/types';
import AddPromoForm from './promotionForms/addPromoForm';


const fetcher = (url: string) => fetch(url).then((r) => r.json())

const DiscoverPage = () => {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [isAddingPromotion, setIsAddingPromotion] = useAtom(isAddingPromotionAtom);
  // const [newPromotion, setNewPromotion] = useState<Omit<Promotion, 'id' | 'isActive' | 'userId'>>(basePromoObject);
  
  const setNewPromotionsAtom = useSetAtom(promotionsAtomState)

  //Allow calls to API and use user body
  const {data: user } = useSWR<User>('/api/user', fetcher)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [locationFilter, setLocationFilter] = useState<string>('all');

  useEffect(() => {
    // Retrieve data from the DB via API call
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      //get product data from api
      const response = await fetch('/api/product/get_data');
      const data = await response.json();
      
      //transform the data
      // const transformedPromotions = data.map((offer : z.infer<typeof ProductSchema>) => transformPromotionObject(offer));

      setNewPromotionsAtom(data)

      //save it in state
      setPromotions(data);
      setFilteredPromotions(data);
    } catch (error) {
      console.log("you fucked up at fetch offers", error);
      return Error
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
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="food">Food & Dining</option>
                <option value="fitness">Fitness</option>
                <option value="electronics">Electronics</option>
                <option value="retail">Retail</option>
                <option value="services">Services</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Locations</option>
                <option value="granada">Granada</option>
                <option value="sevilla">Sevilla</option>
                <option value="madrid">Madrid</option>
                <option value="suburbs">Suburbs</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range: €{priceRange[0]} - €{priceRange[1]}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {isAddingPromotion && user && <AddPromoForm userId={user.id} onSuccess={fetchData}></AddPromoForm>}

        {filteredPromotions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromotions.map((promotion) => (
              <Link 
                key={promotion.id}
                href={{pathname: `/${promotion.id}`}}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
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
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      €{promotion.price}
                    </span>
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
      </main>
    </div>
  );
};

export default DiscoverPage;

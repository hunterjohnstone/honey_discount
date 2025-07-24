// pages/discover.tsx
"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import z from 'zod';
import { ProductSchema, transformPromotionObject } from '../transform';
import Error from 'next/error';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import Link from 'next/link';
import { useAtomValue, useSetAtom } from 'jotai';
import { promotionsAtomState } from "./atom_state";

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

type InputPromotionSchema = {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  isActive: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const DiscoverPage = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [newPromotion, setNewPromotion] = useState<Omit<InputPromotionSchema, 'id' | 'isActive'>>({
    title: '',
    description: '',
    price: '0',
    imageUrl: '',
    category: 'food',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: '',
  });
  

  const setNewPromotionsAtom = useSetAtom(promotionsAtomState)

  //Allow calls to API and use user body
  const {data: user } = useSWR<User>('/api/user', fetcher)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [locationFilter, setLocationFilter] = useState<string>('all');

  useEffect(() => {
    // Retrieve data from the DB via API call
    const fetchData = async () => {
      try {
        //get product data from api
        const response = await fetch('/api/product/get_data');
        const data = await response.json();
        
        //transform the data
        const transformedPromotions = data.map((offer : z.infer<typeof ProductSchema>) => transformPromotionObject(offer));

        setNewPromotionsAtom(transformedPromotions)

        //save it in state
        setPromotions(transformedPromotions);
        setFilteredPromotions(transformedPromotions);
      } catch (error) {
        console.log("you fucked up at fetch offers", error);
        return Error
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters
    let results = [...promotions];
    if (categoryFilter !== 'all') {
      results = results.filter(p => p.category === categoryFilter);
    }
    if (locationFilter !== 'all') {
      results = results.filter(p => p.location === locationFilter);
    }
    results = results.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    setFilteredPromotions(results);
  }, [categoryFilter, locationFilter, priceRange, promotions]);

  const handleAddPromotion = async () => {
    const promotionToAdd: Promotion = {
      ...newPromotion,
      price: z.coerce.number().parse(newPromotion.price), //price stored as a number so we coerce it
      id: Math.random().toString(36).substring(2, 9),
      isActive: true,
    };

    //TODO before moving to prod, add the REAL API endpoints in .env
      await fetch('/api/product/put_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add other headers if needed (e.g., Authorization)
        },
        body: JSON.stringify(promotionToAdd),
      });
    
    
    
    setPromotions([...promotions, promotionToAdd]);
    setIsAddingPromotion(false);
    setNewPromotion({
      title: '',
      description: '',
      price: '0',
      imageUrl: '',
      category: 'food',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPromotion({
      ...newPromotion,
      [name]: name === 'price' ? parseFloat(value) : value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Discover Promotions</title>
        <meta name="description" content="Find the latest promotions and deals" />
      </Head>

      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Discover Promotions</h1>
          { user?.name == "bigballs69" &&
            <button
              onClick={() => setIsAddingPromotion(true)}
              className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add New Promotion
            </button>
          }
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
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="5"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Add Promotion Modal */}
        {isAddingPromotion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Promotion</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newPromotion.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Promotion title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={newPromotion.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Detailed description of the promotion"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={newPromotion.price}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={newPromotion.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="food">Food & Dining</option>
                      <option value="fitness">Fitness</option>
                      <option value="electronics">Electronics</option>
                      <option value="retail">Retail</option>
                      <option value="services">Services</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={newPromotion.startDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={newPromotion.endDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    name="location"
                    value={newPromotion.location}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="granada">Granada</option>
                    <option value="sevilla">seville</option>
                    <option value="madrid">Madrid</option>
                    <option value="suburbs">Suburbs</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={newPromotion.imageUrl}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsAddingPromotion(false)}
                  className="px-4 py-2 border cursor-pointer border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPromotion}
                  className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded-md hover:bg-blue-700"
                >
                  Add Promotion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Promotions Grid */}
        {filteredPromotions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromotions.map((promotion) => (
              <Link 
                key={promotion.id}
                href={{pathname: `/dashboard/${promotion.id}`}}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
              >
                <div className="h-48 overflow-hidden">
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
                      ${promotion.price}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{promotion.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      {promotion.category}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      {promotion.location}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      {new Date(promotion.endDate).toLocaleDateString()}
                    </span>
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
                setPriceRange([0, 500]);
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
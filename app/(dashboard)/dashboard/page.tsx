// pages/discover.tsx
"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';

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

type InputPromotionSchema = { //price is a string
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

type ValidatedPromotionSchema = { //price is a number
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
}

const DiscoverPage = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [isEmployer, setIsEmployer] = useState(false);
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [newPromotion, setNewPromotion] = useState<Omit<ValidatedPromotionSchema, 'id' | 'isActive'>>({
    title: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: 'food',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: '',
  });

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [locationFilter, setLocationFilter] = useState<string>('all');

  useEffect(() => {
    // Simulate fetching promotions from an API
    const mockPromotions: Promotion[] = [
      {
        id: '1',
        title: 'Weekend Brunch Special',
        description: '20% off all brunch stuff',
        price: 25,
        imageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        category: 'food',
        startDate: '2023-06-01',
        endDate: '2023-06-30',
        location: 'granada',
        isActive: true,
      },
      {
        id: '2',
        title: 'Summer Fitness Package',
        description: '3 months of gym membership half price.',
        price: 120,
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        category: 'fitness',
        startDate: '2023-06-15',
        endDate: '2023-08-31',
        location: 'sevilla',
        isActive: true,
      },
      {
        id: '3',
        title: 'Tech Gadgets Sale',
        description: '30% off electronics.',
        price: 299,
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        category: 'electronics',
        startDate: '2023-06-10',
        endDate: '2023-06-20',
        location: 'madrid',
        isActive: true,
      },
    ];
    setPromotions(mockPromotions);
    setFilteredPromotions(mockPromotions);

    // Check if user is an employer (in a real app, this would come from auth context)
    setIsEmployer(false); // Change to true to see employer features
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

  const handleAddPromotion = () => {
    // TODO: send this data to the API which stores information in the postgres DB
    // In a real app, this would call an API
    const promotionToAdd: Promotion = {
      ...newPromotion,
      id: Math.random().toString(36).substring(2, 9),
      isActive: true,
    };
    
    setPromotions([...promotions, promotionToAdd]);
    setIsAddingPromotion(false);
    setNewPromotion({
      title: '',
      description: '',
      price: 0,
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
          {/* //TODO: UPDATE SO ONLY CERTAIN USERNAMES CAN ADD PROMOTIONS */}
          {
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
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPromotion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
              <div key={promotion.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
                setPriceRange([0, 100]);
              }}
              className="mt-4 text-blue-600 hover:text-blue-800"
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
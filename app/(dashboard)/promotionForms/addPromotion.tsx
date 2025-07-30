import { useSetAtom } from "jotai";
import { ChangeEvent, useState } from "react";
import z from "zod";
import { isAddingPromotionAtom } from "../profile/atom_state";
import { useRouter } from "next/navigation";
import { basePromoObject, InputPromotionSchema, Promotion } from "./types";

export default function AddPromotionSection({userId, onSuccess}: {
    userId: number,
    onSuccess: () => void
}) {
    const [price, setPrice] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [submitError, setSubmitError ] = useState<string>('');
    const router = useRouter()
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [newPromotion, setNewPromotion] = useState<Omit<Promotion, 'id' | 'isActive' | 'userId'>>(basePromoObject);
      const setIsAddingPromotion = useSetAtom(isAddingPromotionAtom);

    const handleAddPromotion = async (userId: number) => {
        if (newPromotion.imageUrl === "") {
            newPromotion.imageUrl = "https://t3.ftcdn.net/jpg/11/86/32/62/360_F_1186326217_w0LDFI0Mv6G8gJnSBypbcVWvX1KWyDh0.jpg";
        }
        // if (newPromotion.price === "") {
        //     console.log("we are here.")
        //     setSubmitError("Please set a price before submitting");
        //     return null;
        // }
        const promotionToAdd: Promotion = {
          ...newPromotion,
          userId,
          id: Math.random().toString(36).substring(2, 9),
          isActive: true,
    
        };
    
        //TODO before moving to prod, add the REAL API endpoints in .env
          await fetch('/api/product/put_data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(promotionToAdd),
          });
        
        setPromotions([...promotions, promotionToAdd]);
        setNewPromotion(basePromoObject);
        router.refresh();
        setIsAddingPromotion(false);
        onSuccess();
      };

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewPromotion({
          ...newPromotion,
          price: price,
          [name]: name === 'price' ? parseFloat(value) : value,
        });
      };
      
      const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        // Allow empty string
        if (input === '') {
          setPrice('0');
          setError(null);
          return;
        }
        // Replace comma with dot for consistent decimal handling
        const normalizedInput = input.replace(',', '.');
    
        // Validate the format
        if (!/^\d*\.?\d{0,2}$/.test(normalizedInput)) {
          setError('Maximum 2 decimal places allowed');
          return;
        }
        // Split into whole and decimal parts
        const parts = normalizedInput.split('.');
        
        // Validate whole number part (max 4 digits)
        if (parts[0] && parts[0].length > 4) {
          setError('Maximum 4 digits before decimal');
          return;
        }
    
        // Validate decimal part (max 2 digits)
        if (parts[1] && parts[1].length > 2) {
          setError('Maximum 2 decimal places allowed');
          return;
        }
    
        // If all validations pass
        setPrice(input);
        setError(null);
      };

return (

        <div>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Create New Promotion</h2>
                    <button
                        onClick={() => setIsAddingPromotion(false)}
                        className="cursor-pointer text-gray-400 hover:text-gray-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    </div>
    
                    <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={newPromotion.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Summer Special"
                            required
                        />
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            name="category"
                            value={newPromotion.category}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="food">Food & Dining</option>
                            <option value="fitness">Fitness</option>
                            <option value="electronics">Electronics</option>
                            <option value="retail">Retail</option>
                            <option value="services">Services</option>
                        </select>
                        </div>
                    </div>
    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                        name="description"
                        value={newPromotion.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Describe your promotion..."
                        required
                        />
                    </div>
    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (€)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                <input
                                type="text"
                                name="price"
                                value={price}
                                onChange={handlePriceChange}
                                className={`w-full pl-8 pr-3 py-2 border ${
                                    error ? 'border-red-500' : 'border-gray-300'
                                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                                inputMode="decimal" // Shows numeric keyboard on mobile
                                />
                            </div>
                            {error && (<p className="mt-1 text-sm text-red-600">{error}</p>)}
                            {/* {(submitError !== "") && (<p className="mt-1 text-sm text-red-600">{submitError}</p>)} */}
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <select
                            name="location"
                            value={newPromotion.location}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="granada">Granada</option>
                            <option value="sevilla">Seville</option>
                            <option value="madrid">Madrid</option>
                            <option value="suburbs">Suburbs</option>
                        </select>
                        </div>
                    </div>
    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={newPromotion.startDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={newPromotion.endDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        </div>
                    </div>
    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                        <input
                        type="text"
                        name="imageUrl"
                        value={newPromotion.imageUrl}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/image.jpg"
                        required
                        />
                    </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-8">
                    <button
                        onClick={() => setIsAddingPromotion(false)}
                        className="cursor-pointer px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleAddPromotion(userId)}
                        className="cursor-pointer px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Create Promotion
                    </button>
                    </div>
                </div>
            </div>
        </div>
)};

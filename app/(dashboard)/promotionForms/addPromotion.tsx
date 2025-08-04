import { useSetAtom } from "jotai";
import { ChangeEvent, useState } from "react";
import z from "zod";
import { isAddingPromotionAtom } from "../profile/atom_state";
import { useRouter } from "next/navigation";
import { basePromoObject, Promotion } from "./types";

export default function AddPromotionSection({userId, onSuccess}: {
    userId: number,
    onSuccess: () => void
}) {
    const [price, setPrice] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter()
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [newPromotion, setNewPromotion] = useState<Omit<Promotion, | 'isActive' | 'userId'>>(basePromoObject);
      const setIsAddingPromotion = useSetAtom(isAddingPromotionAtom);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleAddPromotion = async (userId: number) => {
        setIsSubmitting(true);
        if (newPromotion.imageUrl === "") {
            newPromotion.imageUrl = "https://t3.ftcdn.net/jpg/11/86/32/62/360_F_1186326217_w0LDFI0Mv6G8gJnSBypbcVWvX1KWyDh0.jpg";
        }
        const promotionToAdd: Promotion = {
          ...newPromotion,
          userId,
          isActive: true,
          price,
        };
        //TODO before moving to prod, add the REAL API endpoints in .env
          await fetch('/api/product/put_data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(promotionToAdd),
          });
        setIsSubmitting(false);
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
          [name]: value,
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
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-gray-100 flex flex-col max-h-[90vh]">
    {/* Header with close button */}
    <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
      <h2 className="text-2xl font-bold text-gray-800">Create New Promotion</h2>
      <button
        onClick={() => setIsAddingPromotion(false)}
        className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    {/* Scrollable content area with visual cues */}
    <div className="relative flex-1 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {/* Gradient fade at bottom to indicate more content */}
      <div className="sticky bottom-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none flex items-end justify-center pb-2">
        <svg className="w-6 h-6 text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
      
      {/* Form content */}
      <div className="p-6 space-y-5 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title*</label>
            <input
              id="title"
              type="text"
              name="title"
              value={newPromotion.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Summer Special"
              required
              aria-required="true"
            />
          </div>
          
          {/* Category */}
          <div className="space-y-1">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category*</label>
            <select
              id="category"
              name="category"
              value={newPromotion.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              aria-required="true"
            >
              <option value="">Select a category</option>
              <option value="food">Food & Dining</option>
              <option value="fitness">Fitness</option>
              <option value="electronics">Electronics</option>
              <option value="retail">Retail</option>
              <option value="services">Services</option>
            </select>
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Short Description*</label>
          <textarea
            id="description"
            name="description"
            value={newPromotion.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Brief description that will appear in listings..."
            required
            aria-required="true"
          />
        </div>

        {/* Long Description */}
        <div className="space-y-1">
          <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700">Full Details*</label>
          <textarea
            id="longDescription"
            name="longDescription"
            value={newPromotion.longDescription}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={5}
            placeholder="Complete details about your promotion..."
            required
            aria-required="true"
          />
        </div>

        {/* Price & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Price */}
          <div className="space-y-1">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (€)*</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">€</span>
              <input
                id="price"
                type="text"
                name="price"
                value={price}
                onChange={handlePriceChange}
                className={`w-full pl-8 pr-3 py-2 border ${
                  error ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="0.00"
                inputMode="decimal"
                required
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby={error ? "price-error" : undefined}
              />
            </div>
            {error && (
              <p id="price-error" className="mt-1 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="oldPrice" className="block text-sm font-medium text-gray-700">Previous Price (€)*</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">€</span>
              <input
                id="price"
                type="text"
                name="price"
                value={price}
                onChange={handlePriceChange}
                className={`w-full pl-8 pr-3 py-2 border ${
                  error ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="0.00"
                inputMode="decimal"
                required
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby={error ? "price-error" : undefined}
              />
            </div>
            {error && (
              <p id="price-error" className="mt-1 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          
          {/* Location */}
          <div className="space-y-1">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location*</label>
            <select
              id="location"
              name="location"
              value={newPromotion.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              aria-required="true"
            >
              <option value="">Select location</option>
              <option value="granada">Granada</option>
              <option value="sevilla">Seville</option>
              <option value="madrid">Madrid</option>
              <option value="suburbs">Suburbs</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Start Date */}
          <div className="space-y-1">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date*</label>
            <input
              id="startDate"
              type="date"
              name="startDate"
              value={newPromotion.startDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              aria-required="true"
            />
          </div>
          
          {/* End Date */}
          <div className="space-y-1">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date*</label>
            <input
              id="endDate"
              type="date"
              name="endDate"
              value={newPromotion.endDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              aria-required="true"
            />
          </div>
        </div>

        {/* Image URL */}
        <div className="space-y-1">
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL*</label>
          <input
            id="imageUrl"
            type="url"
            name="imageUrl"
            value={newPromotion.imageUrl}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
            required
            aria-required="true"
          />
        </div>
      </div>
    </div>

    {/* Sticky footer with action buttons */}
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setIsAddingPromotion(false)}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          onClick={() => handleAddPromotion(userId)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            'Create Promotion'
          )}
        </button>
      </div>
    </div>
  </div>
</div>
)};

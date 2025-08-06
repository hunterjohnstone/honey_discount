import { useSetAtom } from "jotai"
import { isEditingPromotionAtom } from "../profile/atom_state"
import { ChangeEvent, useState } from "react";
import { InputPromotionSchema, Promotion } from "./types";


export default function EditPromotion({ promotionToEdit, onSuccess } : {
    promotionToEdit: Promotion
    onSuccess: () => void
}) {
    // const router = useRouter();
    const [price, setPrice] = useState<string>(promotionToEdit.price);
    const [error, setError] = useState<string | null>(null);
    const setIsEditingPromotion = useSetAtom(isEditingPromotionAtom);
    const [promotion, setPromotion] = useState<Omit<Promotion,| 'isActive' | 'string' >>({
        ...promotionToEdit,
        price: promotionToEdit.price.toString(),
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPromotion({
          ...promotion,
          [name]: value,
        });
      };
    
    const handleEditPromotion = async () => {
        //first need to validate price field
        const promotionToEdit: Promotion = {
            ...promotion,
            price,
            isActive: true,
            id: promotion.id,
        }
        await fetch('/api/product/update_data', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(promotionToEdit),
        });
        setIsEditingPromotion(false);
        onSuccess();
    };

    const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        // Allow empty string
        if (input === '') {
          setPrice('');
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
                <h2 className="text-2xl font-bold text-gray-800">Edit Promotion</h2>
                <button
                    onClick={() => setIsEditingPromotion(false)}
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
                        value={promotion.title}
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
                        value={promotion.category}
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
                    value={promotion.description}
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
                              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                            inputMode="decimal" // Shows numeric keyboard on mobile
                            />
                        </div>
                        {error && (<p className="mt-1 text-sm text-red-600">{error}</p>)}
                    </div>
                    
                    {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                        name="location"
                        value={promotion.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="granada">Granada</option>
                        <option value="sevilla">Seville</option>
                        <option value="madrid">Madrid</option>
                        <option value="suburbs">Suburbs</option>
                    </select>
                    </div> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        value={promotion.startDate}
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
                        value={promotion.endDate}
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
                    value={promotion.imageUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                    required
                    />
                </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-8">
                <button
                    onClick={() => setIsEditingPromotion(false)}
                    className="cursor-pointer px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => handleEditPromotion()}
                    className="cursor-pointer text-white bg-black hover:bg-gray-800 px-5 py-2.5 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2"
                >
                    Edit Promotion
                </button>
                </div>
            </div>
        </div>
    </div>
    )
};
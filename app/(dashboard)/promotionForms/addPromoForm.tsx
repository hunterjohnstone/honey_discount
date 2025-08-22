import { useForm } from 'react-hook-form';
import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { isAddingPromotionAtom } from "../profile/atom_state";
import { basePromoObject, Promotion } from "./types";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useTranslation } from '@/hooks/useTranslation';
import AddressAutocomplete, { LocationResult } from './addressPicker';
import AddImage from '@/components/addImage';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const safeDateDisplay = (dateString: string | undefined, fallback = '') => {
  if (!dateString) return fallback;
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return fallback;
  }
};

// Define validation schema
const promotionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(100, "Brief description is maximum 100 characters"),
  longDescription: z.string().min(1, 'Detailed description is required'),
  price: z.string().regex(/^\d*\.?\d{0,2}$/, 'Invalid price format (e.g. 12.99)'),
  oldPrice: z.string().regex(/^\d*\.?\d{0,2}$/, 'Invalid price format (e.g. 24.99)'),
  location: z.string(),
  website: z.string(),
  mapLocation: z.object({
    address: z.string(),
    latitude: z.number(),
    longitude: z.number()
  }).optional(),
  startDate: z.string()
    .optional()
    .refine(val => !val || !isNaN(new Date(val).getTime()), {
      message: "Invalid start date",
    }),
  endDate: z.string()
    .optional()
    .refine(val => !val || !isNaN(new Date(val).getTime()), {
      message: "Invalid end date",
    }),
  imageLocation: z.string().min(1, 'Image is required'), // Add validation for image
}).refine(
  data => !data.endDate || !data.startDate || new Date(data.endDate) >= new Date(data.startDate),
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

type PromotionFormData = z.infer<typeof promotionSchema>;

export default function AddPromoForm({ userId, onSuccess }: {
  userId: number,
  onSuccess: () => void
}) {
  const router = useRouter();
  const setIsAddingPromotion = useSetAtom(isAddingPromotionAtom);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      ...basePromoObject,
      price: '',
      oldPrice: '',
      mapLocation: undefined
    }
  });
  
  // const formMapLocation = watch("mapLocation");
  const [imageLocationUuid, setImageLocationUuid ] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  const t = useTranslation();

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Generate UUID for this image
    const newUuid = uuidv4();
    setImageLocationUuid(newUuid);
    setValue('imageLocation', newUuid, { shouldValidate: true });
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageLocationUuid('');
    setValue('imageLocation', '', { shouldValidate: true });
  };


  const handlePriceChange = (field: 'price' | 'oldPrice', e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setValue(field, value);
      trigger(field); // Trigger validation after change
    }
  };

  const handleAddressSelect = useCallback((result: LocationResult | null) => {
    if (result) {
      setValue("mapLocation", {
        address: result.address,
        latitude: result.latitude,
        longitude: result.longitude
      }, { shouldValidate: true });
    } else {
      // Clear the mapLocation if needed
      setValue("mapLocation", undefined, { shouldValidate: true });
    }
  }, [setValue]);

  const onSubmit = async (data: PromotionFormData) => {
    try {

      if (!imageFile || !imageLocationUuid) {
        trigger('imageLocation');
        toast.error('Please upload an image');
        return;
      }
    
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('title', imageLocationUuid);
      console.log("about to submit")
      const reponse = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      })

      if (!reponse.ok) {
        toast.error('Image failed to upload');
        throw new Error('Image upload failed');
      }

      // Convert string prices to numbers
      const priceValue = parseFloat(data.price);
      const oldPriceValue = parseFloat(data.oldPrice);
      
      // Validate that discounted price is lower than original
      if (priceValue >= oldPriceValue) {
        toast.error('Discounted price must be lower than original price');
        return;
      }
      const discount = Math.round((1 - parseFloat(watch('price')) / parseFloat(watch('oldPrice'))) * 100).toString();      

      const promotionToAdd: Omit<Promotion, "id" | "numReviews" | "starAverage" | "reported">  = {
        title: data.title,
        description: data.description,
        longDescription: data.longDescription,
        price: data.price || undefined,
        oldPrice: data.oldPrice || undefined,
        discount: discount + "%",
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        imageUrl: undefined,
        userId,
        isActive: true,
      mapLocation: (data.mapLocation 
        ? [data.mapLocation.latitude, data.mapLocation.longitude] 
        : undefined),
      website: data.website,
      imageLocation: imageLocationUuid,
      };

      if (!promotionToAdd.imageLocation) {
        switch (promotionToAdd.category) {
          case 'food':
            promotionToAdd.imageUrl = 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
            break;
          case 'fitness':
            promotionToAdd.imageUrl = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
            break;
          case 'electronics':
            promotionToAdd.imageUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
            break;
          case 'retail':
            promotionToAdd.imageUrl = 'https://t3.ftcdn.net/jpg/11/86/32/62/360_F_1186326217_w0LDFI0Mv6G8gJnSBypbcVWvX1KWyDh0.jpg';
            break;
          case 'services':
            promotionToAdd.imageUrl = 'https://media.istockphoto.com/id/1457385092/photo/an-asian-young-technician-service-man-wearing-blue-uniform-checking-cleaning-air-conditioner.jpg?s=612x612&w=0&k=20&c=Tqu5jMzD1TKFO1Fvow6d0JMDsEGU8T3kToP706bQFQI=';
            //deault 'i.e., services. TODO: IF MORE CATEGORIES ARE ADDED WE NEED TO CHANGE THIS 
          default: promotionToAdd.imageUrl = 'https://media.istockphoto.com/id/1457385092/photo/an-asian-young-technician-service-man-wearing-blue-uniform-checking-cleaning-air-conditioner.jpg?s=612x612&w=0&k=20&c=Tqu5jMzD1TKFO1Fvow6d0JMDsEGU8T3kToP706bQFQI=';
        }
      };

      await fetch('/api/product/put_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( promotionToAdd),
      });

      onSuccess();
      router.refresh();
      setIsAddingPromotion(false);
    } catch (error) {
      toast.error("failed to submit Please check all fields are correct.")
      console.error('Error creating promotion:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800">{t('create_promotion')}</h2>
          <button
            onClick={() => setIsAddingPromotion(false)}
            className="cursor-pointer text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="relative flex-1 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="p-6 space-y-5 pb-8">
            {/* Title and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  {t('title')}*
                </label>    
              <input
                  id="title"
                  {...register('title')}
                  className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder={t("summer_special")}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{t('title_required')}</p>}
              </div>
              
              <div className="space-y-1">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">{t("category")}*</label>
                <select
                  id="category"
                  {...register('category')}
                  className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">{t("select_category")}</option>
                  <option value="food">{t("food_dining")}</option>
                  <option value="fitness">{t("fitness")}</option>
                  <option value="electronics">{t("electronics")}</option>
                  <option value="retail">{t("retail")}</option>
                  <option value="services">{t("services")}</option>
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{t('category_required')}</p>}
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t("short_description")}*</label>
              <textarea
                id="description"
                {...register('description')}
                className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                rows={3}
                placeholder={t("brief_description")}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{t('short_description_required')}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700">{t("full_description")}*</label>
              <textarea
                id="longDescription"
                {...register('longDescription')}
                className={`w-full px-3 py-2 border ${errors.longDescription ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                rows={5}
                placeholder={t("complete_details")}
              />
              {errors.longDescription && <p className="mt-1 text-sm text-red-600">{t('description_required')}</p>}
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Discounted Price */}
              <div className="space-y-1">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">{t("discounted_price")}*</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">€</span>
                  <input
                    id="price"
                    {...register('price')}
                    onChange={(e) => handlePriceChange('price', e)}
                    value={watch('price')}
                    className={`w-full pl-8 pr-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="19.99"
                    inputMode="decimal"
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-600">{t("discounted_price_required")}</p>}
              </div>
              
              {/* Original Price */}
              <div className="space-y-1">
                <label htmlFor="oldPrice" className="block text-sm font-medium text-gray-700">{t("original_price")}*</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">€</span>
                  <input
                    id="oldPrice"
                    {...register('oldPrice')}
                    onChange={(e) => handlePriceChange('oldPrice', e)}
                    value={watch('oldPrice')}
                    className={`w-full pl-8 pr-3 py-2 border ${errors.oldPrice ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="24.99"
                    inputMode="decimal"
                  />
                </div>
                {errors.oldPrice && <p className="mt-1 text-sm text-red-600">{t("original_price_required")}</p>}
                {watch('oldPrice') && watch('price') && (
                  <p className="mt-1 text-sm text-green-600">
                    {t("discount")}: {Math.round((1 - parseFloat(watch('price')) / parseFloat(watch('oldPrice'))) * 100)}%
                  </p>
                )}
              </div>
            </div>

            {/* Location and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">{t("map_location")}</label>
                <AddressAutocomplete
                  accessToken={process.env.NEXT_PUBLIC_MAP_TOKEN || ""}
                  onSelect={handleAddressSelect}
                  // error={!!errors.mapLocation}
                />
                {/* <input type="hidden" {...register("mapLocation")} /> */}
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  {t("start_date")}
                </label>
                <div className="relative">
                  <input
                    id="startDate"
                    type="date"
                    {...register('startDate')}
                    className={`w-full px-3 py-2 border pr-8 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setValue('startDate', '', { shouldValidate: true })}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear start date"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 pt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{t("invalid_start_date")}</p>
                )}
              </div>

              {/* End Date - Optional */}
              <div className="space-y-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  {t("end_date")}
                  <span className="ml-1 text-xs text-gray-500">({t("must_be_after")}{safeDateDisplay(watch('startDate'), 'start date')})</span>
                </label>
                <div className="relative">
                  <input
                    id="endDate"
                    type="date"
                    {...register('endDate')}
                    min={watch('startDate') || undefined}
                    className={`w-full px-3 py-2 border pr-10 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    disabled={!watch('startDate')}
                  />
                  <button
                    type="button"
                    onClick={() => setValue('endDate', '', { shouldValidate: true })}
                    className="absolute right-4 top-2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear end date"
                    disabled={!watch('startDate')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 pt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{t("invalid_end_date")}</p>
                )}
              </div>
            </div>
            {watch('startDate') && watch('endDate') && (
            <div className="mt-2 text-sm text-green-600">
              {t("promotion_period")}: { new Date(safeDateDisplay(watch('startDate'))).toLocaleDateString()} to {new Date(safeDateDisplay(watch('endDate'))).toLocaleDateString()}
            </div>
          )}
            {/* Image URL */}
            {/* <div className="space-y-1">
              <div className="flex items-center">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  {t("image_url")}
                </label>
                <div className="group relative ml-2 inline-flex">
                  <button
                    type="button"
                    aria-label="Image URL information"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  
                  <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform px-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 sm:bottom-auto sm:left-full sm:top-1/2 sm:mb-0 sm:ml-2 sm:-translate-y-1/2">
                    <div className="w-64 rounded-lg bg-gray-700 px-3 py-2 text-xs text-white shadow-lg">
                      <p>{t('image_url_info')}</p>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 transform sm:-left-1 sm:top-1/2 sm:-translate-y-1/2 sm:rotate-90">
                        <div className="h-2 w-2 rotate-45 bg-gray-700"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <input
                id="imageUrl"
                type="url"
                {...register('imageUrl')}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder={t("example_image")}
                aria-describedby="imageUrlHelp"
              />
            </div> */}
            <div className="space-y-1">
              <AddImage
                onImageSelect={handleImageSelect}
                onRemoveImage={removeImage}
                disabled={isSubmitting}
                previewUrl={imagePreview}
              />
              <input
                type="hidden"
                {...register('imageLocation')}
                value={imageLocationUuid}
              />
              {errors.imageLocation && (
                <p className="mt-1 text-sm text-red-600">{errors.imageLocation.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">{t("website")}*</label>
              <input
                id="website"
                {...register('website')}
                type="url"
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder={t("website")}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t bg-white rounded-b-xl border-gray-200 p-4 z-20">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingPromotion(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-black text-white rounded-lg transition-colors cursor-pointer hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("creating")}
                  </span>
                ) : (
                  `${t("create_promotion")}`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
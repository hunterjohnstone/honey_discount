import { useState } from 'react';
import { toast } from 'react-toastify';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onRemoveImage: () => void;
  disabled?: boolean;
  previewUrl?: string | null;
}

export default function AddImage({ 
  onImageSelect, 
  onRemoveImage, 
  disabled = false, 
  previewUrl = null,
}: ImageUploadProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
    };

    if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
    };

    setIsProcessing(true);

    try {
        // Just pass the file to parent, don't upload it yet
        onImageSelect(file);
        toast.success('Image selected!');
        } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Failed to upload image, please upload another');
        } finally {
            setIsProcessing(false);
        }
        };

        const handleRemoveImage = () => {
        onRemoveImage();
        };
return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Upload Image
      </label>
      
      {/* Upload area */}
      <div className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isProcessing ? 'border-gray-300 bg-gray-50' : 
        previewUrl ? 'border-green-200 bg-green-50' : 
        'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
      }`}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isProcessing || disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="image-upload"
        />
        
        {previewUrl ? (
       <div className="relative w-full mx-auto overflow-visible rounded-lg bg-gray-100"> {/* Changed to overflow-visible */}
        <div className="relative pb-[66.666%]"> {/* Fixed to 66.666% for 3:2 ratio */}
            <img
            src={previewUrl}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
            />
        </div>
        {/* Remove button */}
        {!isProcessing && (
            <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-5" // Fixed positioning
            aria-label="Remove image"
            >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
        )}
        </div>
        ) : (
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-sm text-gray-600">
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  Processing...
                </span>
              ) : (
                <>
                  <span className="font-medium text-blue-600">Click to upload</span>
                  {' '}or drag and drop
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { promotionsAtomState } from '../atom_state';

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

type Comment = {
  id: String,
  name: String
  text: String,
  date: String,
};

export default function PromotionPage() {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Get ID from URL
  
  const promotionsAtom = useAtomValue<Promotion[]>(promotionsAtomState);
  const [promotion, setPromotionDisplay] = useState<Promotion | null>(null);

  useEffect(() => {
    if (!id) return;
  
    const myPromotion = promotionsAtom.find(promotion => 
      promotion.id === id
    );
    
    if (!myPromotion) {
      // Optional: redirect if not found
      router.push('/dashboard');
      return;
    }
    
    setPromotionDisplay(myPromotion);
  }, [id, promotionsAtom, router]);


  const handleSubmitComment = (e: any) => {
    e.preventDefault();
    if (comment.trim()) {
      setComments([...comments, {
        name: "someone",
        id: Date.now().toString(),
        text: comment,
        date: new Date().toLocaleString()
      }]);
      setComment('');
    }
  };

  if (!promotion) {
    console.log("cant find promotion by ID")
    return;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button 
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
      >
        ← Back to Promotions
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="h-64 overflow-hidden">
          <img
            src={promotion.imageUrl}
            alt={promotion.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{promotion.title}</h1>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-lg font-medium">
              ${promotion.price}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{promotion.description}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {promotion.category}
            </span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {promotion.location}
            </span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              Ends: {new Date(promotion.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a comment..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
            rows={3}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Post Comment
          </button>
        </form>

        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id.toString()} className="border-b border-gray-200 pb-4 last:border-0">
                <p className="text-gray-800 mb-1">{c.text}</p>
                <p className="text-gray-500 text-sm">{c.date}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}